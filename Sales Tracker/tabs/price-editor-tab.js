import { setPrice } from "../shop.js";

let editingIndex = -1;

function render(panel, shop) {
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Price Editor";
  panel.appendChild(h2);

  const list = document.createElement("ul");
  list.className = "item-list";

  shop.products.forEach((product, i) => {
    const row = document.createElement("li");
    row.className = "item-row";

    const currentPrice = shop.prices[product];

    if (editingIndex === i) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "item-name";
      nameSpan.textContent = product;

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.01";
      input.value = currentPrice !== undefined ? currentPrice : "";
      input.className = "inline-input inline-input--narrow";

      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-sm btn-primary";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-sm";
      cancelBtn.textContent = "Cancel";

      saveBtn.addEventListener("click", () => {
        if (setPrice(product, input.value)) editingIndex = -1;
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

      row.append(nameSpan, input, saveBtn, cancelBtn);
    } else {
      const name = document.createElement("span");
      name.className = "item-name";
      name.textContent = product;

      const priceSpan = document.createElement("span");
      priceSpan.className = "item-price";
      priceSpan.textContent = currentPrice !== undefined ? currentPrice.toFixed(2) : "—";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm";
      editBtn.textContent = "Set Price";

      editBtn.addEventListener("click", () => {
        editingIndex = i;
        render(panel, shop);
      });

      row.append(name, priceSpan, editBtn);
    }

    list.appendChild(row);
  });

  panel.appendChild(list);

  if (editingIndex !== -1) {
    const inp = panel.querySelector(".inline-input");
    if (inp) { inp.focus(); inp.select(); }
  }
}

export const initPriceEditorTab = {
  title: "Price Editor",
  render
};
