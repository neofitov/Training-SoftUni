import { addProduct, editProduct, removeProduct } from "../shop.js";

let editingIndex = -1;
let lastDeleted = null; // { name, hadPrice, salesCount }

/** Total quantity sold for a product across all locations. */
function getTotalSales(shop, product) {
  let total = 0;
  for (const loc of shop.locations) {
    for (const [name, qty] of loc.sales) {
      if (name === product) total += qty;
    }
  }
  return total;
}

function renderNotice(panel, shop) {
  if (!lastDeleted) return;
  const { name, hadPrice, salesCount } = lastDeleted;

  const parts = [];
  if (hadPrice) parts.push("price entry");
  if (salesCount > 0) parts.push(`${salesCount} sale record${salesCount !== 1 ? "s" : ""}`);
  const cascade = parts.length ? ` — also removed: ${parts.join(" and ")}.` : ".";

  const notice = document.createElement("div");
  notice.className = "notice notice--success";

  const msg = document.createElement("span");
  msg.textContent = `"${name}" deleted${cascade}`;

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "notice__dismiss";
  dismissBtn.textContent = "\u2715";
  dismissBtn.setAttribute("aria-label", "Dismiss");
  dismissBtn.addEventListener("click", () => {
    lastDeleted = null;
    render(panel, shop);
  });

  notice.append(msg, dismissBtn);
  panel.appendChild(notice);
}

function renderTable(panel, shop) {
  const table = document.createElement("table");
  table.className = "data-table";

  // ── thead ────────────────────────────────────────────────
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  [
    ["#",          "col-num"],
    ["Product",    ""],
    ["Price",      "col-price"],
    ["Sales (qty)","col-sales"],
    ["Actions",    "col-actions"],
  ].forEach(([label, cls]) => {
    const th = document.createElement("th");
    th.textContent = label;
    if (cls) th.className = cls;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ── tbody ────────────────────────────────────────────────
  const tbody = document.createElement("tbody");

  if (shop.products.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "empty-cell";
    td.textContent = "No products yet.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  shop.products.forEach((product, i) => {
    const tr = document.createElement("tr");
    const price = shop.prices[product];
    const priceText = price !== undefined ? price.toFixed(2) : "\u2014";
    const totalQty = getTotalSales(shop, product);

    if (editingIndex === i) {
      const numTd = document.createElement("td");
      numTd.className = "col-num";
      numTd.textContent = i + 1;

      const nameTd = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.value = product;
      input.className = "inline-input";
      nameTd.appendChild(input);

      const priceTd = document.createElement("td");
      priceTd.className = "col-price";
      priceTd.textContent = priceText;

      const salesTd = document.createElement("td");
      salesTd.className = "col-sales";
      salesTd.textContent = totalQty;

      const actionsTd = document.createElement("td");
      actionsTd.className = "col-actions";

      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-sm btn-primary";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-sm";
      cancelBtn.textContent = "Cancel";

      saveBtn.addEventListener("click", () => {
        if (editProduct(product, input.value)) editingIndex = -1;
        render(panel, shop);
      });
      cancelBtn.addEventListener("click", () => {
        editingIndex = -1;
        render(panel, shop);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveBtn.click();
        if (e.key === "Escape") cancelBtn.click();
      });

      actionsTd.append(saveBtn, cancelBtn);
      tr.append(numTd, nameTd, priceTd, salesTd, actionsTd);
    } else {
      const numTd = document.createElement("td");
      numTd.className = "col-num";
      numTd.textContent = i + 1;

      const nameTd = document.createElement("td");
      nameTd.textContent = product;

      const priceTd = document.createElement("td");
      priceTd.className = "col-price";
      priceTd.textContent = priceText;

      const salesTd = document.createElement("td");
      salesTd.className = "col-sales";
      salesTd.textContent = totalQty;

      const actionsTd = document.createElement("td");
      actionsTd.className = "col-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm";
      editBtn.textContent = "Edit";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";

      editBtn.addEventListener("click", () => {
        editingIndex = i;
        lastDeleted = null;
        render(panel, shop);
      });
      deleteBtn.addEventListener("click", () => {
        // Capture cascade info BEFORE deletion
        const salesCount = getTotalSales(shop, product);
        const hadPrice = product in shop.prices;
        removeProduct(product);
        editingIndex = -1;
        lastDeleted = { name: product, hadPrice, salesCount };
        render(panel, shop);
      });

      actionsTd.append(editBtn, deleteBtn);
      tr.append(numTd, nameTd, priceTd, salesTd, actionsTd);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  panel.appendChild(table);

  if (editingIndex !== -1) {
    const inp = panel.querySelector(".inline-input");
    if (inp) { inp.focus(); inp.select(); }
  }
}

function renderAddForm(panel, shop) {
  const addForm = document.createElement("div");
  addForm.className = "add-form";

  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.placeholder = "New product name";
  newInput.className = "form-input";

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Add Product";

  addBtn.addEventListener("click", () => {
    if (addProduct(newInput.value)) {
      lastDeleted = null;
      render(panel, shop);
    } else {
      newInput.focus();
    }
  });
  newInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  addForm.append(newInput, addBtn);
  panel.appendChild(addForm);
}

function render(panel, shop) {
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Product Editor";
  panel.appendChild(h2);

  renderNotice(panel, shop);
  renderTable(panel, shop);
  renderAddForm(panel, shop);
}

export const initProductEditorTab = {
  title: "Product Editor",
  render
};
