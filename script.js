/*
  My Expense Tracker
  Copyright © 2026 Mwangazi Tech Solutions. All rights reserved.
  This software is proprietary and licensed under the terms in LICENSE.
  Contact: mwangazitechsolutions@gmail.com
*/
/* Plain JS, no dependencies. Saves to your browser. */
(function () {
  "use strict";

  // ---------- Storage keys ----------
  const KEY_TX = "expenseTracker.tx";      // array of transactions
  const KEY_START = "expenseTracker.start"; // starting balance (number)

  // ---------- State ----------
  let transactions = load(KEY_TX, []);
  let startingBalance = Number(load(KEY_START, 0));

  // ---------- Element references ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    balance: $("balance"),
    moneyInMonth: $("moneyInMonth"),
    moneyOutMonth: $("moneyOutMonth"),
    netMonth: $("netMonth"),
    form: $("txForm"),
    date: $("date"),
    desc: $("desc"),
    category: $("category"),
    amount: $("amount"),
    amountLabel: $("amountLabel"),
    formTitle: $("formTitle"),
    formBadge: $("formBadge"),
    submitBtn: $("submitBtn"),
    list: $("list"),
    listEmpty: $("listEmpty"),
    categoryBars: $("categoryBars"),
    catEmpty: $("catEmpty"),
    editStart: $("editStart"),
    exportBtn: $("exportBtn"),
    importBtn: $("importBtn"),
    importFile: $("importFile"),
    resetBtn: $("resetBtn"),
  };

  // ---------- Categories (depend on the selected type) ----------
  const IN_CATS = [
    "Salary",
    "Business Income",
    "Freelance / Contract",
    "Allowance / Stipend",
    "Gift / Money given",
    "Refund / Reimbursement",
    "Interest / Dividends",
    "Remittance received",
    "Loan received",
    "Other",
  ];
  const OUT_CATS = [
    "Groceries",
    "Rent",
    "Utilities",
    "Transport / Fuel",
    "Airtime & Data",
    "Health / Medical",
    "Education",
    "Savings / Investment",
    "Shopping",
    "Entertainment",
    "Dining Out",
    "Loan Repayment",
    "Family Support",
    "Insurance",
    "Personal Care",
    "Clothing",
    "Household",
    "Charity / Tithe",
    "Other",
  ];

  // ---------- Type state ----------
  let currentType = "out";

  function populateCategories(type) {
    const list = type === "in" ? IN_CATS : OUT_CATS;
    el.category.innerHTML = list
      .map(function (c) { return '<option value="' + c + '">' + c + "</option>"; })
      .join("");
    el.category.value = list[0];
  }

  function setType(type) {
    currentType = type;
    const isIn = type === "in";

    // Toggle buttons
    document.querySelectorAll(".type-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.type === type);
    });

    // Dynamic labels & theming
    el.form.classList.toggle("in", isIn);
    el.form.classList.toggle("out", !isIn);
    el.formTitle.textContent = isIn ? "Add money in" : "Add money out";
    el.formBadge.textContent = isIn ? "Credit" : "Debit";
    el.formBadge.className = "card-badge " + type;
    el.amountLabel.textContent = isIn ? "Amount received (K)" : "Amount spent (K)";
    el.submitBtn.textContent = isIn ? "Add money in" : "Add money out";

    populateCategories(type);
  }
  document.querySelectorAll(".type-btn").forEach(function (b) {
    b.addEventListener("click", function () { setType(b.dataset.type); });
  });

  // ---------- Helpers ----------
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function saveTx() {
    localStorage.setItem(KEY_TX, JSON.stringify(transactions));
  }
  function saveStart() {
    localStorage.setItem(KEY_START, JSON.stringify(startingBalance));
  }

  const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function kwanza(n) {
    const sign = n < 0 ? "-" : "";
    return "K " + sign + fmt.format(Math.abs(n));
  }

  function todayISO() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function monthKey(iso) {
    return iso.slice(0, 7); // "YYYY-MM"
  }
  function currentMonth() {
    return monthKey(todayISO());
  }

  // ---------- Rendering ----------
  function renderAll() {
    renderBalance();
    renderMonth();
    renderCategoryBars();
    renderList();
  }

  function renderBalance() {
    let bal = startingBalance;
    for (const t of transactions) {
      bal += t.type === "in" ? t.amount : -t.amount;
    }
    el.balance.textContent = kwanza(bal);
  }

  function renderMonth() {
    const m = currentMonth();
    let inTot = 0, outTot = 0;
    for (const t of transactions) {
      if (t.date.slice(0, 7) !== m) continue;
      if (t.type === "in") inTot += t.amount;
      else outTot += t.amount;
    }
    el.moneyInMonth.textContent = kwanza(inTot);
    el.moneyOutMonth.textContent = kwanza(outTot);
    el.netMonth.textContent = kwanza(inTot - outTot);
  }

  function renderCategoryBars() {
    const m = currentMonth();
    const byCat = {}; // category -> total out
    for (const t of transactions) {
      if (t.type !== "out" || t.date.slice(0, 7) !== m) continue;
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    }

    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      el.categoryBars.innerHTML = "";
      el.catEmpty.style.display = "block";
      return;
    }
    el.catEmpty.style.display = "none";

    const max = entries[0][1];
    el.categoryBars.innerHTML = entries
      .map(([cat, amt]) => {
        const pct = Math.round((amt / max) * 100);
        return (
          '<div class="bar-row">' +
            '<div class="bar-name">' + escapeHtml(cat) + "</div>" +
            '<div class="bar-line"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="bar-val">' + kwanza(amt) + "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderList() {
    const sorted = transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) {
      el.list.innerHTML = "";
      el.listEmpty.style.display = "block";
      return;
    }
    el.listEmpty.style.display = "none";
    el.list.innerHTML = sorted
      .map(function (t, idx) {
        const sign = t.type === "in" ? "+" : "-";
        return (
          '<div class="tx-row">' +
            '<span class="tx-dot ' + t.type + '-dot"></span>' +
            '<div class="tx-main">' +
              '<div class="tx-desc">' + escapeHtml(t.desc) + "</div>" +
              '<div class="tx-cat">' + escapeHtml(t.category) + " · " + escapeHtml(t.date) + "</div>" +
            "</div>" +
            '<div class="tx-amount ' + t.type + '">' + sign + escapeHtml(kwanza(t.amount)) + "</div>" +
            '<button class="tx-del" data-id="' + idx + '" title="Delete">×</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- Add transaction ----------
  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    const date = el.date.value;
    const desc = el.desc.value.trim();
    const category = el.category.value;
    const type = currentType;
    const amountRaw = parseFloat(el.amount.value);

    if (!date || !desc) return;
    if (!(amountRaw > 0)) {
      toast("Enter a valid amount.");
      return;
    }

    transactions.push({
      date: date,
      desc: desc,
      category: category,
      type: type,
      amount: Math.round(amountRaw * 100) / 100,
    });
    saveTx();
    renderAll();
    el.form.reset();
    el.date.value = todayISO();
    setType(currentType); // refresh category list + accents
    toast(type === "in" ? "Money added ✓" : "Expense added ✓");
  });

  // ---------- Delete transaction ----------
  el.list.addEventListener("click", function (e) {
    const btn = e.target.closest(".tx-del");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-id"));
    if (isNaN(idx)) return;
    // index maps to the sorted order; find the real record
    const sorted = transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
    const victim = sorted[idx];
    const realIdx = transactions.indexOf(victim);
    if (realIdx > -1) {
      transactions.splice(realIdx, 1);
      saveTx();
      renderAll();
      toast("Transaction removed.");
    }
  });

  // ---------- Set starting balance ----------
  el.editStart.addEventListener("click", function () {
    const val = prompt("Starting available balance (K):", startingBalance);
    if (val === null) return;
    const n = parseFloat(val);
    if (isNaN(n)) {
      toast("Invalid number.");
      return;
    }
    startingBalance = n;
    saveStart();
    renderAll();
    toast("Starting balance updated.");
  });

  // ---------- Export / Import ----------
  el.exportBtn.addEventListener("click", function () {
    const data = { version: 1, startingBalance: startingBalance, transactions: transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expense-tracker-backup-" + todayISO() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Backup downloaded.");
  });

  el.importBtn.addEventListener("click", function () {
    el.importFile.click();
  });
  el.importFile.addEventListener("change", function () {
    const file = el.importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          transactions = data;
        } else if (data && Array.isArray(data.transactions)) {
          transactions = data.transactions;
          if (typeof data.startingBalance === "number") startingBalance = data.startingBalance;
        } else {
          throw new Error("bad format");
        }
        saveTx();
        saveStart();
        renderAll();
        toast("Backup imported ✓");
      } catch (err) {
        toast("Could not read that file.");
      }
    };
    reader.readAsText(file);
    el.importFile.value = "";
  });

  // ---------- Toast ----------
  let toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1600);
  }

  // ---------- Reset all data ----------
  function resetAll() {
    const ok = confirm(
      "Reset the whole tracker?\n\n" +
        "This will:\n" +
        "• Clear all transactions\n" +
        "• Set starting balance back to K 0.00\n\n" +
        "This cannot be undone. Export a backup first if you need one."
    );
    if (!ok) return;
    transactions = [];
    startingBalance = 0;
    saveTx();
    saveStart();
    el.date.value = todayISO();
    el.form.reset();
    setType(currentType);
    renderAll();
    toast("Tracker reset to K 0.00.");
  }
  el.resetBtn.addEventListener("click", resetAll);

  // ---------- Init ----------
  // Start clean at K 0.00 with an empty history.
  el.date.value = todayISO();
  setType("out");
  renderAll();
})();
