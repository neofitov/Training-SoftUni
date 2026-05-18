import { shop } from "../shop.js";

let sortCol = null;
let sortDir = 1;
let filterProduct = '';
let filterLocation = '';

function flatSales(shop) {
  const rows = [];
  shop.locations.forEach((loc) => {
    loc.sales.forEach((sale) => {
      const [product, qty] = sale;
      const price = shop.prices[product];
      const revenue = price !== undefined ? price * qty : null;
      rows.push({ product, location: loc.name, qty, price, revenue });
    });
  });
  return rows;
}

function render(panel, shop) {
  panel.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = 'Sales';
  panel.appendChild(h2);

  const allSales = flatSales(shop);

  // Filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';

  const productSel = document.createElement('select');
  productSel.className = 'select-input';
  const allProdOpt = document.createElement('option');
  allProdOpt.value = ''; allProdOpt.textContent = 'All products';
  productSel.appendChild(allProdOpt);
  [...new Set(allSales.map(r => r.product))].sort().forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p; opt.selected = p === filterProduct;
    productSel.appendChild(opt);
  });
  productSel.addEventListener('change', () => { filterProduct = productSel.value; render(panel, shop); });

  const locationSel = document.createElement('select');
  locationSel.className = 'select-input';
  const allLocOpt = document.createElement('option');
  allLocOpt.value = ''; allLocOpt.textContent = 'All locations';
  locationSel.appendChild(allLocOpt);
  shop.locations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc.name; opt.textContent = loc.name; opt.selected = loc.name === filterLocation;
    locationSel.appendChild(opt);
  });
  locationSel.addEventListener('change', () => { filterLocation = locationSel.value; render(panel, shop); });

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn btn-sm';
  clearBtn.textContent = 'Clear filters';
  clearBtn.addEventListener('click', () => { filterProduct = ''; filterLocation = ''; render(panel, shop); });

  filterBar.append(productSel, locationSel, clearBtn);
  panel.appendChild(filterBar);

  // Apply filter + sort
  let rows = allSales;
  if (filterProduct)  rows = rows.filter(r => r.product  === filterProduct);
  if (filterLocation) rows = rows.filter(r => r.location === filterLocation);

  if (sortCol) {
    rows = [...rows].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      const nullVal = sortDir === 1 ? Infinity : -Infinity;
      if (av == null) av = nullVal;
      if (bv == null) bv = nullVal;
      if (typeof av === 'string') return sortDir * av.localeCompare(bv);
      return sortDir * (av - bv);
    });
  }

  // Table
  const table = document.createElement('table');
  table.className = 'data-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  [
    { key: 'product',  label: 'Product'    },
    { key: 'location', label: 'Location'   },
    { key: 'qty',      label: 'Qty'        },
    { key: 'price',    label: 'Unit Price' },
    { key: 'revenue',  label: 'Revenue'    },
  ].forEach(col => {
    const th = document.createElement('th');
    const btn = document.createElement('button');
    const isActive = sortCol === col.key;
    btn.className = 'sort-btn' + (isActive ? ' sort-btn--active' : '');
    btn.textContent = col.label + (isActive ? (sortDir === 1 ? ' \u2191' : ' \u2193') : ' \u2195');
    btn.addEventListener('click', () => {
      sortDir = sortCol === col.key ? sortDir * -1 : 1;
      sortCol = col.key;
      render(panel, shop);
    });
    th.appendChild(btn);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5; td.className = 'empty-cell';
    td.textContent = allSales.length === 0
      ? 'No sales recorded yet.'
      : 'No sales match the current filters.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const tdP = document.createElement('td'); tdP.textContent = row.product;
      const tdL = document.createElement('td'); tdL.textContent = row.location;
      const tdQ = document.createElement('td'); tdQ.textContent = row.qty;
      const tdU = document.createElement('td');
      tdU.className = 'col-price';
      tdU.textContent = row.price !== undefined ? row.price.toFixed(2) : '\u2014';
      const tdR = document.createElement('td');
      tdR.className = 'col-revenue';
      tdR.textContent = row.revenue !== null ? row.revenue.toFixed(2) : '\u2014';
      tr.append(tdP, tdL, tdQ, tdU, tdR);
      tbody.appendChild(tr);
    });
  }
  table.appendChild(tbody);

  // Totals row
  const tfoot = document.createElement('tfoot');
  const totalRow = document.createElement('tr');
  totalRow.className = 'totals-row';
  const totalQty     = rows.reduce((s, r) => s + r.qty, 0);
  const totalRevenue = rows.reduce((s, r) => s + (r.revenue ?? 0), 0);

  const tdLabel = document.createElement('td');
  tdLabel.colSpan = 2; tdLabel.className = 'totals-label';
  tdLabel.textContent = `Total (${rows.length} sale${rows.length !== 1 ? 's' : ''})`;
  const tdTQ = document.createElement('td');
  tdTQ.className = 'totals-value'; tdTQ.textContent = totalQty;
  const tdBlank = document.createElement('td');
  const tdTR = document.createElement('td');
  tdTR.className = 'totals-value col-revenue'; tdTR.textContent = totalRevenue.toFixed(2);
  totalRow.append(tdLabel, tdTQ, tdBlank, tdTR);
  tfoot.appendChild(totalRow);
  table.appendChild(tfoot);
  panel.appendChild(table);
}

export const initSalesTab = {
  title: "Sales",
  render
};
