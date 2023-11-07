import { secondsToMinutesFormatted } from '@main/utils/utils';
import { RolesEnum } from '@main/constants';

export function clearTable() {
  const table = document.getElementById('multiKillTable');
  const tableBody = table.getElementsByTagName('tbody')[0];
  while (tableBody.hasChildNodes()) {
    tableBody.removeChild(tableBody.firstChild);
  }
}

export function createTable(matches) {
  const table = document.getElementById('multiKillTable');
  const tableBody = table.getElementsByTagName('tbody')[0];
  let matchIndex = 0;
  let rowIndex = 1; // header row already exists
  for (const match of matches) {
    let killIndex = 0;
    for (const multiKill of match.multiKills) {
      const rowData = [match.championName, match.role, multiKill.type, secondsToMinutesFormatted(multiKill.start), match.matchId, match.matchDate];
      addTableRow(tableBody, rowData, matchIndex, killIndex, rowIndex);
      killIndex += 1;
      rowIndex += 1;
    }
    matchIndex += 1;
  }
}

function addTableRow(table, data, matchIndex, killIndex, rowIndex) {
  const row = table.insertRow();
  row.id = `row${rowIndex}`;
  row.name = `${matchIndex}`;
  row.className = 'multiKill';
  row.setAttribute('kill-index', `${killIndex}`);
  row.setAttribute('row-index', `${rowIndex}`);
  addCheckboxToRow(row, rowIndex);
  addDataToRow(row, rowIndex, data);
  addEventListenerToRow(row, rowIndex);
}

function getRoleSelectMenu(rowIndex, assumedRole) {
  const roleSelectMenu = document.getElementById('roleSelectMenuTemplate');
  const menu = roleSelectMenu.cloneNode('true');
  menu.id = `row${rowIndex}RoleSelectMenu`;
  menu.classList.remove('displayNone');
  menu.setAttribute('row-index', `${rowIndex}`);
  selectAssumedRole(menu, assumedRole);
  return menu;
}

function selectAssumedRole(menu, assumedRole) {
  const role = (assumedRole in RolesEnum) ? RolesEnum[assumedRole] : RolesEnum.TOP;
  menu.options[role].selected = true;
}

function addCheckboxToRow(row, rowIndex) {
  const cell = row.insertCell();
  const checkbox = document.createElement('INPUT');
  checkbox.setAttribute('type', 'radio');
  checkbox.id = `checkbox${rowIndex}`;
  checkbox.name = 'multiKillCheckbox';
  addEventListenerToCheckbox(checkbox, rowIndex);
  cell.appendChild(checkbox);
}

function addEventListenerToCheckbox(checkbox, rowIndex) {
  checkbox.addEventListener('click', () => {
    toggleCheckbox(rowIndex);
  });
}

function addDataToRow(row, rowIndex, data) {
  const roleColumnNum = 1;
  for (let i = 0; i < data.length; i++) {
    const cell = row.insertCell();
    let cellContent;
    if (i === roleColumnNum) {
      cellContent = getRoleSelectMenu(rowIndex, data[i]);
    } else {
      cellContent = document.createTextNode(data[i]);
    }
    cell.appendChild(cellContent);
  }
}

function addEventListenerToRow(row, rowIndex) {
  row.addEventListener('click', (event) => {
    if (event.target.name == 'roleSelectMenu') {
      // prevents selecting a menu option from turning row highlight off
      if (!isRowHighlighted(row)) {
        toggleCheckbox(rowIndex);
        highlightSelectedRowOnly(row);
      }
    } else {
      toggleCheckbox(rowIndex);
      highlightSelectedRowOnly(row);
    }
  });
}

function isRowHighlighted(row) {
  return row.classList.contains('rowHighlightOn');
}

function toggleCheckbox(rowIndex) {
  const checkbox = document.getElementById(`checkbox${rowIndex}`);
  checkbox.checked = !checkbox.checked;
}

function highlightSelectedRowOnly(row) {
  // if the clicked row is already highlighted we need to turn highlight off
  const alreadyHighlighed = row.classList.contains('rowHighlightOn');
  const allRows = document.getElementsByClassName('multiKill');

  for (const row of allRows) {
    toggleRowColor(row, 'off');
  }

  if (!alreadyHighlighed) toggleRowColor(row, 'on');
}

function toggleRowColor(row, setting) {
  if (setting == 'on') {
    row.classList.add('rowHighlightOn');
  } else {
    row.classList.remove('rowHighlightOn');
  }
}
