const TIME_TO_CLIP_BEFORE_KILL = 15;
const TIME_TO_CLIP_AFTER_KILL = 15;
const MAX_MATCHES_PER_REQUEST = 20;
const MAX_REQUESTS_PER_SECOND = 20;
const MULTI_KILL_TIMER = 10000; // (10 seconds) Allowed time in milliseconds before multi-kill timer resets (1-4 kills).
const PENTA_KILL_TIMER = 30000; // (30 seconds) Multi-kill timer is slower to reset when going from kill 4 to 5.

const RANKED_FLEX_QUEUE_ID = 440;
const RANKED_SOLO_QUEUE_ID = 420;

// Used internally in riot matches API
const MULTI_KILL_PLURAL: any = {
  1: 'firstBloodKill',
  2: 'doubleKills',
  3: 'tripleKills',
  4: 'quadraKills',
  5: 'pentaKills',
};

const MULTI_KILL_SINGULAR: any = {
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

type MultiKillTypes = {
  singular: string;
  plural: string;
};

const MULTI_KILLS: Record<number, MultiKillTypes> = {
  1: { singular: 'FirstBlood', plural: 'firstBloodKill' },
  2: { singular: 'DoubleKill', plural: 'doubleKills' },
  3: { singular: 'TripleKill', plural: 'tripleKills' },
  4: { singular: 'QuadraKill', plural: 'quadraKills' },
  5: { singular: 'PentaKill', plural: 'pentaKills' },
};

export {
  MAX_MATCHES_PER_REQUEST,
  MAX_REQUESTS_PER_SECOND,
  TIME_TO_CLIP_BEFORE_KILL,
  TIME_TO_CLIP_AFTER_KILL,
  PENTA_KILL_TIMER,
  MULTI_KILL_TIMER,
  RolesEnum,
  MULTI_KILL_SINGULAR,
  MULTI_KILL_PLURAL,
  MULTI_KILLS,
  MultiKillTypes,
  RANKED_FLEX_QUEUE_ID,
  RANKED_SOLO_QUEUE_ID,
};
