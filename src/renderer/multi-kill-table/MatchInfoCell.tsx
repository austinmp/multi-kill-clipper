import TableCell from '@mui/material/TableCell';
import styles from '../multi-kill-clipper.module.css';
import MultiKillMatch from '../../main/app/models/multi-kill-match';
import { VICTORY_CSS_CLASS, DEFEAT_CSS_CLASS } from '../constants';

type MatchInfoCellProps = {
  multiKillMatch: MultiKillMatch;
};

/*
  Component for formatting and displaying match info in a single grid cell
*/
export default function MatchInfoCell({ multiKillMatch }: MatchInfoCellProps) {
  const {win, queueType } = multiKillMatch;

  const matchResult = win ? 'Victory' : 'Defeat';
  const className = win ? VICTORY_CSS_CLASS : DEFEAT_CSS_CLASS;

  return (
    <TableCell>
      <div className={styles.matchInfoCellCtn}>
        <div className={styles.matchInfoCell}>
          <div className={styles[className]}>
            <b>{matchResult}</b>
          </div>
          <div>{queueType}</div>
        </div>
      </div>
    </TableCell>
  );
}
