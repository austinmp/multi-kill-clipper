import styles from './multi-kill-clipper.module.css';
import './App.css';
import { useState, useEffect, FormEvent } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import SummonerSearchForm from './SummonerSearchForm';
import Summoner from '../main/app/models/summoner';
import MultiKillTable from './multi-kill-table/MultiKillTable';
import MultiKillMatch from '../main/app/models/multi-kill-match';
import { MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE } from './constants';
import { FormErrors, FormData, LoadingStatusType } from './types';
import MultiKill from '../main/app/models/multi-kill';
import LoadingStatus from './common/LoadingStatus';
import { useDialog } from './dialogue/MessageDialogContext';
import ClipControls from './clip-controls/ClipControls';
import Section from './common/Section';
import { EVENT_SERVICE_CHANNEL } from '../main/app/constants';
import HeaderBar from './HeaderBar';
import CssBaseline from '@mui/material/CssBaseline';
import ClipStatus from './ClipStatus';
import FileLink from './common/OpenFileButton';
import { Button } from '@mui/material';
// import { mockData } from './test-data';
import FolderIcon from '@mui/icons-material/Folder';

import IPC_CHANNEL from '../main/ipc/ipc-channels';
import Footer from './Footer';
import AppTutorial from './AppTutorial';

const MULTI_KILL_MENU_OPTIONS = Object.keys(
  MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE,
);

const DEFAULT_LOADING_STATUS: LoadingStatusType = {
  isLoading: false,
  message: '',
};

