/* ── Credit Quest: Game State ───────────────────────────────────────────────── */

import { makeCreditState } from './engine/scoring.js';

export function createGameState() {
  return {
    playerName: '',
    character:  '',        // 'mario' | 'luigi' | 'peach' | 'toad'

    currentStage:  0,      // 0=intro, 1–3, 4=report
    stageShownIds: [],     // scenario ids already shown this stage
    currentScenario: null,
    decisionsLog:  [],     // { scenarioId, scenarioTitle, stage, choiceIndex, choiceLabel, oldScore, newScore, scoreEffect }

    credit: makeCreditState(),

    quizDrawOrder: [],
    quizCorrect:   0,

    flags: {
      usedAuthorizedUser:    false,
      hadCollections:        false,
      hadLatePayment:        false,
      tookStudentLoans:      false,
      closedOldestAccount:   false,
      hadThinFile:           false,
      perfectPaymentHistory: true,
      stage3ApartmentResult: null,
      stage3CarAPR:          null,
      stage3JobResult:       null,
      foundEasterEgg:        false,
    },

    termsEncountered: new Set(),
  };
}

/* Single shared instance — reset in place so references stay valid */
export const gameState = createGameState();

export function resetGameState() {
  Object.assign(gameState, createGameState());
}
