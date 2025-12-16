import { 
  InputLabel,
  MenuItem,
  FormControl,
  Select
 } from '@mui/material';

function YearDropdown({ yearOptions, defaultValue, labelText, handleChange }) {

  return (
    <FormControl sx={{ maxHeight: 10, marginX: 1 }}>
      <InputLabel id="label-id">{labelText}</InputLabel>
      <Select
        labelId="label-id"
        id="select-year"
        value={defaultValue}
        label={labelText}
        onChange={handleChange}
      >
        {yearOptions.map(year => (
          <MenuItem value={year}>{year}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default YearDropdown;