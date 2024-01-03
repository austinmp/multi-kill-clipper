import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Checkbox from '@mui/material/Checkbox';
import MultiKillMatch from '../main/app/models/multi-kill-match';
import MultiKill from '../main/app/models/multi-kill';

type MultiKillTableProps = {
  multiKillMatches: any;
  // MultiKillMatch[];
};

function Row(props: {
  row: MultiKillMatch;
  selectedMultiKill: MultiKill | null;
  setSelectedMultiKill: (multiKill: MultiKill) => null;
}) {
  const { row, selectedMultiKill, setSelectedMultiKill } = props;
  const [open, setOpen] = React.useState(false);

  const isSelected = (multiKill: MultiKill) =>
    selectedMultiKill?.id === multiKill.id;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" align="left">
          {row.queueType}
        </TableCell>
        <TableCell component="th" scope="row" align="left">
          {row.role}{' '}
        </TableCell>
        <TableCell align="left">{row.championName}</TableCell>
        <TableCell align="left">{`${row.kills} / ${row.deaths} / ${row.assists}`}</TableCell>
        <TableCell align="left">{row.matchDate}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Multi Kills
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Multi Kill Type</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.multiKills.map((multiKill: MultiKill) => (
                    <TableRow
                      hover
                      onClick={(event) =>
                        setSelectedMultiKill(multiKill)
                      }
                      role="checkbox"
                      aria-checked={isSelected(multiKill)}
                      tabIndex={-1}
                      key={`${multiKill.id}`}
                      selected={isSelected(multiKill)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelected(multiKill)}
                          // inputProps={{
                          //   'aria-labelledby': l,
                          // }}
                        />
                      </TableCell>
                      {/* <TableRow key={`${row.matchId}-${multiKill.start}`}> */}
                      <TableCell component="th" scope="row">
                        {multiKill.type}
                      </TableCell>
                      <TableCell>{multiKill.start}</TableCell>
                      {/* <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * row.price * 100) / 100}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// const rows = [
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0, 3.99),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 4.99),
//   createData('Eclair', 262, 16.0, 24, 6.0, 3.79),
//   createData('Cupcake', 305, 3.7, 67, 4.3, 2.5),
//   createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5),
// ];

export default function MultiKillTable({
  multiKillMatches,
}: MultiKillTableProps) {
  const [selectedMultiKill, setSelectedMultiKill] =
    React.useState<MultiKill | null>(null);

  const handleMultiKillSelect = (multiKill: MultiKill) => {
    if (selectedMultiKill?.id === multiKill.id) {
      // deselect if currently selected
      setSelectedMultiKill(null);
    } else {
      setSelectedMultiKill(multiKill);
    }
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Queue Type</TableCell>
              <TableCell align="left">Role</TableCell>
              <TableCell align="left">Champion</TableCell>
              <TableCell align="left">K/D/A</TableCell>
              <TableCell align="left">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {multiKillMatches.map((multiKillMatch: MultiKillMatch) => (
              <Row
                key={multiKillMatch.matchId}
                row={multiKillMatch}
                selectedMultiKill={selectedMultiKill}
                setSelectedMultiKill={handleMultiKillSelect}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
