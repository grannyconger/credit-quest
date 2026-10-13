/* ── Credit Quest: Scenario Pool (30 total, 10 per stage) ────────────────────── */


/* ══════════════════════════════════════════════════════════════════════════════ */
/* STAGE 1 — HIGH SCHOOL (Age 18)                                                */
/* ══════════════════════════════════════════════════════════════════════════════ */

export const stage1Pool = [

  /* S1-01 ── Secured Credit Card Offer ──────────────────────────────────────── */
  {
    id: 's1-01', stage: 1,
    title: 'Your First Credit Card',
    setting: '📍 Senior Year — Age 18',
    alwaysFirst: true, // always shown as first scenario in Stage 1
    characterBubble: {
      mario: "Let's-a go! First card is like finding a Star — powerful if used right.",
      luigi: "Mamma mia... I read ALL the fine print before I signed anything.",
      peach: "Even I had to start somewhere. The castle didn't finance itself.",
      toad:  "My cousin got one of these and bought a jet ski. Don't be my cousin."
    },
    narrative: `You just turned 18 — old enough to open a credit account in your own name. Your bank offers a <span class="term" data-term="secured_credit_card">Secured Credit Card</span>: you put down a $300 deposit as collateral, and that becomes your limit. It's the first real step toward building a <span class="term" data-term="credit_history">Credit History</span> and getting your <span class="term" data-term="credit_report">Credit Report</span> started. Without action, you remain a <span class="term" data-term="thin_file">Thin File</span>.`,
    decision: 'Do you apply for the card?',
    choices: [
      {
        label: 'Apply — and commit to paying it off every month',
        consequenceTitle: 'Smart Start!',
        consequenceEmoji: '✅',
        consequenceText: 'You open your first credit account and make a plan: charge small amounts, pay in full every month. Your Credit History has officially begun. The Credit Bureaus are watching now — and so far, the report looks great.',
        consequenceBubble: {
          mario: "Wahoo! First account opened. The clock is ticking — in a good way!",
          luigi: "Excellent. Slow and steady. Like racing — consistency wins.",
          peach: "Well done. Every exceptional credit score starts exactly like this.",
          toad:  "Look at you being financially responsible. Nobody saw that coming. (I did.)"
        },
        factorHighlight: ['lengthHistory', 'creditMix', 'newCredit'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasRevolvingCredit: true },
          amountsOwed:  { limitDelta: 300, balanceDelta: 0 },
          lengthHistory:{ delta: 15 },
          newCredit:    { hardInquiries: 1 }
        }
      },
      {
        label: 'Apply — then charge it to the limit right away',
        consequenceTitle: 'Rookie Mistake',
        consequenceEmoji: '⚠️',
        consequenceText: 'You got the card — then charged $270 immediately. Your Credit Utilization Rate just hit 90%, which is a major red flag to lenders. Credit History started, but your Amounts Owed factor took a serious hit from day one.',
        consequenceBubble: {
          mario: "Wahoo... wait, 90% utilization? That's not-a the power-up I meant.",
          luigi: "The card is supposed to help you. Not immediately betray you.",
          peach: "Charging to the limit on day one is not the royal strategy I'd recommend.",
          toad:  "Okay so you got the card and immediately... yeah. Yeah, that happened."
        },
        factorHighlight: ['amountsOwed', 'newCredit'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasRevolvingCredit: true },
          amountsOwed:  { limitDelta: 300, balanceDelta: 270 },
          lengthHistory:{ delta: 15 },
          newCredit:    { hardInquiries: 1 }
        }
      },
      {
        label: "Skip it — doesn't seem necessary",
        consequenceTitle: 'Thin File Continues',
        consequenceEmoji: '📋',
        consequenceText: 'Valid choice — but staying off the credit grid means your Thin File stays thin. When you eventually need Credit History (apartment, car loan), you\'ll be starting from absolute zero. The clock hasn\'t started yet.',
        consequenceBubble: {
          mario: "No credit is like never starting the race. The finish line waits for no one.",
          luigi: "I understand. But the clock only starts when you open an account.",
          peach: "Patience is a virtue. But this is less patience and more... avoidance.",
          toad:  "Future you is going to have QUESTIONS about this decision."
        },
        factorHighlight: [],
        effects: {
          flags: { hadThinFile: true }
        }
      }
    ]
  },

  /* S1-02 ── Authorized User on Parent's Card ────────────────────────────────── */
  {
    id: 's1-02', stage: 1,
    title: "Piggyback on Dad's Good Credit",
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "Free credit history?! It's-a like getting an extra life without doing anything!",
      luigi: "This is actually legitimate strategy. I've researched it extensively.",
      peach: "If someone offers you their credit history, you verify it's good first. Then accept.",
      toad:  "Wait, you can just... borrow someone's credit history? I have questions."
    },
    narrative: `Your dad offers to add you as an <span class="term" data-term="authorized_user">Authorized User</span> on his credit card. His account is 8 years old with a spotless payment record. You won't be legally responsible for the bill — but his positive <span class="term" data-term="credit_history">Credit History</span> will appear on your <span class="term" data-term="credit_report">Credit Report</span> immediately.`,
    decision: 'What do you do?',
    choices: [
      {
        label: 'Accept — great opportunity',
        consequenceTitle: 'History Inherited!',
        consequenceEmoji: '✅',
        consequenceText: "Your dad's 8-year track record just became yours on paper. Your Credit Report now shows a long, clean payment history — even though you didn't make any of those payments. Credit History boost, no hard inquiry, zero risk to you.",
        consequenceBubble: {
          mario: "Eight years of credit history for free! Like warping to World 8!",
          luigi: "Smart. Efficient. Exactly what I would do if I had a dad with good credit.",
          peach: "Leverage your network. That's not cheating — that's financial strategy.",
          toad:  "The system works for you this time! This is how the rich stay rich!"
        },
        factorHighlight: ['lengthHistory', 'paymentHistory'],
        effects: {
          hasAnyCredit: true,
          lengthHistory: { delta: 20 },
          paymentHistory:{ delta: 8 },
          flags: { usedAuthorizedUser: true }
        }
      },
      {
        label: "Ask dad about his credit first, then accept",
        consequenceTitle: 'Smart AND Informed!',
        consequenceEmoji: '✅',
        consequenceText: "You asked the right question — dad has excellent credit. Being added as Authorized User on a strong account is one of the fastest ways to start building Credit History. Great instinct to verify first.",
        consequenceBubble: {
          mario: "You asked AND verified! That's-a extra smart! Like hitting TWO coins!",
          luigi: "Due diligence before commitment. I'm genuinely proud.",
          peach: "Information before action. That's how you run a kingdom — or a credit score.",
          toad:  "You checked his credit first? You're better at this than I am."
        },
        factorHighlight: ['lengthHistory', 'paymentHistory'],
        effects: {
          hasAnyCredit: true,
          lengthHistory: { delta: 20 },
          paymentHistory:{ delta: 10 },
          flags: { usedAuthorizedUser: true }
        }
      },
      {
        label: "Decline — I'd rather build credit on my own",
        consequenceTitle: 'Independent Spirit',
        consequenceEmoji: '📋',
        consequenceText: "Respect for the DIY mindset. But turning down a free decade of credit history means you'll need more accounts and more time to get where you want to go. Noble — but it'll cost you years of credit age.",
        consequenceBubble: {
          mario: "Independence is admirable! Just takes longer to reach the castle alone.",
          luigi: "I respect this, but... it's leaving points on the table.",
          peach: "Building your own is valid. It just takes considerably longer.",
          toad:  "Principled! Wrong! But principled!"
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-03 ── Phone Financing (Hard Inquiry) ──────────────────────────────────── */
  {
    id: 's1-03', stage: 1,
    title: 'Phone Financing Offer',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "A new phone AND an installment loan? Two power-ups, one coin block!",
      luigi: "I calculated the total interest cost before accepting. Have you?",
      peach: "Consider: do you need the phone, or do you want it? There's a difference.",
      toad:  "I financed a phone once. Then another. Then I had three phones. Don't do that."
    },
    narrative: `Your phone is two generations old and barely works. A carrier offers to finance a new $600 phone at $25/month for 24 months. They'll run a <span class="term" data-term="hard_inquiry">Hard Inquiry</span> to approve the plan. On the upside, it would add an installment account to your mix — improving your <span class="term" data-term="types_of_credit">Types of Credit</span> and your <span class="term" data-term="credit_history">Credit History</span>.`,
    decision: 'What do you do?',
    choices: [
      {
        label: 'Finance the phone — add the installment account',
        consequenceTitle: 'Mixed Result',
        consequenceEmoji: '⚠️',
        consequenceText: "Phone acquired, installment loan added to your Credit Report. A Hard Inquiry dipped your score slightly, but your Types of Credit just improved — now you have both revolving and installment credit. Monthly payment starts now. Don't miss it.",
        consequenceBubble: {
          mario: "New phone AND new credit mix! Just... pay the bill every month, okay?",
          luigi: "The credit mix benefit is real. The Hard Inquiry is real too. Worth tracking.",
          peach: "A calculated move. Just set up autopay immediately.",
          toad:  "Phone secured. Now the hard part: actually paying the bill."
        },
        factorHighlight: ['creditMix', 'newCredit', 'amountsOwed'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasInstallmentLoan: true },
          installment:  { balanceDelta: 600 },
          newCredit:    { hardInquiries: 1 },
          lengthHistory:{ delta: 5 }
        }
      },
      {
        label: 'Pay cash — no inquiry, no new debt',
        consequenceTitle: 'Clean and Simple',
        consequenceEmoji: '✅',
        consequenceText: "You sidestepped the Hard Inquiry and monthly payment entirely. Zero credit impact, positive or negative. No debt, no risk. Sometimes the simplest financial decision is keeping things uncomplicated — especially early on.",
        consequenceBubble: {
          mario: "No debt! Clean score! No shiny phone, but... clean score!",
          luigi: "Cash is still king for items you can afford outright. Well done.",
          peach: "Straightforward. No interest paid, no inquiry on record. Efficient.",
          toad:  "Boring and correct. Boring. And. Correct."
        },
        factorHighlight: [],
        effects: {}
      },
      {
        label: "Keep the old phone — not worth the debt",
        consequenceTitle: 'Patient Move',
        consequenceEmoji: '📋',
        consequenceText: "Your phone limps on. No credit activity. The installment account opportunity passed — but so did the monthly payment obligation and the Hard Inquiry. Sometimes waiting is genuinely the right call.",
        consequenceBubble: {
          mario: "Waiting is valid! Just... make sure the clock is actually running somewhere.",
          luigi: "I kept a phone for four years once. Zero credit impact. I regret nothing.",
          peach: "Patience. Just make sure you have a plan for building credit another way.",
          toad:  "Your phone might literally die before you make a decision but okay sure."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-04 ── Holiday Store Credit Cards ─────────────────────────────────────── */
  {
    id: 's1-04', stage: 1,
    title: 'Holiday Store Credit Card Blitz',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "20% off everything?! Wait — how many Hard Inquiries is that?",
      luigi: "Three applications. Three Hard Inquiries. I'm going to be sick.",
      peach: "Savings now vs. score damage later. Do the math before you sign anything.",
      toad:  "I once signed up for four store cards in one afternoon. FOUR. Learn from me."
    },
    narrative: `It's the holiday shopping rush. Three different stores offer you 20% off if you open their store credit card today. Each application is a separate <span class="term" data-term="hard_inquiry">Hard Inquiry</span> on your <span class="term" data-term="credit_report">Credit Report</span>. Together they'd be three inquiries in one day — and lenders notice when someone suddenly seems desperate for <span class="term" data-term="credit">credit</span>.`,
    decision: 'What do you do?',
    choices: [
      {
        label: 'Apply for all three — 20% off everything!',
        consequenceTitle: 'Three Inquiries. Ouch.',
        consequenceEmoji: '💥',
        consequenceText: "Three Hard Inquiries in one shopping trip. Each one alone is manageable — but stacking them signals to lenders that you're aggressively seeking credit. New Credit factor took a real hit. The discounts saved you maybe $40. The score impact cost you more.",
        consequenceBubble: {
          mario: "Wahoo... that's-a too many mushrooms, my friend.",
          luigi: "OH NO. OH NO. I felt that from here.",
          peach: "Three credit cards? Even I don't have three credit cards.",
          toad:  "Okay but hear me out — what if you... no. No. That was a terrible suggestion."
        },
        factorHighlight: ['newCredit'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasRevolvingCredit: true },
          amountsOwed:  { limitDelta: 1500, balanceDelta: 0 },
          newCredit:    { hardInquiries: 3 },
          lengthHistory:{ delta: 5 },
          flags: { multipleInquiries: true }
        }
      },
      {
        label: 'Apply for just one — the most useful card',
        consequenceTitle: 'Controlled Move',
        consequenceEmoji: '✅',
        consequenceText: "One Hard Inquiry, one new account, one useful discount. One inquiry is manageable. New credit opened responsibly is fine — you just kept it under control. Score dips slightly, then recovers as the account ages.",
        consequenceBubble: {
          mario: "One card! Responsible! I'm-a proud of your restraint!",
          luigi: "One inquiry. Minimal damage. Maximum control. This is the way.",
          peach: "Selective. Disciplined. You chose the option that serves you.",
          toad:  "Just one! That's great! That's... that's normal actually."
        },
        factorHighlight: ['newCredit', 'creditMix'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasRevolvingCredit: true },
          amountsOwed:  { limitDelta: 500, balanceDelta: 0 },
          newCredit:    { hardInquiries: 1 },
          lengthHistory:{ delta: 5 }
        }
      },
      {
        label: 'Decline all of them — stay focused',
        consequenceTitle: 'Disciplined Pass',
        consequenceEmoji: '✅',
        consequenceText: "You walked past every credit card table without flinching. No inquiries, no new accounts. Smart boundary-setting. Make sure you have a plan to build credit through other responsible means — but this was a win.",
        consequenceBubble: {
          mario: "No inquiries! No traps! You cleared the level without taking damage!",
          luigi: "The easiest Hard Inquiry to recover from is the one you never made.",
          peach: "Discipline in the checkout line. Rare and impressive.",
          toad:  "You said no to all three?! I could never. You're basically a superhero."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-05 ── "Free Credit Score Check" Scam ──────────────────────────────────── */
  {
    id: 's1-05', stage: 1,
    title: '"Free Credit Score" — Plot Twist',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "If it sounds too good to be free... it's probably a-not free.",
      luigi: "I checked the URL. The SSL cert. The company registration. Then I closed the tab.",
      peach: "Legitimate financial services don't need pop-up ads to find customers.",
      toad:  "My cousin clicked this exact thing. He doesn't talk about it."
    },
    narrative: `An online ad promises a free <span class="term" data-term="credit_score">Credit Score</span> check — just enter your info. Sounds helpful. But there's a critical difference between a <span class="term" data-term="soft_inquiry">Soft Inquiry</span> (no score impact) and a <span class="term" data-term="hard_inquiry">Hard Inquiry</span> (score drops). The fine print on this site is... buried.`,
    decision: 'What do you do?',
    choices: [
      {
        label: 'Click the link and enter your info',
        consequenceTitle: 'Surprise — Hard Inquiry!',
        consequenceEmoji: '💥',
        consequenceText: "Plot twist: that 'free score check' was actually a Hard Inquiry from a credit card company. The fine print authorized them to pull your full credit. Score dipped. Always read the fine print — especially anything that sounds completely free.",
        consequenceBubble: {
          mario: "The fine print! The fine print is how Bowser always wins!",
          luigi: "I knew it. I KNEW it. Always, always, read the fine print.",
          peach: "This is why I have a royal attorney review everything. Learn from this.",
          toad:  "My cousin did this. Three times. WITH THE SAME WEBSITE."
        },
        factorHighlight: ['newCredit'],
        effects: {
          newCredit: { hardInquiries: 1 }
        }
      },
      {
        label: "Ignore it — 'if it sounds too good to be free...'",
        consequenceTitle: 'Smart Instinct',
        consequenceEmoji: '✅',
        consequenceText: "Good instinct. Legitimate credit monitoring services (Credit Karma, your bank's app) offer free Soft Inquiry checks. Sketchy ads that seem too good? Almost always a trap. No score impact — and your data stays protected.",
        consequenceBubble: {
          mario: "Smart! The best power-up is the one you don't blindly grab!",
          luigi: "I'm delighted. You made the correct choice without my help.",
          peach: "Skepticism is a virtue when applied to financial offers.",
          toad:  "You just saved yourself from what my cousin calls 'a real bad Thursday.'"
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-06 ── Bank's Official Credit Monitoring ───────────────────────────────── */
  {
    id: 's1-06', stage: 1,
    title: 'Official Credit Monitoring Offer',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "Official monitoring from your own bank? That's always a Soft Inquiry — safe!",
      luigi: "I have THREE credit monitoring apps. My therapist says this is 'excessive.'",
      peach: "Knowing your credit score regularly is simply good governance.",
      toad:  "I set up alerts for everything. My phone buzzes 40 times a day. Worth it."
    },
    narrative: `Your bank emails you: they're offering free credit monitoring through their official app. This uses a <span class="term" data-term="soft_inquiry">Soft Inquiry</span> — it checks your <span class="term" data-term="credit_report">Credit Report</span> without affecting your <span class="term" data-term="credit_score">Credit Score</span>. You'd get alerts for suspicious activity and monthly score updates.`,
    decision: 'Do you sign up?',
    choices: [
      {
        label: 'Sign up — free official monitoring sounds great',
        consequenceTitle: 'Good Financial Habit',
        consequenceEmoji: '✅',
        consequenceText: "Your bank's official monitoring is a Soft Inquiry — zero score impact. You can now check your Credit Report whenever you want, spot errors early, and get alerts if anything looks off. Smart habit to build early.",
        consequenceBubble: {
          mario: "Now you know your score anytime! Information is power!",
          luigi: "Early detection of errors is essential. You've made the right call.",
          peach: "A monitored credit file is a protected one. Well chosen.",
          toad:  "Look at you being proactive. I genuinely respect this."
        },
        factorHighlight: [],
        effects: {} // Soft inquiry — no score change, but great habit
      },
      {
        label: "Skip it — you'll check manually when needed",
        consequenceTitle: 'Manual Monitoring Risk',
        consequenceEmoji: '📋',
        consequenceText: "You can always check your own credit — it's always a Soft Inquiry. But skipping automated alerts means errors or identity theft could sit on your Credit Report for months undetected. You'll only find problems if you go looking.",
        consequenceBubble: {
          mario: "The mushroom you never check might secretly be a trap...",
          luigi: "You'll remember to check it. Probably. Maybe. I hope.",
          peach: "Proactive protection beats reactive damage control. Every time.",
          toad:  "I said I'd check mine manually too. That was four years ago."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-07 ── First Credit Card Bill Arrives ──────────────────────────────────── */
  {
    id: 's1-07', stage: 1,
    requires: ['revolvingCredit'],
    title: 'First Bill Arrives',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "This is the moment. The most important move in the whole game.",
      luigi: "I set up autopay the day I got the card. I wasn't taking any chances.",
      peach: "Payment History is 35% of everything. Everything. Treat this accordingly.",
      toad:  "I 'forgot' to pay my first bill. Don't be like junior-year me."
    },
    narrative: `Your first credit card statement arrived. You charged $180 last month on small purchases. The minimum payment is $25. <span class="term" data-term="payment_history">Payment History</span> is 35% of your <span class="term" data-term="fico_score">FICO Score</span> — the single biggest factor. What you do right now with this $180 matters more than almost any other decision in this simulation.`,
    decision: 'How do you handle it?',
    choices: [
      {
        label: 'Pay the full $180 — zero it out',
        consequenceTitle: 'Perfect Move!',
        consequenceEmoji: '✅',
        consequenceText: "Full payment made. Zero interest charged. Credit Utilization Rate drops to 0%. Payment History stays spotless. This is exactly how credit cards are supposed to work — borrowed responsibly, repaid in full, on time. Score improves.",
        consequenceBubble: {
          mario: "PERFECT! Full payment! Payment History preserved! THIS IS THE WAY!",
          luigi: "Full balance cleared. I'm not crying, my eyes are just leaking with pride.",
          peach: "Immaculate. This is how you handle credit. Frame this statement.",
          toad:  "Full payment! YES! Do it exactly like this EVERY TIME."
        },
        factorHighlight: ['paymentHistory', 'amountsOwed'],
        effects: {
          paymentHistory: { delta: 10, onTimePayments: 1 },
          amountsOwed:    { balanceClear: true }
        }
      },
      {
        label: "Pay the $25 minimum — I'll catch up next month",
        consequenceTitle: 'Okay, But Watch the Interest',
        consequenceEmoji: '⚠️',
        consequenceText: "On-time payment — Payment History is safe. But the remaining $155 carries over with interest. Credit Utilization Rate stays elevated. Not damaging yet, but compound interest on a credit card is the most expensive 'I'll deal with it later' there is.",
        consequenceBubble: {
          mario: "On time is good! Carrying the balance is... less good. Catch up next month!",
          luigi: "On-time minimum payment is safe. The interest is not safe. Watch it closely.",
          peach: "Payment made — fine. The carrying balance is what keeps me up at night.",
          toad:  "'I'll catch up next month' is how I ended up with $2,000 in debt at 19."
        },
        factorHighlight: ['paymentHistory', 'amountsOwed'],
        effects: {
          paymentHistory: { delta: 5, onTimePayments: 1 },
          amountsOwed:    { balanceDelta: -25 }
        }
      },
      {
        label: 'Forget to pay — it slips your mind',
        consequenceTitle: 'First Late Payment',
        consequenceEmoji: '💥',
        consequenceText: "One missed payment. Payment History took a major hit. This mark can stay on your Credit Report for 7 years. Call the bank immediately — first-offense goodwill adjustments are sometimes possible. But don't count on it. Set up autopay. Now.",
        consequenceBubble: {
          mario: "Mamma mia... it's-a like falling in the pit. Call the bank! Climb out!",
          luigi: "*quietly hyperventilates* This is fine. Set up autopay. Everything is fixable.",
          peach: "One call to the bank. Ask for a goodwill adjustment. Then set up autopay.",
          toad:  "I've seen this before. My cousin. Jet ski. It's fine. Set up autopay."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -35, latePayments30: 1 },
          flags: { perfectPaymentHistory: false, hadLatePayment: true }
        }
      }
    ]
  },

  /* S1-08 ── Friend Wants to Be Authorized User ──────────────────────────────── */
  {
    id: 's1-08', stage: 1,
    requires: ['revolvingCredit'],
    title: 'Friend Wants on Your Card',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "If they overspend, it's YOUR Credit Report that pays the price. Not theirs.",
      luigi: "I said no to this once. The friendship survived. The credit score also survived.",
      peach: "Your credit file is not a gift to give. It is your financial reputation.",
      toad:  "My cousin asked me for this favor. I said yes. He's no longer my cousin."
    },
    narrative: `Your friend asks to be added as an <span class="term" data-term="authorized_user">Authorized User</span> on your credit card. They promise to only use it for emergencies. If they overspend or you can't cover their charges, your account takes the hit — your <span class="term" data-term="credit_utilization_rate">Credit Utilization Rate</span> spikes and your <span class="term" data-term="payment_history">Payment History</span> suffers.`,
    decision: 'Do you add them?',
    choices: [
      {
        label: 'Add them — you trust your friend',
        consequenceTitle: 'High Risk Accepted',
        consequenceEmoji: '⚠️',
        consequenceText: "Your friend is now authorized on your account. You're responsible for every charge they make. If they overspend or you can't cover it, your Credit Utilization Rate spikes — and if the bill goes unpaid, your Payment History takes the damage. Trust isn't the same as financial accountability.",
        consequenceBubble: {
          mario: "Friends are great! Credit risk from friends is... less great.",
          luigi: "I can't watch. Tell me how it ends.",
          peach: "You made a choice. Monitor that account closely. Very closely.",
          toad:  "The optimism here is both touching and financially alarming."
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed: { balanceDelta: 90 } // represents friend's likely spending
        }
      },
      {
        label: "Decline — this is your Credit History, not theirs",
        consequenceTitle: 'Smart Boundary',
        consequenceEmoji: '✅',
        consequenceText: "A clean, confident no. Your credit file is yours alone to build and protect. Your friend needs to establish their own Credit History — and that's actually the right path for both of you. No is a complete sentence.",
        consequenceBubble: {
          mario: "Your credit file, your rules! Clean boundaries = clean score!",
          luigi: "Perfect response. Guilt-free. The right call, clearly and completely.",
          peach: "Elegantly done. Your credit reputation remains solely yours.",
          toad:  "I wish I'd said no. I really, truly wish I'd said no."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-09 ── Personal Loan with Co-Signer ────────────────────────────────────── */
  {
    id: 's1-09', stage: 1,
    title: 'Used Car — Installment Loan',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "A car loan means credit mix improves! But monthly payments start... now.",
      luigi: "I made a spreadsheet of every payment before I agreed. 47 rows of data.",
      peach: "Transportation is practical. Debt for transportation requires a plan.",
      toad:  "I got a car loan once. Very exciting. The payment was slightly less exciting."
    },
    narrative: `You need a car to get to your part-time job. A $4,000 used car is available through a credit union — they'll approve the installment loan if your parent co-signs. This adds an installment account to your <span class="term" data-term="credit_report">Credit Report</span>, improving your <span class="term" data-term="types_of_credit">Types of Credit</span>. But your co-signer is liable if you miss payments.`,
    decision: 'Do you take the loan?',
    choices: [
      {
        label: 'Take the loan — build credit while buying the car',
        consequenceTitle: 'Credit Mix Improves!',
        consequenceEmoji: '✅',
        consequenceText: "Installment loan opened. Credit Mix improved — now you have both revolving and installment credit. Your co-signer is on the hook if you miss payments, so this is also a trust exercise. Monthly payment is $89. Set up autopay immediately.",
        consequenceBubble: {
          mario: "Both revolving AND installment credit! Credit mix achieved!",
          luigi: "Credit mix is now diversified. Monthly payment is manageable. Autopay. Now.",
          peach: "Transportation secured, credit diversified. Honor the monthly payment.",
          toad:  "Car secured! Credit mix improved! Don't let your parent regret this!"
        },
        factorHighlight: ['creditMix', 'newCredit', 'amountsOwed'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasInstallmentLoan: true },
          installment:  { balanceDelta: 4000 },
          newCredit:    { hardInquiries: 1 },
          lengthHistory:{ delta: 5 }
        }
      },
      {
        label: "Decline — not ready for a car payment",
        consequenceTitle: 'Responsible Restraint',
        consequenceEmoji: '✅',
        consequenceText: "Knowing your limits is a financial superpower. A car payment you can't consistently make is more dangerous to your Credit History than no car at all. Find another way for now — the loan will still be there when you're ready.",
        consequenceBubble: {
          mario: "Sometimes the power-up you skip is the trap you avoid!",
          luigi: "Self-awareness about your financial capacity is genuinely mature.",
          peach: "Prudent. Better to wait than to default on a co-signed loan.",
          toad:  "No debt = no risk. Boring. Correct. Boring."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S1-10 ── Missed Payment — 35 Days Ago ────────────────────────────────────── */
  {
    id: 's1-10', stage: 1,
    requires: ['revolvingCredit'],
    title: 'Late Payment — 35 Days In',
    setting: '📍 Senior Year — Age 18',
    characterBubble: {
      mario: "At 30 days, it gets REPORTED. You're already at 35. Call. The. Bank.",
      luigi: "30 days late = it hits your credit report. 35 days = it already hit. CALL.",
      peach: "Act now. Every additional day makes this harder — and more expensive — to fix.",
      toad:  "I was in this exact spot once. I called. They helped. CALL."
    },
    narrative: `It's been 35 days since your credit card payment was due. You just noticed. At 30 days past due, negative marks officially become reportable to the <span class="term" data-term="credit_bureau">Credit Bureaus</span>. <span class="term" data-term="payment_history">Payment History</span> is 35% of your <span class="term" data-term="fico_score">FICO Score</span> — a 30-day late mark can cause a significant drop.`,
    decision: 'What do you do?',
    choices: [
      {
        label: 'Pay immediately AND call the bank to explain',
        consequenceTitle: 'Quick Save Attempt',
        consequenceEmoji: '⚠️',
        consequenceText: "Paid immediately. Called the bank — asked for a goodwill adjustment as a first-time offender. The rep noted your account and submitted a review. Some banks honor this. The damage may be partial. But the call was absolutely worth making.",
        consequenceBubble: {
          mario: "You called! You paid! Maybe they fix it, maybe not — but you tried!",
          luigi: "Goodwill adjustments work about 40% of the time. You were right to try.",
          peach: "Proactive, immediate, documented. This is crisis management done right.",
          toad:  "I did this exact thing. They removed the mark. ALWAYS CALL."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -20, latePayments30: 1 },
          flags: { perfectPaymentHistory: false, hadLatePayment: true }
        }
      },
      {
        label: 'Wait until next paycheck — two more weeks',
        consequenceTitle: 'Makes It Worse',
        consequenceEmoji: '💥',
        consequenceText: "Waiting takes you from 35 days to 49 days past due. The 30-day mark was already reported. More days mean additional reporting cycles, and the balance keeps growing with late fees. Pay immediately — then figure out how to prevent this from happening again.",
        consequenceBubble: {
          mario: "No! Waiting makes every number worse! The pit gets deeper!",
          luigi: "More days = more damage. The bank is not forgetful.",
          peach: "Waiting accomplishes nothing except making an already bad situation worse.",
          toad:  "49 days late. I've been there. Trust me. The phone call is faster."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -35, latePayments30: 1 },
          flags: { perfectPaymentHistory: false, hadLatePayment: true }
        }
      },
      {
        label: "Ignore it — it'll work itself out",
        consequenceTitle: 'Heading Toward Collections',
        consequenceEmoji: '💥',
        consequenceText: "Ignoring debt doesn't erase it. At 90+ days past due, this account could go to Collections — a devastating mark that stays on your Credit Report for 7 years. The longer you wait, the harder and more expensive this becomes to resolve.",
        consequenceBubble: {
          mario: "You can't-a jump OVER debt! It follows you through every world!",
          luigi: "Mamma mia... the collectors will come. They always come.",
          peach: "Ignoring it doesn't make it disappear. Trust me. I tried that with Bowser.",
          toad:  "Ah yes, the ostrich strategy. Very popular. Zero stars."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -60, latePayments30: 1, collections: 1 },
          flags: { perfectPaymentHistory: false, hadLatePayment: true, hadCollections: true }
        }
      }
    ]
  }

]; // end stage1Pool


/* ══════════════════════════════════════════════════════════════════════════════ */
/* STAGE 2 — COLLEGE (Ages 18-21)                                               */
/* ══════════════════════════════════════════════════════════════════════════════ */

export const stage2Pool = [

  /* S2-01 ── Federal Student Loans ──────────────────────────────────────────── */
  {
    id: 's2-01', stage: 2,
    title: 'Federal Student Loan Decision',
    setting: '📍 Freshman Year — Age 18',
    characterBubble: {
      mario: "Good Debt vs. bad debt — student loans CAN be good debt. KEY word: can.",
      luigi: "Subsidized means the government pays interest while you study. Read that again.",
      peach: "Education debt can be an investment. Just know what you're actually investing in.",
      toad:  "I took every loan offered. I've been paying them for eight years. Choose wisely."
    },
    narrative: `College accepted. Financial aid letter in hand. You qualify for subsidized Direct Loans — the government pays the <span class="term" data-term="interest">Interest</span> while you're in school. This is often called <span class="term" data-term="good_debt">Good Debt</span>: it funds education, adds an installment account to your <span class="term" data-term="credit_report">Credit Report</span>, and has rates lower than private alternatives.`,
    decision: 'What do you do with the student loan offer?',
    choices: [
      {
        label: 'Accept subsidized loans — the best terms available',
        consequenceTitle: 'Good Debt Accepted',
        consequenceEmoji: '✅',
        consequenceText: "Subsidized federal loans: the government pays interest while you're in school. You added an installment account to your Credit Report, improved your Types of Credit, and funded your education. Good Debt doing exactly what it should.",
        consequenceBubble: {
          mario: "Subsidized! The government pays the interest! While you study!",
          luigi: "The terms on subsidized loans are genuinely good. You made the right call.",
          peach: "Smart financing for a long-term investment. Well chosen.",
          toad:  "Take the subsidized. If you take the unsubsidized... just don't."
        },
        factorHighlight: ['creditMix', 'amountsOwed'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasInstallmentLoan: true },
          installment:  { balanceDelta: 5500 },
          lengthHistory:{ delta: 5 },
          flags: { tookStudentLoans: true }
        }
      },
      {
        label: 'Accept unsubsidized loans — available regardless',
        consequenceTitle: 'Interest Accruing Now',
        consequenceEmoji: '⚠️',
        consequenceText: "Unsubsidized means interest accrues while you're in school — adding to your balance before you graduate. Credit mix improved, but that balance is quietly growing every semester. Watch the Amounts Owed factor as it compounds.",
        consequenceBubble: {
          mario: "Unsubsidized means interest NOW. The clock is ticking AND the meter is running.",
          luigi: "I did this math at 2am freshman year. The interest adds up. Significantly.",
          peach: "Unsubsidized is manageable, not ideal. Track that balance closely.",
          toad:  "I didn't understand the difference until graduation. Don't be me."
        },
        factorHighlight: ['creditMix', 'amountsOwed'],
        effects: {
          hasAnyCredit: true,
          creditMix:    { hasInstallmentLoan: true },
          installment:  { balanceDelta: 6200 }, // interest accrued
          lengthHistory:{ delta: 5 },
          flags: { tookStudentLoans: true }
        }
      },
      {
        label: 'Decline — scholarships and grants cover everything',
        consequenceTitle: 'Debt-Free Path',
        consequenceEmoji: '✅',
        consequenceText: "You're fully funded without loans — which means zero student debt. Your debt-to-income ratio stays clean after graduation. The only downside: you didn't add an installment account to your credit mix. Can't win everything, but this is definitely winning.",
        consequenceBubble: {
          mario: "No student debt! Like getting to the flag pole at full speed!",
          luigi: "Scholarship AND no debt? This is statistically remarkable. Well done.",
          peach: "Debt-free education. The dream. Rare. Savor it.",
          toad:  "I literally don't understand what this feels like but I'm happy for you."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S2-02 ── Spring Break Spending ──────────────────────────────────────────── */
  {
    id: 's2-02', stage: 2,
    requires: ['revolvingCredit'],
    title: 'Spring Break on the Credit Card',
    setting: '📍 Sophomore Year — Age 19',
    characterBubble: {
      mario: "Fun now vs. score later. The credit card doesn't care that the beach was nice.",
      luigi: "I went to the library during spring break. My credit score was beautiful.",
      peach: "You can travel on a budget. Or you can watch your Amounts Owed crater.",
      toad:  "I charged $900 on spring break sophomore year. I'm still paying for it. Literally."
    },
    narrative: `Spring break. Everyone's going. Your credit card limit is $1,000 and current balance is zero. A real trip would cost about $800 — that's 80% <span class="term" data-term="credit_utilization_rate">Credit Utilization Rate</span>. The recommended threshold? Under 30%. <span class="term" data-term="amounts_owed">Amounts Owed</span> is 30% of your <span class="term" data-term="fico_score">FICO Score</span> — the second biggest factor.`,
    decision: 'What do you charge to the card?',
    choices: [
      {
        label: 'Charge the full $800 trip',
        consequenceTitle: 'Score Hits the Beach Too',
        consequenceEmoji: '⚠️',
        consequenceText: "Great trip. 80% Credit Utilization Rate — well above the 30% warning threshold. Amounts Owed is 30% of your FICO Score. Your score took a notable hit. Pay it down fast when you get back — utilization recovers quickly once the balance drops.",
        consequenceBubble: {
          mario: "80% utilization! The beach was nice but the score... not nice.",
          luigi: "I calculated this. 80% utilization costs approximately this many score points.",
          peach: "The memories last forever. The score impact lasts until you pay it down.",
          toad:  "This is exactly what I did. This is EXACTLY what I did."
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed: { balanceDelta: 800 }
        }
      },
      {
        label: 'Charge $250 for a modest trip',
        consequenceTitle: 'Smart Balance',
        consequenceEmoji: '✅',
        consequenceText: "25% utilization — below the 30% threshold. You went on a trip, kept your score mostly intact, and made a memory. Good financial discipline doesn't mean never spending; it means spending within the bounds that protect your score.",
        consequenceBubble: {
          mario: "25% utilization! UNDER 30%! You get a trip AND a good score!",
          luigi: "I approve of this. A modest trip is still a trip. Good math.",
          peach: "You traveled within your means. This is called being a responsible adult.",
          toad:  "Under 30%?? I want to shake your hand. Seriously."
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed: { balanceDelta: 250 }
        }
      },
      {
        label: "Stay home — protect the score completely",
        consequenceTitle: 'Score Fully Protected',
        consequenceEmoji: '✅',
        consequenceText: "Full score protection. No new charges. Credit Utilization stays at 0%. FOMO is real — but so is the fact that your Amounts Owed factor is spotless. Sometimes the best financial decision is the one you didn't make.",
        consequenceBubble: {
          mario: "Zero charges! Perfect utilization! FOMO is the only casualty!",
          luigi: "I understand this choice deeply. The library awaits.",
          peach: "The beach will still be there when your score is exceptional.",
          toad:  "Your Credit Utilization Rate: spotless. Your Instagram: also spotless."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S2-03 ── Autopay Setup ───────────────────────────────────────────────────── */
  {
    id: 's2-03', stage: 2,
    title: 'Set Up Autopay?',
    setting: '📍 Sophomore Year — Age 19',
    characterBubble: {
      mario: "Autopay: the best power-up in personal finance. Just set it. Forget it.",
      luigi: "I have autopay for everything. My therapist calls it hypervigilance. I call it 780.",
      peach: "Never miss a payment because you 'forgot.' That is not a royal excuse.",
      toad:  "I said I'd remember. I didn't remember. My score said 'interesting choice.'"
    },
    narrative: `You've got three recurring bills: credit card, phone, and student loan payment. Each could be set up on autopay. <span class="term" data-term="payment_history">Payment History</span> is 35% of your <span class="term" data-term="credit_score">Credit Score</span> — a single missed payment can cause a score drop that takes months to recover from. Autopay makes "I forgot" structurally impossible.`,
    decision: 'Do you set up autopay?',
    choices: [
      {
        label: 'Set up autopay for all three — remove human error',
        consequenceTitle: 'Protected by Automation',
        consequenceEmoji: '✅',
        consequenceText: "Autopay enabled for all three accounts. Payment History is now protected by automation, not memory. This is one of the highest-ROI financial habits you can build. Every on-time payment, month after month, strengthens your score.",
        consequenceBubble: {
          mario: "AUTOPAY! The invincibility star of personal finance!",
          luigi: "Autopay for everything. This is optimal. This is correct. This is me.",
          peach: "Automation removes the human error variable. Excellent governance.",
          toad:  "Set it, forget it, NEVER MISS A PAYMENT. You've achieved financial Zen."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 8, onTimePayments: 1 }
        }
      },
      {
        label: "Skip it — you'll definitely remember",
        consequenceTitle: '"I\'ll Remember" Risk',
        consequenceEmoji: '⚠️',
        consequenceText: "You've made a bet with yourself that memory will beat habit. Maybe you'll be right. But Payment History is 35% of everything — and the most common cause of a missed payment is exactly 'I thought I'd remember.' Consider setting up a manual reminder at minimum.",
        consequenceBubble: {
          mario: "Famous last words: 'I'll remember.' I hope you remember.",
          luigi: "I said this ONCE. Now I have autopay for everything including the gym I don't use.",
          peach: "'I'll remember' is not a financial strategy. It's wishful thinking.",
          toad:  "You're living dangerously. I respect it. You shouldn't do it."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S2-04 ── Medical Bill Goes to Collections ────────────────────────────────── */
  {
    id: 's2-04', stage: 2,
    title: 'Medical Bill — 90 Days',
    setting: '📍 Sophomore Year — Age 19',
    characterBubble: {
      mario: "Collections is like a Bowser fight for your credit. Don't let it get there.",
      luigi: "Hospitals ALWAYS have payment plans. ALWAYS. You just have to ask.",
      peach: "A $650 bill becomes a 7-year scar on your Credit Report if you ignore it.",
      toad:  "I ignored a medical bill once. It showed up on my credit 90 days later. 7 years."
    },
    narrative: `An unexpected ER visit left you with a $650 bill. No campus insurance yet. The hospital says you have 90 days before unpaid bills go to a collections agency. A <span class="term" data-term="collections">Collections</span> account is one of the most damaging marks on a <span class="term" data-term="credit_report">Credit Report</span> — and it stays for 7 years.`,
    decision: 'What do you do about the medical bill?',
    choices: [
      {
        label: 'Set up a payment plan immediately',
        consequenceTitle: 'Crisis Averted',
        consequenceEmoji: '✅',
        consequenceText: "Payment plan arranged at $55/month. The bill never reaches Collections. Hospitals nearly always have financial assistance programs for uninsured patients — you just have to ask. Crisis managed before the damage could begin.",
        consequenceBubble: {
          mario: "Payment plan! Crisis averted! You called and asked and they HELPED!",
          luigi: "This is the correct response to every unexpected bill. Negotiate. Always.",
          peach: "You asked for help. They provided it. This is how financial crises are managed.",
          toad:  "You CALLED THEM? You just prevented 7 years of damage with one phone call."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 5, onTimePayments: 1 }
        }
      },
      {
        label: "Ignore it — deal with it later",
        consequenceTitle: 'Collections Hit',
        consequenceEmoji: '💥',
        consequenceText: "90+ days without payment. The hospital sold the debt to a collections agency. Now you have a Collections account on your Credit Report. Payment History subScore took its worst hit. This mark stays for 7 years — even after you pay it.",
        consequenceBubble: {
          mario: "You can't-a run from Collections. They find you. They always find you.",
          luigi: "I warned about this scenario statistically. The statistics were correct.",
          peach: "Seven years. That mark will outlast your college degree on paper.",
          toad:  "My cousin ignored a $300 bill. It became a $650 collection. Seven years."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -75, collections: 1 },
          flags: { hadCollections: true, perfectPaymentHistory: false }
        }
      }
    ]
  },

  /* S2-05 ── Credit Limit Raised ─────────────────────────────────────────────── */
  {
    id: 's2-05', stage: 2,
    requires: ['revolvingCredit'],
    title: 'Credit Limit Raised — Temptation',
    setting: '📍 Junior Year — Age 20',
    characterBubble: {
      mario: "Higher limit = lower utilization IF you don't spend more. Big IF.",
      luigi: "A higher credit limit is not permission to use a higher credit limit.",
      peach: "The limit increase is a tool, not an invitation.",
      toad:  "I got a limit raise and immediately booked a trip to Portugal. Portugal!"
    },
    narrative: `Your credit card company raised your limit from $1,000 to $3,000. That's actually good for your <span class="term" data-term="credit_utilization_rate">Credit Utilization Rate</span> — same balance, bigger limit = lower utilization percentage. But the higher available credit is also tempting. <span class="term" data-term="amounts_owed">Amounts Owed</span> responds to what you actually spend, not what's available.`,
    decision: 'What do you do with the higher limit?',
    choices: [
      {
        label: "Book the $2,100 European trip — the limit's there for a reason",
        consequenceTitle: 'Utilization Spike',
        consequenceEmoji: '⚠️',
        consequenceText: "Limit raised to $3,000, then immediately charged $2,100 = 70% utilization. That's worse than before the raise. Credit limits are opportunity — not permission to spend up to them. The Amounts Owed factor took a real hit.",
        consequenceBubble: {
          mario: "70% utilization! The limit raise was supposed to HELP the score!",
          luigi: "You turned a passive score improvement into a score deduction. I'm stressed.",
          peach: "The limit exists to create breathing room, not to fill immediately.",
          toad:  "I also booked Europe. I also had 70% utilization. I also regret it slightly."
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed: { limitDelta: 2000, balanceDelta: 2100 }
        }
      },
      {
        label: 'Book a modest $600 trip — responsible splurge',
        consequenceTitle: 'Smart Balance',
        consequenceEmoji: '✅',
        consequenceText: "20% utilization on the new limit — well within the safe zone. You got a trip AND kept your Amounts Owed factor healthy. This is the credit sweet spot: available credit, responsibly used.",
        consequenceBubble: {
          mario: "20% utilization AND a trip! This is peak financial strategy!",
          luigi: "Within the recommended threshold. I would've done the same trip.",
          peach: "You balanced enjoyment with financial responsibility. Exactly right.",
          toad:  "Under 30%! A trip! THIS IS WHAT GOOD LOOKS LIKE!"
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed: { limitDelta: 2000, balanceDelta: 600 }
        }
      },
      {
        label: "Don't spend anything extra — let the score improve",
        consequenceTitle: 'Passive Score Boost',
        consequenceEmoji: '✅',
        consequenceText: "Higher limit, same balance = lower Credit Utilization Rate = automatic score improvement. You didn't even make a decision — you just chose not to react to temptation. Utilization dropped immediately. Amounts Owed factor improved without spending a cent.",
        consequenceBubble: {
          mario: "Score improved WITHOUT SPENDING ANYTHING! The dream!",
          luigi: "Restraint as financial strategy. I've dedicated my life to this principle.",
          peach: "You received a gift and didn't immediately spend it. That's discipline.",
          toad:  "You... you just didn't spend it? That's it?? That's the whole move??"
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed: { limitDelta: 2000, balanceDelta: 0 }
        }
      }
    ]
  },

  /* S2-06 ── Co-Sign Apartment ────────────────────────────────────────────────── */
  {
    id: 's2-06', stage: 2,
    title: "Co-Sign Friend's Apartment",
    setting: '📍 Junior Year — Age 20',
    characterBubble: {
      mario: "Co-signing is like sharing your extra life with someone who keeps falling in pits.",
      luigi: "If they default on rent, your credit report looks exactly like theirs. Not great.",
      peach: "Your credit reputation is not a gift to give. Not for friends. Not for anyone.",
      toad:  "My cousin co-signed something once. He doesn't bring it up at Thanksgiving."
    },
    narrative: `Your friend can't rent an apartment alone — their <span class="term" data-term="credit_history">Credit History</span> is too thin. They're asking you to co-sign the lease. As co-signer, you're legally equal to the primary renter. If they miss rent and it gets reported, it appears on your <span class="term" data-term="credit_report">Credit Report</span> as if you missed it.`,
    decision: 'Do you co-sign?',
    choices: [
      {
        label: "Co-sign — you trust your friend completely",
        consequenceTitle: 'Liability Accepted',
        consequenceEmoji: '⚠️',
        consequenceText: "You're now legally responsible for the rent. If your friend misses a payment, your Credit Report takes the hit — not theirs. The friendship might be solid. The financial risk is real regardless. You're betting your credit score on someone else's reliability.",
        consequenceBubble: {
          mario: "You just made your credit score dependent on your friend's rent habits.",
          luigi: "I cannot look. Tell me it works out.",
          peach: "This is love as a financial liability. I hope they're worth it.",
          toad:  "The optimism. The beautiful, terrifying optimism."
        },
        factorHighlight: [],
        effects: {} // Risk exists but no immediate credit impact
      },
      {
        label: "Decline — you can't take on that liability",
        consequenceTitle: 'Clean Boundary',
        consequenceEmoji: '✅',
        consequenceText: "Hard to say no to a friend, but co-signing is one of the highest-risk credit decisions you can make. Your credit score is not collateral for someone else's lease. The kind answer here is actually 'no.' Your friend needs to build their own credit path.",
        consequenceBubble: {
          mario: "Your credit score stays clean! And honestly? That's the right call.",
          luigi: "No co-signing is always correct. Always. No exceptions.",
          peach: "The kind answer and the right answer are the same here.",
          toad:  "This is the correct choice. Unambiguously. 100%. The. Right. Call."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S2-07 ── Emergency Fund vs. Debt ─────────────────────────────────────────── */
  {
    id: 's2-07', stage: 2,
    requires: ['revolvingCredit'],
    title: '$1,000 Tax Refund — Debt or Savings?',
    setting: '📍 Junior Year — Age 20',
    characterBubble: {
      mario: "Both the debt AND the emergency fund matter. The question is just the order.",
      luigi: "I made a spreadsheet. The answer depends on your interest rate and risk tolerance.",
      peach: "An Emergency Fund prevents future debt. Paying debt prevents future interest.",
      toad:  "I put everything in savings once. Then my car broke down. Then I had more debt."
    },
    narrative: `A $1,000 tax refund just hit your account. You have $600 in credit card <span class="term" data-term="debt">debt</span> at 24% <span class="term" data-term="apr">APR</span>. Your <span class="term" data-term="emergency_fund">Emergency Fund</span> has exactly $0. Financial experts genuinely debate which to prioritize — both positions have merit. What's the right move?`,
    decision: 'How do you allocate the $1,000?',
    choices: [
      {
        label: 'All $1,000 to the credit card — eliminate the debt',
        consequenceTitle: 'Debt Eliminated, Buffer Gone',
        consequenceEmoji: '✅',
        consequenceText: "Credit card balance cleared. Credit Utilization Rate drops to 0%. Score improves. But with no Emergency Fund, any unexpected expense goes right back on the card at 24% APR. One car repair could undo everything. You solved today's problem; just be ready for tomorrow's.",
        consequenceBubble: {
          mario: "Debt gone! Score up! But... one surprise = right back to square one.",
          luigi: "Mathematically optimal, but with zero emergency buffer. Fragile.",
          peach: "Debt cleared is good. Zero emergency fund is... also a problem.",
          toad:  "I did this once. My water heater broke a week later. True story."
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed:    { balanceClear: true },
          paymentHistory: { delta: 5 }
        }
      },
      {
        label: 'Split: $600 to debt, $400 to emergency fund',
        consequenceTitle: 'Textbook Balance',
        consequenceEmoji: '✅',
        consequenceText: "Debt cleared AND $400 emergency buffer. Credit Utilization Rate dropped to 0%, score improved, and you have a safety net to prevent future debt spirals. This is the balanced approach financial advisors recommend — and now you understand why.",
        consequenceBubble: {
          mario: "Zero debt AND a safety net! This is the double power-up play!",
          luigi: "The mathematically AND emotionally optimal solution. I'm impressed.",
          peach: "Cleared the liability and built the buffer. This is financial strategy.",
          toad:  "The split approach! The actual correct answer! Okay!"
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed:    { balanceClear: true },
          paymentHistory: { delta: 5 }
        }
      },
      {
        label: 'All $1,000 to emergency savings — safety first',
        consequenceTitle: 'Safety Net Built, Debt Remains',
        consequenceEmoji: '⚠️',
        consequenceText: "Good safety net, but the $600 debt keeps accruing at 24% APR — that's $12/month in pure interest. The Emergency Fund is genuinely important. But carrying high-interest debt while building savings usually costs more than it protects.",
        consequenceBubble: {
          mario: "Emergency fund built! The debt keeps charging interest though. Both matter.",
          luigi: "24% APR on $600 is $12/month for no progress. The math is not kind here.",
          peach: "Safety net established. Now pay off the card before the interest compounds.",
          toad:  "Good instinct, slightly suboptimal math. Still a better call than some."
        },
        factorHighlight: [],
        effects: {
          paymentHistory: { delta: 2 }
        }
      }
    ]
  },

  /* S2-08 ── Balance Transfer Offer ─────────────────────────────────────────── */
  {
    id: 's2-08', stage: 2,
    requires: ['revolvingCredit'],
    title: '0% Balance Transfer Offer',
    setting: '📍 Senior Year — Age 21',
    characterBubble: {
      mario: "0% APR for 18 months?! That's like a save point after a long level!",
      luigi: "I calculated the break-even. Transfer fee vs. interest saved. Run the numbers.",
      peach: "The strategy works — but only if you commit to paying it off in 18 months.",
      toad:  "I did a balance transfer once. Then I forgot to pay off the old card. Don't do that."
    },
    narrative: `A new card offers 0% <span class="term" data-term="apr">APR</span> for 18 months on balance transfers. You have $1,200 in credit card debt at 22% <span class="term" data-term="interest_rate">Interest Rate</span>. Transferring saves you significant interest — but requires a <span class="term" data-term="hard_inquiry">Hard Inquiry</span>, a 3% transfer fee ($36), and opens a <span class="term" data-term="new_credit">New Credit</span> account.`,
    decision: 'Do you transfer the balance?',
    choices: [
      {
        label: 'Transfer the balance — save the interest',
        consequenceTitle: 'Strategic Move',
        consequenceEmoji: '✅',
        consequenceText: "Balance transferred. Hard Inquiry absorbed. $36 transfer fee paid. But you're now saving roughly $220/year in interest charges. If you pay it off within 18 months, this is a clear financial win. Just don't run up the old card again — that's how people end up with twice the debt.",
        consequenceBubble: {
          mario: "The math works! The Hard Inquiry hurts slightly but the savings win!",
          luigi: "I ran this calculation three times. The transfer is correct. Good decision.",
          peach: "Strategic use of a promotional rate. Just execute on the payoff plan.",
          toad:  "KEY RULE: Do NOT use the old card. I cannot stress this enough."
        },
        factorHighlight: ['newCredit', 'amountsOwed'],
        effects: {
          newCredit:    { hardInquiries: 1 },
          amountsOwed:  { limitDelta: 2000 },
          lengthHistory:{ delta: 3 }
        }
      },
      {
        label: 'Stay with current card — no new inquiry',
        consequenceTitle: 'Stable, But Paying Interest',
        consequenceEmoji: '⚠️',
        consequenceText: "No new inquiry, no new account. Clean credit file. But you're still paying 22% interest on $1,200 — that's roughly $22/month going directly to the bank. Over 18 months, that's $396 in interest the transfer would have saved. A cost worth knowing.",
        consequenceBubble: {
          mario: "No inquiry! Clean file! But $22 a month in interest is... a lot of coins.",
          luigi: "The credit stability argument is real. The interest cost is also real.",
          peach: "Conservative and defensible. Just pay it down aggressively.",
          toad:  "Sometimes boring is right. This is not one of those times, but okay."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S2-09 ── Close Old Secured Card? ─────────────────────────────────────────── */
  {
    id: 's2-09', stage: 2,
    requires: ['revolvingCredit'],
    title: 'Keep or Close the Oldest Card?',
    setting: '📍 Senior Year — Age 21',
    characterBubble: {
      mario: "Your oldest account is your ANCHOR. Close it and the history drifts.",
      luigi: "I kept every credit card I've ever opened. My wallet is... substantial.",
      peach: "Length of Credit History is 15% of your score. That $65 fee is cheap protection.",
      toad:  "I closed my oldest card to save $50 once. Lost 40 points. Math did not math."
    },
    narrative: `Your oldest credit card — the one you opened in high school — now charges a $65 annual fee. It's your oldest account. Closing it would save $65 but could hurt your <span class="term" data-term="credit_history">Credit History</span> length. Lenders value accounts that have been open a long time — it's 15% of your <span class="term" data-term="fico_score">FICO Score</span>.`,
    decision: 'What do you do?',
    choices: [
      {
        label: "Keep it — the credit history is worth more than $65",
        consequenceTitle: 'History Protected',
        consequenceEmoji: '✅',
        consequenceText: "$65 paid. Your oldest account stays open. Length of History remains intact — and improves automatically as time passes. The math on keeping it: if $65/year protects your oldest account and keeps your score 10-20 points higher, that's worth hundreds in lower interest rates.",
        consequenceBubble: {
          mario: "The history stays! The score stays! The $65 was an investment!",
          luigi: "Keeping your oldest account is always correct. Always.",
          peach: "The $65 fee is insurance on your credit history. Very cheap insurance.",
          toad:  "Keeping it! YES! Don't be me! I CLOSED MINE!"
        },
        factorHighlight: ['lengthHistory'],
        effects: {
          paymentHistory: { delta: 2 }
        }
      },
      {
        label: 'Close it — $65 fee is too much',
        consequenceTitle: 'Oldest Account Gone',
        consequenceEmoji: '⚠️',
        consequenceText: "You saved $65 — but closed your oldest account. When the credit bureaus update, Length of Credit History may shorten. Available credit decreases too, potentially raising your overall utilization ratio. The score impact often costs more than the fee saves.",
        consequenceBubble: {
          mario: "The oldest account... gone. The history anchor... lifted.",
          luigi: "I'm going to need a moment. This is genuinely painful to witness.",
          peach: "You'll understand what this cost you in about three months.",
          toad:  "I did this. Lost points. Regretted it. This is your warning."
        },
        factorHighlight: ['lengthHistory', 'amountsOwed'],
        effects: {
          lengthHistory:{ delta: -15 },
          amountsOwed:  { limitClose: 300 },
          flags: { closedOldestAccount: true }
        }
      },
      {
        label: 'Call and ask them to waive the annual fee',
        consequenceTitle: 'Best of Both Worlds',
        consequenceEmoji: '✅',
        consequenceText: "Fee waived! You kept your oldest account AND saved the $65. This works more often than people think — issuers prefer retaining customers over losing them over an annual fee. Credit history intact, $65 in your pocket.",
        consequenceBubble: {
          mario: "Fee waived! Account kept! This is the secret fourth option they don't advertise!",
          luigi: "I've done this six times. It works approximately 60% of the time. Worth attempting.",
          peach: "You asked. They said yes. This is how negotiation works.",
          toad:  "YOU JUST CALLED AND ASKED AND IT WORKED?! SCREAMING."
        },
        factorHighlight: ['lengthHistory'],
        effects: {
          paymentHistory: { delta: 3 }
        }
      }
    ]
  },

  /* S2-10 ── Forgot to Pay — 5 Days Late ─────────────────────────────────────── */
  {
    id: 's2-10', stage: 2,
    requires: ['revolvingCredit'],
    title: 'Payment Due — 5 Days Ago',
    setting: '📍 Senior Year — Age 21',
    characterBubble: {
      mario: "5 days late! You have 25 days left before it REPORTS! MOVE!",
      luigi: "Negative marks are only reported at 30 days. You have a window. USE IT.",
      peach: "Act immediately. The 30-day threshold is not a suggestion.",
      toad:  "I once realized I was 5 days late and paid in under 4 minutes. You can do this."
    },
    narrative: `It's 5 days past your credit card due date. Finals week happened and it completely slipped your mind. The silver lining: negative marks are only reported to <span class="term" data-term="credit_bureau">Credit Bureaus</span> at 30 days past due. You're at 5. You have a window — but it closes fast.`,
    decision: 'What do you do?',
    choices: [
      {
        label: 'Pay immediately — still well within the 30-day window',
        consequenceTitle: 'Crisis Averted',
        consequenceEmoji: '✅',
        consequenceText: "Paid at 5 days past due — 25 days before the reporting threshold. Zero credit damage. You may owe the credit card company a late fee ($25-40), but your Credit Report stays clean. Set up autopay the moment you're done reading this consequence card.",
        consequenceBubble: {
          mario: "PAID! 25 DAYS BEFORE REPORTING! THE SCORE LIVES TO FIGHT ANOTHER DAY!",
          luigi: "25 days of buffer remaining. Crisis managed. Set. Up. Autopay.",
          peach: "Fast action, clean result. The right call executed correctly.",
          toad:  "FOUR MINUTES OR LESS. YOU COULD HAVE DONE IT IN FOUR MINUTES."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 5, onTimePayments: 1 }
        }
      },
      {
        label: "Wait until next paycheck — two weeks from now",
        consequenceTitle: 'Reporting Window Missed',
        consequenceEmoji: '💥',
        consequenceText: "Two weeks means 19 days past due — still technically under 30. But depending on your exact billing cycle, this might still get reported. You're playing with a 1-11 day buffer. Not worth the risk. The 30-day window is not forgiving.",
        consequenceBubble: {
          mario: "19 days late! You're this close to the reporting window!",
          luigi: "19 days. The next billing cycle might report this. Pay now.",
          peach: "You had a clear window. You used part of it. The rest is up to timing.",
          toad:  "19 days. I've been 19 days late. It did not end well. Fortunately it's still close."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -5 } // late fee, borderline damage
        }
      }
    ]
  }

]; // end stage2Pool


/* ══════════════════════════════════════════════════════════════════════════════ */
/* STAGE 3 — YOUNG ADULT (Ages 22-24)                                           */
/* ══════════════════════════════════════════════════════════════════════════════ */

export const stage3Pool = [

  /* S3-01 ── Apartment Application [CONSEQUENCE EVENT] ─────────────────────── */
  {
    id: 's3-01', stage: 3,
    type: 'consequence-event',
    alwaysFirst: true,
    title: 'Apartment Application Results',
    setting: '📍 Age 22 — First Apartment',
    characterBubble: {
      mario: "Everything you've built — or not built — shows up right here.",
      luigi: "This is the moment the simulation was designed for. Deep breath.",
      peach: "Your Credit Score has been building to exactly this moment.",
      toad:  "Whatever happens — it's information. Use it."
    },
    narrative: `You're apartment hunting for your first post-college place. Most landlords run a credit check before approving a lease. The result you receive isn't determined by luck or personality — it's determined entirely by your <span class="term" data-term="credit_score">Credit Score</span>, built from every decision since high school.`,
    outcomesByScore: [
      {
        minScore: 750,
        title: 'Approved — No Deposit Required!',
        emoji: '✅',
        text: "Your Credit Score qualified you for the top tier. The landlord didn't even require a security deposit. Your record of on-time payments and responsible credit use just saved you $500-1,500 out of pocket. This is the direct payoff of every good decision since high school.",
        flagKey: 'stage3ApartmentResult', flagValue: 'approved_no_deposit'
      },
      {
        minScore: 670,
        title: 'Approved — $500 Deposit Required',
        emoji: '✅',
        text: "Good Credit Score — apartment approved. You did pay an additional $500 security deposit since your score didn't quite hit the premium tier. You'll get it back (assuming no damage), but you needed the cash upfront. Your credit history is solid, just not exceptional.",
        flagKey: 'stage3ApartmentResult', flagValue: 'approved_deposit'
      },
      {
        minScore: 580,
        title: 'Conditionally Approved — $1,200 Deposit',
        emoji: '⚠️',
        text: "Fair Credit Score — conditional approval with a $1,200 deposit. The landlord is taking on more risk, so they require more upfront money as protection. You got in, but the barrier was higher. This is one direct cost of a middle-tier credit score.",
        flagKey: 'stage3ApartmentResult', flagValue: 'conditional'
      },
      {
        minScore: 0,
        title: 'Application Denied — Co-Signer Required',
        emoji: '💥',
        text: "Poor or no Credit Score — application denied without a co-signer. The landlord can't approve a lease without someone with established credit backing it up. This is one of the most visceral consequences of a thin or damaged credit file. The apartment was available. The score wasn't.",
        flagKey: 'stage3ApartmentResult', flagValue: 'denied'
      }
    ]
  },

  /* S3-02 ── Car Loan Rate Reveal [CONSEQUENCE EVENT] ────────────────────────── */
  {
    id: 's3-02', stage: 3,
    type: 'consequence-event',
    title: '$15,000 Car Loan — Your Rate',
    setting: '📍 Age 22 — First Car Loan',
    characterBubble: {
      mario: "Same car. Same loan amount. Wildly different monthly payment. This is why.",
      luigi: "I calculated every tier. The difference over 5 years is substantial.",
      peach: "Two people can take out the same loan and pay vastly different amounts.",
      toad:  "I got a terrible rate on my first car loan. I spent $3,000 extra. Learn from me."
    },
    narrative: `You need a reliable car and you've been pre-approved for a $15,000 auto loan. The <span class="term" data-term="interest_rate">Interest Rate</span> you receive depends entirely on your <span class="term" data-term="credit_score">Credit Score</span>. Same car. Same loan amount. The difference in rate could cost — or save — thousands of dollars over 5 years.`,
    outcomesByScore: [
      {
        minScore: 750,
        title: '4.5% APR — Best Rate Available',
        emoji: '✅',
        text: "Exceptional Credit Score. You qualified for 4.5% APR — the best tier. Monthly payment: $280. Total interest over 5 years: $1,800. Your credit history literally saved you thousands compared to borrowers with lower scores.",
        flagKey: 'stage3CarAPR', flagValue: '4.5%'
      },
      {
        minScore: 700,
        title: '7.5% APR — Good Rate',
        emoji: '✅',
        text: "Good Credit Score. 7.5% APR — solid but not the best available. Monthly payment: $301. Total interest over 5 years: $3,060. You're paying $1,260 more in interest than the top tier. Good score, good outcome — just not optimal.",
        flagKey: 'stage3CarAPR', flagValue: '7.5%'
      },
      {
        minScore: 650,
        title: '12% APR — Elevated Rate',
        emoji: '⚠️',
        text: "Fair Credit Score. 12% APR — noticeably above the best rates. Monthly payment: $334. Total interest over 5 years: $5,040. You're paying $3,240 more than the top tier for the exact same car. This is the direct financial cost of a mid-range score.",
        flagKey: 'stage3CarAPR', flagValue: '12%'
      },
      {
        minScore: 0,
        title: '19% APR — Subprime Rate',
        emoji: '💥',
        text: "Poor or no Credit Score. 19% APR — subprime lending territory. Monthly payment: $388. Total interest over 5 years: $8,280. That's $6,480 more than the best rate — for the same car, same loan amount. The only variable was the credit score.",
        flagKey: 'stage3CarAPR', flagValue: '19%'
      }
    ]
  },

  /* S3-03 ── Job Application Credit Check [CONSEQUENCE EVENT] ──────────────── */
  {
    id: 's3-03', stage: 3,
    type: 'consequence-event',
    title: 'Finance Job Credit Check',
    setting: '📍 Age 22 — Career Start',
    characterBubble: {
      mario: "Some employers check credit as part of hiring. Finance jobs especially.",
      luigi: "I kept my credit clean specifically because of this. It does happen.",
      peach: "Your financial reputation matters professionally, not just personally.",
      toad:  "My cousin got flagged at his background check. Different career path now."
    },
    narrative: `You applied for a position at a financial services firm. Like many finance, government, and security-clearance roles, they run a credit check as part of the background screening. A <span class="term" data-term="credit_report">Credit Report</span> review is a standard part of hiring for roles that involve handling money or accessing sensitive accounts.`,
    outcomesByScore: [
      {
        minScore: 670,
        title: 'Background Check Passed',
        emoji: '✅',
        text: "Your Credit Report cleared the employer's background screening without any flags. Responsible credit behavior isn't just about loans and apartments — it shows financial judgment to employers too. This is one more door your credit score just opened.",
        flagKey: 'stage3JobResult', flagValue: 'passed'
      },
      {
        minScore: 0,
        title: 'Flag Noted in Screening',
        emoji: '⚠️',
        text: "Your Credit Report came up in the screening with notes flagged for review — late payments, collections, or a thin file. The hiring manager wants to discuss it in a follow-up interview. This doesn't automatically disqualify you, but it created a hurdle that didn't exist for candidates with clean credit histories.",
        flagKey: 'stage3JobResult', flagValue: 'flagged'
      }
    ]
  },

  /* S3-04 ── Student Loan Repayment Begins ────────────────────────────────────── */
  {
    id: 's3-04', stage: 3,
    requires: ['studentLoans'],
    title: 'Student Loan Repayment Starts',
    setting: '📍 Age 22 — Post-Graduation',
    characterBubble: {
      mario: "The grace period is over. The game clock is running. First payment matters MOST.",
      luigi: "Autopay on federal loans gives you a 0.25% interest rate reduction. Set it up.",
      peach: "The first payment sets the pattern. Set it up correctly, then don't touch it.",
      toad:  "I missed my first student loan payment because 'it was just the first one.' Rookie mistake."
    },
    narrative: `The 6-month grace period on your federal student loans just ended. First payment is due next month. <span class="term" data-term="payment_history">Payment History</span> is still 35% of everything. Federal student loan <span class="term" data-term="default">Default</span> is uniquely severe — the government can garnish wages and tax refunds without a court order.`,
    decision: 'How do you handle the first payment?',
    choices: [
      {
        label: 'Set up autopay and pay on time, every month',
        consequenceTitle: 'Protected. Consistent. Growing.',
        consequenceEmoji: '✅',
        consequenceText: "Autopay engaged. First payment made on time. Federal loans reporting on-time payments build your score month by month — slow, consistent, and powerful. Autopay also gives you a 0.25% interest rate reduction. Small things add up over 10 years.",
        consequenceBubble: {
          mario: "Autopay set! First payment landed! The score grows with every month!",
          luigi: "The 0.25% reduction plus the Payment History protection. Excellent move.",
          peach: "Autopay is set. The system works for you now. Well structured.",
          toad:  "Autopay! First payment done! THIS IS HOW YOU DO IT!"
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 8, onTimePayments: 1 },
          flags: { tookStudentLoans: true }
        }
      },
      {
        label: 'Enroll in income-driven repayment — lower monthly payment',
        consequenceTitle: 'Manageable Path',
        consequenceEmoji: '✅',
        consequenceText: "Income-driven repayment gives you smaller monthly payments — though the loan lasts longer and total interest is higher. But a $150 payment you make consistently beats a $400 payment you struggle with. Payment History stays clean. The balance will take longer, but it works.",
        consequenceBubble: {
          mario: "Smaller payments! Still paid! Still on time! The score stays strong!",
          luigi: "A payment you can make every month beats a payment you can't. Correct call.",
          peach: "Manageable is sustainable. Sustainable is how loans get paid.",
          toad:  "Income-driven means you CAN pay it. And you WILL. That's what matters."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 5, onTimePayments: 1 },
          flags: { tookStudentLoans: true }
        }
      },
      {
        label: "Miss the first payment — genuinely can't make it work",
        consequenceTitle: 'Federal Loan Late — Serious Damage',
        consequenceEmoji: '💥',
        consequenceText: "First student loan payment missed. Federal loan default is particularly severe — wages can be garnished, tax refunds seized. Call your loan servicer today. Income-driven repayment or deferment are both better options than a missed payment. The damage is done, but stopping it now matters.",
        consequenceBubble: {
          mario: "Call the servicer! Today! Income-driven repayment exists for exactly this!",
          luigi: "The government can garnish wages without a court order. CALL THE SERVICER.",
          peach: "One call today can prevent years of damage. Please make that call.",
          toad:  "This is fixable. But only if you act now. RIGHT NOW."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -35, latePayments30: 1 },
          flags: { perfectPaymentHistory: false, hadLatePayment: true, tookStudentLoans: true }
        }
      }
    ]
  },

  /* S3-05 ── Debt Consolidation Loan ─────────────────────────────────────────── */
  {
    id: 's3-05', stage: 3,
    requires: ['revolvingCredit'],
    title: 'Debt Consolidation Offer',
    setting: '📍 Age 23 — Managing Multiple Debts',
    characterBubble: {
      mario: "One loan, lower rate — but only if you don't rebuild the old balances.",
      luigi: "I calculated the break-even at three months. The consolidation math works.",
      peach: "The interest savings are real. But discipline on the old accounts is essential.",
      toad:  "I consolidated once. Then used my freed-up cards again. Don't be me."
    },
    narrative: `You have a credit card at 22% <span class="term" data-term="apr">APR</span> and a personal loan at 18% APR. A lender offers a Debt Consolidation Loan at 12% APR. It requires a <span class="term" data-term="hard_inquiry">Hard Inquiry</span> and opens a new account — but the lower <span class="term" data-term="interest_rate">Interest Rate</span> saves you real money over time.`,
    decision: 'Do you consolidate?',
    choices: [
      {
        label: 'Take the consolidation loan — lower rate makes sense',
        consequenceTitle: 'Strategic Consolidation',
        consequenceEmoji: '✅',
        consequenceText: "Hard Inquiry absorbed. Consolidation loan opened at 12% APR. Lower interest means more of each payment goes to principal. The math clearly favors this — but the strategy only works if you don't rebuild the old card balances. One new account, one lower rate, one monthly payment.",
        consequenceBubble: {
          mario: "One loan, lower rate, one payment! The math wins! Don't rebuild the cards!",
          luigi: "Correct decision executed correctly. Just don't touch the old credit card.",
          peach: "The interest savings are real. The discipline requirement is also real.",
          toad:  "DO NOT USE THE OLD CREDIT CARD. I beg you. I am on my knees."
        },
        factorHighlight: ['newCredit', 'creditMix'],
        effects: {
          hasAnyCredit: true,
          newCredit:    { hardInquiries: 1 },
          creditMix:    { hasInstallmentLoan: true },
          amountsOwed:  { balanceDelta: -200 } // net improvement from lower rate/payment
        }
      },
      {
        label: 'Skip it — pay down the debt aggressively instead',
        consequenceTitle: 'No New Inquiry',
        consequenceEmoji: '✅',
        consequenceText: "No Hard Inquiry, no new account. Credit file stays stable. You'll pay more interest over time at the higher rates — but if you have the discipline to aggressively pay down existing debt, you'll reach the same place without any credit disruption.",
        consequenceBubble: {
          mario: "No new inquiry! Aggressive paydown! Different path, same destination!",
          luigi: "The credit stability argument is valid. The interest cost is the tradeoff.",
          peach: "Conservative and defensible. Execute the paydown plan consistently.",
          toad:  "No new inquiry = no new risk. Also no interest savings. Tradeoffs exist."
        },
        factorHighlight: [],
        effects: {
          paymentHistory: { delta: 5 }
        }
      }
    ]
  },

  /* S3-06 ── New Rewards Credit Card ─────────────────────────────────────────── */
  {
    id: 's3-06', stage: 3,
    requires: ['revolvingCredit'],
    title: 'Premium Rewards Card Offer',
    setting: '📍 Age 23 — Building Credit',
    characterBubble: {
      mario: "2% cash back sounds great until you do the math on the $95 annual fee.",
      luigi: "New inquiry + new account + annual fee. The math only works above a spending threshold.",
      peach: "Rewards cards are tools. Evaluate the ROI before the excitement.",
      toad:  "I got a rewards card once for the points. Paid $95/year and got $40 back. Good job me."
    },
    narrative: `A premium rewards card offer arrived: 2% cash back on everything, $95 annual fee. Final approval requires a <span class="term" data-term="hard_inquiry">Hard Inquiry</span>. Your current credit mix already has revolving credit — so the <span class="term" data-term="types_of_credit">Types of Credit</span> benefit is minimal. The question is whether the cash back math works for your actual spending.`,
    decision: 'Do you apply?',
    choices: [
      {
        label: "Apply — the cash back is worth it",
        consequenceTitle: 'New Account Opened',
        consequenceEmoji: '⚠️',
        consequenceText: "Hard Inquiry registered, new account opened, $95 annual fee begins. The 2% cash back requires $4,750/year in spending to just break even on the fee. If you spend more and always pay in full, this is a net positive. If not, you paid $95 for a temporary score dip.",
        consequenceBubble: {
          mario: "Hard Inquiry landed. New card secured. Now do the math on the fee.",
          luigi: "I calculated the break-even. $4,750/year minimum. Do you spend that?",
          peach: "The card is in hand. Whether the math works is up to you.",
          toad:  "Break even is $4,750 a year. Just so you know."
        },
        factorHighlight: ['newCredit'],
        effects: {
          hasAnyCredit: true,
          newCredit:    { hardInquiries: 1 },
          amountsOwed:  { limitDelta: 5000 },
          lengthHistory:{ delta: 2 }
        }
      },
      {
        label: "Don't apply — not worth the inquiry",
        consequenceTitle: 'Score Stays Stable',
        consequenceEmoji: '✅',
        consequenceText: "No inquiry, no new account, no annual fee. Your credit score stays exactly where it is. Sometimes the best credit move is not making one. Premium rewards cards only make financial sense when the actual math works in your favor — and you know the math.",
        consequenceBubble: {
          mario: "No inquiry! Score stable! Sometimes the best move is no move!",
          luigi: "You did the math. You made the right decision. I'm proud.",
          peach: "Saying no to a well-marketed product is a sign of financial maturity.",
          toad:  "You didn't get the card. You saved $95. This is a win."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S3-07 ── Old Debt in Collections ─────────────────────────────────────────── */
  {
    id: 's3-07', stage: 3,
    requires: ['collections'],
    title: 'Dealing with Old Collections Debt',
    setting: '📍 Age 23 — Clearing the Past',
    characterBubble: {
      mario: "Pay-for-delete: if they agree, the mark disappears. If not, it stays paid.",
      luigi: "Always negotiate before paying in full. Every collector has wiggle room.",
      peach: "Unpaid collections are financial anchors. Remove them or resolve them.",
      toad:  "I had a collection once. Negotiated pay-for-delete. It worked. TRY THIS FIRST."
    },
    narrative: `An old $650 debt that went to <span class="term" data-term="collections">Collections</span> — is still on your <span class="term" data-term="credit_report">Credit Report</span>. You have money now. Collections accounts stay for 7 years from the first delinquency date, but how you resolve them can affect your <span class="term" data-term="payment_history">Payment History</span> score differently.`,
    decision: 'How do you handle it?',
    choices: [
      {
        label: 'Negotiate a pay-for-delete agreement',
        consequenceTitle: 'Best Possible Outcome',
        consequenceEmoji: '✅',
        consequenceText: "You negotiated: settle for $425 and they remove the collection from your Credit Report entirely. Not all collectors agree to this — but when they do, it's the cleanest resolution. The collection mark is gone. Payment History score improved significantly.",
        consequenceBubble: {
          mario: "PAY FOR DELETE! The nuclear option! The BEST option! It worked!",
          luigi: "40% success rate industry-wide. You got the best possible result.",
          peach: "Negotiated, resolved, erased. This is the right process executed perfectly.",
          toad:  "IT WORKED! IT ACTUALLY WORKED! TELL YOUR FRIENDS!"
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 30, removeCollection: true }
        }
      },
      {
        label: 'Pay in full — $650',
        consequenceTitle: 'Paid, But Still On Record',
        consequenceEmoji: '⚠️',
        consequenceText: "Debt paid in full. But the collection account remains on your Credit Report for the full 7 years — just marked as 'paid.' Better than unpaid, but no dramatic score recovery. The debt is resolved; the history of it isn't erased.",
        consequenceBubble: {
          mario: "Paid! Debt gone! Mark stays for 7 years though. Should've tried negotiate first.",
          luigi: "Correct to pay. You should have tried to negotiate first though.",
          peach: "The debt is gone. The record of it isn't. Lesson for next time.",
          toad:  "Try negotiate BEFORE paying in full. Always. Every time."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 10 }
        }
      },
      {
        label: "Ignore it — it'll age off eventually",
        consequenceTitle: 'Deeper Damage',
        consequenceEmoji: '💥',
        consequenceText: "The 7-year clock isn't as simple as waiting. Collectors can re-sell the debt, renew collection activity, and even sue for a judgment. A judgment becomes a public record — separate from the collection itself. Ignoring it doesn't make it disappear. It makes it worse.",
        consequenceBubble: {
          mario: "They can SUE for a judgment! That's WORSE than the collection!",
          luigi: "Seven years of waiting while collectors can still take action. Please don't.",
          peach: "Ignoring debt doesn't age it off cleanly. It complicates it.",
          toad:  "The 'wait it out' strategy works exactly 0% of the time effectively."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: -20 }
        }
      }
    ]
  },

  /* S3-08 ── $1,500 Windfall ──────────────────────────────────────────────────── */
  {
    id: 's3-08', stage: 3,
    requires: ['revolvingCredit'],
    title: '$1,500 Bonus — Debt or Emergency Fund?',
    setting: '📍 Age 23 — Year-End Windfall',
    characterBubble: {
      mario: "Both the debt AND the emergency fund matter. The split is usually the answer.",
      luigi: "21% interest on $900 = $189/year in pure waste. The debt should go first.",
      peach: "An emergency fund prevents future debt. Paying debt prevents current interest.",
      toad:  "I got a bonus once and put it all in savings. Then my car broke down."
    },
    narrative: `Year-end bonus: $1,500. You still carry $900 in credit card <span class="term" data-term="debt">debt</span> at 21% <span class="term" data-term="apr">APR</span>. Your <span class="term" data-term="emergency_fund">Emergency Fund</span> has only $200. The mathematically correct answer and the practically wise answer are actually close — but not identical.`,
    decision: 'How do you allocate it?',
    choices: [
      {
        label: 'All $1,500 to the credit card debt',
        consequenceTitle: 'Zero Debt, Thin Buffer',
        consequenceEmoji: '✅',
        consequenceText: "Credit card balance cleared. Zero utilization. Score improves immediately. But with $200 in your emergency fund, the next unexpected expense goes straight back to the card at 21% APR. Debt eliminated; safety net is still thin.",
        consequenceBubble: {
          mario: "Zero debt! Zero utilization! But if your car breaks... right back to square one.",
          luigi: "Mathematically optimal. Operationally fragile. One emergency away from restart.",
          peach: "Debt cleared. Emergency buffer minimal. Monitor expenses carefully.",
          toad:  "Great for the score. Less great if something breaks next week."
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed:    { balanceClear: true },
          paymentHistory: { delta: 5 }
        }
      },
      {
        label: 'Split: $900 to debt, $600 to emergency fund',
        consequenceTitle: 'Balanced Financial Play',
        consequenceEmoji: '✅',
        consequenceText: "Debt cleared AND emergency fund at $800. Zero utilization, score improvement, and a meaningful safety net. Now if something breaks, you don't go straight back into debt. This is the approach that breaks the debt cycle — not just this time, but structurally.",
        consequenceBubble: {
          mario: "Zero debt AND an emergency buffer! DOUBLE WIN! This is the play!",
          luigi: "Zero utilization + emergency fund. This is the textbook answer for a reason.",
          peach: "Debt eliminated and resilience built. This is how financial stability works.",
          toad:  "THE SPLIT! THE CORRECT ANSWER! DO THIS! NOW!"
        },
        factorHighlight: ['amountsOwed'],
        effects: {
          amountsOwed:    { balanceClear: true },
          paymentHistory: { delta: 5 }
        }
      },
      {
        label: 'All $1,500 to the emergency fund',
        consequenceTitle: 'Safety Net Built, Interest Continues',
        consequenceEmoji: '⚠️',
        consequenceText: "$1,700 emergency fund — real protection. But the $900 credit card debt keeps accruing at 21% APR: $189/year in interest for no progress. Good protective instinct. The math argues for the split — but having any emergency fund is always better than having none.",
        consequenceBubble: {
          mario: "Safety net built! Good! The debt interest though. That one hurts.",
          luigi: "$189/year in avoidable interest. The split is better. But this is fine.",
          peach: "Solid safety net. Now redirect some of it toward the debt.",
          toad:  "Emergency fund: smart. Letting the debt compound: slightly less smart."
        },
        factorHighlight: [],
        effects: {
          paymentHistory: { delta: 2 }
        }
      }
    ]
  },

  /* S3-09 ── Predatory Credit Repair Company ─────────────────────────────────── */
  {
    id: 's3-09', stage: 3,
    title: 'Credit Repair Company — $500 Fee',
    setting: '📍 Age 23 — Looking for Shortcuts',
    characterBubble: {
      mario: "If someone promises to fix your credit for a fee... that's a trap.",
      luigi: "Every single thing a credit repair company does, you can do yourself. For free.",
      peach: "They cannot legally remove accurate negative items. Only errors. And you can too.",
      toad:  "My cousin paid $800 to one of these companies. His score went DOWN."
    },
    narrative: `An online ad promises: "Repair your <span class="term" data-term="credit_score">Credit Score</span> fast — guaranteed!" Just $500 upfront. Critical fact: under federal law, you have the right to dispute errors on your <span class="term" data-term="credit_report">Credit Report</span> yourself — for free. Credit repair companies legally cannot do anything you can't do yourself. Not one single thing.`,
    decision: 'What do you do?',
    choices: [
      {
        label: "Pay the $500 fee — sounds worth it",
        bubble: 'credit-repair-scam', // character reacts to the scam
        consequenceTitle: 'You Got Scammed',
        consequenceEmoji: '💥',
        consequenceText: "$500 gone. They disputed a few items, most were denied, nothing changed. Legitimate credit issues cannot be removed by law — only errors can. And you could have disputed errors yourself, for free, in 30 minutes. This is what predatory credit repair companies do every day.",
        consequenceBubble: {
          mario: "You got-a bamboozled! Those guys are CROOKS!",
          luigi: "I researched them. One star. ONE STAR.",
          peach: "I feel like I should have warned you. Consider this that warning.",
          toad:  "My cousin paid them $800. His score went DOWN. Small world."
        },
        factorHighlight: [],
        effects: {
          flags: { creditRepairScam: true } // triggers easter egg bubble
        }
      },
      {
        label: 'Dispute errors yourself — free and legal',
        consequenceTitle: 'Empowered and Correct',
        consequenceEmoji: '✅',
        consequenceText: "You found two errors on your Credit Report and disputed them directly with the Credit Bureau. One was removed within 30 days. Under the Fair Credit Reporting Act, you have the legal right to an accurate report — and the right to dispute anything inaccurate in it. For free.",
        consequenceBubble: {
          mario: "You disputed it yourself! FREE! LEGAL! AND IT WORKED!",
          luigi: "The Fair Credit Reporting Act is on your side. Always was.",
          peach: "Knowledge is power. You just exercised a legal right effectively.",
          toad:  "You just did for free what they charge $500 for. Incredible."
        },
        factorHighlight: ['paymentHistory'],
        effects: {
          paymentHistory: { delta: 15 }
        }
      },
      {
        label: "Do nothing — it's probably fine",
        consequenceTitle: 'Errors Stay, Score Stays Low',
        consequenceEmoji: '⚠️',
        consequenceText: "The errors sit on your Credit Report uncontested. Every month they're there, they continue costing you — in higher interest rates, in denied applications, in lost opportunities. You had the right to dispute them. The right to an accurate report doesn't expire — but opportunities do.",
        consequenceBubble: {
          mario: "The errors stay. Every month they cost you. You have the right to fight them.",
          luigi: "Every single day you don't dispute errors is a day you pay for them.",
          peach: "You have legal rights here that you chose not to exercise.",
          toad:  "The fix is free and takes 30 minutes. Just saying."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  },

  /* S3-10 ── Pre-Approved Mortgage ────────────────────────────────────────────── */
  {
    id: 's3-10', stage: 3,
    title: 'Pre-Approved Mortgage Offer',
    setting: '📍 Age 24 — The Biggest Decision',
    characterBubble: {
      mario: "This is World 1-1 for adulthood. And every life decision built to this moment.",
      luigi: "I ran the numbers. A 1% rate difference on $180K over 30 years = $38,000.",
      peach: "Every decision since high school converges here. This is why credit scores matter.",
      toad:  "Whatever you decide — you understand now why the score mattered all along."
    },
    narrative: `You've been pre-approved for a $180,000 mortgage. The <span class="term" data-term="interest_rate">Interest Rate</span> you receive depends entirely on your <span class="term" data-term="fico_score">FICO Score</span>. On a 30-year mortgage, a 1% difference in rate = approximately $38,000 in additional interest paid. Every decision in this simulation was building to this moment — for better or worse.`,
    decision: 'What do you do?',
    choices: [
      {
        label: "Apply now — your score is ready",
        consequenceTitle: 'Mortgage Approved',
        consequenceEmoji: '✅',
        consequenceText: "Mortgage approved. The interest rate you received reflects every credit decision made since high school — every on-time payment, every low utilization choice, every account carefully managed. High scorers save tens of thousands over the life of a mortgage. This is the payoff.",
        consequenceBubble: {
          mario: "You saved the castle AND your credit score! HERO!",
          luigi: "Everything led to this. Every payment. Every choice. This.",
          peach: "Immaculate. Frame this. The credit score you built opened this door.",
          toad:  "Nobody expected this to go this well. Especially not me. CONGRATS."
        },
        factorHighlight: ['paymentHistory', 'amountsOwed'],
        effects: {
          creditMix:    { hasMortgage: true },
          newCredit:    { hardInquiries: 1 },
          installment:  { balanceDelta: 180000 },
          lengthHistory:{ delta: 5 }
        }
      },
      {
        label: "Wait 2 more years — build the score higher first",
        consequenceTitle: 'Patient Long Game',
        consequenceEmoji: '✅',
        consequenceText: "Two more years of on-time payments and lower utilization could move you into a better rate tier. On a $180K mortgage, a better rate could save $20,000-40,000 over 30 years. Patience here isn't hesitation — it's one of the best financial decisions you can make.",
        consequenceBubble: {
          mario: "Two more years for tens of thousands in savings? Sounds like a good level skip.",
          luigi: "I waited. My mortgage rate was 0.75% lower. Over 30 years. Worth it.",
          peach: "Patience applied strategically is not delay — it's financial intelligence.",
          toad:  "Waiting two years to save $30,000 is not weakness. It's literally math."
        },
        factorHighlight: [],
        effects: {
          paymentHistory: { delta: 5 }
        }
      },
      {
        label: "Keep renting — not ready for a mortgage",
        consequenceTitle: 'Valid Life Choice',
        consequenceEmoji: '✅',
        consequenceText: "Renting isn't failing — many financial advisors argue it makes more sense in certain markets and life stages. No credit impact from this decision, and no $180K in debt. You're not obligated to buy a home. Your credit score just means the option was available.",
        consequenceBubble: {
          mario: "The castle can wait! Your score means you COULD have it. That's the point.",
          luigi: "Renting is a completely rational financial decision. No shame whatsoever.",
          peach: "Knowing you have the option is the point. Whether you take it is yours to decide.",
          toad:  "You had the score to get the mortgage. That matters — even if you didn't use it."
        },
        factorHighlight: [],
        effects: {}
      }
    ]
  }

]; // end stage3Pool


