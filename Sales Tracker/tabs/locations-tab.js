import {
  addLocation, editLocation, removeLocation,
  addSale, editSale, removeSale
} from "../shop.js";

let selectedIndex   = 0;
let editingLocIndex  = -1;
let editingSaleIndex = -1;

// ── Main render ───────────────────────────────────────────────────────────────

function render(panel, shop) {
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Locations";
  panel.appendChild(h2);

  if (shop.locations.length > 0 && selectedIndex >= shop.locations.length) {
    selectedIndex = shop.locations.length - 1;
  }

  const layout = document.createElement("div");
  layout.className = "loc-layout";
  layout.appendChild(buildLocList(panel, shop));
  layout.appendChild(buildSalesPanel(panel, shop));
  panel.appendChild(layout);

  if (editingLocIndex !== -1) {
    const inp = panel.querySelector(".loc-list-panel .form-input");
    if (inp) { inp.focus(); inp.select(); }
  } else if (editingSaleIndex !== -1) {
    const inp = panel.querySelector(".inline-input--narrow");
    if (inp) inp.focus();
  }
}

// ── Left panel ────────────────────────────────────────────────────────────────

function buildLocList(mainPanel, shop) {
  const container = document.createElement("div");
  container.className = "loc-list-panel";

  const ul = document.createElement("ul");
  ul.className = "loc-list";

  if (shop.locations.length === 0) {
    const li = document.createElement("li");
    li.className = "loc-item loc-item--empty";
    li.textContent = "No locations yet.";
    ul.appendChild(li);
  }

  shop.locations.forEach((loc, i) => {
    const li = document.createElement("li");
    li.className = "loc-item" + (i === selectedIndex ? " is-selected" : "");

    if (editingLocIndex === i) {
      buildLocEditForm(li, mainPanel, shop, loc, i);
    } else {
      buildLocRow(li, mainPanel, shop, loc, i);
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
  container.appendChild(buildLocAddForm(mainPanel, shop));
  return container;
}

function buildLocRow(li, mainPanel, shop, loc, i) {
  li.addEventListener("click", () => {
    selectedIndex    = i;
    editingLocIndex  = -1;
    editingSaleIndex = -1;
    render(mainPanel, shop);
  });

  const top = document.createElement("div");
  top.className = "loc-item__top";

  const name = document.createElement("span");
  name.className = "loc-item__name";
  name.textContent = loc.name;

  const actions = document.createElement("div");
  actions.className = "loc-item__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-sm";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-sm btn-danger";
  deleteBtn.textContent = "Delete";

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    editingLocIndex  = i;
    editingSaleIndex = -1;
    render(mainPanel, shop);
  });
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeLocation(i);
    editingLocIndex  = -1;
    editingSaleIndex = -1;
    if (selectedIndex >= shop.locations.length) {
      selectedIndex = Math.max(0, shop.locations.length - 1);
    }
    render(mainPanel, shop);
  });

  actions.append(editBtn, deleteBtn);
  top.append(name, actions);

  const meta = document.createElement("div");
  meta.className = "loc-item__meta";

  const coords = document.createElement("span");
  coords.textContent = `${loc.lat}, ${loc.lng}`;

  const badge = document.createElement("span");
  badge.className = "item-badge";
  badge.textContent = `${loc.sales.length} sale${loc.sales.length !== 1 ? "s" : ""}`;

  meta.append(coords, badge);
  li.append(top, meta);
}

