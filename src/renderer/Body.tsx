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
import ClipStatus from './ClipStatus';
import IPC_CHANNEL from '../main/ipc/ipc-channels';
import AppTutorial from './AppTutorial';

const MULTI_KILL_MENU_OPTIONS = Object.keys(
  MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE,
);

const DEFAULT_LOADING_STATUS: LoadingStatusType = {
  isLoading: false,
  message: '',
};

type MultiKillClipperProps = {
  loggedInSummoner: Summoner | null;
  isLoggedInSummonerLoading: boolean;
  className?: string;
};

export default function Body({
  className,
  loggedInSummoner,
  isLoggedInSummonerLoading,
}: MultiKillClipperProps) {
  const { showDialog } = useDialog();
  const [highlightsPath, setHighlightsPath] = useState<string>('');
  const [isClippingInProgress, setIsClippingInProgress] =
    useState<boolean>(false);
  const [clipProgress, setClipProgress] = useState<string>('');
  const [matches, setMatches] = useState<MultiKillMatch[] | null>(null);
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
    ...DEFAULT_LOADING_STATUS,
  });

  const [selectedMultiKillMatch, setSelectedMultiKillMatch] =
    useState<MultiKillMatch | null>(null);

  const [selectedMultiKill, setSelectedMultiKill] = useState<MultiKill | null>(
    null,
  );

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

  const validateForm = () => {
    const newErrors: FormErrors = {
      summonerName: !formData.summonerName,
      tagline: !formData.tagline,
      selectedKillTypes: formData.selectedKillTypes.length === 0,
    };
    setFormErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      setIsMatchesLoading(true);
      const multiKillTypes = formData.selectedKillTypes.map(
        (selectedKill: string) =>
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
    if (response?.error) {
      showDialog('Clipping Failed', response.error);
    }
    setIsClippingInProgress(false);
    setClipProgress(''); // clear status message
  };

  return (
    <Box className={className}>
      <div className={styles.bodyInner}>
        <AppTutorial />
        <Section>
          <SummonerSearchForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            handleFormSubmit={handleFormSubmit}
            isLoading={!loggedInSummoner}
          />
          <Collapse in={loadingStatus.isLoading} timeout={300}>
            <LoadingStatus
              isLoading={loadingStatus.isLoading}
              message={loadingStatus.message}
            />
          </Collapse>
          <Collapse in={isClippingInProgress} timeout={300}>
            <LoadingStatus
              isLoading={isClippingInProgress}
              message={clipProgress}
            />
          </Collapse>
        </Section>
        <Section>
          <MultiKillTable
            multiKillMatches={matches}
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
    </Box>
  );
}
