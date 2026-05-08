import { useState } from 'react';  
import { Box } from '@mui/material';
import YearDropdown from './YearDropdown';

function YearSelector({ startYear, setStartYear, endYear, setEndYear }) {

  const years = []
  for (let y=1987; y<=2024; y++){
    years.push(y);
  }

  const [startYearOptions, setStartYearOptions] = useState(years);
  const [endYearOptions, setEndYearOptions] = useState(years);
  
  const handleStartYearChange = (event) => {
    setStartYear(event.target.value);
    const newEndYearOptions = [];
    for (let y = event.target.value + 1; y <= 2024; y++) {
      newEndYearOptions.push(y);
    }
    setEndYearOptions(newEndYearOptions);
  }

  const handleEndYearChange = (event) => {
    setEndYear(event.target.value);
    const newStartYearOptions = [];
    for (let y = 1987; y < event.target.value; y++) {
      newStartYearOptions.push(y);
    }
    setStartYearOptions(newStartYearOptions);
  }  

  return (
    <Box sx={{display: 'flex', flexDirection: 'row' }}>
      <YearDropdown yearOptions={startYearOptions} defaultValue={startYear} labelText="Alkaen" handleChange={handleStartYearChange}/>
      <YearDropdown yearOptions={endYearOptions} defaultValue={endYear} labelText="Päättyen" handleChange={handleEndYearChange}/>
    </Box>
  );
}

export default YearSelector;