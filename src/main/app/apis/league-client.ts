import CustomError from '../models/custom-error';
import { makeRequest } from '../models/requests';
import EventService from '../models/event-service';

class LeagueClient {
  patch: string;

  constructor() {
    this.patch = '';
  }

  /// GAME SETTINGS/CONFIGURATION REQUESTS ///
  async getHighlightsFolderPath() {
    return await makeRequest(
      'GET',
      '/lol-highlights/v1/highlights-folder-path',
    );
  }

  async getGameSettings() {
    return await makeRequest('GET', '/lol-game-settings/v1/game-settings');
  }

  async getInputSettings() {
    return await makeRequest('GET', '/lol-game-settings/v1/input-settings');
  }

  async patchGameSettings(settingsResource: any) {
    return await makeRequest(
      'PATCH',
      '/lol-game-settings/v1/game-settings',
      settingsResource,
    );
  }

  async saveGameSettings() {
    return await makeRequest('POST', '/lol-game-settings/v1/save');
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
      throw new CustomError(
        'Failed to enable windowed mode automatically. Please manually enable it in the League Client settings before attempting to record a clip.',
      );
    }
    return updatedSettings;
  }

  /// REPLAY REQUESTS ///
  async getReplayConfig() {
    return await makeRequest('GET', '/lol-replays/v1/configuration');
  }

  async getReplayMetaData(matchId: any) {
    return await makeRequest('GET', `/lol-replays/v1/metadata/${matchId}`);
  }

  async getRoflsPath() {
    return await makeRequest('GET', `/lol-replays/v1/rofls/path`);
  }

  async downloadReplay(matchId: any) {
    EventService.publish('clipProgress', 'Initializing replay download...');
    await makeRequest('POST', `/lol-replays/v1/rofls/${matchId}/download`);
    return await this.waitForReplayDownloadToComplete(matchId);
  }

  async waitForReplayDownloadToComplete(matchId: any) {
    const validDownloadStates = ['checking', 'downloading', 'watch'];
    const completed = 'watch';
    do {
      const metaData = await this.getReplayMetaData(matchId);
      var downloadState = metaData.state;
      EventService.publish(
        'clipProgress',
        `Replay download status : ${downloadState}...`,
      );
      if (validDownloadStates.indexOf(downloadState) === -1) {
        throw new CustomError(
          `Failed to download replay for matchId : ${matchId}. Download state : ${downloadState}. The riot replay service may be down, please try again later.`,
        );
      }
    } while (downloadState != completed);
    EventService.publish('clipProgress', 'Replay successfully downloaded...');
  }

  async launchReplay(matchId: any) {
    await this.downloadReplay(matchId);
    EventService.publish('clipProgress', 'Launching replay...');
    await makeRequest('POST', `/lol-replays/v1/rofls/${matchId}/watch`);
  }

  /// MATCH REQUESTS ///
  async getEndOfMatchDataByMatchId(matchId: any) {
    return await makeRequest('GET', `/lol-match-history/v1/games/${matchId}`);
  }

  async getSummoners(riotId: any) {
    return await makeRequest(
      'GET',
      `/lol-summoner/v1/summoners?name=${riotId}`,
    );
  }

  async getMatchHistoryByPuuid(puuid: any, begIndex: any, endIndex: any) {
    const matchData = await makeRequest(
      'GET',
      `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`,
    );
    const matchHistory = await matchData.games.games;
    return matchHistory;
  }

  async getMatchTimelineByMatchId(matchId: any) {
    const matchData = await makeRequest(
      'GET',
      `/lol-match-history/v1/game-timelines/${matchId}`,
    );
    const matchTimeline = await matchData.frames;
    return matchTimeline;
  }

  async getPatchVersion() {
    if (this.patch.length > 0) return this.patch;
    const rawPatchData = await makeRequest('GET', '/lol-patch/v1/game-version');
    return rawPatchData;
  }
}

export default new LeagueClient();
