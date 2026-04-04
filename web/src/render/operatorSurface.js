import { escapeHtml } from "../lib/formatters.js";

function renderNotice(notice) {
  if (!notice) {
    return "";
  }

  return `<div class="feedback-note">${escapeHtml(notice)}</div>`;
}

function renderErrors(errors) {
  if (!errors || errors.length === 0) {
    return "";
  }

  return `
    <div class="form-errors">
      <p class="form-errors-title">JSON を読み込めませんでした</p>
      <ul class="form-error-list">
        ${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
      </ul>
    </div>
  `;
}

export function renderOperatorSurface({ importJsonText = "", notice = "", errors = [] } = {}) {
  return `
    <section class="panel entry-panel operator-panel">
      <div class="operator-heading">
        <div>
          <h2 class="section-title">保存スナップショット操作</h2>
          <p class="section-copy">現在のブラウザ保存を JSON として持ち運べるようにし、sample seed への復元と JSON の置き換えをここで行います。</p>
        </div>
        <div class="action-row">
          <button class="action ghost" type="button" data-export-records>JSON を書き出す</button>
          <button class="action ghost danger" type="button" data-reset-records>sample seed に戻す</button>
        </div>
      </div>
      <p class="field-hint">seed reset と JSON import は、現在のブラウザ保存を丸ごと置き換えます。必要なら先に export してください。</p>
      ${renderNotice(notice)}
      ${renderErrors(errors)}
      <form class="scenario-form operator-import-form" data-import-form>
        <label class="field field-wide">
          <span>JSON ファイル</span>
          <input type="file" accept=".json,application/json" data-import-file />
          <small class="field-hint">export 済み JSON を選ぶと下の入力欄へ読み込みます。直接貼り付けても構いません。</small>
        </label>
        <label class="field field-wide">
          <span>JSON 本文</span>
          <textarea name="import_json" rows="12" data-import-json placeholder="{ ... }">${escapeHtml(importJsonText)}</textarea>
        </label>
        <div class="form-actions">
          <button class="action primary" type="submit">JSON を読み込む</button>
        </div>
      </form>
    </section>
  `;
}
