const { CustomError }   = require('../models/custom-error.js');
const { Replay }        = require('../apis/replay.js');
const LeagueClient      = require('../apis/league-client.js');
const ClipMaker         = require('../models/multi-kill-clip.js');
const EventService      = require('../models/event-service');
const Match             = require('../models/multi-kill-match.js');
const { isMatchOnCurrentPatch, truncatePatchVersion, getRiotId} = require('../utils/utils.js');
const { MAX_MATCHES_PER_REQUEST } = require('../constants.js');

class Controller {

    constructor(){
        this.multiKillMatches = [];
        this.multiKillTypes = [];
        this.summonerName = '';
        this.riotId = '';
        this.subscribeToFrontEndEvents();
    }
    

    async getMultiKillMatches(summonerName, multiKillTypes, tagLine="#NA1"){
        if(this.isSameSummoner(summonerName, tagLine) && this.isSameMultiKillTypes(multiKillTypes) && this.multiKillMatches.length > 0 ){
            return this.multiKillMatches;
        }
        this.riotId = getRiotId(summonerName, tagLine)
        const matchData = await this.getMatchDataFromClient();
        const multiKillMatches = await this.parseMatchDataForMatchesWithMultiKills(matchData,  multiKillTypes);
        const multiKillMatchObjects = await this.initializeMultiKillMatchObjects(multiKillMatches, multiKillTypes);
        this.setMultiKillMatches(summonerName, multiKillTypes, multiKillMatchObjects);
        return this.multiKillMatches;        
    };

    isSameSummoner(summonerName, tagLine){
        return this.riotId === getRiotId(summonerName, tagLine);
    }

    isSameMultiKillTypes(multiKillTypes){
        if(multiKillTypes.length != this.multiKillTypes.length) return false;
        for(let i = 0; i < multiKillTypes.length; i++){
            if(!this.multiKillTypes.includes(multiKillTypes[i])) return false
        }
        return true;
    }

    async getMatchDataFromClient(){
        const matchData = {};
        matchData.puuid             = await LeagueClient.getPuuidBySummonerName(this.riotId);
        matchData.currentPatch      = await LeagueClient.getPatchVersion();
        matchData.matchHistory      = await this.getAllMatchesOnCurrentPatch(matchData.puuid, matchData.currentPatch);
        return matchData;
    };

    async getAllMatchesOnCurrentPatch(puuid, currentPatch){
        let matchesOnCurrentPatch = [];
        let start = 0, end = MAX_MATCHES_PER_REQUEST;
        let matchBatch = await LeagueClient.getMatchHistoryByPuuid(puuid, start, end);
        let i = 0
        let match = matchBatch[i]        
        while (match && isMatchOnCurrentPatch(match, currentPatch)) {
            console.log(match)
            matchesOnCurrentPatch.push(match);
            i++;
            if (i >= MAX_MATCHES_PER_REQUEST) {
                start = end, end += MAX_MATCHES_PER_REQUEST, i = 0
                matchBatch = await LeagueClient.getMatchHistoryByPuuid(puuid, start, end);
            }
            match = matchBatch[i]
        }

        return matchesOnCurrentPatch;
    }

    async parseMatchDataForMatchesWithMultiKills(matchData, multiKillTypes){
        const multiKillMatches = Match.MultiKillMatch.filterMatchesByMultiKillsAndPatch(matchData.matchHistory, multiKillTypes, matchData.currentPatch);
        if(multiKillMatches.length === 0){
            throw new CustomError(`No multi-kill matches of the selected type were found on the current patch (${truncatePatchVersion(matchData.currentPatch)}).`);
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
            MultiKillMatch.setChampionName()
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
        const clip = new ClipMaker.MultiKillClip(replay, MultiKillMatch, indexOfKill, highlightsFolderPath)
        await clip.createClip();
        await replay.exit()
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
