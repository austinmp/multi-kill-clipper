import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import styles from './multi-kill-clipper.module.css';
import gwen from '../../assets/icon.png';
import LoggedInSummoner from './SummonerStatus';
import Summoner from '../main/app/models/summoner';

type HeaderBarProps = {
  loggedInSummoner: Summoner | null;
  isLoggedInSummonerLoading: boolean;
  message: string;
  isLoading: boolean;
};

export default function HeaderBar({
  loggedInSummoner,
  isLoggedInSummonerLoading,
}: HeaderBarProps) {
  return (
    <Box className={styles.topBar} component="div">
      <Paper elevation={10}>
        <div className={styles.header}>
          <div className={styles['logo-ctn']}>
            <img className={styles['gwen-ctn']} src={gwen} alt="Gwen" />
            <div>Multi Kill Clipper</div>
          </div>
          <LoggedInSummoner
            loggedInSummoner={loggedInSummoner}
            isLoggedInSummonerLoading={isLoggedInSummonerLoading}
          />
        </div>
      </Paper>
    </Box>
  );
}
