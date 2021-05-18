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
        await this.setRenderProperties();
        await this.setPlaybackProperties(startTime);
        this.lockCamera();
        await this.setRecordingProperties(startTime, endTime)
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

    async setPlaybackProperties(startTime){
        const options = {
            'time'      : startTime,
            'paused'    : false,
            'speed'     : 1.0
        }
        return await this.replay.postPlaybackProperties(options);
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

    async setRecordingProperties(startTime, endTime){
        const options = {
            'startTime'     : startTime,
            'endTime'       : endTime,
            'recording'     : true,
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