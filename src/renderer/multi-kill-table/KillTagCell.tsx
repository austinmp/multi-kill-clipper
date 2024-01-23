import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';
import styles from '../multi-kill-clipper.module.css';

type KillTagCellProps = {
  multiKillTypes: string[];
};

/*
  Component for formatting and displaying the multi kill type badges within a single grid cell
*/
export default function KillTagCell({ multiKillTypes }: KillTagCellProps) {
  return (
    <TableCell>
      <div className={styles['flex-row']}>
        <div className={styles['flex-col']}>
          {multiKillTypes[0] && (
            <Chip
              size="small"
              className={styles['kill-tag']}
              label={multiKillTypes[0]}
              color="error"
            />
          )}
          {multiKillTypes[1] && (
            <Chip
              size="small"
              className={styles['kill-tag']}
              label={multiKillTypes[1]}
              color="error"
            />
          )}
          {multiKillTypes[2] && (
            <Chip
              size="small"
              className={styles['kill-tag']}
              label={multiKillTypes[2]}
              color="error"
            />
          )}
        </div>
        <div className={styles['flex-col']}>
          {multiKillTypes[3] && (
            <Chip
              size="small"
              className={styles['kill-tag']}
              label={multiKillTypes[3]}
              color="error"
            />
          )}
          {multiKillTypes[4] && (
            <Chip
              size="small"
              className={styles['kill-tag']}
              label={multiKillTypes[4]}
              color="error"
            />
          )}
        </div>
      </div>
    </TableCell>
  );
}
