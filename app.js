"use strict";

function parsePrices(raw) {
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s, index) => ({ id: index + 1, price: parseFloat(s) }))
        .filter((item) => !Number.isNaN(item.price) && item.price > 0);
}

function calculateBsGap(items, x, y) {
    const k = x + y;
    // Sort descending by price while retaining original item ID
    const sorted = [...items].sort((a, b) => b.price - a.price);
    const gross = items.reduce((sum, item) => sum + item.price, 0);
    
    let actualTotal = 0;
    const processedItems = [];

    for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const groupIndex = Math.floor(i / k) + 1;
        const indexInGroup = i % k;

        const isFree = indexInGroup >= x;
        if (!isFree) {
            actualTotal += item.price;
        }

        processedItems.push({
            id: item.id,
            price: item.price,
            status: isFree ? 'FREE' : 'PAID',
            group: groupIndex
        });
    }

    const discount = gross - actualTotal;
    const realDiscountPct = gross > 0 ? (discount / gross) * 100 : 0;
    const advertisedDiscountPct = (y / (x + y)) * 100;
    const bsGapPct = Math.max(0, advertisedDiscountPct - realDiscountPct);

    return {
        gross,
        actualTotal,
        realDiscountPct,
        advertisedDiscountPct,
        bsGapPct,
        processedItems
    };
}

function money(n) { return `$${n.toFixed(2)}`; }
function pct(n) { return `${n.toFixed(2)}%`; }

function render(result) {
    document.getElementById("actualTotal").textContent = money(result.actualTotal);
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
    err.textContent = msg;
    err.classList.remove("hidden");
    document.getElementById("result-panel").classList.add("hidden");
    document.getElementById("breakdown-panel").classList.add("hidden");
}

function clearError() {
    document.getElementById("error").classList.add("hidden");
}

function handleCalculate() {
    clearError();
    const pricesRaw = document.getElementById("prices").value;
    const xRaw = document.getElementById("x").value;
    const yRaw = document.getElementById("y").value;
    
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
    document.getElementById("prices").value = "88, 45, 62, 21, 97, 33, 76, 54, 19, 40, 65, 28";
    document.getElementById("x").value = "3";
    document.getElementById("y").value = "2";
    handleCalculate();
}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calc-btn").addEventListener("click", handleCalculate);
    document.getElementById("example-btn").addEventListener("click", loadExample);

    // Attach Enter Key Handler to trigger calculation
    ['prices', 'x', 'y'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleCalculate();
            }
        });
    });
});