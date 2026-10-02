# ✅ TeoMarket → Shopify Sync - DEPLOY CHECKLIST

**Status:** 🟢 **READY TO DEPLOY**

---

## 📋 What's Ready (✅ Done)

- ✅ Sync script (`sync.js`) — Node.js, paginated fetches, smart matching
- ✅ GitHub Actions workflow (`.github/workflows/sync.yml`) — 4x daily cron
- ✅ Environment template (`.env.example`)
- ✅ Git repo initialized with initial commit
- ✅ Dependencies: `package.json` (axios, dotenv)
- ✅ Documentation (README, SETUP, GITHUB-SETUP)

---

## 🚀 DEPLOY STEPS (5 min)

### Step 1: Creează GitHub Repository
**Location:** https://github.com/new

```
Name: teomarket-shopify-sync
Description: Automated inventory sync from TeoMarket to Shopify PromoX
Visibility: Private (recommended)
```

Click **Create repository**

---

### Step 2: Push Code to GitHub

```bash
cd /path/to/teomarket-shopify-sync
git remote add origin https://github.com/BogdanB240/teomarket-shopify-sync.git
git branch -M main
git push -u origin main
```

✅ Code is now on GitHub

---

### Step 3: Generate Shopify Access Token

**Location:** https://z5jzfz-me.myshopify.com/admin/apps

**Steps:**

1. Bottom left: Click **"Develop apps"**
2. Click **"Create an app"**
3. App name: `Inventory Sync`
4. Click **"Create app"**
5. Tab: **"Configuration"**
6. Scroll down to **"Admin API scopes"**
7. **Checkmark these 3 permissions:**
   - ☑ `write_inventory` (update stock levels)
   - ☑ `read_products` (fetch product variants)
   - ☑ `read_inventory` (read current stock)
8. Click **"Save"**
9. Click **"Install app"**
10. Tab: **"Admin API credentials"**
11. Find **"Access token"** section
12. Click **"Reveal"** button
13. **COPY** the full token (long string of characters)

✅ Save token for Step 4

---

### Step 4: Add GitHub Secrets

**Location:** https://github.com/BogdanB240/teomarket-shopify-sync/settings/secrets/actions

**Add these 4 secrets:**

| Secret Name | Value |
|------------|-------|
| `TEOMARKET_TOKEN` | `5fc16705d1e1c1119a7fe821b20a463226ff2ab311c7565c8ebb84337564165b` |
| `SHOPIFY_STORE` | `z5jzfz-me.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | *(Paste the token from Step 3)* |
| `SHOPIFY_LOCATION_ID` | `125913629006` |

**How to add each:**
1. Click **"New repository secret"**
2. Name: (from table above)
3. Secret: (from table above)
4. Click **"Add secret"**
5. Repeat for all 4

✅ All secrets are now in GitHub

---

### Step 5: Test the Workflow

**Location:** https://github.com/BogdanB240/teomarket-shopify-sync/actions

1. Click **"TeoMarket → Shopify Inventory Sync"** workflow
2. Click **"Run workflow"** (dropdown)
3. Branch: **main**
4. Click **"Run workflow"** button
5. Wait ~2 minutes for execution
6. Click the run to see **full logs**

**Expected output:**
```
📦 Fetching TeoMarket stock...
   ✓ Fetched 1000 products
✅ Total TeoMarket products: 1000

🛍️  Fetching Shopify variants...
   ✓ Fetched 250 variants
✅ Total SKU-mapped variants: 240

🔄 Syncing inventory...
✅ SKU-001: 100 → 95 (Δ -5)
...

📊 SYNC REPORT
Checked:    1000
Updated:    237
Skipped:    0
Not Found:  3
Errors:     0
```

✅ First sync successful!

---

## 📅 Automatic Schedule

After deployment, sync runs **4x daily:**

- 🌅 **06:00 UTC** (morning)
- ☀️ **12:00 UTC** (noon)
- 🌆 **18:00 UTC** (evening)
- 🌙 **22:00 UTC** (night)

Check logs anytime: **Actions → Latest run**

---

## 🛠️ Troubleshooting

### ❌ "401 Unauthorized" on Shopify

**Problem:** Access token is invalid  
**Fix:**
1. Go to Shopify Admin → Apps → Inventory Sync → Configuration
2. Scroll to "Admin API credentials"
3. Click "Rotate" button
4. Copy new token
5. Update GitHub secret: Settings → Secrets → Update `SHOPIFY_ACCESS_TOKEN`

### ❌ "SKU not found in Shopify"

**Problem:** TeoMarket product not in your Shopify store  
**Expected:** These are logged as warnings and skipped  
**Action:** None needed — normal behavior

### ❌ Workflow doesn't run

**Problem:** Actions not enabled  
**Fix:** Go to Settings → Actions → General → "Allow all actions"

### ❌ High error rate

**Problem:** Shopify store is under heavy load  
**Fix:** Wait 15 min and retry from Actions → Run workflow

---

## 📞 Support

All logs available: **GitHub → Actions → Latest run → Sync step**

Review:
- Product count fetched from TeoMarket
- Variant count fetched from Shopify
- Quantity changes applied
- Any errors encountered

---

## ✅ Post-Deploy Checklist

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Shopify app created
- [ ] Shopify access token copied
- [ ] All 4 GitHub secrets added
- [ ] Manual workflow test passed
- [ ] Logs show inventory updates
- [ ] Confirm 4x daily schedule is set

---

**Status:** 🟢 **PRODUCTION READY**

Last updated: 2024-10-02
