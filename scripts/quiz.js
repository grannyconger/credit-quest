/* ── Credit Quest: Quiz Bank + Draw Logic ────────────────────────────────────── */

'use strict';

const quizBank = [
  {
    id: 'q01', answer: 'C',
    question: 'What are the two most important factors in calculating your credit score?',
    choices: {
      A: 'Payment history and types of accounts',
      B: 'Amounts owed and length of credit history',
      C: 'Payment history and total debt',
      D: 'Length of credit history and new credit inquiries'
    },
    explanation: 'Payment History (35%) and Amounts Owed / Credit Utilization (30%) together make up 65% of your FICO Score — the two biggest factors by far.'
  },
  {
    id: 'q02', answer: 'D',
    question: 'Heather realized she has taken out too much debt and it has started to negatively impact her ability to budget. She has decided to pay off this debt in full as soon as possible. All of the following would be beneficial strategies EXCEPT…',
    choices: {
      A: 'Reducing spending by canceling some of her streaming subscriptions',
      B: 'Taking extra shifts at work to increase her income',
      C: 'Making more than the minimum required payment on her debt',
      D: 'Applying for another credit card to use in case she runs out of cash paying off her debt'
    },
    explanation: 'Opening a new credit card adds a Hard Inquiry, increases available debt, and doesn\'t solve the underlying problem — it can make things worse.'
  },
  {
    id: 'q03', answer: 'A',
    question: 'All of the following would show up on a credit report EXCEPT...',
    choices: {
      A: 'Salary of your current job',
      B: 'Payment history of your car loan',
      C: 'Credit card payment history',
      D: 'Student loan activity'
    },
    explanation: 'Your Credit Report tracks credit accounts, payment history, inquiries, and public records — not your income or employment salary.'
  },
  {
    id: 'q04', answer: 'D',
    question: 'Which of the following methods of getting your credit score would involve paying a fee?',
    choices: {
      A: 'Checking your credit card or loan statement',
      B: 'Talking to a non-profit counselor',
      C: 'Checking creditkarma.com',
      D: 'Getting a score from myFICO.com'
    },
    explanation: 'myFICO.com charges for your official FICO Score. Many other services offer free scores — but free Credit Score checks are Soft Inquiries and don\'t hurt your score.'
  },
  {
    id: 'q05', answer: 'B',
    question: 'Your friend confides in you that he has a low credit score. What is the single best way for him to improve his score?',
    choices: {
      A: 'Cancel his credit cards',
      B: 'Make on-time payments',
      C: 'Get a car loan',
      D: 'Check his credit score'
    },
    explanation: 'Payment History is 35% of a FICO Score — the single biggest factor. Consistent, on-time payments are the most powerful thing anyone can do to improve their score.'
  },
  {
    id: 'q06', answer: 'B',
    question: 'Melvin is 19 years old and wants to begin establishing a credit history. Which action should he take to meet that goal?',
    choices: {
      A: 'Always say "credit" when asked "credit or debit?" at a store',
      B: 'Ask his parents to cosign a credit card or add him as an authorized user on their credit card',
      C: 'Any time he borrows money from a friend or family member, be sure to pay it back promptly',
      D: 'Take out some private student loans, even though he doesn\'t need them because he has grants and scholarships'
    },
    explanation: 'Becoming an Authorized User on a parent\'s card is one of the safest ways to start building Credit History — you benefit from their good record without taking on full liability.'
  },
  {
    id: 'q07', answer: 'D',
    question: 'Which of the following individuals or groups would be the LEAST likely to look at your credit score?',
    choices: {
      A: 'Someone interviewing you for a job',
      B: 'Credit card companies',
      C: 'An insurance company reviewing your application for auto insurance',
      D: 'A bank representative who is helping you open a savings account'
    },
    explanation: 'Opening a basic savings account doesn\'t require a credit check. Lenders, landlords, insurers, and some employers can — and do — check your credit.'
  },
  {
    id: 'q08', answer: 'A',
    question: 'You have a credit card that you use regularly for small purchases with the goal of improving your credit score. Which strategy would have the GREATEST positive impact?',
    choices: {
      A: 'Use less than 30% of the credit limit and pay it off in full every month by the due date',
      B: 'Always carry a balance from month to month',
      C: 'Regardless of how much your balance is, make the minimum payment required on your credit card every month by the due date',
      D: 'Put the credit card in a drawer instead and don\'t ever use it'
    },
    explanation: 'Paying in full each month gives you perfect Payment History AND keeps Credit Utilization Rate low — hitting both of the top two FICO factors at once.'
  },
  {
    id: 'q09', answer: 'C',
    question: 'What strategy should you use to pay off multiple sources of debt if you want to pay the lowest amount of interest over time?',
    choices: {
      A: 'Snowball method',
      B: 'Make minimum payments',
      C: 'High rate method',
      D: 'Consolidate multiple debts into one new loan'
    },
    explanation: 'The Debt Avalanche (high rate method) targets the highest interest rate first, minimizing total interest paid over time — even if it feels slower than the Snowball.'
  },
  {
    id: 'q10', answer: 'A',
    question: 'Who tracks all of your credit information?',
    choices: {
      A: 'Credit reporting agencies (Equifax, Experian and TransUnion)',
      B: 'Federal government',
      C: 'Consumer Financial Protection Board (CFPB)',
      D: 'Lenders'
    },
    explanation: 'The three major Credit Bureaus — Equifax, Experian, and TransUnion — each maintain their own Credit Report on you. Your score can vary slightly between them.'
  },
  {
    id: 'q11', answer: 'B',
    question: 'What is the general timeline to establish your first credit score?',
    choices: {
      A: 'As soon as you apply for a credit card or loan',
      B: 'Six months after you first actively use your credit',
      C: 'Once you pay all of your credit balances in full',
      D: 'Once you turn 18'
    },
    explanation: 'FICO requires at least one account open for 6 months before it can generate a score. Until then, you have a Thin File — no score at all.'
  },
  {
    id: 'q12', answer: 'A',
    question: 'You find an error on your credit report: Your credit card account indicates that you are 60 days late on your payment but you have bank records indicating that you have always made on-time payments. What should you do FIRST?',
    choices: {
      A: 'Contact the credit card company to have them fix it',
      B: 'Contact the credit reporting agency',
      C: 'Wait a few weeks to see if it gets resolved',
      D: 'Call the police to report the possible identity theft'
    },
    explanation: 'Start with the creditor who reported the error — they can issue a correction directly to the Credit Bureau. You have the legal right to an accurate Credit Report.'
  },
  {
    id: 'q13', answer: 'C',
    question: 'Which of the following things should you have ready when contacting a credit reporting agency to report an error on your credit report?',
    choices: {
      A: 'Your preferred payment method to pay for fixing the error',
      B: 'A list of all of your financial accounts and balances',
      C: 'An explanation of the mistake and any evidence you have supporting your claim',
      D: 'References from a non-family member vouching for your creditworthiness'
    },
    explanation: 'Disputing a Credit Report error is free. Bring documentation — bank statements, receipts, anything that proves the error. The Credit Bureau must investigate within 30 days.'
  },
  {
    id: 'q14', answer: 'D',
    question: 'Which of the following could have a NEGATIVE impact on your credit score if done in a short period of time?',
    choices: {
      A: 'Paying your bills on-time',
      B: 'Paying down balances on your credit card accounts',
      C: 'Decreasing your utilization of credit',
      D: 'Applying for multiple credit cards'
    },
    explanation: 'Each credit card application triggers a Hard Inquiry. Multiple Hard Inquiries in a short window signals financial stress to lenders and lowers your score.'
  },
  {
    id: 'q15', answer: 'D',
    question: 'Which best describes the Debt Snowball method for paying off debt?',
    choices: {
      A: 'Only make payments on your smallest debt first, then move on to your second smallest debt, and so on',
      B: 'Once your debt "snowballs" out of control, hire a certified credit counselor to help get your finances back on track',
      C: 'Make the monthly minimum payments on all your debts, and then put any extra cash toward the debt with the highest balance',
      D: 'Make the monthly minimum payments on all your debts, and then put any extra cash toward the debt with the lowest balance'
    },
    explanation: 'The Debt Snowball targets the smallest balance first for psychological wins. It\'s not the cheapest method (that\'s the Debt Avalanche), but it builds momentum.'
  },
  {
    id: 'q16', answer: 'A',
    question: 'Which of these represents a potential consequence of neglecting to pay your federal student loans?',
    choices: {
      A: 'Wages or tax refunds can be garnished',
      B: 'Passport revocation',
      C: 'Driver\'s license suspension',
      D: 'Termination from your job'
    },
    explanation: 'Federal student loan Default is serious — the government can garnish wages and seize tax refunds without a court order. It also devastates your Credit Score.'
  },
  {
    id: 'q17', answer: 'C',
    question: 'What benefits do you receive by taking out a loan with a cosigner?',
    choices: {
      A: 'You don\'t get penalized for late payments',
      B: 'You get a discount on future loans after this one is paid off',
      C: 'You have a better chance of getting approved and getting a lower interest rate if the cosigner has good credit',
      D: 'You automatically get the same credit score as the cosigner once the loan is paid off'
    },
    explanation: 'A cosigner with strong credit makes lenders more comfortable — you\'re more likely to get approved and may get a lower Interest Rate. But they\'re fully liable if you don\'t pay.'
  },
  {
    id: 'q18', answer: 'B',
    question: 'You\'re paying your credit card bill and your student loan payment each month, but you\'re falling behind on your auto loan payment. Which friend\'s advice could have a NEGATIVE impact on your credit score?',
    choices: {
      A: 'Joanie says, "Call the auto lender and see if you can negotiate a lower monthly payment or some other deal."',
      B: 'Debbie says, "Stop making the credit card payment for a few months until you\'re caught up on the auto loan."',
      C: 'Angie says, "Pick up a second job for as long as it takes to accumulate enough money to make all your payments, even if it means losing time with friends and family."',
      D: 'Betty says, "Cut down to a bare bones budget, where your necessities and your debt repayments take first priority. Cut everything non-essential."'
    },
    explanation: 'Stopping your credit card payment to cover another debt just moves the damage — late payments hurt Payment History regardless of which account misses the deadline.'
  },
  {
    id: 'q19', answer: 'D',
    question: 'Which response best completes the sentence "It\'s best to begin establishing credit when you\'re young because ________"?',
    choices: {
      A: 'Accessing credit only becomes more expensive as you get older',
      B: 'Negative marks on your credit report go away faster for younger borrowers',
      C: 'Credit scores are free for anyone under the age of 25',
      D: 'You will likely need a credit history to rent your first apartment, finance your first car, or open an unsecured credit card'
    },
    explanation: 'Length of Credit History is 15% of your FICO Score — the earlier you start building it responsibly, the more it works in your favor when life\'s big decisions arrive.'
  },
  {
    id: 'q20', answer: 'A',
    question: 'Which free credit report service is authorized by federal law but only accessible once per year?',
    choices: {
      A: 'AnnualCreditReport.com',
      B: 'Credit Karma',
      C: 'Credit Wise',
      D: 'Wallet Hub'
    },
    explanation: 'AnnualCreditReport.com is the only federally mandated free Credit Report service — one free report per Credit Bureau per year. It shows your report, not your score.'
  },
  {
    id: 'q21', answer: 'C',
    question: 'How can your credit score impact your financial well-being?',
    choices: {
      A: 'Only consumers with high scores are approved for credit',
      B: 'Consumers with low scores get lower interest rates on loans than those with high scores',
      C: 'Your credit score can determine whether you are approved for a loan and what the interest rate on that loan will be',
      D: 'It generally has no impact on your financial situation'
    },
    explanation: 'Your Credit Score affects loan approvals, interest rates, apartment applications, insurance premiums, and even some jobs. It touches almost every major financial decision you\'ll make.'
  }
];

