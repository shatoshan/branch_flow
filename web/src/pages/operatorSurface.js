import {
  exportRecordsJson,
  importRecordsFromJson,
  loadRecords,
  resetRecordsInStore
} from "../lib/browserRecordStore.js";

function setNotice(state, notice) {
  state.notice = notice;
  state.errors = [];
}

function setErrors(state, errors) {
  state.notice = "";
  state.errors = errors;
}

function buildExportFileName(records) {
  const stampSource = String(records?.prototypeClock ?? new Date().toISOString());
  const compactStamp = stampSource.replaceAll("-", "").replaceAll(":", "").replace("+", "_").replaceAll(".", "");
  return `branchflow-records-${compactStamp}.json`;
}

function downloadJsonFile(filename, content) {
  const blob = new Blob([content], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function createOperatorSurfaceState() {
  return {
    importJsonText: "",
    notice: "",
    errors: []
  };
}

export function bindOperatorSurface({ state, render }) {
  const exportButton = document.querySelector("[data-export-records]");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const records = loadRecords();
      const exportedJson = exportRecordsJson(records);
      downloadJsonFile(buildExportFileName(records), exportedJson);
      state.importJsonText = exportedJson;
      setNotice(state, "現在のブラウザ保存を JSON として書き出しました");
      render();
    });
  }

  const resetButton = document.querySelector("[data-reset-records]");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "現在のブラウザ保存を破棄して sample seed に戻します。必要なら先に JSON を書き出してください。"
      );
      if (!confirmed) {
        return;
      }

      resetRecordsInStore();
      state.importJsonText = "";
      setNotice(state, "sample seed に復元しました");
      render();
    });
  }

  const importFileInput = document.querySelector("[data-import-file]");
  if (importFileInput) {
    importFileInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        state.importJsonText = await file.text();
        setNotice(state, `${file.name} を読み込みました。内容を確認してから JSON を読み込んでください`);
      } catch (error) {
        setErrors(state, [`JSON ファイルを読み込めませんでした: ${error.message}`]);
      }

      render();
    });
  }

  const importTextarea = document.querySelector("[data-import-json]");
  if (importTextarea) {
    importTextarea.addEventListener("input", () => {
      state.importJsonText = importTextarea.value;
      if (state.notice || state.errors.length > 0) {
        state.notice = "";
        state.errors = [];
      }
    });
  }

  const importForm = document.querySelector("[data-import-form]");
  if (importForm) {
    importForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const rawJson = String(new FormData(importForm).get("import_json") ?? "");
      state.importJsonText = rawJson;

      if (!rawJson.trim()) {
        setErrors(state, ["JSON 本文を貼り付けるか、JSON ファイルを選択してください"]);
        render();
        return;
      }

      const confirmed = window.confirm(
        "現在のブラウザ保存を入力した JSON で置き換えます。続ける前に必要な export を済ませてください。"
      );
      if (!confirmed) {
        return;
      }

      const result = importRecordsFromJson(rawJson);
      if (!result.ok) {
        setErrors(state, result.errors);
        render();
        return;
      }

      state.importJsonText = exportRecordsJson(result.records);
      setNotice(state, "JSON を読み込み、ブラウザ保存を置き換えました");
      render();
    });
  }
}
