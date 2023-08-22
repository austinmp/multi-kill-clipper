const { CustomError }   = require('../models/custom-error.js');
const { Replay }        = require('../apis/replay.js');
const LeagueClient      = require('../apis/league-client.js');
const ClipMaker         = require('../models/multi-kill-clip.js');
const EventService      = require('../models/event-service');
const WindowManager     = require('../models/window-manager.js');
const Match             = require('../models/multi-kill-match.js');

class Controller {

    constructor(){
        this.multiKillMatches = [];
        this.multiKillTypes = [];
        this.summonerName = '';
        this.subscribeToFrontEndEvents();
    }
    
    async getMultiKillMatches(summonerName, multiKillTypes){
        if(this.isSameSummonerName(summonerName) && this.isSameMultiKillTypes(multiKillTypes) && this.multiKillMatches.length > 0 ){
            return this.multiKillMatches;
        }        
        const matchData = await this.getMatchDataFromClient(summonerName);
        const multiKillMatches = await this.parseMatchDataForMatchesWithMultiKills(matchData,  multiKillTypes);
        const multiKillMatchObjects = await this.initializeMultiKillMatchObjects(multiKillMatches, multiKillTypes);
        this.setMultiKillMatches(summonerName, multiKillTypes, multiKillMatchObjects);
        return this.multiKillMatches;        
    };

    isSameSummonerName(summonerName){
        return this.summonerName === summonerName;
    }

    isSameMultiKillTypes(multiKillTypes){
        if(multiKillTypes.length != this.multiKillTypes.length) return false;
        for(let i = 0; i < multiKillTypes.length; i++){
            if(!this.multiKillTypes.includes(multiKillTypes[i])) return false
        }
        return true;
    }

    async getMatchDataFromClient(summonerName){
        const matchData = {};
        matchData.puuid             = await LeagueClient.getPuuidBySummonerName(summonerName);
        matchData.currentPatch      = await LeagueClient.getPatchVersion();
        matchData.matchHistory      = await this.getAllMatchesOnCurrentPatch(matchData.puuid, matchData.currentPatch);
        return matchData;
    };

    async getAllMatchesOnCurrentPatch(puuid, currentPatch){
        let matches = [];
        let begIndex = 0;
        let endIndex = 20; // Max of 20 matches are returned per request
        let currMatches;
        let patchOfOldestMatch;
        currentPatch = Match.MultiKillMatch.truncatePatchVersion(currentPatch);
        do {
            currMatches = await LeagueClient.getMatchHistoryByPuuid(puuid, begIndex, endIndex);
            matches = matches.concat(currMatches);
            let oldestMatch = currMatches[currMatches.length-1];
            patchOfOldestMatch = Match.MultiKillMatch.truncatePatchVersion(oldestMatch.gameVersion);
            begIndex += 20;
            endIndex += 20;
        } while(patchOfOldestMatch == currentPatch);
        return matches;

        // To Do: verify this function works properly
    }

    async parseMatchDataForMatchesWithMultiKills(matchData, multiKillTypes){
        const multiKillMatches = Match.MultiKillMatch.filterMatchesByMultiKillsAndPatch(matchData.matchHistory, multiKillTypes, matchData.currentPatch);
        if(multiKillMatches.length === 0){
            throw new CustomError(`No multi-kill matches of the selected type were found on the current patch (${ Match.MultiKillMatch.truncatePatchVersion(matchData.currentPatch)}).`);
        } 
        return multiKillMatches;
    }  

    async initializeMultiKillMatchObjects(multiKillMatches, multiKillTypes){
        let matchObjects = [];
        for(let match of multiKillMatches) {
            let MultiKillMatch = new Match.MultiKillMatch(match, multiKillTypes);
            let matchTimeline = await LeagueClient.getMatchTimelineByMatchId(MultiKillMatch.matchId); 
            let endOfMatchData = await LeagueClient.getEndOfMatchDataByMatchId(MultiKillMatch.matchId);
            let participantId = MultiKillMatch.getParticipantIdFromEndOfMatchData(MultiKillMatch.summonerName, endOfMatchData);
            let allKillsForParticipant = MultiKillMatch.getParticipantKillsFromMatchTimeline(matchTimeline, participantId);
            let multiKills = MultiKillMatch.getMultiKillsFromAllMatchKills(allKillsForParticipant);
            MultiKillMatch.setParticipantRole(endOfMatchData, participantId);
            MultiKillMatch.setParticipantTeamId(endOfMatchData, participantId);
            MultiKillMatch.participantId = participantId;
            MultiKillMatch.multiKills = multiKills;
            matchObjects.push(MultiKillMatch);
        } 
        return matchObjects;  
    }

    async clipMultiKills(selectedMultiKills){
        for(let multiKill of selectedMultiKills){
            let match = this.multiKillMatches[multiKill.matchIndex];
            this.updateRole(match, multiKill);
            await this.createMultiKillClip(match, multiKill.killIndex)
        }
    }

    updateRole(match, multiKill){
        const selectedRole = multiKill.role;
        match.role = selectedRole;
    }

    async createMultiKillClip(MultiKillMatch, indexOfKill){
        const highlightsFolderPath = await LeagueClient.getHighlightsFolderPath();
        const replay = new Replay();
        this.replay = replay;
        await LeagueClient.enableWindowMode();
        await LeagueClient.launchReplay(MultiKillMatch.matchId);
        await replay.load(10, 5); // Add global vars
        await replay.init();
        WindowManager.bringWindowToFocus(replay.pid);
        const clip = new ClipMaker.MultiKillClip(replay, MultiKillMatch, indexOfKill, highlightsFolderPath)
        await clip.createClip();
        await replay.exit();
    }
    
    setMultiKillMatches(summonerName, multiKillTypes, matchList ){
        this.multiKillMatches = matchList;
        this.multiKillTypes = multiKillTypes;
        this.summonerName = summonerName;
    }

    subscribeToFrontEndEvents(){
        EventService.subscribe('cancelRequest',  this.cancelRequestCallback);
    }

    async cancelRequestCallback(){
        await this.replay.exit();
    }

    sendProgressToFrontEnd(message){
        EventService.publish('clipProgress', message);
    }
};

module.exports = new Controller();
