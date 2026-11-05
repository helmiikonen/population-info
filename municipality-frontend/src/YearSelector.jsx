import { Box } from '@mui/material';
import YearDropdown from './YearDropdown';

function YearSelector({
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  minYear = 2003,
  maxYear = 2025
}) {
  // Muodostetaan vuosilista kunnan vuosirajojen perusteella
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => minYear + index
  );

  // Alkamisvuoden vaihtoehdot
  const startYearOptions = years.filter(year => year < endYear);

  // Päättymisvuoden vaihtoehdot
  const endYearOptions = years.filter(year => year > startYear);

  const handleStartYearChange = (event) => {
    const newStartYear = Number(event.target.value);

    setStartYear(newStartYear);

    // Varmistetaan, että päättymisvuosi on alkamisvuotta suurempi
    if (newStartYear >= endYear) {
      setEndYear(Math.min(newStartYear + 1, maxYear));
    }
  };

  const handleEndYearChange = (event) => {
    const newEndYear = Number(event.target.value);

    setEndYear(newEndYear);

    // Varmistetaan, että alkamisvuosi on päättymisvuotta pienempi
    if (newEndYear <= startYear) {
      setStartYear(Math.max(newEndYear - 1, minYear));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <YearDropdown
        yearOptions={startYearOptions}
        defaultValue={startYear}
        labelText="Alkaen"
        handleChange={handleStartYearChange}
      />

      <YearDropdown
        yearOptions={endYearOptions}
        defaultValue={endYear}
        labelText="Päättyen"
        handleChange={handleEndYearChange}
      />
    </Box>
  );
}

export default YearSelector;