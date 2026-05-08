import YearDropdown from "./YearDropdown";
import { useState, useEffect } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function Summary() {

  const years = []
  for (let y=1987; y<=2024; y++){
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

  const [startYear, setStartYear] = useState(1987);
  const [endYear, setEndYear] = useState(2024);

  const [orderByTotalPopulation, setOrderByTotalPopulation] = useState(null);
  const [orderByChange, setOrderByChange] = useState(null);
  const [orderByOver65, setOrderByOver65] = useState(null);
  const [orderBy18To64, setOrderBy18To64] = useState(null);
  const [orderBy0To17, setOrderBy0To17] = useState(null);

  const [viewTop, setViewTop] = useState(10);

  const [viewData, setViewData] = useState("largest-total");

  const changeStartYear = (event) => {
    setStartYear(event.target.value);
  }
  
  const changeEndYear = (event) => {
    setEndYear(event.target.value);
  }

  const [allData, setAllData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      fetch(`http://localhost:8080/api/municipalities-data`)
      .then(res => res.json())
      .then(data => setAllData(data))
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

    if (allData != null) {
      const growthOrder = []
      const over65Order = []
      const age18to64Order = []
      const under18Order = []
      const totalOrder = []
      Object.entries(allData).map(m => {
        const municipalityName = m[1].municipalityName
        if (municipalityName != "KOKO MAA") {
          const populationData = m[1].populationByYear
          const startPopulation = populationData[startYear].total
          const endPopulation = populationData[endYear].total
          const over65Population = populationData[endYear].age65plus
          const over65Percentage = (over65Population / endPopulation) * 100
          const age18to64Population = populationData[endYear].age18_64
          const age18to64Percentage = (age18to64Population / endPopulation) * 100
          const under18Population = populationData[endYear].age0_17
          const under18Percentage = (under18Population / endPopulation) * 100
          const populationChange = ((endPopulation - startPopulation) / startPopulation)*100
          totalOrder.push({municipalityName : municipalityName, totalPopulation: endPopulation})
          growthOrder.push({municipalityName : municipalityName, populationChange: populationChange})
          over65Order.push({municipalityName: municipalityName, over65Percentage: over65Percentage})
          age18to64Order.push({municipalityName: municipalityName, age18to64Percentage: age18to64Percentage})
          under18Order.push({municipalityName: municipalityName, under18Percentage: under18Percentage})
        }        
      })
      totalOrder.sort((a, b) => a.totalPopulation - b.totalPopulation)
      setOrderByTotalPopulation(totalOrder);

      growthOrder.sort((a, b) => a.populationChange - b.populationChange);
      setOrderByChange(growthOrder);

      over65Order.sort((a, b) => a.over65Percentage - b.over65Percentage);
      setOrderByOver65(over65Order);
      
      age18to64Order.sort((a, b) => a.age18to64Percentage - b.age18to64Percentage)
      setOrderBy18To64(age18to64Order);

      under18Order.sort((a, b) => a.under18Percentage - b.under18Percentage)
      setOrderBy0To17(under18Order);
    }
    
  },[allData, startYear, endYear])

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
              <MenuItem value="largest-total">Väkiluvultaan suurimmat kunnat</MenuItem>
              <MenuItem value="smallest-total">Väkiluvultaan pienimmät kunnat</MenuItem>
              <MenuItem value="most-growth">Eniten kasvaneet kunnat</MenuItem>
              <MenuItem value="least-growth">Eniten pienentyneet kunnat</MenuItem>
              <MenuItem value="most-65+">Eniten yli 65-vuotiaita</MenuItem>
              <MenuItem value="least-65+">Vähiten yli 65-vuotiaita</MenuItem>
              <MenuItem value="most-18to64">Eniten 18-64-vuotiaita</MenuItem>
              <MenuItem value="least-18to64">Vähiten 18-64-vuotiaita</MenuItem>
              <MenuItem value="most-under18">Eniten alle 18-vuotiaita</MenuItem>
              <MenuItem value="least-under18">Vähiten alle 18-vuotiaita</MenuItem>
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
                <MenuItem value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </Box>
        <Box sx={{margin: 1, paddingBottom: 5}}> 
          {
          viewData == "largest-total" ?
          <div>
            <h3>Väkiluvultaan suurimmat kunnat vuonna {endYear}</h3>
              {orderByTotalPopulation.toReversed().slice(0, viewTop).map(entry => {
                index += 1;
                return <p>{index}. {entry.municipalityName} {thousandSeparatorFormatter(entry.totalPopulation)}</p>
              })}
          </div>
          : 
          viewData == "smallest-total" ?
          <div>
            <h3>Väkiluvultaan pienimmät kunnat vuonna {endYear}</h3>
              {orderByTotalPopulation.slice(0, viewTop).map(entry => {
                index += 1;
                return <p>{index}. {entry.municipalityName} {thousandSeparatorFormatter(entry.totalPopulation)}</p>
              })}
          </div>
          : 
          viewData == "most-growth" ?
          <div>
            <h3>Suhteellisesti eniten kasvaneet kunnat aikavälillä {startYear}-{endYear}</h3>
              {orderByChange.filter(entry => entry.populationChange > 0).toReversed().slice(0, viewTop).map(entry => {
                index += 1;
                return <p>{index}. {entry.municipalityName} {plusFormatter(entry.populationChange.toFixed(2))} %</p>
              })}
          </div>
          : 
          viewData == "least-growth" ?
          <div>
            <h3>Suhteellisesti eniten pienentyneet kunnat aikavälillä {startYear}-{endYear}</h3>
              {orderByChange.slice(0, viewTop).map(entry => {
                index += 1;
                return <p>{index}. {entry.municipalityName} {plusFormatter(entry.populationChange.toFixed(2))} %</p>
              })}
          </div>
          : 
          viewData == "most-65+" ?
          <div>
            <h3>Suhteellisesti eniten yli 65-vuotiaita vuonna {endYear}</h3>
            {orderByOver65.toReversed().slice(0, viewTop).map(entry => {
              index += 1;
              return <p>{index}. {entry.municipalityName} {entry.over65Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "least-65+" ?
          <div>
            <h3>Suhteellisesti vähiten yli 65-vuotiaita vuonna {endYear}</h3>
            {orderByOver65.slice(0, viewTop).map(entry => {
              index += 1;
              return <p>{index}. {entry.municipalityName} {entry.over65Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "most-18to64" ?
          <div>
            <h3>Suhteellisesti eniten 18-64-vuotiaita vuonna {endYear}</h3>
            {orderBy18To64.toReversed().slice(0, viewTop).map(entry => {
              index += 1;
              return <p>{index}. {entry.municipalityName} {entry.age18to64Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "least-18to64" ?
          <div>
            <h3>Suhteellisesti vähiten 18-64-vuotiaita vuonna {endYear}</h3>
            {orderBy18To64.slice(0, viewTop).map(entry => {
              index += 1;
              return <p>{index}. {entry.municipalityName} {entry.age18to64Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "most-under18" ?
          <div>
            <h3>Suhteellisesti eniten alle 18-vuotiaita vuonna {endYear}</h3>
            {orderBy0To17.toReversed().slice(0, viewTop).map(entry => {
              index += 1;
              return <p>{index}. {entry.municipalityName} {entry.under18Percentage.toFixed(2)} %</p>
            })}
          </div>
          : 
          viewData == "least-under18" ?
          <div>
            <h3>Suhteellisesti vähiten alle 18-vuotiaita vuonna {endYear}</h3>
            {orderBy0To17.slice(0, viewTop).map(entry => {
              index += 1;
              return <p>{index}. {entry.municipalityName} {entry.under18Percentage.toFixed(2)} %</p>
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