function buildLocEditForm(li, mainPanel, shop, loc, i) {
  const nameIn = document.createElement("input");
  nameIn.type        = "text";
  nameIn.value       = loc.name;
  nameIn.placeholder = "Name";
  nameIn.className   = "form-input";

  const coordsRow = document.createElement("div");
  coordsRow.className = "loc-edit-coords";

  const latIn = document.createElement("input");
  latIn.type        = "number";
  latIn.step        = "0.001";
  latIn.value       = loc.lat;
  latIn.placeholder = "Lat";
  latIn.className   = "form-input";

  const lngIn = document.createElement("input");
  lngIn.type        = "number";
  lngIn.step        = "0.001";
  lngIn.value       = loc.lng;
  lngIn.placeholder = "Lng";
  lngIn.className   = "form-input";

  coordsRow.append(latIn, lngIn);

  const btnRow = document.createElement("div");
  btnRow.className = "loc-edit-btns";

  const saveBtn = document.createElement("button");
  saveBtn.className   = "btn btn-sm btn-primary";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className   = "btn btn-sm";
  cancelBtn.textContent = "Cancel";

  saveBtn.addEventListener("click", () => {
    if (editLocation(i, nameIn.value, latIn.value, lngIn.value)) editingLocIndex = -1;
    render(mainPanel, shop);
  });
  cancelBtn.addEventListener("click", () => {
    editingLocIndex = -1;
    render(mainPanel, shop);
  });
  nameIn.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  saveBtn.click();
    if (e.key === "Escape") cancelBtn.click();
  });

  btnRow.append(saveBtn, cancelBtn);
  li.append(nameIn, coordsRow, btnRow);
}

function buildLocAddForm(mainPanel, shop) {
  const form = document.createElement("div");
  form.className = "add-form add-form--stack";

  const nameIn = document.createElement("input");
  nameIn.type        = "text";
  nameIn.placeholder = "Location name";
  nameIn.className   = "form-input";

  const coordsRow = document.createElement("div");
  coordsRow.className = "loc-add-coords";

  const latIn = document.createElement("input");
  latIn.type        = "number";
  latIn.step        = "0.001";
  latIn.placeholder = "Lat";
  latIn.className   = "form-input";

  const lngIn = document.createElement("input");
  lngIn.type        = "number";
  lngIn.step        = "0.001";
  lngIn.placeholder = "Lng";
  lngIn.className   = "form-input";

  coordsRow.append(latIn, lngIn);

  const addBtn = document.createElement("button");
  addBtn.className   = "btn btn-primary";
  addBtn.textContent = "Add Location";

  addBtn.addEventListener("click", () => {
    if (addLocation(nameIn.value, latIn.value, lngIn.value)) {
      selectedIndex    = shop.locations.length - 1;
      editingSaleIndex = -1;
      render(mainPanel, shop);
    } else {
      nameIn.focus();
    }
  });
  [nameIn, latIn, lngIn].forEach(inp =>
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") addBtn.click(); })
  );

  form.append(nameIn, coordsRow, addBtn);
  return form;
}

// ── Right panel ───────────────────────────────────────────────────────────────

