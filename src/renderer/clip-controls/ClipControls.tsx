import ContentCutIcon from '@mui/icons-material/ContentCut';
import CancelIcon from '@mui/icons-material/Cancel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import BottomNavigation from '@mui/material/BottomNavigation';
import FolderIcon from '@mui/icons-material/Folder';
import styles from '../multi-kill-clipper.module.css';
import MultiKill from '../../main/app/models/multi-kill';
import MultiKillMatch from '../../main/app/models/multi-kill-match';
import Section from '../common/Section';
import FileLink from '../common/OpenFileButton';
import OpenFileButton from '../common/OpenFileButton';

type ClipControlsProps = {
  selectedMultiKill: MultiKill | null;
  isClippingInProgress: boolean;
  handleCreateClip: () => Promise<void>;
  highlightsPath: string;
};

export default function ClipControls({
  selectedMultiKill,
  isClippingInProgress,
  handleCreateClip,
  highlightsPath,
}: ClipControlsProps) {
  return (
    <div className={styles['clip-controls-ctn']}>
      <Button
        startIcon={<ContentCutIcon />}
        variant="contained"
        color="success"
        size="large"
        disabled={!selectedMultiKill || isClippingInProgress}
        onClick={handleCreateClip}
      >
        Create Clip
      </Button>
      <OpenFileButton
        path={highlightsPath}
        message="View Clips"
        disabled={!highlightsPath}
        icon={<FolderIcon />}
      />
    </div>
  );
}
