import LeagueClient from '../apis/league-client';

class Summoner {
  summonerName: string;

  tagLine: string;

  riotId: string;

  data: any;

  constructor(summonerName: string, tagLine: string) {
    this.summonerName = summonerName;
    this.tagLine = tagLine;
    this.riotId = `${summonerName}${tagLine}`;
    this.data = null;
  }

  async isFound() {
    try {
      this.data = await LeagueClient.getSummoners(this.riotId);
    } catch (error) {
      // pass
    } finally {
      return !!this.data?.puuid;
    }
  }
}

export { Summoner };
