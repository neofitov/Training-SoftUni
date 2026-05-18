import { addSale, editSale, removeSale } from "../shop.js";

let selectedLocationIndex = 0;
let editingSaleIndex = -1;

function render(panel, shop) {
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Sales";
  panel.appendChild(h2);

  if (shop.locations.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No locations yet. Add a location first.";
    panel.appendChild(empty);
    return;
  }

  if (selectedLocationIndex >= shop.locations.length) selectedLocationIndex = 0;

  // Location selector
  const selectorRow = document.createElement("div");
  selectorRow.className = "selector-row";

  const label = document.createElement("label");
  label.htmlFor = "location-select";
  label.textContent = "Location:";
  label.className = "selector-label";

  const select = document.createElement("select");
  select.id = "location-select";
  select.className = "select-input";

  shop.locations.forEach((loc, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = loc.name;
    opt.selected = i === selectedLocationIndex;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    selectedLocationIndex = parseInt(select.value, 10);
    editingSaleIndex = -1;
    render(panel, shop);
  });

  selectorRow.append(label, select);
  panel.appendChild(selectorRow);

  const loc = shop.locations[selectedLocationIndex];

  // Sales list
  const list = document.createElement("ul");
  list.className = "item-list";

  if (loc.sales.length === 0) {
    const empty = document.createElement("li");
    empty.className = "item-row item-row--empty";
    empty.textContent = "No sales for this location yet.";
    list.appendChild(empty);
  }

  loc.sales.forEach((sale, saleIdx) => {
    const [product, qty] = sale;
    const row = document.createElement("li");
    row.className = "item-row";

    if (editingSaleIndex === saleIdx) {
      const productSelect = document.createElement("select");
      productSelect.className = "select-input";
      shop.products.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        opt.selected = p === product;
        productSelect.appendChild(opt);
      });

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "1";
      qtyInput.value = qty;
      qtyInput.className = "inline-input inline-input--narrow";

      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-sm btn-primary";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-sm";
      cancelBtn.textContent = "Cancel";

      saveBtn.addEventListener("click", () => {
        if (editSale(selectedLocationIndex, saleIdx, productSelect.value, qtyInput.value)) editingSaleIndex = -1;
        render(panel, shop);
      });
      cancelBtn.addEventListener("click", () => {
        editingSaleIndex = -1;
        render(panel, shop);
      });
      qtyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveBtn.click();
        if (e.key === "Escape") cancelBtn.click();
      });

      row.append(productSelect, qtyInput, saveBtn, cancelBtn);
    } else {
      const productSpan = document.createElement("span");
      productSpan.className = "item-name";
      productSpan.textContent = product;

      const qtySpan = document.createElement("span");
      qtySpan.className = "item-qty";
      qtySpan.textContent = `\u00d7 ${qty}`;

      row.append(productSpan, qtySpan);

      const price = shop.prices[product];
      if (price !== undefined) {
        const totalSpan = document.createElement("span");
        totalSpan.className = "item-total";
        totalSpan.textContent = `= ${(price * qty).toFixed(2)}`;
        row.appendChild(totalSpan);
      }

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm";
      editBtn.textContent = "Edit";

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-sm btn-danger";
      removeBtn.textContent = "Remove";

      editBtn.addEventListener("click", () => {
        editingSaleIndex = saleIdx;
        render(panel, shop);
      });
      removeBtn.addEventListener("click", () => {
        removeSale(selectedLocationIndex, saleIdx);
        editingSaleIndex = -1;
        render(panel, shop);
      });

      row.append(editBtn, removeBtn);
    }

    list.appendChild(row);
  });

  panel.appendChild(list);

  // Add sale form
  const addForm = document.createElement("div");
  addForm.className = "add-form";

  const productSelect = document.createElement("select");
  productSelect.className = "select-input";
  shop.products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    productSelect.appendChild(opt);
  });

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyInput.placeholder = "Qty";
  qtyInput.className = "form-input form-input--narrow";

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Add Sale";

  addBtn.addEventListener("click", () => {
    if (addSale(selectedLocationIndex, productSelect.value, qtyInput.value)) {
      render(panel, shop);
    }
  });

  addForm.append(productSelect, qtyInput, addBtn);
  panel.appendChild(addForm);
}

export const initSalesTab = {
  title: "Sales",
  render
};
