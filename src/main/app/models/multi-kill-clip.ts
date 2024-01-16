import { sleepInSeconds } from '../utils/utils';
import EventService from './event-service';
import {
  TIME_TO_CLIP_AFTER_KILL,
  TIME_TO_CLIP_BEFORE_KILL,
  EVENT_SERVICE_CHANNEL,
} from '../constants';

import MultiKill from './multi-kill';
import MultiKillMatch from './multi-kill-match';

class MultiKillClip {
  replay: any;

  multiKillMatch: MultiKillMatch;

  multiKill: MultiKill;

  format: string;

  filePath: string;

  constructor(
    replay: any,
    multiKillMatch: MultiKillMatch,
    multiKill: MultiKill,
    filePath: string,
  ) {
    this.replay = replay;
    this.multiKillMatch = multiKillMatch;
    this.multiKill = multiKill;
    this.format = 'webm';
    this.filePath = filePath + this.getClipName();
  }

  getClipName() {
    const { summonerName, championName, matchDate } = this.multiKillMatch;
    const nameOfKill = this.multiKill.type;
    return `/${matchDate}-${summonerName}-${championName}-${nameOfKill}.${this.format}`;
  }

  async createClip() {
    const startTime = this.multiKill.start - TIME_TO_CLIP_BEFORE_KILL;
    const endTime = this.multiKill.end + TIME_TO_CLIP_AFTER_KILL;
    const waitTime = endTime - startTime;
    await this.setRecordingProperties(startTime, endTime, false); // make sure we arent recording
    await this.setRenderProperties();
    await sleepInSeconds(2);
    await this.setPlaybackProperties(startTime, false);
    await sleepInSeconds(2);
    await this.setRecordingProperties(startTime, endTime, true);
    await this.waitForRecordingToFinish(waitTime);
    EventService.publish(
      EVENT_SERVICE_CHANNEL.CLIP_PROGRESS,
      `Clip recorded succcessfully...`,
    );
    EventService.publish(
      EVENT_SERVICE_CHANNEL.CLIPPING_COMPLETE,
      this.filePath,
    );
  }

  async setRenderProperties() {
    const options = {
      interfaceTimeline: false,
      cameraAttached: true, // cameraAttatched setting only works when cameraMode=fps
      selectionName: this.multiKillMatch.summonerName,
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
