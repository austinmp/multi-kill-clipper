const championByIdCache: any = {};
const championJson: any = {};

async function getLatestChampionDDragon(language: any = 'en_US') {
  if (championJson[language]) return championJson[language];

  let response: any;
  let versionIndex = 0;
  do {
    // I loop over versions because 9.22.1 is broken
    const version: any = (
      await fetch('http://ddragon.leagueoflegends.com/api/versions.json').then(
        async (r) => await r.json(),
      )
    )[versionIndex++];

    response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`,
    );
  } while (!response.ok);

  championJson[language] = await response.json();
  return championJson[language];
}

async function getChampionByKey(key: any, language: any = 'en_US') {
  // Setup cache
  if (!championByIdCache[language]) {
    const json: any = await getLatestChampionDDragon(language);

    championByIdCache[language] = {};
    for (const championName in json.data) {
      if (!json.data.hasOwnProperty(championName)) continue;

      const champInfo = json.data[championName];
      championByIdCache[language][champInfo.key] = champInfo;
    }
  }

  return championByIdCache[language][key];
}

// NOTE: IN DDRAGON THE ID IS THE CLEAN NAME!!! It's also super-inconsistent, and broken at times.
// Cho'gath => Chogath, Wukong => Monkeyking, Fiddlesticks => Fiddlesticks/FiddleSticks (depending on what mood DDragon is in this patch)
async function getChampionByID(name: any, language: any = 'en_US') {
  const championData: any = await getLatestChampionDDragon(language);
  return championData[name];
}

export { getChampionByKey, getChampionByID };
