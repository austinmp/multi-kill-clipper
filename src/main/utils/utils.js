function sleep(ms) {
  if(ms <= 0 ) return;
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sleepInSeconds(s) {
  if(s <= 0 ) return;
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

function millisToSeconds(ms){
  return ms*0.001;
}

function secondsToMillis(s){
  return s*1000;
}

function secondsToMinutesFormatted(s){
  let minutes = s/60;
  let seconds = minutes - Math.floor(minutes);
  minutes = minutes-seconds;
  seconds = (seconds*60).toFixed(0);
  seconds = (seconds.length == 1) ? `0${seconds}`: seconds;
  const formattedTime = `${minutes}m : ${seconds}s`;
  return formattedTime;
};

function formatDate(rawDate){
  let date = rawDate.slice(0,10);
  let tokens = date.split('-');                     // Original format : 2021-05-23
  return `${tokens[1]}-${tokens[2]}-${tokens[0]}`;  // Returned format : 05-23-2021
}

function spliceString(str, startIndex, endChar){
  var splicedString = "";
  for(var i = startIndex; (str[i] != endChar && i < str.length); i++){
    splicedString += str[i];
  }
  return splicedString;
};

function isEmpty(obj){
  return Object.keys(obj).length === 0;
};

const isMatchOnCurrentPatch = (match, rawCurrentPatchData) => {
  const rawMatchPatchData = match.gameVersion;
  const matchPatch = truncatePatchVersion(rawMatchPatchData);
  const currentPatch = truncatePatchVersion(rawCurrentPatchData);
  return (matchPatch == currentPatch);
};


const truncatePatchVersion = (rawPatchData) => {
  /* Shortens raw patch string to one decimal place (e.g. 11.7, 12.13, 10.9) */
  let tokens = rawPatchData.split('.');
  const patch = `${tokens[0]}.${tokens[1]}`;
  return patch;
};


module.exports =  {
  sleep,
  sleepInSeconds,
  millisToSeconds,
  secondsToMillis,
  secondsToMinutesFormatted,
  formatDate,
  spliceString,
  isEmpty,
  isMatchOnCurrentPatch,
  truncatePatchVersion
}