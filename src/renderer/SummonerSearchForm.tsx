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
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE } from './constants';
import styles from './multi-kill-clipper.module.css';
// import MultiKillClipper from '../main/app/controllers/multi-kill-clipper';
import Summoner from '../main/app/models/summoner';

// Define the shape of the form data
interface FormData {
  summonerName: string;
  tagline: string;
  selectedKillTypes: string[];
}

// Define the shape of the errors object
interface FormErrors {
  summonerName: boolean;
  tagline: boolean;
  selectedKillTypes: boolean;
}

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
  summoner: Summoner | null;
  summonerLoading: boolean;
};

export default function SummonerSearchForm({
  summoner,
  summonerLoading,
}: SummonerSearchFormProps) {
  // State for the form fields
  const [formData, setFormData] = useState<FormData>({
    summonerName: summoner?.summonerName || '',
    tagline: summoner?.tagline || '#NA1',
    selectedKillTypes: MULTI_KILL_MENU_OPTIONS,
  });

  const [errors, setErrors] = useState<FormErrors>({
    summonerName: false,
    tagline: false, // TO DO VALIDATE LENGTH AND FORMAT
    selectedKillTypes: false,
  });

  useEffect(() => {
    setFormData({
      summonerName: summoner?.summonerName || '',
      tagline: summoner?.tagline || '#NA1',
      selectedKillTypes: MULTI_KILL_MENU_OPTIONS,
    });
  }, [summoner]); // Only re-run the effect if loggedInSummoner changes

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

  // Validate the form fields
  const validateForm = () => {
    const newErrors: FormErrors = {
      summonerName: !formData.summonerName,
      tagline: !formData.tagline,
      selectedKillTypes: formData.selectedKillTypes.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      const multiKillTypes = formData.selectedKillTypes.map(
        (selectedKill: str) =>
          MULTI_KILL_MENU_OPTION_TO_MULTI_KILL_TYPE[selectedKill],
      );
      console.log('Searching...');
      const response = await window.electron.ipcRenderer.invoke(
        'get-multi-kills',
        formData.summonerName,
        multiKillTypes,
        summoner,
        formData.tagline,
      );
      // console.log(`Found ${response.length()} multi kills`);

      response.forEach((match) => {
        console.log(match);
        match.multiKills.forEach((kill) => console.log(kill));
      });
      // const matches = await multiKillClipper.getMultiKillMatches();
      // console.log(matches);
      // Submit formData to the backend here...
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
          disabled={summonerLoading}
          // defaultValue={}
          required
        />
        <TextField
          id="outlined-basic"
          name="tagline"
          label="Tagline"
          variant="outlined"
          // defaultValue="#NA1"
          onChange={handleTextFieldChange}
          value={formData.tagline}
          required
        />
        <FormControl
          sx={{ width: 300 }}
          required
          error={!formData.selectedKillTypes?.length}
        >
          <InputLabel id="multiple-checkbox-label">Kill Types</InputLabel>
          <Select
            labelId="multiple-checkbox-label"
            id="multiple-checkbox"
            multiple
            value={formData.selectedKillTypes}
            onChange={handleKillTypeChange}
            input={<OutlinedInput label="Kill Types" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
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
          {/* <FormHelperText>Required</FormHelperText> */}
        </FormControl>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleSubmit}
        >
          Search
        </Button>
      </form>
    </div>
  );
}
