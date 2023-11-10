import { CustomError } from '@main/models/custom-error';
import { Replay } from '@main/apis/replay';
import LeagueClient from '@main/apis/league-client';
import ClipMaker from '@main/models/multi-kill-clip';
import EventService from '@main/models/event-service';
import { bringWindowToFocus } from '@main/models/window-manager'; // may need to fix this
import { MultiKillMatch} from '@main/models/multi-kill-match';
import { isMatchOnCurrentPatch, truncatePatchVersion } from '@main/utils/utils';
import { MAX_MATCHES_PER_REQUEST } from '@main/constants';

export class Controller {
  constructor() {
    this.multiKillMatches = [];
    this.multiKillTypes = [];
    this.summonerName = '';
    this.subscribeToFrontEndEvents();
  }

  async getMultiKillMatches(summonerName, multiKillTypes) {
    if (this.isSameSummonerName(summonerName) && this.isSameMultiKillTypes(multiKillTypes) && this.multiKillMatches.length > 0) {
      return this.multiKillMatches;
    }
    const matchData = await this.getMatchDataFromClient(summonerName);
    const multiKillMatches = await this.parseMatchDataForMatchesWithMultiKills(matchData, multiKillTypes);
    const multiKillMatchObjects = await this.initializeMultiKillMatchObjects(multiKillMatches, multiKillTypes);
    this.setMultiKillMatches(summonerName, multiKillTypes, multiKillMatchObjects);
    return this.multiKillMatches;
  }

  isSameSummonerName(summonerName) {
    return this.summonerName === summonerName;
  }

  isSameMultiKillTypes(multiKillTypes) {
    if (multiKillTypes.length != this.multiKillTypes.length) return false;
    for (let i = 0; i < multiKillTypes.length; i++) {
      if (!this.multiKillTypes.includes(multiKillTypes[i])) return false;
    }
    return true;
  }

  async getMatchDataFromClient(summonerName) {
    const matchData = {};
    matchData.puuid = await LeagueClient.getPuuidBySummonerName(summonerName);
    matchData.currentPatch = await LeagueClient.getPatchVersion();
    matchData.matchHistory = await this.getAllMatchesOnCurrentPatch(matchData.puuid, matchData.currentPatch);
    return matchData;
  }

  async getAllMatchesOnCurrentPatch(puuid, currentPatch) {
    const matchesOnCurrentPatch = [];
    let start = 0; let
      end = MAX_MATCHES_PER_REQUEST;
    let matchBatch = await LeagueClient.getMatchHistoryByPuuid(puuid, start, end);
    let i = 0;
    let match = matchBatch[i];
    while (match && isMatchOnCurrentPatch(match, currentPatch)) {
      console.log(match);
      matchesOnCurrentPatch.push(match);
      i++;
      if (i >= MAX_MATCHES_PER_REQUEST) {
        start = end, end += MAX_MATCHES_PER_REQUEST, i = 0;
        matchBatch = await LeagueClient.getMatchHistoryByPuuid(puuid, start, end);
      }
      match = matchBatch[i];
    }

    return matchesOnCurrentPatch;
  }

  async parseMatchDataForMatchesWithMultiKills(matchData, multiKillTypes) {
    const multiKillMatches = MultiKillMatch.filterMatchesByMultiKillsAndPatch(matchData.matchHistory, multiKillTypes, matchData.currentPatch);
    if (multiKillMatches.length === 0) {
      throw new CustomError(`No multi-kill matches of the selected type were found on the current patch (${truncatePatchVersion(matchData.currentPatch)}).`);
    }
    return multiKillMatches;
  }

  async initializeMultiKillMatchObjects(multiKillMatches, multiKillTypes) {
    const matchObjects = [];
    for (const match of multiKillMatches) {
      const MultiKillMatch = new MultiKillMatch(match, multiKillTypes);
      const matchTimeline = await LeagueClient.getMatchTimelineByMatchId(MultiKillMatch.matchId);
      const endOfMatchData = await LeagueClient.getEndOfMatchDataByMatchId(MultiKillMatch.matchId);
      const participantId = MultiKillMatch.getParticipantIdFromEndOfMatchData(MultiKillMatch.summonerName, endOfMatchData);
      const allKillsForParticipant = MultiKillMatch.getParticipantKillsFromMatchTimeline(matchTimeline, participantId);
      const multiKills = MultiKillMatch.getMultiKillsFromAllMatchKills(allKillsForParticipant);
      MultiKillMatch.setParticipantRole(endOfMatchData, participantId);
      MultiKillMatch.setParticipantTeamId(endOfMatchData, participantId);
      MultiKillMatch.participantId = participantId;
      MultiKillMatch.multiKills = multiKills;
      matchObjects.push(MultiKillMatch);
    }
    return matchObjects;
  }

  async clipMultiKills(selectedMultiKills) {
    for (const multiKill of selectedMultiKills) {
      const match = this.multiKillMatches[multiKill.matchIndex];
      this.updateRole(match, multiKill);
      await this.createMultiKillClip(match, multiKill.killIndex);
    }
  }

  updateRole(match, multiKill) {
    const selectedRole = multiKill.role;
    match.role = selectedRole;
  }

  async createMultiKillClip(MultiKillMatch, indexOfKill) {
    const highlightsFolderPath = await LeagueClient.getHighlightsFolderPath();
    const replay = new Replay();
    this.replay = replay;
    await LeagueClient.enableWindowMode();
    await LeagueClient.launchReplay(MultiKillMatch.matchId);
    await replay.load(10, 5); // Add global vars
    await replay.init();
    bringWindowToFocus(replay.pid);
    const clip = new ClipMaker.MultiKillClip(replay, MultiKillMatch, indexOfKill, highlightsFolderPath);
    await clip.createClip();
    await replay.exit();
  }

  setMultiKillMatches(summonerName, multiKillTypes, matchList) {
    this.multiKillMatches = matchList;
    this.multiKillTypes = multiKillTypes;
    this.summonerName = summonerName;
  }

  subscribeToFrontEndEvents() {
    EventService.subscribe('cancelRequest', this.cancelRequestCallback);
  }

  async cancelRequestCallback() {
    await this.replay.exit();
  }

  sendProgressToFrontEnd(message) {
    EventService.publish('clipProgress', message);
  }
}
