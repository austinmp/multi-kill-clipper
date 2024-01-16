import Button from '@mui/material/Button';
import { ReactNode } from 'react';
import IPC_CHANNEL from '../../main/ipc/ipc-channels';

type OpenFileButtonProps = {
  path: string;
  message: string;
  disabled: boolean;
  icon?: ReactNode;
  className?: string;
};

export default function OpenFileButton({
  path,
  message,
  disabled,
  className,
  icon,
}: OpenFileButtonProps) {
  const convertFilePath = (filePath: string) => {
    return filePath.replace(/\//g, '\\');
  };

  const openFile = (event: any) => {
    event.preventDefault();
    const convertedPath = convertFilePath(path);
    window.electron.ipcRenderer.sendMessage(
      IPC_CHANNEL.OPEN_FILE,
      convertedPath,
    );
  };

  return (
    <Button
      className={className}
      startIcon={icon}
      variant="contained"
      size="large"
      disabled={disabled}
      onClick={openFile}
    >
      {message}
    </Button>
  );
}
