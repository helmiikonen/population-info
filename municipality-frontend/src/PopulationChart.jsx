import { LineChart, BarChart } from '@mui/x-charts';
import { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function PopulationChart({data, startYear, endYear}) {

  const populationByYear = []

  const percentageFormatter = (value) => `${(value*100).toFixed(1)}%`

  const numberFormatter = (value) => new Intl.NumberFormat().format(value);

  const plusFormatter = (value) => {
    if (value > 0) {
      return "+" + numberFormatter(value).toString();
    } else {
      return numberFormatter(value).toString();
    }
  }

  const [ageGroupView, setAgeGroupView] = useState("numbers");

  const [populationChange_0_17, setPopulationChange_0_17] = useState(0);
  const [populationChange_18_64, setPopulationChange_18_64] = useState(0);
  const [populationChange_65plus, setPopulationChange_65plus] = useState(0);
  const [percentageChange_0_17, setPercentageChange_0_17] = useState(0);
  const [percentageChange_18_64, setPercentageChange_18_64] = useState(0);
  const [percentageChange_65plus, setPercentageChange_65plus] = useState(0);
  const [relativeChange_0_17, setRelativeChange_0_17] = useState(0);
  const [relativeChange_18_64, setRelativeChange_18_64] = useState(0);
  const [relativeChange_65plus, setRelativeChange_65plus] = useState(0);

  Object.entries(data.populationByYear).map(entry => {

    if (entry[1].year >= startYear && entry[1].year <= endYear) {
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
    }
  }) 

  const start = populationByYear.find(obj => obj.year == startYear)
  const end = populationByYear.find(obj => obj.year == endYear)

  if (populationChange_0_17 != end["age0_17"] - start["age0_17"]) {
    setPopulationChange_0_17(end["age0_17"] - start["age0_17"]);
    setPercentageChange_0_17((end["age0_17"] - start["age0_17"])/start["age0_17"]);
    setRelativeChange_0_17((end["age0_17_relative"] - start["age0_17_relative"]));
  }

  if (populationChange_18_64 != end["age18_64"] - start["age18_64"]) {
    setPopulationChange_18_64(end["age18_64"] - start["age18_64"]);
    setPercentageChange_18_64((end["age18_64"] - start["age18_64"])/start["age18_64"]);
    setRelativeChange_18_64((end["age18_64_relative"] - start["age18_64_relative"]));
  }

  if(populationChange_65plus != end["age65plus"] - start["age65plus"]) {
    setPopulationChange_65plus(end["age65plus"] - start["age65plus"]);
    setPercentageChange_65plus((end["age65plus"] - start["age65plus"])/start["age65plus"]);
    setRelativeChange_65plus((end["age65plus_relative"] - start["age65plus_relative"]));
  }
  
  const handleChange = (event) => {
    setAgeGroupView(event.target.value);
  };


  return (
    <div>
      <h3>Kokonaisväestö</h3>
      <LineChart
        dataset = {populationByYear}
        grid={{ vertical: true, horizontal: true }}
        xAxis={[{ 
          dataKey: 'year', 
          valueFormatter: (value) => value.toString(),
          tickMinStep: 1
        }]}
        yAxis={[{ width: 100, valueFormatter: numberFormatter }]}
        series={[
          {
            dataKey: 'total',
          },
        ]}
        height={300}
      />
      <h3>Väestö ikäryhmittäin</h3>
       <FormControl>
        <FormLabel id="select-agegroup-view">Näytä</FormLabel>
        <RadioGroup
          defaultValue="numbers"
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
          yAxis={[{ width: 100, valueFormatter: numberFormatter }]}
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
          yAxis={[{ width: 100, valueFormatter: percentageFormatter }]}
          series={[
            { dataKey: 'age0_17_relative', label: '0-17', valueFormatter: percentageFormatter },
            { dataKey: 'age18_64_relative', label: '18-64', valueFormatter: percentageFormatter },
            { dataKey: 'age65plus_relative', label: '65+', valueFormatter: percentageFormatter },
          ]}
          height={300}
        />
      } <div>
          <h4>Muutokset ikäryhmittäin</h4>
          <p><strong>0-17 -vuotiaat:</strong></p>
          <p>Lukumäärän muutos: {plusFormatter(populationChange_0_17)} ({plusFormatter((percentageChange_0_17*100).toFixed(1))} %)</p>
          <p>Suhteellinen muutos: {plusFormatter((relativeChange_0_17*100).toFixed(1))} prosenttiyksikköä</p>
          <p><strong>18-64-vuotiaat:</strong></p>
          <p>Lukumäärän muutos: {plusFormatter(populationChange_18_64)} ({plusFormatter((percentageChange_18_64*100).toFixed(1))} %)</p>
          <p>Suhteellinen muutos: {plusFormatter((relativeChange_18_64*100).toFixed(1))} prosenttiyksikköä</p>          
          <p><strong>Yli 65-vuotiaat:</strong></p>
          <p>Lukumäärän muutos: {plusFormatter(populationChange_65plus)} ({plusFormatter((percentageChange_65plus*100).toFixed(1))} %)</p>
          <p>Suhteellinen muutos: {plusFormatter((relativeChange_65plus*100).toFixed(1))} prosenttiyksikköä</p>
        </div>
      
      
       
    </div>
    
  );
}

export default PopulationChart;