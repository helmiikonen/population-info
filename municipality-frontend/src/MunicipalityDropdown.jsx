import { useEffect, useState } from "react";
import { Autocomplete, TextField } from '@mui/material';

function MunicipalityDropdown({ selectedMunicipality, setSelectedMunicipality }) {

  const [municipalities, setMunicipalities] = useState([]);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/municipalities-list")
    .then(res => res.json())
    .then(data => setMunicipalities(data))
    .catch(err => console.error(err));
  }, []);

  return (
    municipalities.length > 0 ?
      <div>
        <Autocomplete 
          sx={{minWidth: 200, marginX: 1}}
          options={municipalities}
          getOptionLabel={(option) => option.name}
          value={selectedMunicipality ? 
            municipalities.find(m => m.code === selectedMunicipality) || null
           : null
          }
          renderInput={(params) => <TextField {...params} label="Valitse kunta"/>}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue) }
          onChange={(event, newValue) => {
            setSelectedMunicipality(newValue?.code || null);
          }}
        />
      </div> 
    : <></>
      
  );
    
    
}

export default MunicipalityDropdown;