import { sleepInSeconds } from '../utils/utils';
import EventService from './event-service';
import {
  TIME_TO_CLIP_AFTER_KILL,
  TIME_TO_CLIP_BEFORE_KILL,
} from '../constants';

class MultiKillClip {
  replay: any;

  MultiKillMatch: any;

  kill: any;

  indexOfKill: any;

  format: string;

  filePath: string;

  constructor(
    replay: any,
    MultiKillMatch: any,
    indexOfKill: any,
    filePath: string,
  ) {
    this.replay = replay;
    this.MultiKillMatch = MultiKillMatch;
    this.kill = MultiKillMatch.multiKills[indexOfKill];
    this.indexOfKill = indexOfKill;
    this.format = 'webm';
    this.filePath = filePath + this.getClipName();
  }

  getClipName() {
    const { summonerName } = this.MultiKillMatch;
    const { championName } = this.MultiKillMatch;
    const nameOfKill = this.kill.type;
    const { matchDate } = this.MultiKillMatch;
    const killIndex = this.indexOfKill + 1;
    return `/${summonerName}-${championName}-${nameOfKill}-${matchDate}(${killIndex}).${this.format}`;
  }

  async createClip() {
    const startTime = this.kill.start - TIME_TO_CLIP_BEFORE_KILL;
    const endTime = this.kill.end + TIME_TO_CLIP_AFTER_KILL;
    const waitTime = endTime - startTime;
    await this.setRecordingProperties(startTime, endTime, false); // make sure we arent recording
    await this.setRenderProperties();
    await sleepInSeconds(2);
    await this.setPlaybackProperties(startTime, false);
    await sleepInSeconds(2);
    await this.setRecordingProperties(startTime, endTime, true);
    await this.waitForRecordingToFinish(waitTime);
    EventService.publish('clipProgress', `Clip recorded succcessfully...`);
    EventService.publish('renderingComplete', this.filePath);
  }

  async setRenderProperties() {
    const options = {
      interfaceTimeline: false,
      cameraAttached: true, // cameraAttatched setting only works when cameraMode=fps
      selectionName: this.MultiKillMatch.summonerName,
      cameraMode: 'fps',
      selectionOffset: {
        x: 0.0,
        y: 1911.85,
        z: -1200.0,
      },
    };
    return this.replay.postRenderProperties(options);
  }

  async setPlaybackProperties(startTime: any, isPaused: any) {
    const options = {
      time: startTime,
      paused: isPaused || false,
      seeking: false,
      speed: 1.0,
      length: 0,
    };
    await this.replay.postPlaybackProperties(options);
  }

  async setRecordingProperties(startTime: any, endTime: any, isRecording: any) {
    const options = {
      startTime,
      endTime,
      recording: isRecording,
      path: this.filePath,
    };
    return this.replay.postRecordingProperties(options);
  }

  async waitForRecordingToFinish(time: any) {
    let waitTime = time;
    let recording;
    do {
      EventService.publish('clipProgress', `Clipping in progress...`);
      await sleepInSeconds(waitTime);
      const recordingState = await this.replay.getRecordingProperties();
      recording = recordingState.recording;
      waitTime = recordingState.endTime - recordingState.currentTime;
    } while (recording && waitTime > 0);
  }
}

export { MultiKillClip };
