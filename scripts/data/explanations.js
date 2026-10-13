/* ── Credit Quest: "Why'd this happen?" explanation generator ─────────────── */
/* Builds plain-language FICO explanations from a choice's effects.            */

export function generateDeepExplanation(choice) {
  const effects = choice.effects || {};
  const lines = [];

  if (effects.hasAnyCredit) {
    lines.push('<strong>🏁 Credit History Started</strong> — This account officially opened your credit file with the bureaus. FICO requires at least 6 months of history before it can generate a score. The clock is now running — every on-time payment from here builds your record.');
  }

  if (effects.paymentHistory) {
    const ph = effects.paymentHistory;
    if (ph.latePayments30) {
      lines.push('<strong>⚠️ 30-Day Late Payment (−35 pts)</strong> — Payment History is 35% of your FICO Score — the single biggest factor. A 30-day late stays on your Credit Report for 7 years. The damage fades over time, but only consistent on-time payments rebuild it.');
      lines.push('Recovery tip: Set up autopay for at least the minimum so this never happens again. One late payment can drop a good score by 50–100+ points overnight.');
    }
    if (ph.latePayments60) {
      lines.push('<strong>🚨 60-Day Late Payment (−60 pts)</strong> — More damaging than a 30-day late because it signals you ignored the first warning. Lenders see this as a significant reliability problem. Recovery requires 12–24 months of clean payment history to meaningfully offset it.');
    }
    if (ph.defaults) {
      lines.push('<strong>💥 Default / Charge-Off (−90 pts)</strong> — The lender gave up trying to collect. This is one of the worst marks on a credit report and stays for 7 years. It can drop a good score by 100–150 points and will cause loan denials, high rates, and deposit requirements for years.');
    }
    if (ph.collections) {
      lines.push('<strong>📉 Collections Account (−75 pts)</strong> — A third-party collector now owns your debt and reports it separately. Collections accounts are heavily penalized by FICO even after paid — many newer scoring models ignore paid collections, but older ones (still widely used) still count them.');
    }
    if (ph.removeCollection) {
      lines.push('<strong>✅ Collection Removed</strong> — Successfully negotiating a "pay-for-delete" (where the collector removes the entry in exchange for payment) is one of the few ways to erase a collections mark before its 7-year expiration.');
    }
    if (ph.delta > 0) {
      lines.push('<strong>✅ On-Time Payment Recorded</strong> — Payment History (35%) rewards consistency above all else. Each payment reinforces your reliability. A long streak of on-time payments is the single most powerful thing you can do to build and protect your score.');
    }
  }

  if (effects.amountsOwed) {
    const ao = effects.amountsOwed;
    if (ao.limitDelta > 0 && ao.balanceDelta > 0) {
      const util = ao.limitDelta > 0 ? Math.round((ao.balanceDelta / ao.limitDelta) * 100) : 0;
      if (util >= 75) {
        lines.push(`<strong>💳 Utilization at ~${util}% (Amounts Owed, 30%)</strong> — This is in the danger zone. FICO heavily penalizes utilization over 30%, and above 75% it's a major red flag. Even if you plan to pay it off next month, the reported balance was already sent to the bureaus at your statement date.`);
      } else if (util >= 30) {
        lines.push(`<strong>💳 Utilization at ~${util}% (Amounts Owed, 30%)</strong> — You're above the 30% sweet spot. Amounts Owed is worth 30% of your score — keeping balances below 30% of your total limit keeps this factor healthy.`);
      } else if (util > 0) {
        lines.push(`<strong>💳 Utilization at ~${util}% (Amounts Owed, 30%)</strong> — Low utilization. FICO rewards keeping balances well below your limit. Under 10% is ideal; under 30% is solid.`);
      }
    }
    if (ao.balanceDelta < 0 || ao.balanceClear) {
      lines.push('<strong>📉 Balance Paid Down (Amounts Owed, 30%)</strong> — Reducing your balance directly improves your utilization ratio. The lower your balance relative to your limit, the better your Amounts Owed factor. Paying to zero is the best outcome — 0% utilization is ideal.');
    }
    if (ao.limitClose) {
      lines.push('<strong>⚠️ Credit Limit Reduced (Closing Account)</strong> — Closing a card removes its limit from your total available credit. If you still carry balances elsewhere, this spikes your overall utilization ratio — sometimes dramatically. This is why financial advisors say "never close your oldest card."');
    }
  }

  if (effects.lengthHistory) {
    const lh = effects.lengthHistory;
    if (lh.delta > 0) {
      lines.push('<strong>📅 Length of Credit History (15%)</strong> — Time in the game. The older your oldest account, the more this factor works in your favor. You can\'t rush it — every month an account stays open adds to your history. This is a slow burn that rewards patience and starting early.');
    }
    if (lh.delta < 0) {
      lines.push('<strong>📅 Credit Age Shortened (Length of History, 15%)</strong> — Closing your oldest account shortens your average credit age. Lenders use account age to measure long-term reliability. Once closed, the history eventually falls off your report entirely (usually after 10 years).');
    }
  }

  if (effects.creditMix) {
    const cm = effects.creditMix;
    if (cm.hasInstallmentLoan) {
      lines.push('<strong>🔄 Installment Loan Added (Credit Mix, 10%)</strong> — Credit Mix rewards having both revolving credit (cards) and installment loans (car, student, personal). You just added a new type. This factor doesn\'t warrant taking on debt you don\'t need, but it\'s a nice bonus when you have a legitimate reason.');
    }
    if (cm.hasRevolvingCredit) {
      lines.push('<strong>🔄 Revolving Credit Added (Credit Mix, 10%)</strong> — Having a credit card (revolving) alongside loans (installment) improves your mix. Credit Mix is only 10% of your score, but it adds up over a full game.');
    }
    if (cm.hasMortgage) {
      lines.push('<strong>🏡 Mortgage Added (Credit Mix, 10%)</strong> — A mortgage is the gold standard of credit mix. It maxes out your Credit Mix factor and your mortgage payments become your most impactful Payment History opportunity — the biggest loan most people ever carry.');
    }
  }

  if (effects.newCredit) {
    const nc = effects.newCredit;
    if (nc.hardInquiries >= 3) {
      lines.push(`<strong>🔍 ${nc.hardInquiries} Hard Inquiries (New Credit, 10%)</strong> — Multiple applications in a short window signal financial stress to lenders. Each Hard Inquiry stays on your report for 2 years (affects your score for about 12 months). The damage isn't catastrophic from one, but stacking them compounds fast.`);
    } else if (nc.hardInquiries >= 1) {
      lines.push(`<strong>🔍 Hard Inquiry (New Credit, 10%)</strong> — Applying for credit triggers a Hard Inquiry. A single inquiry costs only a few points and fades after 12 months. The key is not stacking multiple applications in a short window — that's when it starts hurting meaningfully.`);
    }
  }

  if (Object.keys(effects).length === 0 || lines.length === 0) {
    lines.push('<strong>ℹ️ No Direct Score Impact</strong> — Not every financial decision moves your credit score. Some choices build safety nets that protect your score indirectly — like an Emergency Fund that prevents you from missing a payment during a financial shock.');
  }

  return lines.join('<br><br>');
}
