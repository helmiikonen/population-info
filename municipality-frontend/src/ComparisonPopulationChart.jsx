import { LineChart, BarChart } from '@mui/x-charts';
import { useState } from 'react';
import { Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';

function ComparisonPopulationChart({data1, data2, startYear, endYear}) {

  const populationByYear1 = []
  const populationByYear2 = []

  const [ageGroupView, setAgeGroupView] = useState("age0_17_relative");

  const percentageFormatter = (value) => 
    {
      if (value >= 100) {
        return `+${(value-100).toFixed(1)}%`
      } else {
        return `-${(100-value).toFixed(1)}%`
      }
    }

  const numberFormatter = (value) => new Intl.NumberFormat().format(value);

  const [populationView, setPopulationView] = useState("numbers");

  const setPopulationData = (data, target) => {
    let base = 1;
    let totalIndex = 100;
    Object.entries(data.populationByYear).map(entry => {
      if (entry[1].year >= startYear && entry[1].year <= endYear) {
        if (entry[1].year == startYear) {
          totalIndex = 100
          base = entry[1].total
        } else {
          totalIndex = (entry[1].total / base) * 100
        }
        target.push({
          year: entry[1].year.toString(), 
          total: entry[1].total,
          age0_17: entry[1].age0_17,
          age18_64: entry[1].age18_64,
          age65plus: entry[1].age65plus,
          age0_17_relative: entry[1].age0_17 / entry[1].total,
          age18_64_relative: entry[1].age18_64 / entry[1].total,
          age65plus_relative: entry[1].age65plus / entry[1].total,
          totalIndex: totalIndex
        })
        
      }
    }) 
  }
  
  setPopulationData(data1, populationByYear1);
  setPopulationData(data2, populationByYear2);

  const handleViewChange = (event) => {
    setPopulationView(event.target.value);
  }

  const handleAgeGroupChange = (event) => {
    setAgeGroupView(event.target.value);
  }

  return (
    <Box sx={{paddingBottom: 5}}>
      <FormControl>
        <FormLabel id="select-comparison-view">Näytä</FormLabel>
        <RadioGroup
          defaultValue="numbers"
          value={populationView}
          onChange={handleViewChange}
        >
          <FormControlLabel value="numbers" control={<Radio />} label="Vertaile lukumääriä" />
          <FormControlLabel value="percentages" control={<Radio />} label="Vertaile väestön suhteellista muutosta" />  
        </RadioGroup>
      </FormControl>
      {populationByYear1.length > 0 && populationByYear2.length > 0 ?
        populationView == "numbers" ?
        <div>
          <h4>Näytetään väestö lukuina</h4>
          <LineChart
            grid={{ vertical: true, horizontal: true }}
            xAxis={[{ 
              data: populationByYear1.map(entry => entry.year), 
              valueFormatter: (value) => value.toString(),
              tickMinStep: 1
            }]}
            yAxis={[{ width: 100, valueFormatter: numberFormatter }]}
            series={[
              { data: populationByYear1.map(entry => entry.total), label: data1.municipalityName },
              { data: populationByYear2.map(entry => entry.total), label: data2.municipalityName },
            ]}
            height={300}
          />
        </div>
        : 
        <div>
          <h4>Näytetään väestön suhteellinen muutos vuodesta {startYear} (100 % = väestö vuonna {startYear})</h4>
          <LineChart
            grid={{ vertical: true, horizontal: true }}
            height={300}
            xAxis={[{ 
              data: populationByYear1.map(entry => entry.year), 
              valueFormatter: (value) => value.toString(),
              tickMinStep: 1
            }]}
            yAxis={[{ width: 100, valueFormatter: (value) => value.toString() + " %" }]}
            series={[
              { 
                data: populationByYear1.map(entry => entry.totalIndex), 
                label: data1.municipalityName,  
                valueFormatter: (value) => percentageFormatter(value)
              },
              { 
                data: populationByYear2.map(entry => entry.totalIndex), 
                label: data2.municipalityName,
                valueFormatter: (value) => percentageFormatter(value) 
              },
            ]}
          />
        </div>
       
        : <></>
    }
    {populationByYear1.length > 0 && populationByYear2.length > 0 ? 
    <div>
      <h3>Vertaile eri ikäryhmien suhteellisia osuuksia</h3>
       <FormControl >
        <FormLabel id="select-agegroup-view">Näytä</FormLabel>
        <RadioGroup
          sx={{display: 'flex', flexDirection: 'row'}}
          defaultValue="age0_17_relative"
          value={ageGroupView}
          onChange={handleAgeGroupChange}
        >
          <FormControlLabel value="age0_17_relative" control={<Radio />} label="Alle 18-vuotiaat" />
          <FormControlLabel value="age18_64_relative" control={<Radio />} label="18-64-vuotiaat" /> 
          <FormControlLabel value="age65plus_relative" control={<Radio />} label="Yli 65-vuotiaat" /> 
        </RadioGroup>
      </FormControl>
      <BarChart
        grid={{ vertical: true, horizontal: true }}
        xAxis={[{ 
                data: populationByYear1.map(entry => entry.year), 
                valueFormatter: (value) => value.toString(),
                tickMinStep: 1
              }]}
        yAxis={[{ width: 100, valueFormatter: (value) => (value*100).toString() + " %" }]}
        series={[
          { 
            data: populationByYear1.map(entry => entry[ageGroupView]), 
            label: data1.municipalityName,
            valueFormatter: (value) => ((value * 100).toFixed(1)).toString() + " %"
          },
          { 
            data: populationByYear2.map(entry => entry[ageGroupView]), 
            label: data2.municipalityName,
            valueFormatter: (value) => ((value * 100).toFixed(1)).toString() + " %"
          }
          
        ]}
        height={300}
      />
    </div>
    :<></>
    }
      
    </Box>
  );
}

export default ComparisonPopulationChart;