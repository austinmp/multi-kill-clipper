import {
  MULTI_KILL_TIMER,
  PENTA_KILL_TIMER,
  MultiKillsPlural,
  MultiKillsSingular,
} from '../constants';
import { getChampionByKey } from '../apis/ddragon';
import MultiKill from './multi-kill';
import { formatDate } from '../utils/utils';

class MultiKillMatch {
  matchId: any;

  matchDate: any;

  summonerName: any;

  summonerId: any;

  accountId: any;

  championId: any;

  firstBloodKill: any;

  doubleKills: any;

  tripleKills: any;

  quadraKills: any;

  pentaKills: any;

  largestMultiKill: any;

  userSelectedKillTypes: any;

  championName: any;

  participantId: any;

  multiKills: any;

  role: string;

  teamId: string;

  constructor(match: any, multiKillTypes: any) {
    this.matchId = match.gameId;
    this.matchDate = formatDate(match.gameCreationDate);
    this.summonerName = match.participantIdentities[0].player.summonerName;
    this.summonerId = match.participantIdentities[0].player.summonerId;
    this.accountId = match.participantIdentities[0].player.accountId;
    this.championId = match.participants[0].championId;
    this.firstBloodKill = match.participants[0].stats.firstBloodKill;
    this.doubleKills = match.participants[0].stats.doubleKills;
    this.tripleKills = match.participants[0].stats.tripleKills;
    this.quadraKills = match.participants[0].stats.quadraKills;
    this.pentaKills = match.participants[0].stats.pentaKills;
    this.largestMultiKill = match.participants[0].stats.largestMultiKill;
    this.userSelectedKillTypes = multiKillTypes;
    this.championName = null;
    this.role = '';
    this.teamId = '';
  }

  static filterMatchesByMultiKillsAndPatch(
    matchHistory: any,
    multiKillTypes: any,
  ) {
    const multiKillMatches: any = [];
    matchHistory.forEach((match: any) => {
      if (this.isMultiKillMatch(match, multiKillTypes)) {
        multiKillMatches.push(match);
      }
    });
    return multiKillMatches;
  }

  static isMultiKillMatch(match: any, multiKillTypes: any) {
    const participantStats = match.participants[0].stats;
    for (const multiKill of multiKillTypes) {
      const multiKillType = MultiKillsPlural[multiKill];
      if (participantStats[multiKillType] > 0) return true;
    }
    return false;
  }

  getParticipantIdFromEndOfMatchData(summonerName: any, matchData: any) {
    const participants = matchData.participantIdentities;
    for (let i = 0; i < participants.length; i++) {
      const currSummoner = participants[i].player.summonerName;
      if (currSummoner == summonerName) return participants[i].participantId;
    }
  }

  setParticipantRole(matchData: any, participantId: any) {
    const participantData = matchData.participants[participantId - 1];
    const { lane } = participantData.timeline;
    const { role } = participantData.timeline;
    this.role = role === 'DUO_SUPPORT' ? 'SUPPORT' : lane;
  }

  async setChampionName() {
    // fetch champion name from ddragon
    const championData = await getChampionByKey(this.championId);
    this.championName = championData?.name;
  }

  setParticipantTeamId(matchData: any, participantId: any) {
    const participantData = matchData.participants[participantId - 1];
    const { teamId } = participantData;
    this.teamId = teamId;
  }

  getParticipantKillsFromMatchTimeline(matchTimeline: any, participantId: any) {
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

  getMultiKillsFromAllMatchKills(kills: any) {
    let killType = 1;
    let startTime = kills[0].timestamp;
    let endTime;
    const multiKills = [];

    if (
      this.firstBloodKill &&
      this.userSelectedKillTypes.includes(`${killType}`)
    ) {
      multiKills.push(
        new MultiKill(MultiKillsSingular[killType], startTime, startTime),
      );
    }

    for (let i = 0; i < kills.length; i++) {
      const currKillTime = kills[i].timestamp;
      const nextKillTime =
        i + 1 < kills.length ? kills[i + 1].timestamp : Number.MAX_VALUE;
      if (
        nextKillTime <= currKillTime + MULTI_KILL_TIMER ||
        (killType === 4 && nextKillTime <= currKillTime + PENTA_KILL_TIMER)
      ) {
        killType++;
        endTime = nextKillTime;
      } else {
        // Never add non-multi kills (single kills)
        if (
          killType >= 2 &&
          this.userSelectedKillTypes.includes(`${killType}`)
        ) {
          multiKills.push(
            new MultiKill(MultiKillsSingular[killType], startTime, endTime),
          );
        }
        startTime = nextKillTime;
        killType = 1;
      }
    }
    return multiKills;
  }
}

export default MultiKillMatch;
