import { Box } from '@mui/material';
import YearDropdown from './YearDropdown';
import MunicipalityDropdown from './MunicipalityDropdown';
import { useState, useEffect } from 'react';
import ComparisonPopulationChart from './ComparisonPopulationChart';

function Comparisons({selectedMunicipality, setSelectedMunicipality}) {

  const [municipality1, setMunicipality1] = useState(
    selectedMunicipality || "SSS"
  );

  const [municipality2, setMunicipality2] = useState("SSS");

  const [startYear, setStartYear] = useState(2003);
  const [endYear, setEndYear] = useState(2025);
  
  const years = []
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  const [municipality1Data, setMunicipality1Data] = useState(null);
  const [municipality2Data, setMunicipality2Data] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changeStartYear = (event) => {
    const year = Number(event.target.value);

    setStartYear(year);

    if (year >= endYear) {
      setEndYear(Math.min(year + 1, 2025));
    }
  };

  const changeEndYear = (event) => {
    const year = Number(event.target.value);

    setEndYear(year);

    if (year <= startYear) {
      setStartYear(Math.max(year - 1, 2003));
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [response1, response2] = await Promise.all([
          fetch(`http://localhost:8080/api/municipality/${municipality1}`),
          fetch(`http://localhost:8080/api/municipality/${municipality2}`)
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error("Kuntatietojen hakeminen epäonnistui.");
        }

        const [data1, data2] = await Promise.all([
          response1.json(),
          response2.json()
        ]);

        if (!cancelled) {
          setMunicipality1Data(data1);
          setMunicipality2Data(data2);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [municipality1, municipality2]);

  useEffect(() => {
    setSelectedMunicipality(municipality1);
  }, [municipality1, setSelectedMunicipality]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <p>Vertaile valitsemiesi kuntien väestömuutoksia haluamallasi aikavälillä</p>

      <Box sx={{ display: 'flex', flexDirection: 'row', paddingY: 4 }}>
        <MunicipalityDropdown
          selectedMunicipality={municipality1}
          setSelectedMunicipality={setMunicipality1}
        />

        <MunicipalityDropdown
          selectedMunicipality={municipality2}
          setSelectedMunicipality={setMunicipality2}
        />

        <YearDropdown
          yearOptions={years.filter(year => year < endYear)}
          defaultValue={startYear}
          labelText="Alkaen"
          handleChange={changeStartYear}
        />

        <YearDropdown
          yearOptions={years.filter(year => year > startYear)}
          defaultValue={endYear}
          labelText="Päättyen"
          handleChange={changeEndYear}
        />
      </Box>

      {loading && <p>Haetaan kuntien väestötietoja...</p>}

      {error && <p>Virhe: {error}</p>}

      {municipality1Data && municipality2Data && !loading && !error && (
        municipality1 === "SSS" && municipality2 === "SSS" ? (
          <h3>Valitse vertailtavat kunnat</h3>
        ) : (
          <Box sx={{ marginTop: 5 }}>
            <h3>
              Vertaillaan kuntia {municipality1Data.municipalityName} ja{" "}
              {municipality2Data.municipalityName} aikavälillä{" "}
              {startYear}-{endYear}
            </h3>

            <ComparisonPopulationChart
              data1={municipality1Data}
              data2={municipality2Data}
              startYear={startYear}
              endYear={endYear}
            />
          </Box>
        )
      )}
    </Box>
  );
}

export default Comparisons;