function buildSalesPanel(mainPanel, shop) {
  const container = document.createElement("div");
  container.className = "loc-detail-panel";

  if (shop.locations.length === 0) {
    const empty = document.createElement("p");
    empty.className   = "empty-message";
    empty.textContent = "Add a location to manage its sales.";
    container.appendChild(empty);
    return container;
  }

  const loc = shop.locations[selectedIndex];

  // Header
  const header = document.createElement("div");
  header.className = "loc-detail-header";

  const title = document.createElement("span");
  title.className   = "loc-detail-title";
  title.textContent = loc.name;

  const coords = document.createElement("span");
  coords.className   = "loc-detail-coords";
  coords.textContent = `${loc.lat}, ${loc.lng}`;

  header.append(title, coords);
  container.appendChild(header);

  // Sales table
  const table = document.createElement("table");
  table.className = "data-table";

  const thead = document.createElement("thead");
  const hRow  = document.createElement("tr");
  [["#", "col-num"], ["Product", ""], ["Qty", "col-qty"],
   ["Unit price", "col-price-col"], ["Total", "col-total"], ["Actions", "col-actions"]]
    .forEach(([label, cls]) => {
      const th = document.createElement("th");
      th.textContent = label;
      if (cls) th.className = cls;
      hRow.appendChild(th);
    });
  thead.appendChild(hRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  if (loc.sales.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan     = 6;
    td.className   = "empty-cell";
    td.textContent = "No sales for this location.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  loc.sales.forEach((sale, si) => {
    const [product, qty] = sale;
    const tr = document.createElement("tr");

    const numTd = document.createElement("td");
    numTd.className   = "col-num";
    numTd.textContent = si + 1;

    if (editingSaleIndex === si) {
      const productTd  = document.createElement("td");
      const productSel = document.createElement("select");
      productSel.className = "select-input";
      shop.products.forEach((p) => {
        const opt = document.createElement("option");
        opt.value       = p;
        opt.textContent = p;
        opt.selected    = p === product;
        productSel.appendChild(opt);
      });
      productTd.appendChild(productSel);

      const qtyTd = document.createElement("td");
      const qtyIn = document.createElement("input");
      qtyIn.type      = "number";
      qtyIn.min       = "1";
      qtyIn.value     = qty;
      qtyIn.className = "inline-input inline-input--narrow";
      qtyTd.appendChild(qtyIn);

      const actionsTd = document.createElement("td");
      actionsTd.className = "col-actions";
      actionsTd.colSpan   = 3;

      const saveBtn = document.createElement("button");
      saveBtn.className   = "btn btn-sm btn-primary";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.className   = "btn btn-sm";
      cancelBtn.textContent = "Cancel";

      saveBtn.addEventListener("click", () => {
        if (editSale(selectedIndex, si, productSel.value, qtyIn.value)) editingSaleIndex = -1;
        render(mainPanel, shop);
      });
      cancelBtn.addEventListener("click", () => {
        editingSaleIndex = -1;
        render(mainPanel, shop);
      });
      qtyIn.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  saveBtn.click();
        if (e.key === "Escape") cancelBtn.click();
      });

      actionsTd.append(saveBtn, cancelBtn);
      tr.append(numTd, productTd, qtyTd, actionsTd);
    } else {
      const productTd = document.createElement("td");
      productTd.textContent = product;

      const qtyTd = document.createElement("td");
      qtyTd.className   = "col-qty";
      qtyTd.textContent = qty;

      const price   = shop.prices[product];
      const priceTd = document.createElement("td");
      priceTd.className   = "col-price-col price-value";
      priceTd.textContent = price !== undefined ? price.toFixed(2) : "\u2014";

      const totalTd = document.createElement("td");
      totalTd.className   = "col-total";
      totalTd.textContent = price !== undefined ? (price * qty).toFixed(2) : "\u2014";

      const actionsTd = document.createElement("td");
      actionsTd.className = "col-actions";

      const editBtn = document.createElement("button");
      editBtn.className   = "btn btn-sm";
      editBtn.textContent = "Edit";

      const deleteBtn = document.createElement("button");
      deleteBtn.className   = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";

      editBtn.addEventListener("click", () => {
        editingSaleIndex = si;
        render(mainPanel, shop);
      });
      deleteBtn.addEventListener("click", () => {
        removeSale(selectedIndex, si);
        editingSaleIndex = -1;
        render(mainPanel, shop);
      });

      actionsTd.append(editBtn, deleteBtn);
      tr.append(numTd, productTd, qtyTd, priceTd, totalTd, actionsTd);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  // Add-sale form
  if (shop.products.length === 0) {
    const note = document.createElement("p");
    note.className   = "price-notice";
    note.textContent = "Add products in the Product Editor before recording sales.";
    container.appendChild(note);
    return container;
  }

  const addForm = document.createElement("div");
  addForm.className = "add-form";

  const productSel = document.createElement("select");
  productSel.className = "select-input";
  shop.products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value       = p;
    opt.textContent = p;
    productSel.appendChild(opt);
  });

  const qtyIn = document.createElement("input");
  qtyIn.type      = "number";
  qtyIn.min       = "1";
  qtyIn.value     = "1";
  qtyIn.className = "form-input form-input--narrow";

  const addBtn = document.createElement("button");
  addBtn.className   = "btn btn-primary";
  addBtn.textContent = "Add Sale";

  addBtn.addEventListener("click", () => {
    if (addSale(selectedIndex, productSel.value, qtyIn.value)) {
      render(mainPanel, shop);
    }
  });
  qtyIn.addEventListener("keydown", (e) => { if (e.key === "Enter") addBtn.click(); });

  addForm.append(productSel, qtyIn, addBtn);
  container.appendChild(addForm);

  return container;
}

export const initLocationsTab = {
  title: "Locations",
  render
};