/* ── Deep-Dive Explanations (shown via "Explain More" on quiz result) ─────────── */
/* Keyed by question ID. Explains the underlying FICO principle being tested.    */
const QUIZ_DEEP_DIVES = {
  q01: '<strong>The FICO 5-Factor Breakdown:</strong> Payment History (35%) + Amounts Owed (30%) = 65% of your score combined. These two factors dominate because they directly reflect whether you borrow responsibly right now — not in the past, not in theory. The remaining three factors — Length of History (15%), Credit Mix (10%), and New Credit (10%) — matter, but nothing moves a score faster than Payment History and utilization.',

  q02: '<strong>Hard Inquiries and Debt Psychology:</strong> Opening a new credit card when you\'re trying to pay down debt creates two problems: it triggers a Hard Inquiry (New Credit, 10%) and it increases your available temptation. The psychological trap is real — having more available credit makes it easier to keep spending instead of paying down. Reducing spending and increasing income attacks the root cause.',

  q03: '<strong>What\'s Actually on Your Credit Report:</strong> Your Credit Report tracks credit accounts (cards, loans, mortgages), payment history, balances, credit limits, hard inquiries, collections, and public records (bankruptcies, liens). It does NOT track your income, bank account balances, investments, net worth, or employment history — though employers and lenders may ask for those separately.',

  q04: '<strong>Soft vs. Hard Inquiries:</strong> A Soft Inquiry happens when you check your own score, when employers run background checks, or when companies pre-screen you for offers. It has zero effect on your score. A Hard Inquiry only happens when you actively apply for new credit — that triggers a small score dip. Checking your own score is always a Soft Inquiry, so check freely.',

  q05: '<strong>Why Payment History Dominates (35%):</strong> FICO is asking: "Will this person pay us back?" Payment History answers that question directly with evidence. Every on-time payment builds a track record of reliability. There\'s no shortcut — consistent payments over time are the only path to a strong score, which is exactly why starting early matters so much.',

  q06: '<strong>Authorized User Strategy:</strong> Being added as an Authorized User is legitimate and commonly recommended for teens and young adults. You inherit the account\'s history without being legally responsible for the debt. The key: make sure the primary cardholder has a good payment record and low utilization — otherwise you inherit their bad habits too.',

  q07: '<strong>Who Uses Your Credit Score:</strong> Lenders (obviously), landlords, insurance companies (for rates in many states), and employers in finance or government roles all commonly pull credit. Opening a basic savings account doesn\'t require a credit check because no credit is being extended — the bank is just holding your money. Knowing when a Hard Inquiry is coming helps you plan.',

  q08: '<strong>The Two-Factor Combo Play:</strong> Paying in full by the due date simultaneously maximizes both top FICO factors: Payment History (35%) gets a positive mark, and Amounts Owed (30%) benefits because your utilization drops to ~0% before the next reporting cycle. This single habit — pay in full, on time, every month — is the foundation of an exceptional credit score.',

  q09: '<strong>Debt Avalanche vs. Snowball:</strong> The Debt Avalanche (high-rate-first) minimizes total interest paid — it\'s the mathematically optimal strategy. The Debt Snowball (smallest-balance-first) isn\'t as efficient financially but builds psychological momentum through quick wins. Both are legitimate strategies; the best one is whichever you\'ll actually stick to.',

  q10: '<strong>The Three Credit Bureaus:</strong> Equifax, Experian, and TransUnion each independently collect and maintain credit data. Your score can vary between them because not all lenders report to all three, and they may receive updates on different schedules. Your legal right: one free report from each bureau per year at AnnualCreditReport.com.',

  q11: '<strong>The 6-Month Rule:</strong> FICO needs at least one account open for 6 months AND at least one account reported to a bureau within the last 6 months to generate a score. Before those 6 months, you\'re "unscorable" — lenders may deny you not for bad credit, but for no credit. This is the core reason to open an account early and use it consistently.',

  q12: '<strong>Disputing a Credit Report Error:</strong> The Fair Credit Reporting Act (FCRA) gives you the right to dispute inaccurate information. Start with the creditor who reported the error — they can send a correction directly to the bureau. If that doesn\'t work, dispute with the bureau directly. They must investigate within 30 days. Document everything.',

  q13: '<strong>Dispute Evidence Matters:</strong> Credit bureaus receive thousands of disputes. Evidence that proves your case — bank statements, receipts, payment confirmations — dramatically increases your chance of a successful dispute. Errors are more common than people realize: identity mix-ups, data entry mistakes, and old debts that should have fallen off are all real scenarios.',

  q14: '<strong>The Hard Inquiry Cascade:</strong> When you apply for multiple credit cards quickly, lenders see a pattern: someone who suddenly needs a lot of new credit may be in financial distress. Each Hard Inquiry stays on your report for 2 years (affects your score for about 12 months). Exception: rate shopping for a mortgage, auto loan, or student loan within a 14–45 day window is treated as a single inquiry by most scoring models.',

  q15: '<strong>Snowball vs. Avalanche — The Full Picture:</strong> Snowball (smallest balance first) gives fast wins that keep you motivated. Avalanche (highest rate first) saves the most money over time. Research suggests people who use the Snowball method are more likely to actually pay off their debt — behavioral economics matters. Pick the method you\'ll commit to.',

  q16: '<strong>Federal Student Loan Default Consequences:</strong> Unlike most debt, the federal government can collect federal student loan debt without suing you first. Wage garnishment, tax refund seizure, and Social Security offset are all available enforcement tools. Default also triggers immediate reporting to credit bureaus with the full balance showing as past due. Income-driven repayment plans exist specifically to prevent default.',

  q17: '<strong>The Cosigner Arrangement:</strong> A cosigner doesn\'t just vouch for you — they\'re equally legally responsible for the debt. If you miss payments, it damages their credit too. For the borrower, the cosigner\'s stronger credit history can unlock approval and better rates. For the cosigner, it\'s a risk. This is why cosigning is often described as "guaranteeing the debt with your own credit score."',

  q18: '<strong>Payment Priority — All Debt Counts:</strong> It doesn\'t matter which account you skip — any missed payment damages your Payment History (35%). The instinct to prioritize the biggest debt is understandable, but credit bureaus just see a missed payment, not your reasoning. When cash is tight, negotiate with lenders for lower payments or hardship programs rather than simply stopping payment.',

  q19: '<strong>Length of Credit History (15%):</strong> This factor rewards the age of your oldest account and your average account age. You can\'t rush it — it grows automatically as long as you keep accounts open. The practical implication: don\'t close old credit cards, even if you rarely use them. A 10-year-old card with a $0 balance is quietly helping your score every month.',

  q20: '<strong>Your Legal Right to Free Credit Reports:</strong> The Fair and Accurate Credit Transactions Act (FACTA) mandates one free credit report per bureau per year. AnnualCreditReport.com is the only federally authorized source. Note: this gives you your REPORT (the full data), not your SCORE. Scores are calculated from the report but are sold separately (or given free by many banks and apps).',

  q21: '<strong>The Real-World Breadth of Credit Scores:</strong> Your credit score isn\'t just for loans. It affects apartment applications, car insurance premiums (in most states), utility deposits, cell phone contracts, and some job applications. A low score doesn\'t just cost you higher interest — it can mean paying more for everything from rent to insurance for years.',
};

/* Merge deepDive fields into quizBank at load time */
quizBank.forEach(q => {
  if (QUIZ_DEEP_DIVES[q.id]) q.deepDive = QUIZ_DEEP_DIVES[q.id];
});

/* ── Fisher-Yates Shuffle ─────────────────────────────────────────────────────── */
function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Initialize shuffled draw order at game start.
   Returns an array of 21 shuffled indices into quizBank. */
function initQuizDrawOrder() {
  return fisherYates([...Array(quizBank.length).keys()]);
}

/* Get 3 questions for a bridge (bridge 1 = indices 0-2, bridge 2 = 3-5) */
function getQuizBatch(drawOrder, bridgeNumber) {
  const start = (bridgeNumber - 1) * 3;
  return drawOrder.slice(start, start + 3).map(idx => quizBank[idx]);
}
