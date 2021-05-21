const { BlueSideCameraControlsByRole, RedSideCameraControlsByRole } = require('../../../config/constants.js');
const { sleepInSeconds }                                            = require('../utils/utils.js');
const EventService                                                  = require('./event-service.js');
const Robot                                                         = require('robotjs');

const TIME_TO_CLIP_BEFORE_KILL = 15;
const TIME_TO_CLIP_AFTER_KILL = 5;

class MultiKillClip {
    constructor(replay, MultiKillMatch, indexOfKill, filePath){
        this.replay = replay;
        this.MultiKillMatch = MultiKillMatch;
        this.kill = MultiKillMatch.multiKills[indexOfKill];
        this.indexOfKill = indexOfKill;
        this.format = 'webm';
        this.filePath = filePath + this.getClipName();
    }

    getClipName(){
        const summonerName = this. MultiKillMatch.summonerName;
        const championName = this.MultiKillMatch.championName;
        const nameOfKill = this.kill.type;
        const matchDate = this.MultiKillMatch.matchDate;
        const killIndex = this.indexOfKill + 1;
        return`/${summonerName}-${championName}-${nameOfKill}-${matchDate}(${killIndex}).${this.format}`;
    };
    
    async createClip(){
        const startTime = this.kill.start - TIME_TO_CLIP_BEFORE_KILL;
        const endTime = this.kill.end + TIME_TO_CLIP_AFTER_KILL;
        const waitTime = endTime -  startTime;
        await this.setRecordingProperties(startTime, endTime, false); // make sure we arent recording
        await this.setPlaybackProperties(startTime, true);
        await sleepInSeconds(2);
        await this.setPlaybackProperties(startTime, false);
        await this.setRenderProperties();
        await sleepInSeconds(2);
        await this.setRecordingProperties(startTime, endTime, true);
        this.lockCamera();
        await this.waitForRecordingToFinish(waitTime);
        EventService.publish('clipProgress', `Clip recorded succcessfully...`);
        EventService.publish('renderingComplete', this.filePath);
    };

    async setRenderProperties(){
        const options = {
            'interfaceTimeline' : false,
        }
        return await this.replay.postRenderProperties(options);
    }

    async setPlaybackProperties(startTime, isPaused){
        let options = {
            'time'      : startTime,
            'paused'    : isPaused || false,
            'seeking'   :  false,
            'speed'     : 1.0,
            'length'    : 0
        }
        console.log(options);
        let res = await this.replay.postPlaybackProperties(options);
        console.log(res);
    }

    lockCamera(){
        const teamId = this.MultiKillMatch.teamId;
        const role = this.MultiKillMatch.role;
        let cameraLockKey;
        if(teamId == '100') {
            cameraLockKey = BlueSideCameraControlsByRole[`${role}`];
        } else {
            cameraLockKey = RedSideCameraControlsByRole[`${role}`];
        }     
        Robot.keyTap(`s`); 
        Robot.keyTap(`${cameraLockKey}`);
        Robot.keyTap(`${cameraLockKey}`);
    }

    async setRecordingProperties(startTime, endTime, isRecording){
        const options = {
            'startTime'     : startTime,
            'endTime'       : endTime,
            'recording'     : isRecording,
            'path'          : this.filePath
        }
        return await this.replay.postRecordingProperties(options);
    }

    async waitForRecordingToFinish(time){
        let waitTime = time;
        let recording;
        do {
            EventService.publish('clipProgress', `Clipping in progress...`);
            await sleepInSeconds(waitTime);
            let recordingState = await this.replay.getRecordingProperties();
            recording = recordingState.recording;
            waitTime = recordingState.endTime - recordingState.currentTime;
        } while(recording && waitTime > 0);   
    }
}

module.exports = { MultiKillClip };




// import Robot from 'robotjs';
// import ReplayRequests from './ReplayRequests';
// import {sleepInSeconds} from './Utilities/UtilityFunctions.js';
// import {
//     ChampIdToName,  
//     BlueSideCameraControlsByRole, 
//     RedSideCameraControlsByRole, 
//     MultiKillsSingular
// } from './Utilities/Constants.js';