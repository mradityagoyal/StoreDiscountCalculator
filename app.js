"use strict";

const DEFAULT_EXAMPLE = "88, 45, 62, 21, 97, 33, 76, 54, 19, 40, 65, 28";

function parsePrices(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim().replace(/[^0-9.]/g, "")) // Strip '$' and stray characters
    .filter((s) => s.length > 0)
    .map((s, index) => ({ id: index + 1, price: parseFloat(s) }))
    .filter((item) => !Number.isNaN(item.price) && item.price > 0);
}

function calculateBsGap(items, x, y) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      gross: 0,
      actualTotal: 0,
      discount: 0,
      realDiscountPct: 0,
      advertisedDiscountPct: 0,
      bsGapPct: 0,
      processedItems: []
    };
  }

  // Explicitly convert x and y to numbers to prevent string concatenation ("3" + "2" = "32")
  const numX = Number(x);
  const numY = Number(y);
  const k = numX + numY;

  if (Number.isNaN(numX) || Number.isNaN(numY) || numX <= 0 || numY <= 0 || k <= 0) {
    return {
      gross: 0,
      actualTotal: 0,
      discount: 0,
      realDiscountPct: 0,
      advertisedDiscountPct: 0,
      bsGapPct: 0,
      processedItems: []
    };
  }

  // Sort descending by price, retaining original item ID
  const sorted = [...items].sort((a, b) => b.price - a.price);
  const gross = items.reduce((sum, item) => sum + item.price, 0);

  let actualTotal = 0;
  const processedItems = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const groupIndex = Math.floor(i / k) + 1;
    const indexInGroup = i % k;

    // In a group of size k, the first numX items are PAID; remaining items up to k are FREE
    const isFree = indexInGroup >= numX;
    if (!isFree) {
      actualTotal += item.price;
    }

    processedItems.push({
      id: item.id,
      price: item.price,
      status: isFree ? "FREE" : "PAID",
      group: groupIndex
    });
  }

  const discount = gross - actualTotal;
  const realDiscountPct = gross > 0 ? (discount / gross) * 100 : 0;
  const advertisedDiscountPct = (numY / k) * 100;
  const bsGapPct = Math.max(0, advertisedDiscountPct - realDiscountPct);

  return {
    gross,
    actualTotal,
    discount,
    realDiscountPct,
    advertisedDiscountPct,
    bsGapPct,
    processedItems
  };
}

function money(n) { return `$${(n || 0).toFixed(2)}`; }
function pct(n) { return `${(n || 0).toFixed(2)}%`; }

function render(result) {
  document.getElementById("actualTotal").textContent = money(result.actualTotal);
  document.getElementById("totalDiscount").textContent = money(result.discount);
  document.getElementById("realDiscount").textContent = pct(result.realDiscountPct);
  document.getElementById("advertisedDiscount").textContent = pct(result.advertisedDiscountPct);
  document.getElementById("bsGapValue").textContent = pct(result.bsGapPct);

  const tbody = document.getElementById("receiptBody");
  tbody.innerHTML = result.processedItems.map(item => `
    <tr>
      <td><strong>Item #${item.id}</strong></td>
      <td>${money(item.price)}</td>
      <td>
        <span class="badge ${item.status === 'PAID' ? 'badge-paid' : 'badge-free'}">
          ${item.status}
        </span>
      </td>
      <td style="color: var(--text-secondary);">Group ${item.group}</td>
    </tr>
  `).join('');

  document.getElementById("result-panel").classList.remove("hidden");
  document.getElementById("breakdown-panel").classList.remove("hidden");
}

function showError(msg) {
  const err = document.getElementById("error");
  if (err) {
    err.textContent = msg;
    err.classList.remove("hidden");
  }
  const res = document.getElementById("result-panel");
  const bd = document.getElementById("breakdown-panel");
  if (res) res.classList.add("hidden");
  if (bd) bd.classList.add("hidden");
}

function clearError() {
  const err = document.getElementById("error");
  if (err) err.classList.add("hidden");
}

function handleCalculate() {
  clearError();
  const pricesEl = document.getElementById("prices");
  const xEl = document.getElementById("x");
  const yEl = document.getElementById("y");

  if (!pricesEl || !xEl || !yEl) return;

  const pricesRaw = pricesEl.value;
  const xRaw = xEl.value;
  const yRaw = yEl.value;

  const items = parsePrices(pricesRaw);
  const x = parseInt(xRaw, 10);
  const y = parseInt(yRaw, 10);

  if (items.length === 0) {
    showError("Enter at least one item price, e.g. 500, 400, 300, 200, 100");
    return;
  }
  if (!Number.isInteger(x) || x <= 0 || !Number.isInteger(y) || y <= 0) {
    showError("X and Y must be positive whole numbers.");
    return;
  }

  const result = calculateBsGap(items, x, y);
  render(result);
}

function loadExample() {
  const pricesEl = document.getElementById("prices");
  const xEl = document.getElementById("x");
  const yEl = document.getElementById("y");
  if (pricesEl) pricesEl.value = DEFAULT_EXAMPLE;
  if (xEl) xEl.value = "3";
  if (yEl) yEl.value = "2";
  handleCalculate();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const pricesInput = document.getElementById("prices");

    document.getElementById("calc-btn")?.addEventListener("click", handleCalculate);
    document.getElementById("example-btn")?.addEventListener("click", loadExample);

    // Clear pre-populated default entries when user focuses input
    pricesInput?.addEventListener("focus", () => {
      if (pricesInput.value.trim() === DEFAULT_EXAMPLE) {
        pricesInput.value = "";
      }
    });

    // Enter Key Handler across input fields
    ["prices", "x", "y"].forEach(id => {
      document.getElementById(id)?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleCalculate();
        }
      });
    });
  });
}

// Module export for Node.js / Jest testing environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = { parsePrices, calculateBsGap };
}