#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const TEOMARKET_API = 'https://teomarket.com/api/v1/integrations/teoship/stock/export';
const SHOPIFY_API = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10`;

const teomarketClient = axios.create({
  baseURL: TEOMARKET_API,
  headers: {
    'X-Integration-Key': process.env.TEOMARKET_TOKEN,
    'Accept': 'application/json'
  }
});

const shopifyClient = axios.create({
  baseURL: SHOPIFY_API,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Fetch all products from TeoMarket (paginated)
async function fetchTeoMarketStock() {
  const allProducts = [];
  let afterId = 0;
  let hasMore = true;

  console.log('📦 Fetching TeoMarket stock...');

  while (hasMore) {
    try {
      const response = await teomarketClient.get('', {
        params: {
          per_page: 1000,
          after_id: afterId
        }
      });

      const { data, meta } = response.data;
      allProducts.push(...data);

      console.log(`   ✓ Fetched ${data.length} products (total: ${allProducts.length})`);

      hasMore = meta.has_more;
      afterId = meta.next_after_id;
    } catch (error) {
      console.error('❌ TeoMarket API error:', error.response?.data || error.message);
      throw error;
    }
  }

  console.log(`✅ Total TeoMarket products: ${allProducts.length}\n`);
  return allProducts;
}

// Fetch all variants from Shopify (by SKU)
async function fetchShopifyVariants() {
  const variants = new Map(); // SKU -> variant details
  let cursor = null;
  let hasNextPage = true;

  console.log('🛍️  Fetching Shopify variants...');

  while (hasNextPage) {
    try {
      const query = `
        query GetVariants($cursor: String) {
          productVariants(first: 250, after: $cursor) {
            edges {
              node {
                id
                sku
                barcode
                inventoryQuantity
                inventoryItem {
                  id
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const response = await shopifyClient.post('/graphql.json', {
        query,
        variables: { cursor }
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const { edges, pageInfo } = response.data.data.productVariants;
      
      edges.forEach(({ node }) => {
        if (node.sku) {
          variants.set(node.sku, {
            variantId: node.id,
            inventoryItemId: node.inventoryItem.id,
            currentQty: node.inventoryQuantity,
            barcode: node.barcode
          });
        }
      });

      console.log(`   ✓ Fetched ${edges.length} variants (SKU map size: ${variants.size})`);

      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;
    } catch (error) {
      console.error('❌ Shopify GraphQL error:', error.response?.data || error.message);
      throw error;
    }
  }

  console.log(`✅ Total SKU-mapped variants: ${variants.size}\n`);
  return variants;
}

// Update inventory for a single variant
async function updateShopifyInventory(inventoryItemId, newQuantity, currentQuantity) {
  const deltaQuantity = newQuantity - currentQuantity;

  if (deltaQuantity === 0) {
    return { skipped: true, reason: 'no change' };
  }

  const query = `
    mutation AdjustInventory($inventoryItemId: ID!, $deltaQuantity: Int!, $locationId: ID!) {
      inventoryAdjustQuantity(input: {
        inventoryItemId: $inventoryItemId
        availableDelta: $deltaQuantity
        locationId: $locationId
      }) {
        inventoryLevel {
          quantities(names: "available") {
            quantity
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await shopifyClient.post('/graphql.json', {
      query,
      variables: {
        inventoryItemId,
        deltaQuantity,
        locationId: `gid://shopify/Location/${process.env.SHOPIFY_LOCATION_ID}`
      }
    });

    if (response.data.errors) {
      return { error: response.data.errors[0].message };
    }

    if (response.data.data?.inventoryAdjustQuantity?.userErrors?.length) {
      return { error: response.data.data.inventoryAdjustQuantity.userErrors[0].message };
    }

    return {
      success: true,
      newQuantity,
      currentQuantity,
      delta: deltaQuantity
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Main sync logic
async function syncInventory() {
  const dryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - no changes will be made\n');
  }

  try {
    // 1. Fetch data from both sources
    const teomarketStock = await fetchTeoMarketStock();
    const shopifyVariants = await fetchShopifyVariants();

    // 2. Sync logic: compare and update
    const syncReport = {
      checked: 0,
      updated: 0,
      skipped: 0,
      notFound: 0,
      errors: []
    };

    console.log('🔄 Syncing inventory...\n');

    for (const product of teomarketStock) {
      const { sku, quantity: teoQty } = product;
      syncReport.checked++;

      const shopifyVar = shopifyVariants.get(sku);

      if (!shopifyVar) {
        syncReport.notFound++;
        console.log(`⚠️  SKU not found: ${sku} (TeoMarket qty: ${teoQty})`);
        continue;
      }

      if (!dryRun) {
        const result = await updateShopifyInventory(
          shopifyVar.inventoryItemId,
          teoQty,
          shopifyVar.currentQty
        );

        if (result.success) {
          syncReport.updated++;
          console.log(`✅ ${sku}: ${shopifyVar.currentQty} → ${teoQty} (Δ ${result.delta})`);
        } else if (result.skipped) {
          syncReport.skipped++;
        } else {
          syncReport.errors.push({ sku, error: result.error });
          console.log(`❌ ${sku}: ${result.error}`);
        }
      } else {
        // Dry run: show what would change
        if (teoQty !== shopifyVar.currentQty) {
          console.log(`📋 [DRY] ${sku}: ${shopifyVar.currentQty} → ${teoQty} (Δ ${teoQty - shopifyVar.currentQty})`);
          syncReport.updated++;
        } else {
          console.log(`📋 [DRY] ${sku}: no change (${teoQty})`);
          syncReport.skipped++;
        }
      }

      // Rate limiting: 2 req/sec for Shopify
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC REPORT');
    console.log('='.repeat(60));
    console.log(`Checked:    ${syncReport.checked}`);
    console.log(`Updated:    ${syncReport.updated}`);
    console.log(`Skipped:    ${syncReport.skipped}`);
    console.log(`Not Found:  ${syncReport.notFound}`);
    console.log(`Errors:     ${syncReport.errors.length}`);

    if (syncReport.errors.length > 0) {
      console.log('\nError details:');
      syncReport.errors.forEach(({ sku, error }) => {
        console.log(`  - ${sku}: ${error}`);
      });
    }

    console.log('='.repeat(60));
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    if (dryRun) console.log('🔍 DRY RUN - no changes applied');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ SYNC FAILED:', error.message);
    process.exit(1);
  }
}

// Run sync
syncInventory();
