import { Box } from '@mui/material';
import YearDropdown from './YearDropdown';
import { useState } from 'react';

function Comparisons({municipalityData, totalPopulation}) {

  const years = []
  for (let y=1987; y<=2023; y++){
    years.push(y);
  }

  const thousandSeparatorFormatter = (value) => new Intl.NumberFormat().format(value);

  const [selectedYear, setSelectedYear] = useState(2023);

  const [yearlyMunicipalityInfo, setYearlyMunicipalityInfo] = useState(
    municipalityData.populationByYear[selectedYear]
  );
  const [yearlyTotalInfo, setYearlyTotalInfo] = useState(
    totalPopulation.populationByYear[selectedYear]
  );

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setYearlyMunicipalityInfo(municipalityData.populationByYear[selectedYear]);
    setYearlyTotalInfo(totalPopulation.populationByYear[selectedYear]);
  }

  if (yearlyMunicipalityInfo["total"] != municipalityData.populationByYear[selectedYear]["total"]) {
    setYearlyMunicipalityInfo(municipalityData.populationByYear[selectedYear]);
    setYearlyTotalInfo(totalPopulation.populationByYear[selectedYear]);

  }

  return (
    <Box sx={{marginTop: 5}}>
      {municipalityData.municipalityCode !== ("SSS") ? 
        <div>
          <h2>{municipalityData.municipalityName}</h2>
          <Box sx={{display: 'flex', flexDirection: 'row', marginBottom: 3}}>
            <p>Valitse vuosi</p>
            <YearDropdown yearOptions={years} defaultValue={selectedYear} labelText="" handleChange={handleYearChange}/>
          </Box>
          <h4>Vuonna {selectedYear}:</h4>
          <p>Kunnan väkiluku oli {thousandSeparatorFormatter(yearlyMunicipalityInfo["total"])}</p>
          <p>Se on {((yearlyMunicipalityInfo["total"] / yearlyTotalInfo["total"])*100).toFixed(2)} % koko maan väestöstä, joka oli {thousandSeparatorFormatter(yearlyTotalInfo["total"])}</p>
        </div>
        : <p>Valitse kunta, jonka väestötietoja haluat vertailla koko maan väestöön</p>
      }
    </Box>
  )

}

export default Comparisons;