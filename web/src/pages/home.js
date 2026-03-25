import { loadRecords } from "../lib/browserRecordStore.js";
import { buildScenarioCurrentViews } from "../lib/scenarioViews.js";
import { renderHomePage } from "../render/homePage.js";

const app = document.querySelector("#app");

function getDueOnly() {
  const params = new URLSearchParams(window.location.search);
  return params.get("filter") === "due";
}

function updateFilter(filter) {
  const nextUrl = new URL(window.location.href);
  if (filter === "due") {
    nextUrl.searchParams.set("filter", "due");
  } else {
    nextUrl.searchParams.delete("filter");
  }

  window.history.replaceState({}, "", nextUrl);
}

function bindFilterActions() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      updateFilter(button.dataset.filter);
      render();
    });
  });
}

function render() {
  const dueOnly = getDueOnly();
  const records = loadRecords();
  const views = buildScenarioCurrentViews(records, records.prototypeClock);
  app.innerHTML = renderHomePage({
    views,
    asOf: records.prototypeClock,
    dueOnly
  });

  bindFilterActions();
}

render();
