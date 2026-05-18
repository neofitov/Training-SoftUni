function render(panel, shop) {
  panel.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = 'Reports';
  panel.appendChild(h2);

  if (shop.locations.length === 0 || shop.products.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = 'No data to report yet.';
    panel.appendChild(empty);
    return;
  }

  // Build pivot: pivot[product][locName] = revenue (null = no sales at all)
  const pivot = {};
  for (const p of shop.products) {
    pivot[p] = {};
    for (const loc of shop.locations) pivot[p][loc.name] = null;
  }
  for (const loc of shop.locations) {
    for (const [product, qty] of loc.sales) {
      const rev = (shop.prices[product] ?? 0) * qty;
      pivot[product] ??= {};
      pivot[product][loc.name] = (pivot[product][loc.name] ?? 0) + rev;
    }
  }

  // Per-location column totals
  const locTotals = {};
  for (const loc of shop.locations) {
    locTotals[loc.name] = shop.products.reduce((s, p) => s + (pivot[p][loc.name] ?? 0), 0);
  }

  // Per-product row totals
  const productTotals = {};
  for (const p of shop.products) {
    productTotals[p] = shop.locations.reduce((s, loc) => s + (pivot[p][loc.name] ?? 0), 0);
  }

  const grandTotal = Object.values(locTotals).reduce((s, v) => s + v, 0);

  // Table
  const table = document.createElement('table');
  table.className = 'report-table pivot-table';

  // Header row: Product | Loc1 | Loc2 | ... | Total
  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');

  const thProd = document.createElement('th'); thProd.textContent = 'Product';
  hRow.appendChild(thProd);

  for (const loc of shop.locations) {
    const th = document.createElement('th');
    th.textContent = loc.name; th.className = 'pivot-num';
    hRow.appendChild(th);
  }

  const thTotal = document.createElement('th');
  thTotal.textContent = 'Total'; thTotal.className = 'pivot-num pivot-grand';
  hRow.appendChild(thTotal);

  thead.appendChild(hRow);
  table.appendChild(thead);

  // Body: one row per product
  const tbody = document.createElement('tbody');
  for (const product of shop.products) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = product; tdName.className = 'pivot-row-label';
    tr.appendChild(tdName);

    for (const loc of shop.locations) {
      const td = document.createElement('td');
      const val = pivot[product][loc.name];
      if (val === null) {
        td.textContent = '\u2014'; td.className = 'pivot-num pivot-empty';
      } else {
        td.textContent = val.toFixed(2); td.className = 'pivot-num col-revenue';
      }
      tr.appendChild(td);
    }

    const tdRowTotal = document.createElement('td');
    tdRowTotal.textContent = productTotals[product].toFixed(2);
    tdRowTotal.className = 'pivot-num pivot-grand col-revenue';
    tr.appendChild(tdRowTotal);

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  // Totals row
  const tfoot = document.createElement('tfoot');
  const tRow = document.createElement('tr');
  tRow.className = 'totals-row';

  const tdLabel = document.createElement('td');
  tdLabel.textContent = 'Total'; tdLabel.className = 'totals-label';
  tRow.appendChild(tdLabel);

  for (const loc of shop.locations) {
    const td = document.createElement('td');
    td.textContent = locTotals[loc.name].toFixed(2);
    td.className = 'totals-value col-revenue';
    tRow.appendChild(td);
  }

  const tdGrand = document.createElement('td');
  tdGrand.textContent = grandTotal.toFixed(2);
  tdGrand.className = 'totals-value col-revenue pivot-grand';
  tRow.appendChild(tdGrand);

  tfoot.appendChild(tRow);
  table.appendChild(tfoot);
  panel.appendChild(table);
}

export const initReportsTab = {
  title: "Reports",
  render
};
