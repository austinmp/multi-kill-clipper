import Box from '@mui/material/Box';
import { useState, useEffect, FormEvent } from 'react';
import { useDialog, DialogProvider } from './dialogue/MessageDialogContext';
import Header from './Header';
import Footer from './Footer';
import Body from './Body';
import styles from './multi-kill-clipper.module.css';
import Summoner from '../main/app/models/summoner';
import IPC_CHANNEL from '../main/ipc/ipc-channels';

export default function MultiKillClipper() {
  const { showDialog } = useDialog();
  const [loggedInSummoner, setLoggedInSummoner] = useState<Summoner | null>(
    null,
  );
  const [isLoggedInSummonerLoading, setIsLoggedInSummonerLoading] =
    useState<boolean>(false);

  const fetchSummoner = async () => {
    setIsLoggedInSummonerLoading(true);
    const response = await window.electron.ipcRenderer.invoke(
      IPC_CHANNEL.GET_LOGGED_IN_SUMMONER,
      null,
    );
    if (!response.error) {
      setLoggedInSummoner(response);
    } else {
      setLoggedInSummoner(null);
      showDialog(
        'Failed To Connect',
        `${response.error}. Please make sure your League Client is running, then press F5 to refresh this app.`,
      );
    }
    setIsLoggedInSummonerLoading(false);
  };

  useEffect(() => {
    fetchSummoner();
  }, []);

  return (
    <Box className={styles.container}>
      <Header
        className={styles.header}
        loggedInSummoner={loggedInSummoner}
        isLoggedInSummonerLoading={isLoggedInSummonerLoading}
        fetchSummoner={fetchSummoner}
      />
      <Body
        className={styles.body}
        loggedInSummoner={loggedInSummoner}
        isLoggedInSummonerLoading={isLoggedInSummonerLoading}
      />
      <Footer className={styles.footer} />
    </Box>
  );
}
