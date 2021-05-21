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
        matchData.accountId         = await LeagueClient.getAccountIdBySummonerName(summonerName);
        matchData.currentPatch      = await LeagueClient.getPatchVersion();
        matchData.matchHistory      = await this.getAllMatchesOnCurrentPatch(matchData.accountId, matchData.currentPatch);
        return matchData;
    };

    async getAllMatchesOnCurrentPatch(accountId, currentPatch){
        let matches = [];
        let begIndex = 0;
        let endIndex = 20; // Max of 20 matches are returned per request
        let currMatches;
        let patchOfOldestMatch;
        currentPatch = Match.MultiKillMatch.truncatePatchVersion(currentPatch);
        do {
            currMatches = await LeagueClient.getMatchHistoryByAccountId(accountId, begIndex, endIndex);
            matches = matches.concat(currMatches);
            let oldestMatch = currMatches[currMatches.length-1];
            patchOfOldestMatch = Match.MultiKillMatch.truncatePatchVersion(oldestMatch.gameVersion);
            begIndex += 20;
            endIndex += 20;
        } while(patchOfOldestMatch == currentPatch);
        return matches;3
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


// async function createMultiKillMatchObjects(multiKillMatches, multiKillTypes){
//     let matchObjects = [];
//     for(let match of multiKillMatches) {
//         try {
//             let MultiKillMatch = new Match.MultiKillMatch(match, multiKillTypes);
//             let matchTimeline = await LeagueClient.getMatchTimelineByMatchId(MultiKillMatch.matchId); 
//             let endOfMatchData = await LeagueClient.getEndOfMatchDataByMatchId(MultiKillMatch.matchId);
//             let participantId = MultiKillMatch.getParticipantIdFromEndOfMatchData(MultiKillMatch.summonerName, endOfMatchData);
//             let allKillsForParticipant = MultiKillMatch.getParticipantKillsFromMatchTimeline(matchTimeline, participantId);
//             let multiKills = MultiKillMatch.getMultiKillsFromAllMatchKills(allKillsForParticipant);
//             MultiKillMatch.setParticipantRole(endOfMatchData, participantId);
//             MultiKillMatch.setParticipantTeamId(endOfMatchData, participantId);
//             MultiKillMatch.participantId = participantId;
//             MultiKillMatch.multiKills = multiKills;
//             matchObjects.push(MultiKillMatch);
//         } catch(err) {
//             throw new Error(err);
//         }
//     } 
//     return matchObjects;
// };

// async function createMultiKillClip(MultiKillMatch, indexOfKill){
//     await LeagueClient.launchReplay(MultiKillMatch.matchId);
//     await Replay.load(10, 5);       // ADD GLOBALS
//     const replayProcessId = await Replay.getProcessId(); 
//     WindowManager.bringWindowToFocus(replayProcessId);
//     var clip = new ClipMaker.MultiKillClip(MultiKillMatch, indexOfKill, `E:/LoL-Clips`)
//     await clip.createClip();
// }




// import ClipMaker from  './MultiKillClip.js'
// import LeagueClient from './LeagueClient.js';
// import Replay from './Replay.js';
// import EventService from './EventService';
// import WindowManager from './WindowManager.js';
// import MultiKillMatch from './MultiKillMatch.js';







/*  TO DO:
- recording may need to stop if they have pasued 

- make it so enter will also start search
    - add retries for 500 request errors
    - create folders for everything
    - break apart the front end code
    - MAKE A CONFIG FILE AND PUT ALL GLOBAL VARIABLES IN THERE
    // Sometimes input field is unclickable
    // NEED TO CLOSE OUT OF THHE CURRENT REPLAY IF ONE IS OPEN OR ELSE IT JUST SKIPS TO TIME IN CURRENT ONE
    - Generated clip names will be broken after change to multikill object list


     - write the load function in replay as a recursive algo
    - CHECK THAT RETRIES ARE WORKING
    - make a github page
    - 

    DOWN THE LINE:
    - ADD A QUEUE FOR MULTIPLE CLIPS
    - CUSTOMIZE REPLAY SETTINGS LIKE FPS
    


    - show a green light when connected to client, and a red light if disconnected
    -Error: Failed to download replay for matchId : 3868572046. Download state : lost

    - FILTER BY CUSTOM GAMES, WE CANT CLIP THOSE

w
*/ 


// Wrap this around calls to replay api
// try {
// } catch (err){
//     if(err.code == 'ECONNREFUSED'){
//         throw new Error("Replay reuqest failed. Please make sure the replay is running and fully loaded.");
//     }    
// }


// chec that the replay has been fully downloaded
// To Do : Check that replay has actuallyy started
// To Do : Check that we are at desired time before recording starts
// To Do : at 10 seconds to the front and end of clips to capture everything.
// To Do : Enable the ability to change replay recording properties like fps 
// To Do : Add the logic to enable replay api
// Select which multikills to clip individually, dont just do them all at once.
// Match : 
    // (2) Double Kills, time = a, time = b <-- chose which time
    //  1 Tripple Kill



// Jump to specific time
// Follow specific player
// async function tester(){
//     let endOfMatchData = await LeagueClient.getEndOfMatchDataByMatchId(MultiKillMatch.matchId);
//     let participantId = MultiKillMatch.getParticipantIdFromEndOfMatchData(endOfMatchData);
//     MultiKillMatch.setParticipantLanePosition(endOfMatchData, participantId);
// }

// tester().catch(err=> console.log(err));


// var streaks = [1,2,3,4,5]

// getMultiKillMatches('Stoopkidman', streaks)
// .then(function(res){
//     // console.log(res);
//     // console.log(res[0].multiKillMatches);
//     // createMultiKillClip(res);
// })
// .catch(err => console.log(err));



// getMultiKillMatches('stoopkidman', streaks)
//     .then(function(res){
//         for(let MultiKillMatch of res){
            
//             let summonerName = MultiKillMatch.summonerName;
//             let championName = MultiKillMatch.championName;
//             let matchDate = MultiKillMatch.matchDate;

//             for(let multiKill in MultiKillMatch.multiKillTimes){
//                 for(let i = 0; i < MultiKillMatch.multiKillTimes[multiKill].length; i++){
//                     var name = Replay.Replay.getClipName(summonerName, championName, matchDate, multiKill, i);
//                     console.log(name);
//                 }
                    
//             }
//         }
//     })
//     .catch(err => console.log(err));

// LeagueClient.watchReplay(3868669563)
// .then(res => console.log(res))
// .catch(err => console.log(err));

// LeagueClient.getReplayMetaData(3868669563)
// .then(res => console.log(res))
// .catch(err => console.log(err));

// '3868669563'

// LeagueClient.getRoflsPath()
// .then(res => console.log(res))
// .catch(err => console.log(err));

// LeagueClient.exit()
// .then(res => console.log(res))
// .catch(err => console.log(err));

// process.kill(10284);

// LeagueClient.getPatchVersion()
// .then(res => console.log(res))
// .catch(err => console.log(err));

/*
    1. Download the replay and check if it is complete
    2. Once its complete, launch it
    3. Check when it has started, then we can begin processing clip.

*/


// static removeClipsFromQueue(selectedMultiKills){
//     for(let i = 0; i < selectedMultiKills.length; i++){
//         for(let j = 0; j< clipQueue.length; j++){
//             if(selectedMultiKills[i][0] === this.clipQueue[j][0] && selectedMultiKills[i][1] === this.clipQueue[j][1]){
//                 this.clipQueue.splice(j,1);
//             }
//         }
//     }
// }