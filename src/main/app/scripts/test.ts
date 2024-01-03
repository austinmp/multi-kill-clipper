import MultiKillClipper from '../controllers/MultiKillClipperMain';
import LeagueClient from '../apis/league-client';

const SUMMONER_NAME = 'stoopkidman';
const KILL_TYPES = [1, 2, 3, 4, 5];

async function tester(){
  const currentSummoner = await LeagueClient.getCurrentSummoner();
  console.log(currentSummoner)
  const clipper = new MultiKillClipper(SUMMONER_NAME, KILL_TYPES, currentSummoner)
  const matches = clipper.getMultiKillMatches();
  console.log(matches)

  // const queueName = await getQueueName(440);
  // console.log(queueName)
}

tester()
/*

  1. get currentSummoner (the summoner logged into client)
  If searchedSummoner === currentSummoner
    1. Search Unranked game modes

  else:
    Only search ranked games





*/


// MOVE THIS LOGIC TO FRONTEND
    // check if we can return cached multi-kills
    // if (
    //   this.summoner?.riotId === summoner.riotId &&
    //   this.isSameMultiKillTypes(multiKillTypes) &&
    //   this.multiKillMatches.length > 0
    // ) {
    //   return this.multiKillMatches;
    // }

  // isSameMultiKillTypes(multiKillTypes: any) {
  //   if (multiKillTypes.length !== this.multiKillTypes.length) return false;
  //   for (let i = 0; i < multiKillTypes.length; i += 1) {
  //     if (!this.multiKillTypes.includes(multiKillTypes[i])) return false;
  //   }
  //   return true;
  // }



