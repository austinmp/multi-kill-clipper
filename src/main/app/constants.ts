const TIME_TO_CLIP_BEFORE_KILL = 15;
const TIME_TO_CLIP_AFTER_KILL = 15;
const MAX_MATCHES_PER_REQUEST = 20;
const MAX_REQUESTS_PER_SECOND = 20;
const MULTI_KILL_TIMER = 10000; // (10 seconds) Allowed time in milliseconds before multi-kill timer resets (1-4 kills).
const PENTA_KILL_TIMER = 30000; // (30 seconds) Multi-kill timer is slower to reset when going from kill 4 to 5.

const MultiKillsPlural: any = {
  1: 'firstBloodKill',
  2: 'doubleKills',
  3: 'tripleKills',
  4: 'quadraKills',
  5: 'pentaKills',
};

const MultiKillsSingular: any = {
  1: 'FirstBlood',
  2: 'DoubleKill',
  3: 'TripleKill',
  4: 'QuadraKill',
  5: 'PentaKill',
};

const RolesEnum: any = {
  TOP: 0,
  JUNGLE: 1,
  MIDDLE: 2,
  BOTTOM: 3,
  SUPPORT: 4,
};

export {
  MAX_MATCHES_PER_REQUEST,
  MAX_REQUESTS_PER_SECOND,
  TIME_TO_CLIP_BEFORE_KILL,
  TIME_TO_CLIP_AFTER_KILL,
  PENTA_KILL_TIMER,
  MULTI_KILL_TIMER,
  RolesEnum,
  MultiKillsPlural,
  MultiKillsSingular,
};
