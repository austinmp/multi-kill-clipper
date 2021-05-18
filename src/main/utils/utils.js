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

module.exports =  {
  sleep,
  sleepInSeconds,
  millisToSeconds,
  secondsToMillis,
  secondsToMinutesFormatted,
  spliceString,
  isEmpty
}