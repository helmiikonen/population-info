import { Box } from '@mui/material';
import YearDropdown from './YearDropdown';
import MunicipalityDropdown from './MunicipalityDropdown';
import { useState, useEffect } from 'react';
import ComparisonPopulationChart from './ComparisonPopulationChart';

function Comparisons({selectedMunicipality, setSelectedMunicipality, fetchMunicipalityData}) {

  const years = []
  for (let y=1987; y<=2024; y++){
    years.push(y);
  }

  const [municipality1, setMunicipality1] = useState(selectedMunicipality || null);

  const [municipality2, setMunicipality2] = useState("SSS");

  const [endYear, setEndYear] = useState(2024);

  const [startYear, setStartYear] = useState(1987);

  const [municipality1Data, setMunicipality1Data] = useState(null);

  const [municipality2Data, setMunicipality2Data] = useState(null);

  const [startPopulation1, setStartPopulation1] = useState(null);

  const [endPopulation1, setEndPopulation1] = useState(null);

  const [startPopulation2, setStartPopulation2] = useState(null);

  const [endPopulation2, setEndPopulation2] = useState(null);

  const changeStartYear = (event) => {
    setStartYear(event.target.value);
  }
  
  const changeEndYear = (event) => {
    setEndYear(event.target.value);
  }

  useEffect(() => {
    fetchMunicipalityData(municipality1, setMunicipality1Data, setStartPopulation1, setEndPopulation1);
    fetchMunicipalityData(municipality2, setMunicipality2Data, setStartPopulation2, setEndPopulation2);
    setSelectedMunicipality(municipality1);

  }, [municipality1, municipality2, startYear, endYear]);


  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <p>Vertaile valitsemiesi kuntien väestömuutoksia haluamallasi aikavälillä</p>
      <Box sx={{display: 'flex', flexDirection: 'row', paddingY: 4}}>
        <MunicipalityDropdown selectedMunicipality={municipality1} setSelectedMunicipality={setMunicipality1}/>
        <MunicipalityDropdown selectedMunicipality={municipality2} setSelectedMunicipality={setMunicipality2}/> 
        <YearDropdown yearOptions={years} defaultValue={startYear} labelText="Alkaen" handleChange={changeStartYear}/>   
        <YearDropdown yearOptions={years} defaultValue={endYear} labelText="Päättyen" handleChange={changeEndYear}/>
      </Box>
      <Box sx={{marginTop: 5}}>
        {municipality1Data && municipality2Data ?
        municipality1 == "SSS" && municipality2 == "SSS" ?
        <h3>Valitse vertailtavat kunnat</h3>
        :
        municipality1 == "SSS" || municipality2 == "SSS" ?
        <div>
          <h3>Vertaillaan kunnan {municipality1 == "SSS" ? municipality2Data.municipalityName : municipality1Data.municipalityName} väestöä koko maan väestöön aikavälillä {startYear}-{endYear}</h3>
          <ComparisonPopulationChart data1={municipality1Data} data2={municipality2Data} startYear={startYear} endYear={endYear}/>
        </div>
        :
        <div>
          <h3>Vertaillaan kuntia {municipality1Data.municipalityName} ja {municipality2Data.municipalityName} aikavälillä {startYear}-{endYear}</h3>
          <ComparisonPopulationChart data1={municipality1Data} data2={municipality2Data} startYear={startYear} endYear={endYear}/>
        </div>
        :<></>
      }
        
      </Box>
    </Box>
  )

}

export default Comparisons;