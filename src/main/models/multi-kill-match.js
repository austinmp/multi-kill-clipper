const { millisToSeconds } = require('../utils/utils.js');
const { 
  ChampIdToName,
  MultiKillsSingular,
  MultiKillsPlural 
} = require('../../../config/constants.js');

const MULTIKILL_TIMER = 10000;  // (10 seconds) Allowed time in milliseconds before multi-kill timer resets (1-4 kills).
const PENTAKILL_TIMER = 30000;  // (30 seconds) Multi-kill timer is slower to reset when going from kill 4 to 5.

class MultiKill {
  constructor(type, start, end){
    this.type = type;
    this.start = millisToSeconds(start);
    this.end = millisToSeconds(end);
  }
};

class MultiKillMatch{
  constructor(match, multiKillTypes){
    this.matchId = match.gameId,
    this.matchDate = match.gameCreationDate.slice(0,10);
    this.summonerName = match.participantIdentities[0].player.summonerName;
    this.summonerId = match.participantIdentities[0].player.summonerId;
    this.accountId = match.participantIdentities[0].player.accountId;
    this.championId = match.participants[0].championId;
    this.championName = ChampIdToName[this.championId];
    this.firstBloodKill = match.participants[0].stats.firstBloodKill;
    this.doubleKills = match.participants[0].stats.doubleKills;
    this.tripleKills =  match.participants[0].stats.tripleKills;
    this.quadraKills = match.participants[0].stats.quadraKills;
    this.pentaKills = match.participants[0].stats.pentaKills;
    this.largestMultiKill = match.participants[0].stats.largestMultiKill;
    this.userSelectedKillTypes = multiKillTypes;    
  }

  static filterMatchesByMultiKillsAndPatch(matchHistory, multiKillTypes, currentPatch){
    let multiKillMatches = [];
    for(let match of matchHistory) {
        if(!(this.isMatchOnCurrentPatch(match, currentPatch))) break;
        if(this.isMultiKillMatch(match, multiKillTypes)) multiKillMatches.push(match);
    }
    return multiKillMatches;
  };

  static isMatchOnCurrentPatch(match, rawCurrentPatchData){
    const rawMatchPatchData = match.gameVersion;
    const matchPatch = this.truncatePatchVersion(rawMatchPatchData);
    const currentPatch = this.truncatePatchVersion(rawCurrentPatchData)
    return (matchPatch == currentPatch);
  };

  static truncatePatchVersion(rawPatchData){    // Shortens raw patch string to one decimal place (e.g. 11.7, 12.13, 10.9)
    let tokens = rawPatchData.split('.');
    const patch = `${tokens[0]}.${tokens[1]}`;
    return patch;
  };

  static isMultiKillMatch(match, multiKillTypes){
    const participantStats = match.participants[0].stats;
    for(let multiKill of multiKillTypes){
        let multiKillType = MultiKillsPlural[multiKill];
        if (participantStats[multiKillType] > 0) return true;
    }
    return false;
  };

  getParticipantIdFromEndOfMatchData(summonerName, matchData){
    const participants = matchData.participantIdentities;
    for(let i = 0; i < participants.length; i++){
        const currSummoner = participants[i].player.summonerName;
        if(currSummoner == summonerName) return participants[i].participantId;
    }  
  };

  static test (){
    console.log('test');
  }
  setParticipantRole(matchData, participantId){
    const participantData = matchData.participants[participantId-1];
    const lane = participantData.timeline.lane;
    const role = participantData.timeline.role;
    this.role = (role == "DUO_SUPPORT") ? "SUPPORT" : lane;
  };

  setParticipantTeamId(matchData, participantId){
    const participantData = matchData.participants[participantId-1];
    const teamId = participantData.teamId;
    this.teamId = teamId;
  };
  
  getParticipantKillsFromMatchTimeline(matchTimeline, participantId){
    let kills = [];
    for(let frame of matchTimeline){
        for(let event of frame.events){
            if(event.type == 'CHAMPION_KILL' && event.killerId == participantId ){
                kills.push(event);
            }
        }
    }
    return kills;
  };

  getMultiKillsFromAllMatchKills(kills){
    let killType = 1;
    let startTime = kills[0].timestamp;
    let endTime;
    let multiKills = []; 

    if(this.firstBloodKill && this.userSelectedKillTypes.includes(`${killType}`)){
      multiKills.push(new MultiKill(MultiKillsSingular[killType], startTime, startTime));
    }

    for(let i = 0; i < kills.length; i++){
        let currKillTime = kills[i].timestamp;
        let nextKillTime = (i + 1 < kills.length) ? kills[i+1].timestamp : Number.MAX_VALUE;
        if( (nextKillTime <= currKillTime + MULTIKILL_TIMER) || (killType === 4 && nextKillTime <= currKillTime + PENTAKILL_TIMER) ){
            killType++;
            endTime = nextKillTime;
        } else {
            // Never add non-multi kills (single kills)
            if(killType >= 2 && this.userSelectedKillTypes.includes(`${killType}`)){ 
              multiKills.push(new MultiKill(MultiKillsSingular[killType], startTime, endTime));                
            }
            startTime = nextKillTime;
            killType = 1;
        }
    }
    return multiKills;
  };
}

module.exports = { MultiKillMatch };


// import {millisToSeconds} from './Utilities/UtilityFunctions.js';
// import {ChampIdToName} from './Utilities/Constants.js';
// export {MultiKillMatch};



// getMultiKillTimesFromAllKills(kills){
//   let killStreak = 1;
//   let endTime;
//   let startTime = kills[0].timestamp;
//   let killTimes = {}; 

//   if(this.gotFirstBlood) killTimes[killStreak] = [new Time(startTime, startTime)];    

//   for(let i = 0; i < kills.length; i++){
//       let currKillTime = kills[i].timestamp;
//       let nextKillTime = (i + 1 < kills.length) ? kills[i+1].timestamp : Number.MAX_VALUE;
//       if( (nextKillTime <= currKillTime + MULTIKILL_TIMER) || (killStreak === 4 && nextKillTime <= currKillTime + PENTAKILL_TIMER) ){
//           killStreak++;
//           endTime = nextKillTime;
//       } else {
//           if (killStreak >= 2){   // Never add any 'single' kill except for first blood
//               if(killTimes.hasOwnProperty(`${killStreak}`)){
//                   killTimes[killStreak].push(new Time(startTime, endTime));
//               } else {
//                   killTimes[killStreak] = [new Time(startTime, endTime)];     
//               }                    
//           }
//           startTime = nextKillTime;
//           killStreak = 1;
//       }
//   }
//   return killTimes;
// };