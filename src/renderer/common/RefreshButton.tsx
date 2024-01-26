import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import styles from '../multi-kill-clipper.module.css';

type RefreshButtonProps = {
  onClick: () => Promise<void>;
};

function RefreshButton({ onClick }: RefreshButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
    onClick();
  };

  return (
    <IconButton className={styles.refreshBtn} onClick={handleClick}>
      <RefreshIcon
        fontSize="small"
        className={
          isSpinning
            ? `${styles.spinAnimation} ${styles.refreshBtn}`
            : styles.refreshBtn
        }
      />
    </IconButton>
  );
}

export default RefreshButton;