export default function MultiKillClipper() {
  const { showDialog } = useDialog();
  const [highlightsPath, setHighlightsPath] = useState<string>('');
  const [isClippingInProgress, setIsClippingInProgress] =
    useState<boolean>(false);
  const [clipProgress, setClipProgress] = useState<string>('');
  const [isConnectedToClient, setIsConnectedToClient] =
    useState<boolean>(false);
  const [matches, setMatches] = useState<MultiKillMatch[] | null>(null);
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(false);
  const [loggedInSummoner, setLoggedInSummoner] = useState<Summoner | null>(
    null,
  );
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
    ...DEFAULT_LOADING_STATUS,
  });

  const [selectedMultiKillMatch, setSelectedMultiKillMatch] =
    useState<MultiKillMatch | null>(null);

  const [selectedMultiKill, setSelectedMultiKill] = useState<MultiKill | null>(
    null,
  );

  const [isLoggedInSummonerLoading, setIsLoggedInSummonerLoading] =
    useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    summonerName: false,
    tagline: false, // TO DO VALIDATE LENGTH AND FORMAT
    selectedKillTypes: false,
  });

  const [formData, setFormData] = useState<FormData>({
    summonerName: loggedInSummoner?.summonerName || '',
    tagline: loggedInSummoner?.tagline || '#NA1', // TODO UPDATE THE DEFAULT HERE
    selectedKillTypes: MULTI_KILL_MENU_OPTIONS,
  });

  useEffect(() => {
    const newLoadingStatus: LoadingStatusType = { ...DEFAULT_LOADING_STATUS };
    if (isLoggedInSummonerLoading) {
      newLoadingStatus.isLoading = true;
      newLoadingStatus.message =
        'Connecting to the League of Legends game client ...';
    } else if (isMatchesLoading) {
      newLoadingStatus.isLoading = true;
      newLoadingStatus.message = 'Searching match history ...';
    }
    setLoadingStatus(newLoadingStatus);
  }, [isMatchesLoading, isLoggedInSummonerLoading]);

  // Validate the form fields
  const validateForm = () => {
    const newErrors: FormErrors = {
      summonerName: !formData.summonerName,
      tagline: !formData.tagline,
      selectedKillTypes: formData.selectedKillTypes.length === 0,
    };
    setFormErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // TODO: ADD A TRY/EXCEPT OR ERROR HANDLING
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      setIsMatchesLoading(true);
      const multiKillTypes = formData.selectedKillTypes.map(
        (selectedKill: str) =>
          MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE[selectedKill],
      );
      const response = await window.electron.ipcRenderer.invoke(
        IPC_CHANNEL.GET_MULTI_KILLS,
        formData.summonerName,
        multiKillTypes,
        loggedInSummoner,
        formData.tagline,
      );
      if (!response.error) {
        setMatches(response);
      } else {
        showDialog('Summoner Search Failed', response.error);
      }
      setIsMatchesLoading(false);
    }
  };

  const fetchSummoner = async () => {
    setIsLoggedInSummonerLoading(true);
    const response = await window.electron.ipcRenderer.invoke(
      IPC_CHANNEL.GET_LOGGED_IN_SUMMONER,
      null,
    );
    if (!response.error) {
      setLoggedInSummoner(response);
    } else {
      showDialog(
        'Failed To Connect',
        `${response.error}. Please make sure your League Client is running, then press F5 to refresh this app.`,
      );
    }
    setIsLoggedInSummonerLoading(false);
  };

  const fetchHighlightsPath = async () => {
    const response = await window.electron.ipcRenderer.invoke(
      IPC_CHANNEL.GET_HIGHLIGHTS_PATH,
    );
    if (!response.error) {
      setHighlightsPath(response);
    }
  };

  const handleClipProgressUpdate = (data: string) => {
    setClipProgress(data);
  };

  const handleClippingComplete = (data: string) => {
    setIsClippingInProgress(false);
    const message = `Clip saved to: ${data}`;
    showDialog('Clip Created', message, data);
  };

  useEffect(() => {
    // Example of using EventService for an internal event
    window.electron.ipcRenderer.on(
      EVENT_SERVICE_CHANNEL.CLIP_PROGRESS,
      handleClipProgressUpdate,
    );
    window.electron.ipcRenderer.on(
      EVENT_SERVICE_CHANNEL.CLIPPING_COMPLETE,
      handleClippingComplete,
    );
  }, []);

  useEffect(() => {
    fetchSummoner();
    fetchHighlightsPath();
  }, []);

  useEffect(() => {
    setFormData({
      summonerName: loggedInSummoner?.summonerName || '',
      tagline: loggedInSummoner?.tagline || 'NA1',
      selectedKillTypes: MULTI_KILL_MENU_OPTIONS,
    });
  }, [loggedInSummoner]); // Only re-run the effect if loggedInSummoner changes

  const handleCreateClip = async () => {
    setIsClippingInProgress(true);
    const response = await window.electron.ipcRenderer.invoke(
      IPC_CHANNEL.CREATE_CLIP,
      selectedMultiKillMatch,
      selectedMultiKill,
    );
    if (response.error) {
      showDialog('Clipping Failed', response.error);
    }
    setIsClippingInProgress(false);
  };

  return (
    <Box className={styles.ctn}>
      <CssBaseline />
      <HeaderBar
        loggedInSummoner={loggedInSummoner}
        isLoggedInSummonerLoading={isLoggedInSummonerLoading}
      />
      <div className={styles.body}>
        <AppTutorial />
        <Section>
          <SummonerSearchForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            handleFormSubmit={handleFormSubmit}
            isLoading={!loggedInSummoner} // need to add search loading
          />
          <Collapse in={loadingStatus.isLoading} timeout={300}>
            <LoadingStatus
              isLoading={loadingStatus.isLoading}
              message={loadingStatus.message}
            />
          </Collapse>
        </Section>
        <ClipStatus isLoading={isClippingInProgress} message={clipProgress} />
        <Section>
          <MultiKillTable
            multiKillMatches={matches}
            selectedMultiKillMatch={selectedMultiKillMatch}
            selectedMultiKill={selectedMultiKill}
            setSelectedMultiKillMatch={setSelectedMultiKillMatch}
            setSelectedMultiKill={setSelectedMultiKill}
          />
          <ClipControls
            selectedMultiKill={selectedMultiKill}
            isClippingInProgress={isClippingInProgress}
            handleCreateClip={handleCreateClip}
            highlightsPath={highlightsPath}
          />
        </Section>
      </div>
      <Footer />
    </Box>
  );
}
