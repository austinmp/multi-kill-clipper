import Button from '@mui/material/Button';
import styles from './multi-kill-clipper.module.css';
import Summoner from '../main/app/models/summoner';

type SummonerStatusProps = {
  summoner: Summoner | null;
  summonerLoading: boolean;
};

/*
  Component acting as a status indicator for whether the Multi Kill Clipper app is able to
  connect to the League Client. If we are connected, the current Summoner will be displayed.
*/
export default function SummonerStatus({
  summoner,
  summonerLoading,
}: SummonerStatusProps) {
  const getStatusDot = () => {
    if (summonerLoading) return '🟡 Connecting...';
    return summoner ? '🟢 Connected' : '🔴 Not Connected';
  };

  return (
    <div className={styles['logged-in-summoner-ctn']}>
      <div className={styles['logged-in-summoner']}>
        {summoner && !summonerLoading && (
          <>
            <span>{summoner.summonerName}</span>
            <span>{`#${summoner.tagline}`}</span>
          </>
        )}
        <div>{getStatusDot()}</div>
      </div>
    </div>
  );
}
