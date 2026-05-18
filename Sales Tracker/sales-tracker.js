import { initProductEditorTab } from "./tabs/product-editor-tab.js";
import { initPriceEditorTab } from "./tabs/price-editor-tab.js";
import { initLocationsTab } from "./tabs/locations-tab.js";
import { initSalesTab } from "./tabs/sales-tab.js";
import { initReportsTab } from "./tabs/reports-tab.js";
import { shop } from "./shop.js";

const tabRegistry = {
  "product-editor": initProductEditorTab,
  "price-editor": initPriceEditorTab,
  locations: initLocationsTab,
  sales: initSalesTab,
  reports: initReportsTab
};

function renderActivePanel(tabKey) {
  const panel = document.querySelector(`[data-panel="${tabKey}"]`);
  const renderer = tabRegistry[tabKey];

  if (!panel || !renderer) {
    return;
  }

  renderer.render(panel, shop);
}

function activateTab(tabKey) {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabKey;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  renderActivePanel(tabKey);
}

function initializeTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tab);
    });
  });

  activateTab("product-editor");
}

initializeTabs();
