import { keyTap } from 'robotjs';
import {
  BlueSideCameraControlsByRole, RedSideCameraControlsByRole, TIME_TO_CLIP_AFTER_KILL, TIME_TO_CLIP_BEFORE_KILL,
} from '@main/constants';
import { sleepInSeconds } from '@main/utils/utils';
import { EventService } from '@main/models/event-service';

export class MultiKillClip {
  constructor(replay, MultiKillMatch, indexOfKill, filePath) {
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
    await this.setPlaybackProperties(startTime, true);
    await sleepInSeconds(2);
    await this.setPlaybackProperties(startTime, false);
    await this.setRenderProperties();
    await sleepInSeconds(2);
    await this.setRecordingProperties(startTime, endTime, true);
    this.lockCamera();
    await this.waitForRecordingToFinish(waitTime);
    EventService.publish('clipProgress', 'Clip recorded succcessfully...');
    EventService.publish('renderingComplete', this.filePath);
  }

  async setRenderProperties() {
    const options = {
      interfaceTimeline: false,
    };
    return await this.replay.postRenderProperties(options);
  }

  async setPlaybackProperties(startTime, isPaused) {
    const options = {
      time: startTime,
      paused: isPaused || false,
      seeking: false,
      speed: 1.0,
      length: 0,
    };
    const res = await this.replay.postPlaybackProperties(options);
  }

  lockCamera() {
    const { teamId } = this.MultiKillMatch;
    const { role } = this.MultiKillMatch;
    let cameraLockKey;
    if (teamId == '100') {
      cameraLockKey = BlueSideCameraControlsByRole[`${role}`];
    } else {
      cameraLockKey = RedSideCameraControlsByRole[`${role}`];
    }
    keyTap('s');
    keyTap(`${cameraLockKey}`);
    keyTap(`${cameraLockKey}`);
  }

  async setRecordingProperties(startTime, endTime, isRecording) {
    const options = {
      startTime,
      endTime,
      recording: isRecording,
      path: this.filePath,
    };
    return await this.replay.postRecordingProperties(options);
  }

  async waitForRecordingToFinish(time) {
    let waitTime = time;
    let recording;
    do {
      EventService.publish('clipProgress', 'Clipping in progress...');
      await sleepInSeconds(waitTime);
      const recordingState = await this.replay.getRecordingProperties();
      recording = recordingState.recording;
      waitTime = recordingState.endTime - recordingState.currentTime;
    } while (recording && waitTime > 0);
  }
}
