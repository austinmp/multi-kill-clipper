const LeagueClient      = require('../apis/league-client.js');


class Summoner {
    constructor(summonerName, tagLine) {
        this.summonerName = summonerName;
        this.tagLine = tagLine;
        this.riotId = `${summonerName}${tagLine}`;
        this.data = null;
    }

    async isFound() {
        try {
            this.data = await LeagueClient.getSummoners(this.riotId)
        } catch(error) {
            // pass
        } finally {
            return this.data?.puuid ? true : false
        }
    }
}

module.exports = {Summoner};