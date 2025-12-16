import { useEffect, useState } from "react";
import { 
  InputLabel,
  MenuItem,
  FormControl,
  Select
 } from '@mui/material';

function MunicipalityDropdown({ selectedMunicipality, setSelectedMunicipality, includeTotal }) {

  const [municipalities, setMunicipalities] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/municipalities")
    .then(res => res.json())
    .then(data => setMunicipalities(data))
    .catch(err => console.error(err));
  }, []);

  const handleChange = (event) => {
    setSelectedMunicipality(event.target.value);
  }

  return (
    <FormControl sx={{ maxHeight: 10, minWidth: 200, marginRight: 1 }}>
      <InputLabel id="municipality-label">Valitse kunta</InputLabel>
      <Select
        labelId="municipality-label"
        id="select-municipality"
        value={selectedMunicipality}
        label="Valitse kunta"
        onChange={handleChange}
      >
        {includeTotal ? 
          <MenuItem value="SSS">Koko maa</MenuItem> 
          : <MenuItem value="SSS">Valitse kunta</MenuItem>}
        {municipalities.map(m => (
          <MenuItem value={m.code}>{m.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
    
    
}

export default MunicipalityDropdown;