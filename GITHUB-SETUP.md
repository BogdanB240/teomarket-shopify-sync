# 🚀 GitHub Setup (2 minute)

## Step 1: Creează GitHub Repo

1. Mergi la: https://github.com/new
2. Nume: `teomarket-shopify-sync`
3. Descriere: `Automated inventory sync from TeoMarket to Shopify PromoX`
4. Private (opțional)
5. Click: **Create repository**

## Step 2: Push Codul Local

```bash
cd /path/to/teomarket-shopify-sync
git remote add origin https://github.com/BogdanB240/teomarket-shopify-sync.git
git branch -M main
git push -u origin main
```

## Step 3: Adaugă GitHub Secrets (4 secrete)

**Settings → Secrets and variables → Actions → New secret**

| Secret | Value |
|--------|-------|
| `TEOMARKET_TOKEN` | `5fc16705d1e1c1119a7fe821b20a463226ff2ab311c7565c8ebb84337564165b` |
| `SHOPIFY_STORE` | `z5jzfz-me.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | **[Generează din Shopify Admin]** |
| `SHOPIFY_LOCATION_ID` | `125913629006` |

### Cum să generezi SHOPIFY_ACCESS_TOKEN:

1. Deschide: **https://z5jzfz-me.myshopify.com/admin/apps**
2. Stânga jos: **Develop apps**
3. Click: **Create an app**
4. Nume: `Inventory Sync`
5. Click: **Create app**
6. Tab: **Configuration**
7. Scroll: **Admin API scopes**
8. Bifează aceste 3:
   - ☑ `write_inventory`
   - ☑ `read_products`
   - ☑ `read_inventory`
9. Click: **Save**
10. Click: **Install app**
11. Tab: **Admin API credentials**
12. Button: **Reveal** (lângă Access token)
13. **COPY** tokenul complet (1000+ caractere)
14. Paste în GitHub Secret `SHOPIFY_ACCESS_TOKEN`

## Step 4: Test Workflow

1. GitHub: **Actions tab**
2. Click: **TeoMarket → Shopify Inventory Sync**
3. Click: **Run workflow**
4. Selectează: **main branch**
5. Click: **Run workflow**
6. Asteapta ~1 min și vezi output

## ✅ Gata!

Sync rulează automat:
- 🌅 06:00 UTC
- ☀️ 12:00 UTC
- 🌆 18:00 UTC
- 🌙 22:00 UTC

Sau manual oricând din **Actions → Run workflow**

---

**Need help?** Check logs: **Actions → Latest run → Sync step**
