import IPC_CHANNEL from './ipc-channels';
import {
  getMultiKills,
  getLoggedInSummoner,
  getHighlightsPath,
  createClip,
  openFile,
} from './ipc-handlers';

const IPC_CHANNEL_TO_HANDLER = {
  [IPC_CHANNEL.GET_MULTI_KILLS]: getMultiKills,
  [IPC_CHANNEL.GET_HIGHLIGHTS_PATH]: getHighlightsPath,
  [IPC_CHANNEL.GET_LOGGED_IN_SUMMONER]: getLoggedInSummoner,
  [IPC_CHANNEL.CREATE_CLIP]: createClip,
  [IPC_CHANNEL.OPEN_FILE]: openFile,
};

export default IPC_CHANNEL_TO_HANDLER;
