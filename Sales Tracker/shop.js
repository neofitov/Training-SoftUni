export const shop = {
  products: ['bread', 'butter', 'eggs', 'yogurt'],
  prices: { butter: 5.30, eggs: 0.40, bread: 3.50, yogurt: 1.65 },
  locations: [
    {
      name: "Sofia", lat: 42.657, lng: 23.316,
      sales: [['bread', 2], ['eggs', 5], ['butter', 1]]
    },
    {
      name: "Plovdiv", lat: 42.145, lng: 24.779,
      sales: [['eggs', 3], ['butter', 2], ['bread', 1]]
    }
  ]
};

// ── Products ─────────────────────────────────────────────────────────────────

export function addProduct(name) {
  const trimmed = name.trim();
  if (!trimmed || shop.products.includes(trimmed)) return false;
  shop.products.push(trimmed);
  return true;
}

export function editProduct(oldName, newName) {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return false;
  if (shop.products.includes(trimmed)) return false;
  const idx = shop.products.indexOf(oldName);
  if (idx === -1) return false;
  shop.products[idx] = trimmed;
  if (oldName in shop.prices) {
    shop.prices[trimmed] = shop.prices[oldName];
    delete shop.prices[oldName];
  }
  for (const loc of shop.locations) {
    for (const sale of loc.sales) {
      if (sale[0] === oldName) sale[0] = trimmed;
    }
  }
  return true;
}

export function removeProduct(name) {
  const idx = shop.products.indexOf(name);
  if (idx === -1) return false;
  shop.products.splice(idx, 1);
  delete shop.prices[name];
  for (const loc of shop.locations) {
    loc.sales = loc.sales.filter(s => s[0] !== name);
  }
  return true;
}

// ── Prices ────────────────────────────────────────────────────────────────────

export function setPrice(product, price) {
  if (!shop.products.includes(product)) return false;
  const p = parseFloat(price);
  if (isNaN(p) || p < 0) return false;
  shop.prices[product] = p;
  return true;
}

// ── Locations ─────────────────────────────────────────────────────────────────

export function addLocation(name, lat, lng) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (isNaN(la) || isNaN(ln)) return false;
  shop.locations.push({ name: trimmed, lat: la, lng: ln, sales: [] });
  return true;
}

export function editLocation(index, name, lat, lng) {
  const loc = shop.locations[index];
  if (!loc) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (isNaN(la) || isNaN(ln)) return false;
  loc.name = trimmed;
  loc.lat = la;
  loc.lng = ln;
  return true;
}

export function removeLocation(index) {
  if (index < 0 || index >= shop.locations.length) return false;
  shop.locations.splice(index, 1);
  return true;
}

// ── Sales ─────────────────────────────────────────────────────────────────────

export function addSale(locationIndex, product, qty) {
  const loc = shop.locations[locationIndex];
  if (!loc || !shop.products.includes(product)) return false;
  const q = parseInt(qty, 10);
  if (isNaN(q) || q <= 0) return false;
  loc.sales.push([product, q]);
  return true;
}

export function editSale(locationIndex, saleIndex, product, qty) {
  const loc = shop.locations[locationIndex];
  if (!loc) return false;
  const sale = loc.sales[saleIndex];
  if (!sale || !shop.products.includes(product)) return false;
  const q = parseInt(qty, 10);
  if (isNaN(q) || q <= 0) return false;
  sale[0] = product;
  sale[1] = q;
  return true;
}

export function removeSale(locationIndex, saleIndex) {
  const loc = shop.locations[locationIndex];
  if (!loc) return false;
  if (saleIndex < 0 || saleIndex >= loc.sales.length) return false;
  loc.sales.splice(saleIndex, 1);
  return true;
}
