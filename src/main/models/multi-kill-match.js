import {
  millisToSeconds, formatDate,
} from '@main/utils/utils';

import {
  ChampIdToName,
  MultiKillsSingular,
  MultiKillsPlural,
  MULTIKILL_TIMER,
  PENTAKILL_TIMER,
} from '@main/constants';

export class MultiKill {
  constructor(type, start, end) {
    this.type = type;
    this.start = millisToSeconds(start);
    this.end = millisToSeconds(end);
  }
}

export class MultiKillMatch {
  constructor(match, multiKillTypes) {
    this.matchId = match.gameId,
    this.matchDate = formatDate(match.gameCreationDate);
    this.summonerName = match.participantIdentities[0].player.summonerName;
    this.summonerId = match.participantIdentities[0].player.summonerId;
    this.accountId = match.participantIdentities[0].player.accountId;
    this.championId = match.participants[0].championId;
    this.championName = ChampIdToName[this.championId];
    this.firstBloodKill = match.participants[0].stats.firstBloodKill;
    this.doubleKills = match.participants[0].stats.doubleKills;
    this.tripleKills = match.participants[0].stats.tripleKills;
    this.quadraKills = match.participants[0].stats.quadraKills;
    this.pentaKills = match.participants[0].stats.pentaKills;
    this.largestMultiKill = match.participants[0].stats.largestMultiKill;
    this.userSelectedKillTypes = multiKillTypes;
  }

  static filterMatchesByMultiKillsAndPatch(matchHistory, multiKillTypes) {
    const multiKillMatches = [];
    matchHistory.forEach((match) => {
      if (this.isMultiKillMatch(match, multiKillTypes)) {
        multiKillMatches.push(match);
      }
    });
    return multiKillMatches;
  }

  static isMultiKillMatch(match, multiKillTypes) {
    const participantStats = match.participants[0].stats;
    for (const multiKill of multiKillTypes) {
      const multiKillType = MultiKillsPlural[multiKill];
      if (participantStats[multiKillType] > 0) return true;
    }
    return false;
  }

  getParticipantIdFromEndOfMatchData(summonerName, matchData) {
    const participants = matchData.participantIdentities;
    for (let i = 0; i < participants.length; i++) {
      const currSummoner = participants[i].player.summonerName;
      if (currSummoner == summonerName) return participants[i].participantId;
    }
  }

  setParticipantRole(matchData, participantId) {
    const participantData = matchData.participants[participantId - 1];
    const { lane } = participantData.timeline;
    const { role } = participantData.timeline;
    this.role = (role == 'DUO_SUPPORT') ? 'SUPPORT' : lane;
  }

  setParticipantTeamId(matchData, participantId) {
    const participantData = matchData.participants[participantId - 1];
    const { teamId } = participantData;
    this.teamId = teamId;
  }

  getParticipantKillsFromMatchTimeline(matchTimeline, participantId) {
    const kills = [];
    for (const frame of matchTimeline) {
      for (const event of frame.events) {
        if (event.type == 'CHAMPION_KILL' && event.killerId == participantId) {
          kills.push(event);
        }
      }
    }
    return kills;
  }

  getMultiKillsFromAllMatchKills(kills) {
    let killType = 1;
    let startTime = kills[0].timestamp;
    let endTime;
    const multiKills = [];

    if (this.firstBloodKill && this.userSelectedKillTypes.includes(`${killType}`)) {
      multiKills.push(new MultiKill(MultiKillsSingular[killType], startTime, startTime));
    }

    for (let i = 0; i < kills.length; i++) {
      const currKillTime = kills[i].timestamp;
      const nextKillTime = (i + 1 < kills.length) ? kills[i + 1].timestamp : Number.MAX_VALUE;
      if ((nextKillTime <= currKillTime + MULTIKILL_TIMER) || (killType === 4 && nextKillTime <= currKillTime + PENTAKILL_TIMER)) {
        killType++;
        endTime = nextKillTime;
      } else {
        // Never add non-multi kills (single kills)
        if (killType >= 2 && this.userSelectedKillTypes.includes(`${killType}`)) {
          multiKills.push(new MultiKill(MultiKillsSingular[killType], startTime, endTime));
        }
        startTime = nextKillTime;
        killType = 1;
      }
    }
    return multiKills;
  }
}
