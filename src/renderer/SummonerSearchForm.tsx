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

import Button from '@mui/material/Button';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import { MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE } from './constants';
import styles from './multi-kill-clipper.module.css';
// import MultiKillClipper from '../main/app/controllers/multi-kill-clipper';
import { FormData, FormErrors, HandleFormSubmitType } from './types';
import LoadingStatus from './common/LoadingStatus';

// Define the shape of the form data
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const MULTI_KILL_MENU_OPTIONS = Object.keys(
  MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE,
);

type SummonerSearchFormProps = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formErrors: FormErrors;
  handleFormSubmit: Promise<void>;
  isLoading: boolean;
};

export default function SummonerSearchForm({
  formData,
  setFormData,
  handleFormSubmit,
  isLoading,
}: SummonerSearchFormProps) {
  // Handle change for the multi-select
  const handleKillTypeChange = (
    event: SelectChangeEvent<typeof formData.selectedKillTypes>,
  ) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const newValue = typeof value === 'string' ? value.split(',') : value;
    setFormData({ ...formData, selectedKillTypes: newValue });
  };

  // Handle change for text fields
  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const isFormFieldMissing =
    !formData.summonerName ||
    !formData.tagline ||
    !formData.selectedKillTypes.length;
  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      className={styles['summoner-search-ctn']}
      onSubmit={handleFormSubmit}
    >
      <TextField
        id="outlined-basic"
        label="Region"
        variant="outlined"
        disabled
        defaultValue="NA"
      />
      <TextField
        id="outlined-basic"
        name="summonerName"
        label="Summoner Name"
        variant="outlined"
        onChange={handleTextFieldChange}
        value={formData.summonerName}
        disabled={isLoading}
        error={!formData.summonerName && !isLoading}
        required
      />
      <TextField
        id="outlined-basic"
        name="tagline"
        label="Tagline"
        variant="outlined"
        onChange={handleTextFieldChange}
        value={formData.tagline}
        disabled={isLoading}
        required
        error={!formData.tagline}
        InputProps={{
          startAdornment: <InputAdornment position="start">#</InputAdornment>,
        }}
      />
      <FormControl
        sx={{ width: 300 }}
        required
        error={!formData.selectedKillTypes.length}
      >
        <InputLabel id="multiple-checkbox-label">Kill Types</InputLabel>
        <Select
          labelId="multiple-checkbox-label"
          id="multiple-checkbox"
          multiple
          value={formData.selectedKillTypes}
          onChange={handleKillTypeChange}
          input={<OutlinedInput label="Kill Types" />}
          renderValue={(selected) => selected?.join(', ')}
          MenuProps={MenuProps}
          disabled={isLoading}
        >
          {MULTI_KILL_MENU_OPTIONS.map((killType: string) => (
            <MenuItem key={killType} value={killType}>
              <Checkbox
                checked={formData.selectedKillTypes.indexOf(killType) > -1}
              />
              <ListItemText primary={killType} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="success"
        size="large"
        onClick={handleFormSubmit}
        disabled={isFormFieldMissing}
      >
        ⚔️ Find Multi Kills
      </Button>
    </Box>
  );
}
