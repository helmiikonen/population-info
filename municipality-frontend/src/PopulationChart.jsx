import { LineChart, BarChart } from '@mui/x-charts';
import { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function PopulationChart({data}) {

  const populationByYear = []

  const valueFormatter = (value) => `${(value*100).toFixed(1)}%`

  const [ageGroupView, setAgeGroupView] = useState("numbers");

  Object.entries(data.populationByYear).map(entry => {
    populationByYear.push({
      year: entry[1].year.toString(), 
      total: entry[1].total,
      age0_17: entry[1].age0_17,
      age18_64: entry[1].age18_64,
      age65plus: entry[1].age65plus,
      age0_17_relative: entry[1].age0_17 / entry[1].total,
      age18_64_relative: entry[1].age18_64 / entry[1].total,
      age65plus_relative: entry[1].age65plus / entry[1].total,
    })
  })

  const handleChange = (event) => {
    setAgeGroupView(event.target.value);
  };

  return (
    <div>
      <h4>Kunnan kokonaisväestö</h4>
      <LineChart
        dataset = {populationByYear}
        grid={{ vertical: true, horizontal: true }}
        xAxis={[{ dataKey: 'year', valueFormatter: (value) => value.toString() }]}
        yAxis={[{ width: 100 }]}
        series={[
          {
            dataKey: 'total',
          },
        ]}
        height={300}
      />
      <h4>Kunnan väestö ikäryhmittäin</h4>
       <FormControl>
        <FormLabel id="select-agegroup-view">Näytä</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="numbers"
          name="radio-buttons-group"
          value={ageGroupView}
          onChange={handleChange}
        >
          <FormControlLabel value="numbers" control={<Radio />} label="Lukumäärä" />
          <FormControlLabel value="percentages" control={<Radio />} label="Prosenttiosuudet" />  
        </RadioGroup>
      </FormControl>
      {ageGroupView == "numbers" ? 
      <BarChart
          dataset={populationByYear}
          grid={{ vertical: true, horizontal: true }}
          xAxis={[{ dataKey: 'year' }]}
          yAxis={[{ width: 100 }]}
          series={[
            { dataKey: 'age0_17', label: '0-17' },
            { dataKey: 'age18_64', label: '18-64' },
            { dataKey: 'age65plus', label: '65+' },
          ]}
          height={300}
        /> :
         <BarChart
          dataset={populationByYear}
          grid={{ vertical: true, horizontal: true }}
          xAxis={[{ dataKey: 'year' }]}
          yAxis={[{ width: 100, valueFormatter }]}
          series={[
            { dataKey: 'age0_17_relative', label: '0-17', valueFormatter },
            { dataKey: 'age18_64_relative', label: '18-64', valueFormatter },
            { dataKey: 'age65plus_relative', label: '65+', valueFormatter },
          ]}
          height={300}
        />
    
    }
      
       
    </div>
    
  );
}

export default PopulationChart;