import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import FolderIcon from '@mui/icons-material/Folder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FileLink from '../common/OpenFileButton';
import OpenFileButton from '../common/OpenFileButton';

interface MessageDialogProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  message: string;
  filePath?: string;
}
export default function MessageDialog({
  open,
  handleClose,
  title,
  message,
  filePath,
}: MessageDialogProps) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="message-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {filePath && (
          <OpenFileButton
            path={filePath}
            message="Watch"
            disabled={!filePath}
            icon={<PlayArrowIcon />}
          />
        )}
        <Button
          onClick={handleClose}
          autoFocus
          variant="contained"
          size="large"
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
