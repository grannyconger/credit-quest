/* ── Credit Quest: Game Tuning ──────────────────────────────────────────────── */
/* Central place for numbers that shape a playthrough.                           */

export const STAGE_COUNT          = 3;
export const SCENARIOS_PER_STAGE  = 4;
export const QUIZ_PER_BRIDGE      = 3;   // Knowledge Check questions between stages
export const QUIZ_POINTS          = 5;   // bonus points per correct answer
export const QUIZ_BRIDGES         = STAGE_COUNT - 1;
export const MAX_QUIZ_BONUS       = QUIZ_PER_BRIDGE * QUIZ_BRIDGES * QUIZ_POINTS;

export const STAGES = {
  1: { title: 'High School', age: 'Age 18',    tagline: 'First decisions. Lasting consequences.' },
  2: { title: 'College',     age: 'Ages 18–22', tagline: 'The years that make or break your score.' },
  3: { title: 'Young Adult', age: 'Ages 22–25', tagline: 'Reality doesn\'t care about excuses.' },
};
