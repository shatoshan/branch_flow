const statusLabels = {
  watch: "Watch",
  eligible: "Eligible",
  rejected: "Rejected",
  invalidated: "Invalidated"
};

const phaseLabels = {
  morning: "Morning",
  intraday: "Intraday",
  after_close: "After Close",
  weekly: "Weekly"
};

const triggerLabels = {
  partial: "Partial",
  confirmed: "Confirmed",
  invalidated: "Invalidated"
};

const gateLabels = {
  pass: "Pass",
  fail: "Fail",
  unchecked: "Unchecked"
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatTimestamp(value) {
  if (!value) {
    return "none";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}

export function formatStatus(status) {
  return statusLabels[status] ?? status;
}

export function formatPhase(phase) {
  return phaseLabels[phase] ?? phase ?? "none";
}

export function formatTriggerState(triggerState) {
  return triggerLabels[triggerState] ?? triggerState ?? "none";
}

export function formatGateStatus(status) {
  return gateLabels[status] ?? status ?? "n/a";
}

export function formatBooleanCheck(value) {
  if (value === null || typeof value === "undefined") {
    return "n/a";
  }

  return value ? "true" : "false";
}

export function formatList(values) {
  if (!values || values.length === 0) {
    return "none";
  }

  return values.join(" ; ");
}

export function buildPriceGateSummary(gate, fallbackPolicy) {
  if (!gate) {
    return `policy: ${fallbackPolicy}`;
  }

  if (gate.overall_gate === "pass") {
    return "pass";
  }

  if (gate.overall_gate === "unchecked") {
    return "unchecked";
  }

  const suffix = gate.fail_reason_codes.length > 0 ? `: ${gate.fail_reason_codes.join(", ")}` : "";
  return `fail${suffix}`;
}

export function isDue(nextReviewAt, now) {
  if (!nextReviewAt) {
    return false;
  }

  return new Date(nextReviewAt).getTime() <= new Date(now).getTime();
}

export function compareAscWithNulls(first, second) {
  if (!first && !second) {
    return 0;
  }

  if (!first) {
    return 1;
  }

  if (!second) {
    return -1;
  }

  return new Date(first).getTime() - new Date(second).getTime();
}

export function compareDesc(first, second) {
  return new Date(second).getTime() - new Date(first).getTime();
}
