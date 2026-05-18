function render(panel, shop) {
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Reports";
  panel.appendChild(h2);

  // ── By product ───────────────────────────────────────────────────────────
  const totals = {};
  for (const p of shop.products) {
    totals[p] = { qty: 0, revenue: 0 };
  }
  for (const loc of shop.locations) {
    for (const [product, qty] of loc.sales) {
      if (!totals[product]) totals[product] = { qty: 0, revenue: 0 };
      totals[product].qty += qty;
      totals[product].revenue += (shop.prices[product] ?? 0) * qty;
    }
  }

  const h3Products = document.createElement("h3");
  h3Products.textContent = "By Product";
  panel.appendChild(h3Products);

  const table = document.createElement("table");
  table.className = "report-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Product", "Price", "Total Qty", "Revenue"].forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const product of shop.products) {
    const tr = document.createElement("tr");
    const d = totals[product];
    [
      product,
      shop.prices[product] !== undefined ? shop.prices[product].toFixed(2) : "\u2014",
      d.qty,
      d.revenue.toFixed(2)
    ].forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  panel.appendChild(table);

  // ── By location ──────────────────────────────────────────────────────────
  const h3Locations = document.createElement("h3");
  h3Locations.textContent = "By Location";
  panel.appendChild(h3Locations);

  const locTable = document.createElement("table");
  locTable.className = "report-table";

  const locThead = document.createElement("thead");
  const locHeaderRow = document.createElement("tr");
  ["Location", "Transactions", "Revenue"].forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    locHeaderRow.appendChild(th);
  });
  locThead.appendChild(locHeaderRow);
  locTable.appendChild(locThead);

  const locTbody = document.createElement("tbody");
  for (const loc of shop.locations) {
    const tr = document.createElement("tr");
    const revenue = loc.sales.reduce((sum, [p, q]) => sum + (shop.prices[p] ?? 0) * q, 0);
    [loc.name, loc.sales.length, revenue.toFixed(2)].forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    locTbody.appendChild(tr);
  }
  locTable.appendChild(locTbody);
  panel.appendChild(locTable);
}

export const initReportsTab = {
  title: "Reports",
  render
};
