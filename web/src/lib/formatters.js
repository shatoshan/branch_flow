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

const tokyoDayFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo"
});

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

export function formatCodeLabel(value) {
  if (!value) {
    return "none";
  }

  return String(value).replaceAll("_", " ");
}

export function formatCodeList(values) {
  if (!values || values.length === 0) {
    return "none";
  }

  return values.map((value) => formatCodeLabel(value)).join(" ; ");
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

export function diffMinutes(later, earlier) {
  if (!later || !earlier) {
    return null;
  }

  return Math.max(0, Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / 60000));
}

export function formatMinuteGap(value) {
  if (value === null || typeof value === "undefined") {
    return "n/a";
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function isSameTokyoDay(first, second) {
  if (!first || !second) {
    return false;
  }

  return tokyoDayFormatter.format(new Date(first)) === tokyoDayFormatter.format(new Date(second));
}

export function buildPriceFreshnessSummary(view) {
  if (!view.linked_price_gate_id || view.linked_price_gate === null) {
    return "Price not checked in the linked review.";
  }

  if (view.linked_price_gate === "unchecked") {
    return "Price still unchecked in the linked review.";
  }

  const gapText = formatMinuteGap(view.gate_decision_gap_minutes);

  if (view.price_freshness_state === "fresh") {
    return `Price fresh: checked ${gapText} before the latest decision.`;
  }

  if (view.price_freshness_state === "aging") {
    return `Price aging: checked ${gapText} before the latest decision.`;
  }

  return `Price stale: checked ${gapText} before the latest decision.`;
}

export function buildDecisionSummary(view) {
  const reasonCode = formatCodeLabel(view.latest_reason_code);
  const reasonDetail = view.latest_reason_detail ? formatCodeLabel(view.latest_reason_detail) : "";
  const failReasons = formatCodeList(view.linked_fail_reason_codes);

  let label = "Why not now";
  let line = "";

  if (view.current_status === "eligible") {
    label = "Why now";
    line =
      view.linked_trigger_state === "confirmed" && view.linked_price_gate === "pass"
        ? "Trigger confirmed and price gate passed."
        : `${reasonCode}${reasonDetail ? `: ${reasonDetail}` : "."}`;
  } else if (view.current_status === "rejected") {
    line =
      view.linked_price_gate === "fail"
        ? failReasons !== "none"
          ? `Price gate failed on ${failReasons}.`
          : "Price gate failed."
        : `${reasonCode}${reasonDetail ? `: ${reasonDetail}` : "."}`;
  } else if (view.current_status === "invalidated") {
    label = "Kill switch";
    line = reasonDetail || reasonCode;
    if (!line.endsWith(".")) {
      line = `${line}.`;
    }
  } else if (view.linked_trigger_state === "confirmed" && (!view.linked_price_gate_id || view.linked_price_gate === "unchecked")) {
    line = "Trigger confirmed, but price has not been checked yet.";
  } else if (view.linked_trigger_state === "partial") {
    line = "Trigger is still partial.";
  } else if (view.linked_trigger_state === "invalidated") {
    line = "Latest linked observation already touched the kill switch.";
  } else if (view.linked_snapshot_id) {
    line = `${reasonCode}${reasonDetail ? `: ${reasonDetail}` : "."}`;
  } else {
    line = "No linked review yet.";
  }

  const compact = `${label}: ${line}`;

  return {
    label,
    line,
    compact
  };
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
