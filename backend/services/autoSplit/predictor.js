// Auto-split predictor.
//
// Learns each group's per-member opt-in habits and suggests which line items to
// pre-check for a new receipt, so members don't re-declare "yes I had the milk"
// every single grocery run. This is the part of the product that nobody else
// has: it runs on the participation history you already collect.
//
// Design:
// - Pure functions. No DB, no network. The caller supplies `history` (a flat
//   list of past opt-in observations) and the current receipt `items`. Keeping
//   the core pure makes it unit-testable and lets the data source evolve
//   independently (see buildHistoryFromExpenses for the Mongo adapter).
//
// - Estimation is hierarchical empirical-Bayes shrinkage. For "will member m
//   opt into item k (category c)?" we start from a population prior (0.5) and
//   shrink, step by step, toward more specific evidence:
//       0.5
//        -> group overall opt-in rate
//        -> group rate for category c        (is this category widely shared?)
//        -> member m overall rate            (is m an inclusive splitter?)
//        -> member m rate for category c
//        -> member m rate for item k         (most specific)
//   Each level pulls toward the running estimate with strength `kappa`. Sparse
//   data => the estimate stays near the broader prior instead of over-fitting
//   one stray observation.
//
// - We only make an ACTIVE suggestion (pre-check, or confidently-leave-blank)
//   when there is genuine member-specific evidence AND the estimate is
//   decisive. A brand-new group therefore behaves exactly like today: no
//   suggestions, safe default. Suggestions never auto-submit — they only
//   pre-fill checkboxes the member can override, and overrides are the gold
//   feedback signal to log.

const DEFAULTS = {
  kappa: 3, // prior strength (pseudo-observations) at each shrink level
  halfLifeDays: 120, // recency half-life: a 4-month-old habit counts half
  highThreshold: 0.6, // estimate >= this (with evidence) => suggest checked
  lowThreshold: 0.2, // estimate <= this (with evidence) => confident "not in"
  minEvidence: 2, // min weighted member-specific observations to make a claim
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function recencyWeight(timestamp, now, halfLifeDays) {
  if (timestamp == null) return 1;
  const ageDays = Math.max(0, (now - new Date(timestamp).getTime()) / MS_PER_DAY);
  return Math.pow(0.5, ageDays / halfLifeDays);
}

// Recency-weighted opt-in tally over observations matching `predicate`.
function aggregate(history, predicate, now, halfLifeDays) {
  let optIn = 0;
  let total = 0;
  let rawOptIn = 0;
  let rawTotal = 0;
  for (const o of history) {
    if (!predicate(o)) continue;
    const w = recencyWeight(o.timestamp, now, halfLifeDays);
    total += w;
    rawTotal += 1;
    if (o.optedIn) {
      optIn += w;
      rawOptIn += 1;
    }
  }
  return { optIn, total, rawOptIn, rawTotal };
}

// Beta-Binomial posterior mean: shrink the observed rate toward `priorRate`
// with `kappa` pseudo-observations of weight.
function shrink(priorRate, agg, kappa) {
  return (kappa * priorRate + agg.optIn) / (kappa + agg.total);
}

function predictOne(memberId, canonicalItem, category, history, now, cfg) {
  const { kappa, halfLifeDays } = cfg;
  const agg = (pred) => aggregate(history, pred, now, halfLifeDays);

  const groupAll = agg(() => true);
  const groupCat = agg((o) => o.category === category);
  const memberAll = agg((o) => o.memberId === memberId);
  const memberCat = agg((o) => o.memberId === memberId && o.category === category);
  const memberItem = agg(
    (o) => o.memberId === memberId && o.canonicalItem === canonicalItem
  );

  // Shrink from population down to the most specific evidence.
  let p = 0.5;
  p = shrink(p, groupAll, kappa);
  p = shrink(p, groupCat, kappa);
  p = shrink(p, memberAll, kappa);
  p = shrink(p, memberCat, kappa);
  p = shrink(p, memberItem, kappa);

  // Evidence = the most specific member-level tally that actually has data.
  // (We deliberately do NOT count group-wide rates as evidence — suggesting a
  // check should require that THIS member has a relevant history.)
  const evidence = memberItem.rawTotal > 0 ? memberItem : memberCat;
  const evidenceWeight = evidence.total;

  const hasEvidence = evidenceWeight >= cfg.minEvidence;
  let checked = false;
  let active = false;
  let reason = null;

  if (hasEvidence && p >= cfg.highThreshold) {
    checked = true;
    active = true;
    reason = explain(memberItem, memberCat, canonicalItem, category, true);
  } else if (hasEvidence && p <= cfg.lowThreshold) {
    checked = false;
    active = true;
    reason = explain(memberItem, memberCat, canonicalItem, category, false);
  }

  return {
    checked, // what to pre-fill the checkbox to
    suggested: active, // did we make a confident, evidence-backed call?
    probability: Number(p.toFixed(3)),
    reason, // human-readable "why", for a tooltip/badge
  };
}

function explain(memberItem, memberCat, canonicalItem, category, positive) {
  const verb = positive ? "Usually in on" : "Usually skips";
  if (memberItem.rawTotal > 0) {
    return `${verb} "${canonicalItem}" (${memberItem.rawOptIn}/${memberItem.rawTotal} recent trips)`;
  }
  return `${verb} ${category} (${memberCat.rawOptIn}/${memberCat.rawTotal} recent trips)`;
}

// Predict participation for every (item, member) pair on a new receipt.
//
//   items:   [{ item, canonicalItem, category, ... }]  (post-normalization)
//   members: [memberId, ...]
//   history: [{ memberId, canonicalItem, category, optedIn, timestamp }]
//
// Returns: [{ item, suggestions: { [memberId]: { checked, suggested, ... } } }]
function predictParticipation({ items, members, history, now = Date.now(), config = {} }) {
  const cfg = { ...DEFAULTS, ...config };
  return items.map((item) => {
    const suggestions = {};
    for (const memberId of members) {
      suggestions[String(memberId)] = predictOne(
        String(memberId),
        item.canonicalItem,
        item.category,
        history,
        now,
        cfg
      );
    }
    return { item, suggestions };
  });
}

module.exports = { predictParticipation, DEFAULTS, recencyWeight };
