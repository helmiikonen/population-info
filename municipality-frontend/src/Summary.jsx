import YearDropdown from "./YearDropdown";
import { useState, useEffect } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function Summary() {

  const years = []
  for (let y=2003; y<=2025; y++){
    years.push(y);
  }

  const viewOptions = [10, 20, 50, 100];

  const plusFormatter = (value) => {
    if (Number(value) > 0) {
      return "+" + value.toString();
    } else {
      return value;
    }
  }

  const thousandSeparatorFormatter = (value) => new Intl.NumberFormat().format(value);

  const [startYear, setStartYear] = useState(2003);
  const [endYear, setEndYear] = useState(2025);

  const [orderByTotalPopulation, setOrderByTotalPopulation] = useState(null);
  const [orderByChange, setOrderByChange] = useState(null);
  const [orderByOver65, setOrderByOver65] = useState(null);
  const [orderBy15To64, setOrderBy15To64] = useState(null);
  const [orderBy0To14, setOrderBy0To14] = useState(null);

  const [viewTop, setViewTop] = useState(10);

  const [viewData, setViewData] = useState("largest-total");

  const changeStartYear = (event) => {
    setStartYear(Number(event.target.value));
  };

  const changeEndYear = (event) => {
    setEndYear(Number(event.target.value));
  };

  const hasPopulationData = (populationData, year) => {
    const yearData = populationData?.[year];
    return yearData != null && Number(yearData.total) > 0;
  };

  const [allData, setAllData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'http://localhost:8080/api/municipalities-data'
      );

      if (!response.ok) {
        throw new Error(`Palvelin palautti virheen: ${response.status}`);
      }

      const data = await response.json();
      setAllData(data);

    } catch (err) {
      console.error(err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  },[])
  
  useEffect(() => {
    if (!allData) return;

    const growthOrder = [];
    const over65Order = [];
    const age15to64Order = [];
    const under15Order = [];
    const totalOrder = [];

    Object.values(allData).forEach(municipality => {
      // Koko maan tietoja ei oteta kuntavertailuun
      if (municipality.municipalityName === "KOKO MAA") return;

      const populationData = municipality.populationByYear;

      // Molempien vuosien pitää sisältää positiivinen väkiluku
      const hasStartData = hasPopulationData(populationData, startYear);
      const hasEndData = hasPopulationData(populationData, endYear);

      // Nykyisen vuoden väkiluku ja ikäjakauma
      if (hasEndData) {
        const endPopulation = Number(populationData[endYear].total);

        const over65Population = Number(populationData[endYear].age65plus);
        const age15to64Population = Number(populationData[endYear].age15_64);
        const under15Population = Number(populationData[endYear].age0_14);

        totalOrder.push({
          municipalityName: municipality.municipalityName,
          totalPopulation: endPopulation
        });

        over65Order.push({
          municipalityName: municipality.municipalityName,
          over65Percentage: (over65Population / endPopulation) * 100
        });

        age15to64Order.push({
          municipalityName: municipality.municipalityName,
          age15to64Percentage: (age15to64Population / endPopulation) * 100
        });

        under15Order.push({
          municipalityName: municipality.municipalityName,
          under15Percentage: (under15Population / endPopulation) * 100
        });
      }

      // Väestönmuutos lasketaan vain, jos molemmilta vuosilta löytyy väestöä
      if (hasStartData && hasEndData) {
        const startPopulation = Number(populationData[startYear].total);
        const endPopulation = Number(populationData[endYear].total);

        const populationChange =
          ((endPopulation - startPopulation) / startPopulation) * 100;

        growthOrder.push({
          municipalityName: municipality.municipalityName,
          populationChange: populationChange
        });
      }
    });

    totalOrder.sort((a, b) => a.totalPopulation - b.totalPopulation);
    growthOrder.sort((a, b) => a.populationChange - b.populationChange);
    over65Order.sort((a, b) => a.over65Percentage - b.over65Percentage);
    age15to64Order.sort((a, b) => a.age15to64Percentage - b.age15to64Percentage);
    under15Order.sort((a, b) => a.under15Percentage - b.under15Percentage);

    setOrderByTotalPopulation(totalOrder);
    setOrderByChange(growthOrder);
    setOrderByOver65(over65Order);
    setOrderBy15To64(age15to64Order);
    setOrderBy0To14(under15Order);

  }, [allData, startYear, endYear]);

  const handleViewChange = (event) => {
    setViewData(event.target.value);
  }

  const handleListLengthChange = (event) => {
    setViewTop(event.target.value);
  }
  
  let index = 0;
    
  return (
    <div>
      <h4>Yhteenveto kuntien väestötiedoista</h4>
      <Box sx={{display: 'flex', flexDirection: 'row', paddingY: 4}}>
        <YearDropdown yearOptions={years} defaultValue={startYear} labelText="Alkaen" handleChange={changeStartYear}/>   
        <YearDropdown yearOptions={years} defaultValue={endYear} labelText="Päättyen" handleChange={changeEndYear}/>
      </Box>
      {orderByChange != null ?
        <div>
        <Box sx={{display: 'flex', flexDirection: 'row', paddingY: 4}}> 
          <FormControl sx={{marginX: 1, minWidth: 300}}>
            <InputLabel id="label-id">Näytä tiedot</InputLabel>
            <Select
              labelId="label-id"
              id="select-view"
              value={viewData}
              label="Näytä tiedot"
              onChange={handleViewChange}
            >
              <MenuItem key={"view-1"} value="largest-total">Väkiluvultaan suurimmat kunnat</MenuItem>
              <MenuItem key={"view-2"} value="smallest-total">Väkiluvultaan pienimmät kunnat</MenuItem>
              <MenuItem key={"view-3"} value="most-growth">Eniten kasvaneet kunnat</MenuItem>
              <MenuItem key={"view-4"} value="least-growth">Eniten pienentyneet kunnat</MenuItem>
              <MenuItem key={"view-5"} value="most-65+">Eniten yli 65-vuotiaita</MenuItem>
              <MenuItem key={"view-6"} value="least-65+">Vähiten yli 65-vuotiaita</MenuItem>
              <MenuItem key={"view-7"} value="most-15to64">Eniten 15-64-vuotiaita</MenuItem>
              <MenuItem key={"view-8"} value="least-15to64">Vähiten 15-64-vuotiaita</MenuItem>
              <MenuItem key={"view-9"} value="most-under15">Eniten alle 15-vuotiaita</MenuItem>
              <MenuItem key={"view-10"} value="least-under15">Vähiten alle 15-vuotiaita</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{marginX: 1, minWidth: 150}}>
            <InputLabel id="label-id">Näytä lukumäärä</InputLabel>
            <Select
              labelId="label-id"
              id="select-year"
              value={viewTop}
              label="Näytä lukumäärä"
              onChange={handleListLengthChange}
            >
              {viewOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </Box>
        <Box sx={{margin: 1, paddingBottom: 5}}> 
          {loading && <p>Ladataan kuntien väestötietoja...</p>}
          {error && <p style={{ color: 'red' }}>Väestötietojen haku epäonnistui: {error}</p>}
          {
          viewData == "largest-total" ?
          <div>
            <h3>Väkiluvultaan suurimmat kunnat vuonna {endYear}</h3>
              {orderByTotalPopulation.toReversed().slice(0, viewTop).map(entry => {
                index += 1;
                return <p key={index}>{index}. {entry.municipalityName} {thousandSeparatorFormatter(entry.totalPopulation)}</p>
              })}
          </div>
          : 
          viewData == "smallest-total" ?
          <div>
            <h3>Väkiluvultaan pienimmät kunnat vuonna {endYear}</h3>
              {orderByTotalPopulation.slice(0, viewTop).map(entry => {
                index += 1;
                return <p key={index}>{index}. {entry.municipalityName} {thousandSeparatorFormatter(entry.totalPopulation)}</p>
              })}
          </div>
          : 
          viewData == "most-growth" ?
          <div>
            <h3>Suhteellisesti eniten kasvaneet kunnat aikavälillä {startYear}-{endYear}</h3>
              {orderByChange.filter(entry => entry.populationChange > 0).toReversed().slice(0, viewTop).map(entry => {
                index += 1;
                return <p key={index}>{index}. {entry.municipalityName} {plusFormatter(entry.populationChange.toFixed(2))} %</p>
              })}
          </div>
          : 
          viewData == "least-growth" ?
          <div>
            <h3>Suhteellisesti eniten pienentyneet kunnat aikavälillä {startYear}-{endYear}</h3>
              {orderByChange.slice(0, viewTop).map(entry => {
                index += 1;
                return <p key={index}>{index}. {entry.municipalityName} {plusFormatter(entry.populationChange.toFixed(2))} %</p>
              })}
          </div>
          : 
          viewData == "most-65+" ?
          <div>
            <h3>Suhteellisesti eniten yli 65-vuotiaita vuonna {endYear}</h3>
            {orderByOver65.toReversed().slice(0, viewTop).map(entry => {
              index += 1;
              return <p key={index}>{index}. {entry.municipalityName} {entry.over65Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "least-65+" ?
          <div>
            <h3>Suhteellisesti vähiten yli 65-vuotiaita vuonna {endYear}</h3>
            {orderByOver65.slice(0, viewTop).map(entry => {
              index += 1;
              return <p key={index}>{index}. {entry.municipalityName} {entry.over65Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "most-15to64" ?
          <div>
            <h3>Suhteellisesti eniten 15-64-vuotiaita vuonna {endYear}</h3>
            {orderBy15To64.toReversed().slice(0, viewTop).map(entry => {
              index += 1;
              return <p key={index}>{index}. {entry.municipalityName} {entry.age15to64Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "least-15to64" ?
          <div>
            <h3>Suhteellisesti vähiten 15-64-vuotiaita vuonna {endYear}</h3>
            {orderBy15To64.slice(0, viewTop).map(entry => {
              index += 1;
              return <p key={index}>{index}. {entry.municipalityName} {entry.age15to64Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "most-under15" ?
          <div>
            <h3>Suhteellisesti eniten alle 15-vuotiaita vuonna {endYear}</h3>
            {orderBy0To14.toReversed().slice(0, viewTop).map(entry => {
              index += 1;
              return <p key={index}>{index}. {entry.municipalityName} {entry.under15Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "least-under15" ?
          <div>
            <h3>Suhteellisesti vähiten alle 15-vuotiaita vuonna {endYear}</h3>
            {orderBy0To14.slice(0, viewTop).map(entry => {
              index += 1;
              return <p key={index}>{index}. {entry.municipalityName} {entry.under15Percentage.toFixed(2)} %</p>
            })}
          </div>
          : <></>
          }
          </Box>
          
        </div>
      :<></>
      }
      
      
      
    </div>
  )
}

export default Summary;