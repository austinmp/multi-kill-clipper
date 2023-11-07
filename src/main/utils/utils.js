export function sleep(ms) {
  if (ms <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sleepInSeconds(s) {
  if (s <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

export function millisToSeconds(ms) {
  return ms * 0.001;
}

export function secondsToMillis(s) {
  return s * 1000;
}

export function secondsToMinutesFormatted(s) {
  let minutes = s / 60;
  let seconds = minutes - Math.floor(minutes);
  minutes -= seconds;
  seconds = (seconds * 60).toFixed(0);
  seconds = (seconds.length == 1) ? `0${seconds}` : seconds;
  const formattedTime = `${minutes}m : ${seconds}s`;
  return formattedTime;
}

export function formatDate(rawDate) {
  const date = rawDate.slice(0, 10);
  const tokens = date.split('-'); // Original format : 2021-05-23
  return `${tokens[1]}-${tokens[2]}-${tokens[0]}`; // Returned format : 05-23-2021
}

export function spliceString(str, startIndex, endChar) {
  let splicedString = '';
  for (let i = startIndex; (str[i] != endChar && i < str.length); i++) {
    splicedString += str[i];
  }
  return splicedString;
}

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export const isMatchOnCurrentPatch = (match, rawCurrentPatchData) => {
  const rawMatchPatchData = match.gameVersion;
  const matchPatch = truncatePatchVersion(rawMatchPatchData);
  const currentPatch = truncatePatchVersion(rawCurrentPatchData);
  return (matchPatch == currentPatch);
};

export const truncatePatchVersion = (rawPatchData) => {
  /* Shortens raw patch string to one decimal place (e.g. 11.7, 12.13, 10.9) */
  const tokens = rawPatchData.split('.');
  const patch = `${tokens[0]}.${tokens[1]}`;
  return patch;
};
