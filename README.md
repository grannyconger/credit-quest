# Credit Quest

A choose-your-path game that teaches how FICO credit scores work. Players pick a character and make
financial decisions from high school through young adulthood. Each choice moves a simulated score
built on the five FICO factors, and Knowledge Check quizzes between stages earn bonus points.

## Run it

It's a static site with no build step. Serve the folder over HTTP (opening `index.html` directly
won't work, because ES modules and `fetch` need a server):

```sh
npm start          # python3 -m http.server 8000 → http://localhost:8000
```

To publish it, enable **GitHub Pages** for the repo (Settings → Pages → deploy from `main`, root).

## Test

```sh
npm test           # node --test (Node 20+), no dependencies
```

The tests cover the scoring engine, validate all content (unknown effect keys, missing character
lines, tooltip terms missing from the dictionary, bad `requires` names) and simulate hundreds of
random playthroughs. Run them after any content change.

## Project layout

```
index.html
styles/            main.css · themes.css (per-character colors) · components.css · screens.css
data/              pf_dictionary.json (tooltip definitions)
images/  sounds/
scripts/
  main.js          boot: one-time listeners, first screen
  game.js          start / reset flow
  state.js         the gameState object (createGameState / resetGameState)
  config.js        tuning: stages, scenarios per stage, quiz points
  events.js        event bus: game:start, stage:begin, choice, quiz:answer, game:end
  data/            content: scenarios, quiz, characters, explanations
  engine/          pure logic, no DOM: scoring, scenario/quiz drawing, run summary
  ui/              shared UI: header (hud), modal, audio, bubbles, tooltips, effects
  screens/         charSelect · intro · stage (scenarios) · quiz · report
tests/
```

## Common changes

**Add a scenario.** Append an object to the right pool in `scripts/data/scenarios.js`. Each
choice's `effects` can use:

| key | fields |
|---|---|
| `hasAnyCredit` | `true` once the player has a reported account |
| `paymentHistory` | `delta`, `onTimePayments`, `latePayments30`, `latePayments60`, `defaults`, `collections`, `removeCollection` |
| `amountsOwed` | revolving (card) credit: `limitDelta`, `balanceDelta`, `balanceClear`, `limitClose` |
| `installment` | loans: `balanceDelta` (doesn't count toward utilization) |
| `lengthHistory` | `delta` |
| `creditMix` | `hasRevolvingCredit`, `hasInstallmentLoan`, `hasMortgage` |
| `newCredit` | `hardInquiries` |
| `flags` | any game flags to set |

Optional scenario fields:

- `requires: ['revolvingCredit']` shows a scenario only when its precondition holds. Preconditions
  live in `REQUIREMENTS` in `scripts/engine/draw.js`.
- `alwaysFirst: true` makes a scenario open its stage.
- `bubble: '<event>'` on a choice makes the character react (see `bubbleTriggers` in
  `scripts/ui/bubbles.js`).

Scenarios are drawn one at a time, so choices made earlier in a stage decide what can come next.

**Add a quiz question.** Append to `quizBank` in `scripts/data/quiz.js`. You can add a deep-dive
explanation in `QUIZ_DEEP_DIVES`.

**Change pacing or points.** Edit `scripts/config.js`.

**React to gameplay** (scoreboards, achievements). Subscribe in a new module, without editing the
screens:

```js
import { on } from './events.js';
on('game:end', ({ summary }) => { /* summary = buildRunSummary(gameState) */ });
```

## Credits

Characters and stage art reference Nintendo's Super Mario franchise and are used for
non-commercial educational purposes. They aren't affiliated with or endorsed by Nintendo.
