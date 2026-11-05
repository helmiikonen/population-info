import { useState, useEffect } from "react";
import MunicipalityDropdown from "./MunicipalityDropdown";
import YearSelector from "./YearSelector";
import PopulationChart from "./PopulationChart";
import { Tabs, Tab, Box } from "@mui/material";
import Summary from "./Summary";
import Comparisons from "./Comparisons";

function App() {
  const [selectedMunicipality, setSelectedMunicipality] = useState("SSS");
  const [populationData, setPopulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startPopulation, setStartPopulation] = useState(null);
  const [endPopulation, setEndPopulation] = useState(null);
  const [startYear, setStartYear] = useState(2003);
  const [endYear, setEndYear] = useState(2025);
  const [view, setView] = useState("municipality");
  const [totalPopulation, setTotalPopulation] = useState(null);
  const [municipalityYearRange, setMunicipalityYearRange] = useState({firstYear: 2003, lastYear: 2025});

  const thousandSeparatorFormatter = (value) => new Intl.NumberFormat().format(value);

  const plusFormatter = (value) => {
    if (Number(value) > 0) {
      return "+" + thousandSeparatorFormatter(value).toString();
    } else {
      return thousandSeparatorFormatter(value);
    }
  }

  const handleViewChange = (event, value) => setView(value);  

  const getMunicipalityYearRange = (data) => {
    if (!data?.populationByYear) {
      return null;
    }

    const existingYears = Object.entries(data.populationByYear)
      .filter(([, record]) => Number(record.total) > 0)
      .map(([year]) => Number(year))
      .sort((a, b) => a - b);

    if (existingYears.length === 0) {
      return null;
    }

    return {
      firstYear: existingYears[0],
      lastYear: existingYears[existingYears.length - 1]
    };
  };

  const fetchMunicipalityData = async (
    selectedMunicipality,
    setData,
    setStart,
    setEnd
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/municipality/${selectedMunicipality}`
      );

      if (!response.ok) {
        throw new Error(`Palvelin palautti virheen: ${response.status}`);
      }

      const data = await response.json();

      if (data.municipalityCode != null) {
        setData(data);

        const yearRange = getMunicipalityYearRange(data);

        if (yearRange) {
          setMunicipalityYearRange(yearRange);
          setStartYear(yearRange.firstYear);
          setEndYear(yearRange.lastYear);

          const start = data.populationByYear[yearRange.firstYear].total;
          const end = data.populationByYear[yearRange.lastYear].total;

          setStart(start);
          setEnd(end);
        }
      } else {
        throw new Error("Palvelimen vastauksesta puuttuu municipalityCode.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (totalPopulation == null) {
      try {
        fetch(`http://localhost:8080/api/municipality/SSS`)
        .then(res => res.json())
        .then(data => setTotalPopulation(data))
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (!selectedMunicipality) {
      return;
    }

    fetchMunicipalityData(selectedMunicipality, setPopulationData, setStartPopulation, setEndPopulation);

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
              <p>Voit tarkastella kuntien väestömuutoksia haluamallasi aikavälillä vuosien 2003-2025 välillä.</p>
              <Box sx={{display: 'flex', flexDirection: 'row', paddingBottom: 4}}>
                <MunicipalityDropdown selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality} />
                <YearSelector
                  startYear={startYear}
                  setStartYear={setStartYear}
                  endYear={endYear}
                  setEndYear={setEndYear}
                  minYear={municipalityYearRange.firstYear}
                  maxYear={municipalityYearRange.lastYear}
                />
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
          : view == "comparison" ? <Comparisons selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality} fetchMunicipalityData={fetchMunicipalityData}/>
          : view == "summary" ? <Summary /> : <></>
        }
          
      
      </Box>
    </div>

  );
}

export default App;