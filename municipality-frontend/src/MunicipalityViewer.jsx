import { useState, useEffect } from "react";
import MunicipalityDropdown from "./MunicipalityDropdown";
import YearSelector from "./YearSelector";
import PopulationChart from "./PopulationChart";
import { Tabs, Tab, Box } from '@mui/material';
import Summary from "./Summary";
import Comparisons from "./Comparisons";

function MunicipalityViewer() {
  const [selectedMunicipality, setSelectedMunicipality] = useState("SSS");
  const [populationData, setPopulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startPopulation, setStartPopulation] = useState(null);
  const [endPopulation, setEndPopulation] = useState(null);
  const [startYear, setStartYear] = useState(1987);
  const [endYear, setEndYear] = useState(2023);
  const [view, setView] = useState("municipality");
  const [totalPopulation, setTotalPopulation] = useState(null);

  const thousandSeparatorFormatter = (value) => new Intl.NumberFormat().format(value);

  const plusFormatter = (value) => {
    if (Number(value) > 0) {
      return "+" + thousandSeparatorFormatter(value).toString();
    } else {
      return thousandSeparatorFormatter(value);
    }
  }

  const handleViewChange = (event, value) => setView(value);  

  useEffect(() => {
    if (!selectedMunicipality) {
      return;
    }

    if (totalPopulation == null) {
      try {
        fetch(`http://localhost:8080/api/municipality/SSS`)
        .then(res => res.json())
        .then(data => setTotalPopulation(data))
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        fetch(`http://localhost:8080/api/municipality/${selectedMunicipality}`)
        .then(res => res.json())
        .then(data => {
          setPopulationData(data);
          const start = data.populationByYear[startYear]["total"];
          const end = data.populationByYear[endYear]["total"];
          setStartPopulation(start);
          setEndPopulation(end);
        })
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMunicipality, startYear, endYear, totalPopulation]);

  return (
    <div>
      <Box sx={{
        margin: 3, 
        paddingX: 3,
        paddingY: 1,
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        width: '100vh'
        }}>
        <h1>Väestötiedot kunnittain</h1>
        <Box sx={{ width: '100%' }}>
          <Tabs value={view} onChange={handleViewChange}>
            <Tab value = "municipality" label="Kuntanäkymä"/>
            <Tab value = "comparison" label="Vertailunäkymä"/>
            <Tab value = "summary" label="Yhteenvetonäkymä"/>
          </Tabs>
        </Box>
          {view == "municipality" ? 
          <div>
            <p>Voit tarkastella kuntien väestömuutoksia haluamallasi aikavälillä vuosien 1987-2023 välillä.</p>
            <Box sx={{display: 'flex', flexDirection: 'row', paddingBottom: 4}}>
              <MunicipalityDropdown selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality} includeTotal={true} />
              <YearSelector startYear={startYear} setStartYear={setStartYear} endYear={endYear} setEndYear={setEndYear} />
            </Box>
            {loading && <p>Ladataan tietoja...</p>}
            {error && <p>Virhe: {error}</p>}

            {selectedMunicipality != "" && populationData ? (
              <div>
                <h2>{populationData.municipalityName}</h2>
                <p>Väestötiedot vuosilta {startYear}-{endYear}</p>
                <p>Muutos tarkastelujaksolla {plusFormatter(endPopulation - startPopulation)} ({plusFormatter((((endPopulation - startPopulation) / startPopulation)*100).toFixed(2))} %)</p>
                <PopulationChart data={populationData} startYear={startYear} endYear={endYear} />
              </div>
              )
            : <></>
            }
          </div> 
          : view == "comparison" ? 
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <MunicipalityDropdown selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality} includeTotal={false} />
              <Comparisons municipalityData={populationData} totalPopulation={totalPopulation} />
            </Box>
          : view == "summary" ? <Summary /> : <></>
        }
          
      
      </Box>
    </div>

  );
}

export default MunicipalityViewer;