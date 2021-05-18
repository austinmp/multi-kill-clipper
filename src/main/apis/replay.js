const { sleepInSeconds }    = require('../utils/utils.js');
const { CustomError }       = require('../models/custom-error.js');
const { makeRequest }       = require('../models/requests.js');
const EventService          = require('../models/event-service');

class Replay {
    
    constructor(){
        this.url = 'https://127.0.0.1:2999';
    }

    async init(){
        try {
            const pid = await this.getProcessId();
            this.setProcessId(pid);
        } catch(error){
            console.log(error);
        }
    }

    setProcessId(pid){
        this.pid = pid;
    };

    async getProcessId(){
        if(!this.pid === undefined) return this.pid;
        const replayData = await makeRequest('GET', this.url + '/replay/game');
        return replayData.processID;
    };

    async exit(){
        try {
            const pid = await this.getProcessId();
            process.kill(pid);
        } catch(err){
            // shhhh...
        }
    };

    async getPlaybackProperties(){
        return await makeRequest('GET', this.url + '/replay/playback');
    };

    async postPlaybackProperties(options){
        return await makeRequest('POST', this.url + '/replay/playback', {}, options);
    }

    async getRecordingProperties(){
        return await makeRequest('GET', this.url + '/replay/recording');
    };

    async postRecordingProperties(options){
        return await makeRequest('POST', this.url + '/replay/recording', {}, options);
    };

    async postRenderProperties(options){
        return await makeRequest('POST', this.url + '/replay/render', {}, options);
    }

    async load(timeout, numRetries){
        let responseReceived = false;
        do {
            try {
                await this.getPlaybackProperties();
                await this.getRecordingProperties();
                responseReceived = true;
            } catch(err){
                numRetries--;
                EventService.publish('clipProgress', `Loading replay...`);
                console.log(`Couldnt connect to replay API, waiting ${timeout} seconds then retrying (${numRetries} retries remaining).`);
                await sleepInSeconds(timeout);
            }
        } while(!responseReceived && numRetries > 0 );
        if(numRetries <= 0){
            throw new CustomError("Failed to launch replay. Please ensure the replay API is enabled and the client is running, then try again");
        } 
        await this.waitForAssetsToLoad();
        EventService.publish('clipProgress', `Replay loaded succcessfully...`);
    };

    async waitForAssetsToLoad(){
        let playbackState;
        let paused;
        let time;
        do {
            EventService.publish('clipProgress', `Waiting for game assets to load...`);
            playbackState = await this.getPlaybackProperties();
            time = playbackState.time;
            paused = playbackState.paused;
        } while(time < 15 && !paused);
    };

}

module.exports = { Replay };


// import {sleepInSeconds} from './Utilities/UtilityFunctions.js';
// import {makeRequest} from './RequestFactory.js';