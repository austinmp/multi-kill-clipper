import { windowManager, Window } from 'node-window-manager';

export function getWindowId(pid) {
  const windows = windowManager.getWindows();
  for (const window of windows) {
    if (window.processId == pid) {
      return new Window(window.id);
    }
  }
  throw new Error('Failed to find a running instance of a League of Legends replay');
}

export function bringWindowToFocus(pid) {
  const replayWindow = getWindowId(pid);
  replayWindow.bringToTop();
}
