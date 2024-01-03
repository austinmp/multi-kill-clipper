import styles from './multi-kill-clipper.module.css';

import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { Button, FormLabel } from '@mui/material';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';

import CssBaseline from '@mui/material/CssBaseline';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';

import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IpcRenderer } from 'electron';
import { useState, useEffect } from 'react';
import SummonerSearchForm from './SummonerSearchForm';
import MultipleSelectChip from './MultipleSelectCheckmark';
import Summoner from '../main/app/models/summoner';
import LoggedInSummoner from './SummonerStatus';
import MultiKillTable from './MultiKillTable';
import { mockData } from './test-data';

export default function MultiKillClipper() {
  /*
    TODO: default tagline value should correspond to default region
    Need to pre populate these fields on load
  */
  const [summonerLoading, setSummonerLoading] = useState<boolean>(true);
  const [summoner, setSummoner] = useState<Summoner | null>(null);

  const fetchSummoner = async () => {
    try {
      setSummonerLoading(true);
      const response = await window.electron.ipcRenderer.invoke(
        'get-current-summoner',
        null,
      );
      console.log(response);

      // TODO: CLEAN THIS ERROR HANDLING UP
      if (!response.error) {
        setSummoner(response);
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching summoner:', error);
    } finally {
      setSummonerLoading(false);
    }
  };

  useEffect(() => {
    fetchSummoner();
  }, []);

  return (
    <Box className={styles.ctn}>
      <LoggedInSummoner summoner={summoner} summonerLoading={summonerLoading} />
      <div>
        <div className={styles['hero-ctn']}>
          <Typography variant="h3" component="div">
            Multi Kill Clipper
          </Typography>
        </div>
        <Box className={styles['search-box']} component="div">
          <SummonerSearchForm
            summoner={summoner}
            summonerLoading={summonerLoading}
          />
        </Box>
      </div>
      <MultiKillTable multiKillMatches={mockData}/>
    </Box>
  );
}
