function sleep(ms: any) {
  if (ms <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sleepInSeconds(s: any) {
  if (s <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

function millisToSeconds(ms: any) {
  return ms * 0.001;
}

function secondsToMillis(s: any) {
  return s * 1000;
}

function secondsToMinutesFormatted(s: any) {
  let minutes = s / 60;
  const seconds = minutes - Math.floor(minutes);
  minutes -= seconds;
  let secondsString: string = (seconds * 60).toFixed(0);
  secondsString = secondsString.length === 1 ? `0${seconds}` : `${seconds}`;
  const formattedTime = `${minutes}m : ${secondsString}s`;
  return formattedTime;
}

function formatDate(rawDate: any) {
  const date = rawDate.slice(0, 10);
  const tokens = date.split('-'); // Original format : 2021-05-23
  return `${tokens[1]}-${tokens[2]}-${tokens[0]}`; // Returned format : 05-23-2021
}

function spliceString(str: any, startIndex: any, endChar: any) {
  let splicedString = '';
  for (let i = startIndex; str[i] != endChar && i < str.length; i++) {
    splicedString += str[i];
  }
  return splicedString;
}

function isEmpty(obj: any) {
  return Object.keys(obj).length === 0;
}

const isMatchOnCurrentPatch = (match: any, rawCurrentPatchData: any) => {
  const rawMatchPatchData = match.gameVersion;
  const matchPatch = truncatePatchVersion(rawMatchPatchData);
  const currentPatch = truncatePatchVersion(rawCurrentPatchData);
  return matchPatch == currentPatch;
};

const truncatePatchVersion = (rawPatchData: any) => {
  /* Shortens raw patch string to one decimal place (e.g. 11.7, 12.13, 10.9) */
  const tokens = rawPatchData.split('.');
  const patch = `${tokens[0]}.${tokens[1]}`;
  return patch;
};

const getRiotId = (summonerName: any, tagline: any) => {
  return `${summonerName}${tagline}`;
};

/*
  Replace forward slashes in file path with back slashes
*/
const convertFilePath = (path: string) => {
  return path.replace(/\//g, '\\');
};

export {
  sleep,
  sleepInSeconds,
  millisToSeconds,
  secondsToMillis,
  secondsToMinutesFormatted,
  formatDate,
  spliceString,
  isEmpty,
  isMatchOnCurrentPatch,
  truncatePatchVersion,
  getRiotId,
  convertFilePath,
};
