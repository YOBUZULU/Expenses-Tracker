# My Expense Tracker

A simple, personal expenses tracker built with **plain HTML, CSS and JavaScript** — no frameworks, no backend. It tracks your **available balance**, **money in (credited)** and **money out (debited)** in **Zambian Kwacha (K)**, and everything updates automatically as you add transactions.

Your data is saved in your browser (`localStorage`), so it stays on your device between visits.

## Features
- ✅ Add money in / money out with a date, description and category.
- ✅ **Available balance** recalculates automatically.
- ✅ **This month** money in, money out and net.
- ✅ **Spending by category** bar chart (this month).
- ✅ Transaction **history** with delete.
- ✅ **Set starting balance** anytime (defaults to K 0.00).
- ✅ **Reset** button to clear all data and start fresh at K 0.00.
- ✅ **Export / Import** a JSON backup (great for moving between devices or saving).

## Files
| File | Purpose |
|------|---------|
| `index.html` | The page structure |
| `style.css` | Styling |
| `script.js` | All the logic + data persistence |
| `README.md` | This guide |

## Run it locally
Open `index.html` in any modern browser. Done — no build step, no server needed.

## Host it free on GitHub Pages (about 3 minutes)
1. Create a new repository on GitHub (e.g. `expense-tracker`).
2. Upload these files: `index.html`, `style.css`, `script.js` (and `README.md` if you like).
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch** and select **main / master** with the root folder `/ (root)`.
5. Click **Save**. GitHub builds your site automatically.
6. Your site goes live at: `https://<your-username>.github.io/expense-tracker/`

Every time you `git push` a change, GitHub automatically redeploys.

## How to use
1. **Add a transaction:** fill the form (date defaults to today), pick the type (Money In or Money Out), enter the amount and press **Add transaction**.
2. **Available balance** in the top card updates immediately.
3. **Set starting balance:** click the link under the balance to change your opening amount (defaults to K 0.00).
4. **Delete** a mistake using the **×** next to any row.
5. **Export** a backup JSON file anytime; **Import** it on another device.

## License & ownership
This software is proprietary and belongs to **Mwangazi Tech Solutions**.

Copyright © 2026 Mwangazi Tech Solutions. All rights reserved.

It is licensed for personal, non-commercial use only. Redistribution,
modification, or commercial use without permission is prohibited. See the
**`LICENSE`** file for the full terms.

For licensing, permission, or commercial enquiries:
**mwangazitechsolutions@gmail.com**

## Note on privacy
Because everything lives in `localStorage`, your records are stored only in the browser where you use it. Clearing your browser cache or using a different device/browser will start fresh (unless you imported a backup). For full peace of mind, **Export** a backup regularly.
