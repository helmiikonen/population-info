import { useState, useEffect } from "react";
import MunicipalityDropdown from "./MunicipalityDropdown";
import YearDropdown from "./YearDropdown";
import PopulationChart from "./PopulationChart";
import Box from '@mui/material/Box';

function MunicipalityViewer() {
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [yearlyStatistic, setYearlyStatistic] =  useState(null);
  const [populationData, setPopulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startPopulation, setStartPopulation] = useState(null);
  const [endPopulation, setEndPopulation] = useState(null);


  useEffect(() => {
    if (!selectedMunicipality) return;

    if (selectedYear != "") {
      setYearlyStatistic(populationData.populationByYear[selectedYear])
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        fetch(`http://localhost:8080/api/municipality/${selectedMunicipality}`)
        .then(res => res.json())
        .then(data => {
          setPopulationData(data);
          setStartPopulation(data.populationByYear["1987"]["total"]);
          setEndPopulation(data.populationByYear["2023"]["total"]);
        })
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMunicipality, selectedYear]);

  return (
    <div>
      <Box sx={{
        margin: 3, 
        paddingX: 3,
        paddingY: 1,
        justifyContent: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        width: '100vh'
        }}>
        <h1>Väestötiedot kunnittain</h1>
        <p>Voit tarkastella kuntien väestötietoja haluamaltasi vuodelta tai koostetusti aikaväliltä 1987-2023.</p>
        <MunicipalityDropdown onSelect={setSelectedMunicipality} />
        <YearDropdown onSelect={setSelectedYear}/>
        {loading && <p>Ladataan tietoja...</p>}
        {error && <p>Virhe: {error}</p>}

        {populationData && selectedYear != "" && yearlyStatistic ?
        (
          <div>
            <h2>{populationData.municipalityName}</h2>
            <p>Väestötiedot vuonna {selectedYear}</p>
            <p>Kokonaisväestö: {yearlyStatistic.total}</p>
            <p>0-17-vuotiaat: {yearlyStatistic.age0_17}</p>
            <p>18-64-vuotiaat: {yearlyStatistic.age18_64}</p>
            <p>Yli 65-vuotiaat: {yearlyStatistic.age65plus}</p>
          </div>
        )
      : selectedMunicipality != "" && populationData && endPopulation > startPopulation ? (
          <div>
            <h2>{populationData.municipalityName}</h2>
            <p>Väestötiedot vuosilta 1987-2023</p>
            <p>Muutos tarkastelujaksolla +{endPopulation - startPopulation} (+{(((endPopulation - startPopulation) / startPopulation)*100).toFixed(2)} %)</p>
            <PopulationChart data={populationData}/>
            
          </div>
        ) : selectedMunicipality != "" && populationData ? (
          <div>
            <h2>{populationData.municipalityName}</h2>
            <p>Väestötiedot vuosilta 1987-2023</p>
            <p>Muutos tarkastelujaksolla {endPopulation - startPopulation} ({(((endPopulation - startPopulation) / startPopulation)*100).toFixed(2)} %)</p>
            <PopulationChart data={populationData}/>
            
          </div>
        ) : <></>
        
      }
      </Box>
    </div>

  );
}

export default MunicipalityViewer;