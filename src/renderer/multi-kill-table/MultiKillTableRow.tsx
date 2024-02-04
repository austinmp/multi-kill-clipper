import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { useState } from 'react';
import styles from '../multi-kill-clipper.module.css';
import MultiKill from '../../main/app/models/multi-kill';
import MultiKillMatch from '../../main/app/models/multi-kill-match';
import KillTagCell from './KillTagCell';
import MatchInfoCell from './MatchInfoCell';
import { MULTI_KILLS } from '../../main/app/constants';
import { convertSecondsToHMS } from '../../main/app/utils/utils';

type MultiKillTableRowProps = {
  row: MultiKillMatch;
  selectedMultiKill: MultiKill | null;
  handleMultiKillSelect: (
    multiKillMatch: MultiKillMatch,
    multiKill: MultiKill,
  ) => void;
};

export default function MultiKillTableRow({
  row,
  selectedMultiKill,
  handleMultiKillSelect,
}: MultiKillTableRowProps) {
  const isSelected = (multiKill: MultiKill) =>
    selectedMultiKill?.id === multiKill.id;

  const [open, setOpen] = useState(false);
  /*
    Sort the multi kill types in ascending order (First Blood, Double, Triple, Quadra, Penta)
  */
  const getSortedMultiKillTypes = (multiKillTypes: string[]): string[] => {
    const sorted: string[] = [];
    Object.values(MULTI_KILLS).forEach((value) => {
      if (multiKillTypes.includes(value.singular)) {
        sorted.push(value.singular);
      }
    });
    return sorted;
  };

  /*
    Get all distinct multi kill types
  */
  let multiKillTypes: string[] = [];
  row.multiKills.forEach((multiKill: MultiKill) => {
    if (!multiKillTypes.includes(multiKill.type)) {
      multiKillTypes.push(multiKill.type);
    }
  });

  multiKillTypes = getSortedMultiKillTypes(multiKillTypes);

  return (
    <>
      <TableRow
        sx={{ '& > *': { borderBottom: 'unset' } }}
        className={styles.multiKillTableMainRow}
        onClick={() => setOpen(!open)}
      >
        <TableCell align="left">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(event) => {
              event.stopPropagation(); // Prevent the row from also triggering the onRowOpen
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <KillTagCell multiKillTypes={multiKillTypes} />
        <MatchInfoCell multiKillMatch={row} />
        <TableCell align="left">{row.role}</TableCell>
        <TableCell align="left">{row.championName}</TableCell>
        <TableCell align="left">
          {`${row.kills} / ${row.deaths} / ${row.assists}`}
        </TableCell>
        <TableCell align="left">{row.matchDate}</TableCell>
      </TableRow>
      {/* Expanded Row View */}
      {open && (
        <TableRow className={styles.multiKillTableExpandedRow}>
          <TableCell colSpan={4} />
          <TableCell
            className={styles.multiKillTableExpandedRowCell}
            colSpan={3}
          >
            <Collapse
              in={open}
              timeout={{ enter: 2000, exit: 500 }}
              unmountOnExit
            >
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="details">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right" />
                      <TableCell align="right">
                        <b>Multi Kill Type</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Timestamp</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.multiKills.map((multiKill: MultiKill) => (
                      <TableRow
                        hover
                        onClick={() => handleMultiKillSelect(row, multiKill)}
                        role="checkbox"
                        aria-checked={isSelected(multiKill)}
                        tabIndex={-1}
                        key={`${multiKill.id}`}
                        selected={isSelected(multiKill)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox" align="right">
                          <Checkbox
                            color="primary"
                            checked={isSelected(multiKill)}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row" align="right">
                          <Chip
                            label={multiKill.type}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {convertSecondsToHMS(multiKill.start)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
