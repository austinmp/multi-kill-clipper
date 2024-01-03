import LeagueClient from '../apis/league-client';

class Summoner {
  summonerName: string;

  tagline: string;

  riotId: string;

  data: any;

  puuid: string;

  constructor(summonerName: string, tagline: string, puuid: string = '') {
    this.summonerName = summonerName;
    this.tagline = tagline;
    this.riotId = `${summonerName}#${tagline}`;
    this.puuid = puuid;
    this.data = null;
  }

  async isFound(): Promise<boolean> {
    try {
      const summonerData = await LeagueClient.getSummoners(this.riotId);
      if (summonerData?.puuid) {
        this.puuid = summonerData.puuid;
        this.data = summonerData;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export default Summoner;
