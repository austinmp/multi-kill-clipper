import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import styles from '../multi-kill-clipper.module.css';
import MultiKill from '../../main/app/models/multi-kill';
import MultiKillMatch from '../../main/app/models/multi-kill-match';
import MultiKillTableRow from './MultiKillTableRow';

type MultiKillTableProps = {
  multiKillMatches: MultiKillMatch[] | null;
  selectedMultiKill: MultiKill | null;
  setSelectedMultiKillMatch: (multiKillMatch: MultiKillMatch | null) => void;
  setSelectedMultiKill: (multiKill: MultiKill | null) => void;
};

export default function MultiKillTable({
  multiKillMatches,
  selectedMultiKill,
  setSelectedMultiKillMatch,
  setSelectedMultiKill,
}: MultiKillTableProps) {
  const handleMultiKillSelect = (
    multiKillMatch: MultiKillMatch,
    multiKill: MultiKill,
  ) => {
    if (selectedMultiKill?.id === multiKill.id) {
      // deselect if currently selected
      setSelectedMultiKill(null);
    } else {
      setSelectedMultiKill(multiKill);
      setSelectedMultiKillMatch(multiKillMatch);
    }
  };

  return (
    <TableContainer sx={{ maxHeight: 500, width: '90vw' }}>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow className={styles.tableHeader}>
            <TableCell />
            <TableCell align="center">Multi Kill(s)</TableCell>
            <TableCell align="center">Match Result</TableCell>
            <TableCell align="left">Role</TableCell>
            <TableCell align="left">Champion</TableCell>
            <TableCell align="left">K/D/A</TableCell>
            <TableCell align="left">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {multiKillMatches?.map((multiKillMatch: MultiKillMatch) => (
            <MultiKillTableRow
              key={multiKillMatch.matchId}
              row={multiKillMatch}
              selectedMultiKill={selectedMultiKill}
              handleMultiKillSelect={handleMultiKillSelect}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
