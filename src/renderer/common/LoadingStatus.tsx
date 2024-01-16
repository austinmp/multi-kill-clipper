import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
} from '@mui/material';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import styles from '../multi-kill-clipper.module.css';
import { LoadingStatusType } from '../types';

export default function LoadingStatus({
  isLoading,
  message,
}: LoadingStatusType) {
  return (
    isLoading && (
      <div className={styles['loading-status-ctn']}>
        <div className={styles['flex-col']}>
          <div>
            <CircularProgress size={60} />
          </div>
          <div>{message}</div>
        </div>
      </div>
    )
  );
}
