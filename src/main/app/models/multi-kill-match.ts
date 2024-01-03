import { MULTI_KILL_TIMER, PENTA_KILL_TIMER, MULTI_KILLS } from '../constants';
import { getChampionByKey } from '../apis/ddragon';
import MultiKill from './multi-kill';
import { formatDate } from '../utils/utils';
import LeagueClient from '../apis/league-client';
import getQueueType from './queue-type';

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

  multiKillTypes: number[];

  championName: any;

  participantId: number;

  teamId: string;

  gameCreationDate: Date;

  gameDuration: number;

  queueId: number;

  queueType: string;

  kills: number;

  deaths: number;

  assists: number;

  win: boolean;

  role: string;

  multiKills: MultiKill[];

  constructor(match: any, multiKillTypes: number[]) {
    const participant = match.participants[0];
    const participantIdentity = match.participantIdentities[0];
    this.kills = participant.stats.kills;
    this.deaths = participant.stats.deaths;
    this.assists = participant.stats.assists;
    this.win = participant.stats.win;
    this.participantId = participant.timeline.participantId;
    this.firstBloodKill = participant.stats.firstBloodKill;
    this.doubleKills = participant.stats.doubleKills;
    this.tripleKills = participant.stats.tripleKills;
    this.quadraKills = participant.stats.quadraKills;
    this.pentaKills = participant.stats.pentaKills;
    this.largestMultiKill = participant.stats.largestMultiKill;
    this.teamId = participant.teamId;
    this.championId = participant.championId;
    this.matchId = match.gameId;
    this.matchDate = formatDate(match.gameCreationDate);
    this.summonerName = participantIdentity.player.summonerName;
    this.summonerId = participantIdentity.player.summonerId;
    this.accountId = participantIdentity.player.accountId; // is this needed ?
    this.role = MultiKillMatch.getRole(
      participant.timeline.lane,
      participant.timeline.role,
    );
    this.championName = null;
    this.multiKillTypes = multiKillTypes;
    this.gameCreationDate = match.gameCreationDate;
    this.gameDuration = match.gameDuration;
    this.queueId = match.queueId;
    this.multiKills = [];
    this.queueType = '';
  }

  static getRole(lane: string, role: string) {
    return role === 'DUO_SUPPORT' ? 'SUPPORT' : lane;
  }

  static filterMatchesByMultiKills(matchHistory: any, multiKillTypes: any) {
    const multiKillMatches: any = [];
    matchHistory.forEach((match: any) => {
      if (this.isMultiKillMatch(match, multiKillTypes)) {
        multiKillMatches.push(match);
      }
    });
    return multiKillMatches;
  }

  static isMultiKillMatch(match: any, multiKillTypes: number[]) {
    const participantStats = match.participants[0].stats;
    return multiKillTypes.some((killTypeEnum: number) => {
      const killType = MULTI_KILLS[killTypeEnum].plural;
      return participantStats[killType] > 0;
    });
  }

  async init() {
    await this.setChampionName();
    await this.setMultiKills();
    this.queueType = await getQueueType(this.queueId);
  }

  async setChampionName(): Promise<void> {
    // fetch champion name from ddragon
    const championData = await getChampionByKey(this.championId);
    this.championName = championData?.name;
  }

  async setMultiKills(): Promise<void> {
    const allKillsForParticipant =
      await this.getParticipantKillsFromMatchTimeline();
    const multiKills = this.getMultiKillsFromAllMatchKills(
      allKillsForParticipant,
    );
    this.multiKills = multiKills;
  }

  async getParticipantKillsFromMatchTimeline() {
    const kills: any[] = [];
    const matchTimeline = await LeagueClient.getMatchTimelineByMatchId(
      this.matchId,
    );
    matchTimeline.forEach((frame: any) => {
      frame.events.forEach((event: any) => {
        if (
          event.type === 'CHAMPION_KILL' &&
          event.killerId === this.participantId
        ) {
          kills.push(event);
        }
      });
    });
    return kills;
  }

  getMultiKillsFromAllMatchKills(kills: any): MultiKill[] {
    let killType = 1;
    let startTime = kills[0].timestamp;
    let endTime;
    const multiKills = [];

    if (this.firstBloodKill && this.multiKillTypes.includes(killType)) {
      multiKills.push(
        new MultiKill(
          MULTI_KILLS[killType].singular,
          startTime,
          startTime,
          this.matchId,
        ),
      );
    }

    for (let i = 0; i < kills.length; i += 1) {
      const currKillTime = kills[i].timestamp;
      const nextKillTime =
        i + 1 < kills.length ? kills[i + 1].timestamp : Number.MAX_VALUE;
      if (
        nextKillTime <= currKillTime + MULTI_KILL_TIMER ||
        (killType === 4 && nextKillTime <= currKillTime + PENTA_KILL_TIMER)
      ) {
        killType += 1;
        endTime = nextKillTime;
      } else {
        // Never add non-multi kills (single kills)
        if (killType >= 2 && this.multiKillTypes.includes(killType)) {
          multiKills.push(
            new MultiKill(
              MULTI_KILLS[killType].singular,
              startTime,
              endTime,
              this.matchId,
            ),
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
