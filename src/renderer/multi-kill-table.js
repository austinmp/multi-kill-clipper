const { secondsToMinutesFormatted } = require('../main/utils/utils.js');
const { RolesEnum } = require('../../config/constants.js');

function clearTable(){
    const table = document.getElementById('multiKillTable');
    const tableBody = table.getElementsByTagName('tbody')[0];
    while(tableBody.hasChildNodes()){
       tableBody.removeChild(tableBody.firstChild);
    }
}

function createTable(matches){
    const table = document.getElementById('multiKillTable');
    const tableBody = table.getElementsByTagName('tbody')[0];
    let matchIndex = 0;
    let rowIndex = 1; // header row already exists
    for(let match of matches){
        let killIndex = 0;
        for(let multiKill of match.multiKills){
            let rowData = [match.championName, match.role, multiKill.type, secondsToMinutesFormatted(multiKill.start), match.matchId, match.matchDate];
            addTableRow(tableBody, rowData, matchIndex, killIndex, rowIndex);
            killIndex++;
            rowIndex++
        }
        matchIndex++;
    }
}

function addTableRow(table, data, matchIndex, killIndex, rowIndex){
    let row = table.insertRow();
    row.id = `row${rowIndex}`;
    row.name = `${matchIndex}`;
    row.className = `multiKill`;
    row.setAttribute('kill-index', `${killIndex}`);
    row.setAttribute('row-index', `${rowIndex}`);
    addCheckboxToRow(row, rowIndex);
    addDataToRow(row, rowIndex, data);
    addEventListenerToRow(row, rowIndex);
}

function getRoleSelectMenu(rowIndex, assumedRole){
    let roleSelectMenu = document.getElementById('roleSelectMenuTemplate');
    let menu = roleSelectMenu.cloneNode('true');
    menu.id = `row${rowIndex}RoleSelectMenu`;
    menu.classList.remove('displayNone');
    menu.setAttribute('row-index', `${rowIndex}`);
    selectAssumedRole(menu, assumedRole);
    return menu;
}

function selectAssumedRole(menu, assumedRole){
    let role = (assumedRole in RolesEnum) ? RolesEnum[assumedRole] : RolesEnum['TOP'];
    menu.options[role].selected = true;
}

function addCheckboxToRow(row, rowIndex){
    let cell = row.insertCell();
    let checkbox = document.createElement("INPUT");
    checkbox.setAttribute("type", "radio");
    checkbox.id= `checkbox${rowIndex}`;
    checkbox.name= `multiKillCheckbox`;
    addEventListenerToCheckbox(checkbox, rowIndex);
    cell.appendChild(checkbox);
}

function addEventListenerToCheckbox(checkbox, rowIndex){
    checkbox.addEventListener('click', function(){
        toggleCheckbox(rowIndex);
    });
}

function addDataToRow(row, rowIndex, data){
    const roleColumnNum = 1;
    for(let i = 0; i < data.length; i++){
        let cell = row.insertCell();
        let cellContent;
        if(i === roleColumnNum ){
            cellContent = getRoleSelectMenu(rowIndex, data[i]);
        } else {
            cellContent = document.createTextNode(data[i]);
        }
        cell.appendChild(cellContent);
    }
}

function addEventListenerToRow(row, rowIndex){
    row.addEventListener('click', function(event){
        if(event.target.name == 'roleSelectMenu'){
            // prevents selecting a menu option from turning row highlight off
            if(!isRowHighlighted(row)){
                toggleCheckbox(rowIndex);
                highlightSelectedRowOnly(row);
            } 
        } else {
            toggleCheckbox(rowIndex);
            highlightSelectedRowOnly(row);
        }
    });
};

function isRowHighlighted(row){
    return row.classList.contains('rowHighlightOn');
}

function toggleCheckbox(rowIndex){
    let checkbox = document.getElementById(`checkbox${rowIndex}`);
    checkbox.checked = !checkbox.checked;
}

function highlightSelectedRowOnly(row){
    // if the clicked row is already highlighted we need to turn highlight off
   let alreadyHighlighed= row.classList.contains("rowHighlightOn"); 
   let allRows = document.getElementsByClassName("multiKill");

   for(let row of allRows){
       toggleRowColor(row, 'off');
   }
   
   if(!alreadyHighlighed) toggleRowColor(row, 'on');
}

function toggleRowColor(row, setting){
    if(setting == 'on'){
        row.classList.add("rowHighlightOn");
    } else {
        row.classList.remove("rowHighlightOn");
    }
}

module.exports = { clearTable, createTable}