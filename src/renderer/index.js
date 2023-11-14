const { CustomError }   = require('../main/models/custom-error.js');
const { ipcRenderer }   = require('electron');
const EventService      = require('../main/models/event-service.js');
const Controller        = require('../main/controllers/multi-kill-clipper.js');
const MultiKillTable    = require('./multi-kill-table.js');



window.addEventListener('DOMContentLoaded', async function(){
    addEventListenerToSearchGamesButton();
    addEventListenerToSelectAllCheckbox();
    clickSearchGamesButtonOnEnterKeyPress();
    addEventListenerToClipButton();
    addEventListenerToCancelButton();
    addEventListenerToCollapseButton();
    listenForBackEndEvents();
});

function addEventListenerToSearchGamesButton(){
    const form = document.getElementById('form');
    form.addEventListener('submit', async function(event){
        event.preventDefault(); // prevent default refresh
        if(!isValidForm()){
            alert("Please select at least one kill type.");
        } else {
            let summonerName = document.getElementById('summonerNameInput').value.trim();
            if (summonerName) {
                const cleanedSummonerName = summonerName.replace(/ /g, "%20"); // replaces spaces in name
                const selectedKillTypes = getSelectedKillTypes();
                collapseAboutSection();
                clearMultiKillTable();
                toggleHTMLElementDisplay('loading', 'on');
                try {
                    const multiKillMatches =  await Controller.getMultiKillMatches(cleanedSummonerName, selectedKillTypes);
                    createMultiKillTable(multiKillMatches);
                } catch(error){
                    console.log(error);
                    showError(error);
                } finally {
                    toggleHTMLElementDisplay('loading', 'off');
                }
            } else {
                showError(new CustomError("Please enter a valid summoner name."));
            }
        }
    })
}

function isValidForm(){
    const selectedKillTypes = getSelectedKillTypes();
    if(selectedKillTypes.length === 0) return false;
    return true;
}

function getSelectedKillTypes(){
    const killTypes = document.getElementsByName('killType');
    let selectedKillTypes = []
    for(let kill of killTypes){
        if(kill.checked){   
            selectedKillTypes.push(kill.value);
        }
    }
    return selectedKillTypes;
}

function toggleHTMLElementDisplay(elementId, setting){
    const element = document.getElementById(`${elementId}`);
    if(setting == 'on' && element.classList.contains('displayNone')){
        element.classList.remove('displayNone');
    } else {
        element.classList.add('displayNone');
    }
}

function createMultiKillTable(multiKillMatches){
    clearMultiKillTable();
    MultiKillTable.createTable(multiKillMatches);
    clipMultiKillButton('enable');
}

function clearMultiKillTable(){
    MultiKillTable.clearTable();
    clipMultiKillButton('disable');
}

function clipMultiKillButton(setting){
    let clipMultiKillButton = document.getElementById("clipMultiKillButton");
    if(setting == 'enable'){
        clipMultiKillButton.disabled = false;
    } else {
        clipMultiKillButton.disabled = true;
    }
}

function showError(error) {
    if(error instanceof CustomError){
        alert(error.message);
    } else {
        alert("An unexpected error occured, please try again.")
    }
}

function clickSearchGamesButtonOnEnterKeyPress(){
    const searchGamesButton = document.getElementById('searchGamesButton');
    window.addEventListener("keydown", function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchGamesButton.click();
        }
    });
}

function addEventListenerToSelectAllCheckbox(){
    const killTypes = document.getElementsByName('killType');
    const selectAll = document.getElementById('selectAll');
    selectAll.addEventListener('click', function(event){
        const isChecked = selectAll.checked;
        for(let kill of killTypes){
            kill.checked = isChecked;
        }
    });
}

function addEventListenerToClipButton(){
    const clipButton = document.getElementById('clipMultiKillButton');
    clipButton.addEventListener('click', async function(event){
        event.preventDefault();
        const dataFromSelectedRows = getMatchDataFromSelectedRows();
        if(dataFromSelectedRows.length === 0){
            alert("Please select at least one multi-kill to clip.");
        } else {
            toggleHTMLElementDisplay('loading', 'on');
            collapseAboutSection();
            try {           
                await Controller.clipMultiKills(dataFromSelectedRows);
            } catch(error){
                console.log(error);
                showError(error);
            } finally {
                toggleHTMLElementDisplay('loading', 'off');
            }
        }
    });
}

function getMatchDataFromSelectedRows(){
    let tableRows = document.getElementsByClassName('multiKill');
    let checkboxes = document.getElementsByName('multiKillCheckbox');
    let selectedMultiKills = [];
    for(let i = 0; i <checkboxes.length; i++){
        let matchIndex = tableRows[i].name;
        let killIndex = tableRows[i].getAttribute('kill-index');
        if(checkboxes[i].checked){
            selectedMultiKills.push( {
                    'matchIndex': matchIndex,
                    'killIndex' : killIndex,
                    'role'      : getSelectedRole(tableRows[i])
                });
        }
    }
    return selectedMultiKills;
}

function getSelectedRole(row){
    const options = document.getElementById(`${row.id}RoleSelectMenu`).options;
    let selectedRole;
    for(let role of options){
        if(role.selected){
            selectedRole = role.value;
        }
    }
    return selectedRole;
}

function addEventListenerToCancelButton(checkbox, rowIndex){
    const cancelButton = document.getElementById("cancelButton");
    cancelButton.addEventListener('click', function(){
        EventService.publish('cancelRequest'); // Kill clipping process
        ipcRenderer.sendSync('cancelRequest'); // Refresh front end
    });    
}

function listenForBackEndEvents(){
    EventService.subscribe('clipProgress', printProgress);
    EventService.subscribe('renderingComplete', showFilePathOfClip);
}

function printProgress(data){
    const statusText = document.getElementById("statusText").innerHTML = data;
}

function showFilePathOfClip(data){
    const filePathSection = document.getElementById('clipFilePath');
    alert(`Clip saved successfully at the following location: ${data}`);
}


function addEventListenerToCollapseButton(){
    const collapseAbout = document.getElementById('collapseAbout');
    collapseAbout.addEventListener('click', function(event){
        toggleHTMLElementDisplay('aboutContent', 'on');
        collapseButton.classList.toggle('collapsed');  
        if(collapseButton.classList.contains('collapsed')){
            collapseButton.innerHTML = '+';
        } else {
            collapseButton.innerHTML = '-';
        }
    });
}

function collapseAboutSection(){
    toggleHTMLElementDisplay('aboutContent', 'off');
    collapseButton.classList.add('collapsed');
    collapseButton.innerHTML = '+';
}