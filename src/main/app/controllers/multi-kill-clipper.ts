import CustomError from '../models/custom-error';
import LeagueClient from '../apis/league-client';
import { MultiKillClip } from '../models/multi-kill-clip';
import EventService from '../models/event-service';
import MultiKillMatch from '../models/multi-kill-match';
import { Summoner } from '../models/summoner';
import { isMatchOnCurrentPatch, truncatePatchVersion } from '../utils/utils';
import { MAX_MATCHES_PER_REQUEST } from '../constants';
import Replay from '../apis/replay';

class Controller {
  multiKillMatches: MultiKillMatch[];

  multiKillTypes: any;

  summoner: any;

  replay: any;

  constructor() {
    this.multiKillMatches = [];
    this.multiKillTypes = [];
    this.subscribeToFrontEndEvents();
    this.summoner = null;
  }

  async getMultiKillMatches(
    summonerName: any,
    multiKillTypes: any,
    tagLine: any = '#NA1',
  ) {
    const summoner = new Summoner(summonerName, tagLine);
    const isSummonerFound = await summoner.isFound();
    if (!isSummonerFound) {
      throw new CustomError(
        `${summoner.riotId} was not found; verify the name and try again.`,
      );
    }

    // check if we can return cached multi-kills
    if (
      this.summoner?.riotId === summoner.riotId &&
      this.isSameMultiKillTypes(multiKillTypes) &&
      this.multiKillMatches.length > 0
    ) {
      return this.multiKillMatches;
    }

    this.summoner = summoner;
    const matchData = await this.getMatchDataFromClient();
    const multiKillMatches = await this.parseMatchDataForMatchesWithMultiKills(
      matchData,
      multiKillTypes,
    );
    const multiKillMatchObjects = await this.initializeMultiKillMatchObjects(
      multiKillMatches,
      multiKillTypes,
    );
    this.setMultiKillMatches(multiKillTypes, multiKillMatchObjects);
    return this.multiKillMatches;
  }

  isSameMultiKillTypes(multiKillTypes: any) {
    if (multiKillTypes.length !== this.multiKillTypes.length) return false;
    for (let i = 0; i < multiKillTypes.length; i++) {
      if (!this.multiKillTypes.includes(multiKillTypes[i])) return false;
    }
    return true;
  }

  async getMatchDataFromClient() {
    const matchData: any = {};
    matchData.puuid = this.summoner?.data.puuid;
    matchData.currentPatch = await LeagueClient.getPatchVersion();
    matchData.matchHistory = await this.getAllMatchesOnCurrentPatch(
      matchData.puuid,
      matchData.currentPatch,
    );
    return matchData;
  }

  async getAllMatchesOnCurrentPatch(puuid: any, currentPatch: any) {
    const matchesOnCurrentPatch = [];
    let start = 0;
    let end = MAX_MATCHES_PER_REQUEST;
    let matchBatch = await LeagueClient.getMatchHistoryByPuuid(
      puuid,
      start,
      end,
    );
    let i = 0;
    let match = matchBatch[i];
    while (match && isMatchOnCurrentPatch(match, currentPatch)) {
      console.log(match);
      matchesOnCurrentPatch.push(match);
      i++;
      if (i >= MAX_MATCHES_PER_REQUEST) {
        (start = end), (end += MAX_MATCHES_PER_REQUEST), (i = 0);
        matchBatch = await LeagueClient.getMatchHistoryByPuuid(
          puuid,
          start,
          end,
        );
      }
      match = matchBatch[i];
    }

    return matchesOnCurrentPatch;
  }

  async parseMatchDataForMatchesWithMultiKills(
    matchData: any,
    multiKillTypes: any,
  ) {
    const multiKillMatches = MultiKillMatch.filterMatchesByMultiKillsAndPatch(
      matchData.matchHistory,
      multiKillTypes,
    );
    if (multiKillMatches.length === 0) {
      throw new CustomError(
        `No multi-kill matches of the selected type were found on the current patch (${truncatePatchVersion(
          matchData.currentPatch,
        )}).`,
      );
    }
    return multiKillMatches;
  }

  async initializeMultiKillMatchObjects(
    multiKillMatches: any,
    multiKillTypes: any,
  ) {
    const matchObjects = [];
    for (const multiKillMatch of multiKillMatches) {
      const match = new MultiKillMatch(multiKillMatch, multiKillTypes);
      const matchTimeline = await LeagueClient.getMatchTimelineByMatchId(
        match.matchId,
      );
      const endOfMatchData = await LeagueClient.getEndOfMatchDataByMatchId(
        match.matchId,
      );
      const participantId = match.getParticipantIdFromEndOfMatchData(
        match.summonerName,
        endOfMatchData,
      );
      const allKillsForParticipant = match.getParticipantKillsFromMatchTimeline(
        matchTimeline,
        participantId,
      );
      const multiKills = match.getMultiKillsFromAllMatchKills(
        allKillsForParticipant,
      );
      match.setChampionName();
      match.setParticipantRole(endOfMatchData, participantId);
      match.setParticipantTeamId(endOfMatchData, participantId);
      match.participantId = participantId;
      match.multiKills = multiKills;
      matchObjects.push(match);
    }
    return matchObjects;
  }

  async clipMultiKills(selectedMultiKills: any) {
    for (const multiKill of selectedMultiKills) {
      const match = this.multiKillMatches[multiKill.matchIndex];
      this.updateRole(match, multiKill);
      await this.createMultiKillClip(match, multiKill.killIndex);
    }
  }

  updateRole(match: any, multiKill: any) {
    const selectedRole = multiKill.role;
    match.role = selectedRole;
  }

  async createMultiKillClip(MultiKillMatch: any, indexOfKill: any) {
    const highlightsFolderPath = await LeagueClient.getHighlightsFolderPath();
    const replay = new Replay();
    this.replay = replay;
    await LeagueClient.enableWindowMode();
    await LeagueClient.launchReplay(MultiKillMatch.matchId);
    await replay.load(10, 5); // Add global vars
    await replay.init();
    const clip = new MultiKillClip(
      replay,
      MultiKillMatch,
      indexOfKill,
      highlightsFolderPath,
    );
    await clip.createClip();
    await replay.exit();
  }

  setMultiKillMatches(multiKillTypes: any, matchList: any) {
    this.multiKillMatches = matchList;
    this.multiKillTypes = multiKillTypes;
  }

  subscribeToFrontEndEvents() {
    EventService.subscribe('cancelRequest', this.cancelRequestCallback);
  }

  async cancelRequestCallback() {
    await this.replay.exit();
  }

  sendProgressToFrontEnd(message: any) {
    EventService.publish('clipProgress', message);
  }
}

export default new Controller();
