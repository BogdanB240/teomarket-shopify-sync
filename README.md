# TeoMarket → Shopify Inventory Sync

Automated inventory synchronization from TeoMarket B2B supplier API to Shopify PromoX.ro store.

- ✅ **Fully automated** — GitHub Actions (free, 2000 min/month)
- ✅ **4x daily** — Runs at 06:00, 12:00, 18:00, 22:00 UTC
- ✅ **Smart matching** — SKU-based product matching
- ✅ **Error resilient** — Rate limiting + detailed logging
- ✅ **No external costs** — Zero hosting fees

## Quick Setup

1. **Push to GitHub** (or create repo)
2. **Add 4 secrets** to GitHub Actions
3. **Enable workflows**
4. ✅ Done — sync runs automatically

See [SETUP.md](SETUP.md) for detailed instructions.

## Architecture

```
TeoMarket API (stock export)
    ↓
    └─→ Node.js sync service
         ├─ Fetch paginated stock
         ├─ Fetch Shopify variants by SKU
         ├─ Compare quantities
         └─ Update via Shopify GraphQL
              ↓
          Shopify Store (PromoX.ro)
```

## Files

- **sync.js** — Main sync logic (Node.js)
- **.github-workflows-sync.yml** — GitHub Actions schedule
- **.env.example** — Environment variables template
- **SETUP.md** — Full setup guide

## Tech Stack

- **Language**: Node.js (JavaScript)
- **APIs**: TeoMarket REST + Shopify GraphQL
- **Scheduler**: GitHub Actions (free tier)
- **Deps**: axios, dotenv

## Status

🟢 **Ready for production**

Last updated: 2024-10-02
