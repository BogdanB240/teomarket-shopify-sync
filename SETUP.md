# TeoMarket → Shopify Inventory Sync

**Automated daily inventory synchronization from TeoMarket B2B to Shopify PromoX.ro**

---

## 🚀 Quick Start

### 1. Clone or copy this repo to GitHub

```bash
git clone https://github.com/BogdanB240/teomarket-shopify-sync.git
cd teomarket-shopify-sync
```

### 2. Add GitHub Secrets

Go to: **Repo → Settings → Secrets and variables → Actions**

Add these 4 secrets:

| Secret | Value |
|--------|-------|
| `TEOMARKET_TOKEN` | `5fc16705d1e1c1119a7fe821b20a463226ff2ab311c7565c8ebb84337564165b` |
| `SHOPIFY_STORE` | `z5jzfz-me.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | *(Your Shopify Admin API token)* |
| `SHOPIFY_LOCATION_ID` | `125913629006` |

### 3. Enable Actions

**Repo → Actions tab** → Make sure workflows are enabled

### 4. Test locally (optional)

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run sync          # Production run
npm run test          # Dry-run (no changes)
```

---

## 📋 How it Works

### Schedule
- **4x daily**: 06:00, 12:00, 18:00, 22:00 UTC
- **Manual trigger**: GitHub Actions UI

### Flow
1. **Fetch** all products from TeoMarket API (paginated, 1000 per page)
2. **Fetch** all SKU variants from Shopify
3. **Compare** quantities: TeoMarket qty vs Shopify current qty
4. **Update** Shopify inventory for any deltas
5. **Report** changes, skipped, and errors

### Matching
- **By SKU**: Products matched using identical SKU field in both systems
- **No SKU** → Product skipped
- **SKU not in Shopify** → Logged as warning, not synced

### Rate Limiting
- TeoMarket: No strict limits (paginated by 1000)
- Shopify: 2 requests/second (built-in delay)

---

## 🔐 Credentials

### TeoMarket
- **Token**: Already configured in this repo (visible in .env.example)
- **No rotation needed** unless compromised

### Shopify Access Token
Get from: **Admin → Apps and channels → Develop apps → Inventory Sync → Configuration → Admin API credentials → Reveal**

**Important:**
- Token grants full inventory write access
- Rotate via "Rotate" button if compromised
- Update GitHub secret after rotation

---

## 📊 Monitoring

### Check sync logs
1. **GitHub Actions tab** → Click latest workflow run
2. **Step: Run inventory sync** → Full output with:
   - Products fetched
   - Variants matched
   - Inventory changes
   - Errors (if any)

### Sample output
```
📦 Fetching TeoMarket stock...
   ✓ Fetched 1000 products (total: 1000)
✅ Total TeoMarket products: 1000

🛍️  Fetching Shopify variants...
   ✓ Fetched 250 variants (SKU map size: 240)
✅ Total SKU-mapped variants: 240

🔄 Syncing inventory...

✅ SKU-001: 100 → 95 (Δ -5)
✅ SKU-002: 50 → 48 (Δ -2)
⚠️  SKU-999: not found in Shopify

============================================================
📊 SYNC REPORT
============================================================
Checked:    1000
Updated:    237
Skipped:    0
Not Found:  3
Errors:     0
============================================================
⏰ Timestamp: 2024-10-02T12:00:00.000Z
============================================================
```

---

## ⚠️ Troubleshooting

### "401 Unauthorized" from Shopify
- ❌ Access token is invalid or expired
- ✅ Go to Shopify Admin → Rotate token → Update GitHub secret

### "SKU not found in Shopify"
- This is normal — TeoMarket may have products not in your Shopify store
- They're logged as warnings and skipped

### Workflow not running
- ✅ Check **Actions tab** → Workflows enabled
- ✅ Check **Settings → Actions → General** → "Allow all actions"
- ✅ Manual trigger: **Actions tab → Run workflow**

### High error rate
- Check if Shopify store is under heavy load
- Wait 15 min and re-run manually
- Or reduce frequency (edit cron times)

---

## 🛠️ Customization

### Change sync times
Edit `.github-workflows-sync.yml`:
```yaml
schedule:
  - cron: '30 8 * * *'   # 08:30 UTC
  - cron: '30 14 * * *'  # 14:30 UTC
```

### Skip price sync
Currently: **Stock only** (quantity)
To add prices later: Modify `sync.js` to include `price_lvl1_pj_excl_vat` field

### Add Slack notifications
```yaml
- name: 📧 Notify Slack on sync
  if: always()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Inventory sync completed"
      }
```

---

## 📞 Support

Check logs first:
- **GitHub Actions → Sync workflow → Latest run → Full output**

Common issues solved above. For API-level debugging:
- TeoMarket: `https://teomarket.com/api/v1/integrations/teoship/stock/export?per_page=10`
- Shopify GraphQL: Add `debug: true` to sync.js

---

**Last updated**: 2024-10-02  
**Status**: ✅ Ready for production
