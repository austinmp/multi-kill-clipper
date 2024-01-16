import path from 'path';
import { shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from '../menu';
import { resolveHtmlPath } from '../util';
import LeagueClient from '../app/apis/league-client';
import MultiKillClipperMain from '../app/controllers/MultiKillClipperMain';
import EventService from '../app/models/event-service';
import { EVENT_SERVICE_CHANNEL } from '../app/constants';
import IPC_CHANNEL from './ipc-channels';
import Summoner from '../app/models/summoner';
import MultiKillMatch from '../app/models/multi-kill-match';
import MultiKill from '../app/models/multi-kill';
import CustomError from '../app/models/custom-error';

export const getLoggedInSummoner = async (event: any) => {
  try {
    const response = await LeagueClient.getCurrentSummoner();
    return response; // This will be sent back to the renderer process
  } catch (error: any) {
    return { error: error.message }; // Send back error information if needed
  }
};

export const getMultiKills = async (
  event: any,
  summonerName: string,
  multiKillTypes: number[],
  currentSummoner: Summoner,
  tagline: string,
) => {
  try {
    const multiKillClipper = new MultiKillClipperMain(
      summonerName,
      multiKillTypes,
      currentSummoner,
      tagline,
    );
    const response = await multiKillClipper.getMultiKills();
    return response; // This will be sent back to the renderer process
  } catch (error: any) {
    return { error: error?.message };
  }
};

export const getHighlightsPath = async (event: any) => {
  try {
    const response = await LeagueClient.getHighlightsFolderPath();
    return response;
  } catch (error: any) {
    return { error: error?.message };
  }
};

export const createClip = async (
  event: any,
  multiKillMatch: MultiKillMatch,
  multiKill: MultiKill,
) => {
  try {
    const resp = await MultiKillClipperMain.createMultiKillClip(
      multiKillMatch,
      multiKill,
    );
  } catch (error: any) {
    return { error: error.message };
  }
};

export const openFile = (event: any, filePath: string) => {
  shell.openPath(filePath).catch((err) => {
    console.error('Error opening file:', err);
  });
};
