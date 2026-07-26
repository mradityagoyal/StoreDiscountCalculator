const assert = require("assert");
const { parsePrices, calculateBsGap } = require("./app.js");

console.log("🧪 Running unit tests for app.js...\n");

// Test 1: parsePrices with messy inputs ($ signs, whitespace, invalid text)
(() => {
  const rawInput = " $88, 45, $62.50, invalid_str, 21 ";
  const result = parsePrices(rawInput);

  assert.strictEqual(result.length, 4, "Should parse 4 valid prices");
  assert.strictEqual(result[0].price, 88);
  assert.strictEqual(result[0].id, 1, "Should preserve item ID matching input order");
  assert.strictEqual(result[2].price, 62.5);
  console.log("✅ Test 1 Passed: parsePrices handles $, spaces, and invalid tokens.");
})();

// Test 2: Standard "Buy 3 Get 2 Free" calculation (12 items)
(() => {
  const rawPrices = "88, 45, 62, 21, 97, 33, 76, 54, 19, 40, 65, 28";
  const items = parsePrices(rawPrices);
  const result = calculateBsGap(items, 3, 2);

  // Expected logic breakdown:
  // Gross Total: 628
  // Sorted items: 97, 88, 76, [65, 62 free], 54, 45, 40, [33, 28 free], 21, 19
  // Free items sum: 65 + 62 + 33 + 28 = 188
  // Actual total: 628 - 188 = 440

  assert.strictEqual(result.gross, 628, "Gross total should be $628.00");
  assert.strictEqual(result.actualTotal, 440, "Actual out-of-pocket should be $440.00");
  assert.strictEqual(result.discount, 188, "Total saved should be $188.00");
  assert.strictEqual(result.processedItems.filter(i => i.status === "FREE").length, 4, "Should have 4 free items");

  console.log("✅ Test 2 Passed: calculateBsGap correctly computes Total Saved ($188.00).");
})();

// Test 3: String coercion safety for X and Y inputs
(() => {
  const items = parsePrices("100, 80, 60, 40, 20");
  // Pass strings "3" and "2" instead of raw integers
  const result = calculateBsGap(items, "3", "2");

  assert.strictEqual(result.discount, 20, "Should correctly calculate $20 saved when X and Y are passed as strings");
  console.log("✅ Test 3 Passed: String coercion safety for X and Y inputs.");
})();

// Test 4: Cart items fewer than deal requirement
(() => {
  const items = parsePrices("100, 80");
  const result = calculateBsGap(items, 3, 2);

  assert.strictEqual(result.discount, 0, "Total saved should be $0 when items count < X requirement");
  assert.strictEqual(result.actualTotal, 180, "Out of pocket should equal gross");
  console.log("✅ Test 4 Passed: Properly handles carts below promotion threshold.");
})();

console.log("\n🎉 All 4 tests passed successfully!");