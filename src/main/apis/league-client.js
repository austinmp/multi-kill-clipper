const { CustomError }       = require('../models/custom-error.js');
const { makeRequest }       = require('../models/requests.js');
const LeagueClientConnector = require('../models/league-client-connector.js');
const EventService          = require('../models/event-service');


class LeagueClient  {

    constructor(){
        this.patch = '';
    }

    /// GAME SETTINGS/CONFIGURATION REQUESTS ///
    async getHighlightsFolderPath(){
        return await makeRequest('GET', await this.getUrl('/lol-highlights/v1/highlights-folder-path'), await this.getHeaders());
    }

    async getGameSettings(){
        return await makeRequest('GET', await this.getUrl('/lol-game-settings/v1/game-settings'), await this.getHeaders());
    }

    async patchGameSettings(settingsResource){
        return await makeRequest('PATCH', await this.getUrl('/lol-game-settings/v1/game-settings'), await this.getHeaders(), settingsResource);
    }

    async saveGameSettings(){
        return await makeRequest('POST', await this.getUrl('/lol-game-settings/v1/save'), await this.getHeaders(), {});
    }

    async enableWindowMode(){
        const settingsResource = {
            General: {
                WindowMode: 1
            }
        }
        const updatedSettings = await this.patchGameSettings(settingsResource);
        const saved = await this.saveGameSettings();
        if(!saved){
            throw new CustomError("Failed to enable windowed mode automatically. Please manually enable it in the League Client settings before attempting to record a clip.");
        }
        return updatedSettings;
    }

    /// REPLAY REQUESTS ///
    async getReplayConfig(){
        return await makeRequest('GET', await this.getUrl('/lol-replays/v1/configuration'), await this.getHeaders());
    };

    async getReplayMetaData(matchId){
        return await makeRequest('GET', await this.getUrl(`/lol-replays/v1/metadata/${matchId}`), await this.getHeaders());
    };

    async getRoflsPath(){
        return await makeRequest('GET', `/lol-replays/v1/rofls/path`);
    };

    async downloadReplay(matchId){
        EventService.publish('clipProgress', "Initializing replay download...");
        await makeRequest('POST', await this.getUrl(`/lol-replays/v1/rofls/${matchId}/download`), await this.getHeaders(), {});
        return await this.waitForReplayDownloadToComplete(matchId);
    };

    async waitForReplayDownloadToComplete(matchId){
        const validDownloadStates = ['checking', 'downloading', 'watch'];
        const completed = 'watch';
        do {
            let metaData = await this.getReplayMetaData(matchId);
            var downloadState = metaData.state;
            EventService.publish('clipProgress', `Replay download status : ${downloadState}...`);   
            if(validDownloadStates.indexOf(downloadState) === -1){
                throw new CustomError(`Failed to download replay for matchId : ${matchId}. Download state : ${downloadState}. The riot replay service may be down, please try again later.`)
            }
        } while(downloadState != completed);
        EventService.publish('clipProgress', "Replay successfully downloaded...");
    };

    async launchReplay(matchId) {
        await this.downloadReplay(matchId);
        EventService.publish('clipProgress', "Launching replay...");
        await makeRequest('POST', await this.getUrl(`/lol-replays/v1/rofls/${matchId}/watch`), await this.getHeaders(), {});
    };

    /// MATCH REQUESTS ///     
    async getEndOfMatchDataByMatchId(matchId){
        return await makeRequest('GET', await this.getUrl(`/lol-match-history/v1/games/${matchId}`), await this.getHeaders());
    };

    async getAccountIdBySummonerName(summonerName){
        const accountData = await makeRequest('GET', await this.getUrl(`/lol-summoner/v1/summoners?name=${summonerName}`), await this.getHeaders());
        const accountId = accountData.accountId;
        return accountId;
    };

    async getMatchHistoryByAccountId(accountId){
        const matchData = await makeRequest('GET', await this.getUrl(`/lol-match-history/v3/matchlist/account/${accountId}`), await this.getHeaders());
        const matchHistory = await matchData.games.games;
        return matchHistory.reverse();
    };

    async getMatchTimelineByMatchId(matchId){
        const matchData = await makeRequest('GET', await this.getUrl(`/lol-match-history/v1/game-timelines/${matchId}`), await this.getHeaders());
        const matchTimeline = await matchData.frames;
        return matchTimeline;
    };

    async getPatchVersion(){
        if(this.patch.length > 0) return this.patch;
        const rawPatchData = await makeRequest('GET', await this.getUrl('/lol-patch/v1/game-version'), await this.getHeaders());
        return rawPatchData;
    };
    
    /// HELPER METHODS ///
    async getUrl(endpoint){
        const credentials = await LeagueClientConnector.getClientCredentials();
        const url = `${credentials.host}:${credentials.port}${endpoint}`;
        return url;
    };

    async getHeaders(){
        const credentials = await LeagueClientConnector.getClientCredentials();
        const headers = { 
            // encode 'user:password' using basic auth
            'Authorization': 'Basic ' + Buffer.from(`${credentials.user}:${credentials.password}`).toString('base64')
        };
        return headers;
    };
}

module.exports = new LeagueClient();


// import {makeRequest} from './RequestFactory.js';
// import {LeagueClientConnector} from './LeagueClientConnector.js';
// export default new LeagueClient();




















// async connect(){
//     try {
//         const credentials = await this.getClientCredentialsFromProcess();
//         this.clientData.password = credentials.password;
//         this.clientData.port = credentials.port;
//         this.requestHeaders = this.getHeaders();
//         this.status = 'connected';
//         console.log("Successfully connected to client");
//     } catch(err) {
//         console.log(err);
//     }
// };

// async getClientCredentialsFromProcess(){
//     const response = await find('name', 'LeagueClientUx.exe');          // Searches currently running processes for 'LeagueClientUx.exe' process      
//     if(Array.isArray(response) && response.length != 0){
//         const processInformation = await response[0].cmd;
//         const passwordField = '--remoting-auth-token=';
//         const portField = '--app-port=';
//         var credentials = {};
//         credentials.password = this.spliceString(processInformation, processInformation.search(passwordField) + passwordField.length, '"');
//         credentials.port = this.spliceString(processInformation, processInformation.search(portField) + portField.length, '"');    
//         return credentials;
//     } else {
//         throw new Error("Failed to find the league client process. Please make sure the client is running");    // Error will be propogated up to calling function
//     }
// };



