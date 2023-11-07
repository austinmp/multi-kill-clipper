import { CustomError } from '@main/models/custom-error';
import { EventService } from '@main/models/event-service';
import { makeRequest } from '@main/models/requests';

export default class LeagueClient {
  constructor() {
    this.patch = '';
  }

  /// GAME SETTINGS/CONFIGURATION REQUESTS ///
  static async getHighlightsFolderPath() {
    return makeRequest('GET', '/lol-highlights/v1/highlights-folder-path');
  }

  static async getGameSettings() {
    return makeRequest('GET', '/lol-game-settings/v1/game-settings');
  }

  static async patchGameSettings(settingsResource) {
    return makeRequest('PATCH', '/lol-game-settings/v1/game-settings', settingsResource);
  }

  static async saveGameSettings() {
    return makeRequest('POST', '/lol-game-settings/v1/save');
  }

  async enableWindowMode() {
    const settingsResource = {
      General: {
        WindowMode: 1,
      },
    };
    const updatedSettings = await this.patchGameSettings(settingsResource);
    const saved = await this.saveGameSettings();
    if (!saved) {
      throw new CustomError('Failed to enable windowed mode automatically. Please manually enable it in the League Client settings before attempting to record a clip.');
    }
    return updatedSettings;
  }

  /// REPLAY REQUESTS ///
  static async getReplayConfig() {
    return makeRequest('GET', '/lol-replays/v1/configuration');
  }

  static async getReplayMetaData(matchId) {
    return makeRequest('GET', `/lol-replays/v1/metadata/${matchId}`);
  }

  static async getRoflsPath() {
    return makeRequest('GET', '/lol-replays/v1/rofls/path');
  }

  async downloadReplay(matchId) {
    EventService.publish('clipProgress', 'Initializing replay download...');
    await makeRequest('POST', await this.getUrl(`/lol-replays/v1/rofls/${matchId}/download`));
    return this.waitForReplayDownloadToComplete(matchId);
  }

  async waitForReplayDownloadToComplete(matchId) {
    const validDownloadStates = ['checking', 'downloading', 'watch'];
    const completed = 'watch';
    do {
      const metaData = await this.getReplayMetaData(matchId);
      var downloadState = metaData.state;
      EventService.publish('clipProgress', `Replay download status : ${downloadState}...`);
      if (validDownloadStates.indexOf(downloadState) === -1) {
        throw new CustomError(`Failed to download replay for matchId : ${matchId}. Download state : ${downloadState}. The riot replay service may be down, please try again later.`);
      }
    } while (downloadState != completed);
    EventService.publish('clipProgress', 'Replay successfully downloaded...');
  }

  async launchReplay(matchId) {
    await this.downloadReplay(matchId);
    EventService.publish('clipProgress', 'Launching replay...');
    await makeRequest('POST', `/lol-replays/v1/rofls/${matchId}/watch`);
  }

  /// MATCH REQUESTS ///
  static async getEndOfMatchDataByMatchId(matchId) {
    return makeRequest('GET', `/lol-match-history/v1/games/${matchId}`);
  }

  static async getPuuidBySummonerName(summonerName) {
    const accountData = await makeRequest('GET', `/lol-summoner/v1/summoners?name=${summonerName}`);
    const { puuid } = accountData;
    return puuid;
  }

  static async getMatchHistoryByPuuid(puuid, begIndex, endIndex) {
    const matchData = await makeRequest('GET', `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`);
    const matchHistory = await matchData.games.games;
    return matchHistory;
  }

  static async getMatchTimelineByMatchId(matchId) {
    const matchData = await makeRequest('GET', `/lol-match-history/v1/game-timelines/${matchId}`);
    const matchTimeline = await matchData.frames;
    return matchTimeline;
  }

  async getPatchVersion() {
    if (this.patch.length > 0) return this.patch;
    const rawPatchData = await makeRequest('GET', '/lol-patch/v1/game-version');
    return rawPatchData;
  }
}
