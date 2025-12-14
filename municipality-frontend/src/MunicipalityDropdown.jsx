import { useEffect, useState } from "react";

function MunicipalityDropdown({ onSelect }) {
  const [municipalities, setMunicipalities] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/municipalities")
    .then(res => res.json())
    .then(data => setMunicipalities(data))
    .catch(err => console.error(err));
  }, []);

  

  return (
    <select onChange={e => onSelect(e.target.value)}>
      <option value="">Valitse kunta</option>
      
      {municipalities.map(m => (
        <option key={m.code} value={m.code}>{m.name}</option>
      ))}
    </select>
  );
}

export default MunicipalityDropdown;