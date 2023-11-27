const { Key } = require("@nut-tree/nut-js");

const TIME_TO_CLIP_BEFORE_KILL = 15;
const TIME_TO_CLIP_AFTER_KILL = 5;
const MAX_MATCHES_PER_REQUEST = 20;
const BLUE_SIDE_TEAM_ID = '100'
const RED_SIDE_TEAM_ID = '200';
const MULTI_KILL_TIMER = 10000;  // (10 seconds) Allowed time in milliseconds before multi-kill timer resets (1-4 kills).
const PENTA_KILL_TIMER = 30000;  // (30 seconds) Multi-kill timer is slower to reset when going from kill 4 to 5.

const BLUE_SIDE_CAMERA_CONTROLS_BY_ROLE = {
    'TOP': Key.Num1,
    'JUNGLE': Key.Num2,
    'MIDDLE': Key.Num3,
    'BOTTOM': Key.Num4,
    'SUPPORT': Key.Num5
};

const RED_SIDE_CAMERA_CONTROLS_BY_ROLE = {
    'TOP': Key.Q,
    'JUNGLE': Key.W,
    'MIDDLE': Key.E,
    'BOTTOM': Key.R,
    'SUPPORT': Key.T,
};

const MultiKillsPlural = {
    1: 'firstBloodKill',
    2: 'doubleKills',
    3: 'tripleKills',
    4: 'quadraKills',
    5: 'pentaKills'
};

const MultiKillsSingular = {
    1: 'FirstBlood',
    2: 'DoubleKill',
    3: 'TripleKill',
    4: 'QuadraKill',
    5: 'PentaKill'
};

const RolesEnum = {
    'TOP': 0,
    'JUNGLE': 1,
    'MIDDLE': 2,
    'BOTTOM': 3,
    'SUPPORT': 4
}


module.exports = {
    MAX_MATCHES_PER_REQUEST,
    BLUE_SIDE_TEAM_ID,
    RED_SIDE_TEAM_ID,
    BLUE_SIDE_CAMERA_CONTROLS_BY_ROLE,
    RED_SIDE_CAMERA_CONTROLS_BY_ROLE,
    TIME_TO_CLIP_BEFORE_KILL,
    TIME_TO_CLIP_AFTER_KILL,
    PENTA_KILL_TIMER,
    MULTI_KILL_TIMER,
    RolesEnum,
    MultiKillsPlural,
    MultiKillsSingular
}