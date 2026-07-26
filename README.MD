# The BS Detector — Department Store Math Exposed

An interactive web application and algorithm that exposes the real-world math behind retail **"Buy X, Get Y Free"** promotions. 

While store signage advertises sweeping headline discounts (e.g., "Buy 3 Get 2 Free" sound like 40% off), real-world cart math often yields a much lower actual discount depending on item price distribution. This tool calculates the **BS Gap**—the discrepancy between what retailers advertise and what consumers actually save.

> 📖 **Read the accompanying breakdown on LinkedIn:**  
> 👉 [Department store BS detector.](https://www.linkedin.com/posts/mradityagoyal_buy2get1free-leetcode-retailmath-activity-7486822721608142848-hDjX)

---

## 🚀 Features

* **Greedy Price Optimization:** Models the exact point-of-sale (POS) logic used by retail registers to maximize retailer revenue (and minimize consumer discount).
* **Key Metrics at a Glance:**
  * **Out of Pocket ($):** Total actual cash spent.
  * **Total Saved ($):** Exact dollar value of free items.
  * **Real Discount (%):** Effective savings rate across the entire cart.
  * **Advertised Discount (%):** The theoretical max savings rate ($Y / (X + Y)$).
  * **BS Gap (%):** The mathematical gap between perception and reality.
* **Itemized Receipt Breakdown:** Tracks original item order (Item #) while displaying group-by-group payment statuses (`PAID` vs `FREE`).
* **Instant Demo Mode:** Pre-populated with sample cart data. Press `Enter` immediately to run, or click the input field to auto-clear and enter custom prices.
* **Zero Dependencies:** Pure vanilla HTML, CSS, and JavaScript with Node.js assertion testing.

---

## 🧮 How The Algorithm Works

The register groups items into chunks of $X + Y$ to apply discounts. To minimize customer savings, the optimal greedy strategy sorts all items in descending order by price:

1. **Sort:** Order $N$ item prices descending: $P = [p_1, p_2, \dots, p_n]$ where $p_1 \ge p_2 \ge \dots \ge p_n$.
2. **Chunk:** Partition into groups of size $k = X + Y$.
3. **Bill:** For each group, charge for the $X$ most expensive items and mark the remaining $Y$ cheaper items as **FREE**.
4. **Calculate Gap:**
   $$\text{Real Discount \%} = \left(\frac{\sum \text{Free Item Prices}}{\sum \text{All Item Prices}}\right) \times 100$$
   $$\text{BS Gap \%} = \max(0, \text{Advertised Discount \%} - \text{Real Discount \%})$$

Time Complexity: **$O(N \log N)$** (dominated by sorting).  
Space Complexity: **$O(N)$** (to maintain item index mapping).

---

## 📁 Project Structure