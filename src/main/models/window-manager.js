
const WindowManager = require('node-window-manager');

function bringWindowToFocus(pid){
    const replayWindow = getWindowId(pid);
    replayWindow.bringToTop();
}
    
function getWindowId(pid){
    const windows = WindowManager.windowManager.getWindows();
    for(let window of windows){
        if(window.processId == pid){
            return new WindowManager.Window(window.id);
        }
    }
    throw new Error("Failed to find a running instance of a League of Legends replay");
}

module.exports = { bringWindowToFocus };
// import WindowManager from 'node-window-manager';
// export {bringWindowToFocus};




