const { spliceString, isEmpty } = require('../utils/utils.js');
const { CustomError }           = require('./custom-error.js');
const find                      = require('find-process');

class LeagueClientConnector {

    constructor(){
        this.credentials = {};
        this.processInformation = '';
        this.pid = ''
    }

    // Before every request, we check to see if client is running
    async getClientCredentials(){
        if(!isEmpty(this.credentials) && this.isClientRunning()) return this.credentials;
        const processInformation = await this.getClientProcessInformation();
        this.setClientProcessInformation(processInformation);
        return this.credentials;
    };

    async isClientRunning() {  
        try {
            const pid = (this.pid.length > 0) ? this.pid : await this.getClientPid();
            let isRunning = process.kill(pid, 0);
            return isRunning;
        } catch (error) {
            return false;
        }
    }
    
    async getClientProcessInformation(){
        const response = await find('name', 'LeagueClientUx.exe'); 
        if(Array.isArray(response) && response.length != 0){
            this.processInformation = response[0].cmd;
            return this.processInformation;
        } else {
            throw new CustomError("Failed to find the league client process. Please make sure the client is running.");
        }
    }

    async setClientProcessInformation(processInformation){
        const passwordFieldStartIndex = processInformation.search("--remoting-auth-token=") + ("--remoting-auth-token=".length);
        const portFieldStartIndex = processInformation.search('--app-port=') + ('--app-port='.length);
        this.credentials = {
            user        : 'riot',
            host        : 'https://127.0.0.1',
            password    : spliceString(processInformation, passwordFieldStartIndex, '"'),
            port        : spliceString(processInformation, portFieldStartIndex , '"')
        };
        this.pid = await this.getClientPid();
    }

    async getClientPid(){
        if(this.pid.length > 0) return this.pid;
        const processInformation = await this.getClientProcessInformation();
        const pidStartIndex =  processInformation.search("--app-pid=") + "--app-pid=".length;
        const pid = spliceString(processInformation, pidStartIndex, '"');
        return pid;
    };
}

module.exports = new LeagueClientConnector();
