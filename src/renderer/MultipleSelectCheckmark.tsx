import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

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

const killTypes = [
  'First Blood',
  'Double Kill',
  'Triple Kill',
  'Quadra Kill',
  'Penta Kill',
];

export default function MultipleSelectCheckmarks() {
  const [selectedKillTypes, setSelectedKillTypes] =
    React.useState<string[]>(killTypes);

  const handleChange = (event: SelectChangeEvent<typeof selectedKillTypes>) => {
    const {
      target: { value },
    } = event;
    setSelectedKillTypes(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // const isChecked = (killType: string) => {
  //   if (selectedKillTypes.indexOf('Select All') > -1) {
  //     return True
  //   }
  // }

  return (
    <div>
      <FormControl
        sx={{ m: 1, width: 300 }}
        required
        error={!selectedKillTypes.length}
      >
        <InputLabel id="demo-multiple-checkbox-label">Kill Types</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedKillTypes}
          onChange={handleChange}
          input={<OutlinedInput label="Kill Types" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {killTypes.map((killType) => (
            <MenuItem key={killType} value={killType}>
              <Checkbox checked={selectedKillTypes.indexOf(killType) > -1} />
              <ListItemText primary={killType} />
            </MenuItem>
          ))}
        </Select>
        {/* <FormHelperText>Required</FormHelperText> */}
      </FormControl>
    </div>
  );
}
