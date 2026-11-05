
import { LineChart, BarChart } from '@mui/x-charts';
import { useState } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';

function PopulationChart({ data, startYear, endYear }) {

  const [ageGroupView, setAgeGroupView] = useState("numbers");

  const numberFormatter = (value) => new Intl.NumberFormat('fi-FI').format(value);

  const percentageFormatter = (value) => `${(value * 100).toFixed(1)} %`;

  const plusFormatter = (value) => {
    const number = Number(value);
    if (number > 0) {
      return "+" + numberFormatter(number);
    }
    return numberFormatter(number);
  };

  // Muodostetaan kuvaajien käyttämä aineisto.
  const populationByYear = Object.entries(
    data.populationByYear || {}
  )
    .map(([yearKey, record]) => {
      const total = Number(record.total) || 0;
      const age0_14 = Number(record.age0_14) || 0;
      const age15_64 = Number(record.age15_64) || 0;
      const age65plus = Number(record.age65plus) || 0;

      return {
        year: Number(record.year ?? yearKey),
        total,
        age0_14,
        age15_64,
        age65plus,

        // Ikäryhmän osuus kokonaisväestöstä.
        age0_14_relative: total > 0 ? age0_14 / total : 0,
        age15_64_relative: total > 0 ? age15_64 / total : 0,
        age65plus_relative: total > 0 ? age65plus / total : 0
      };
    })
    .filter(record =>
      record.year >= Number(startYear) &&
      record.year <= Number(endYear)
    )
    .sort((a, b) => a.year - b.year);

  // Etsitään tarkastelujakson alku- ja loppuvuoden tiedot.
  const start = populationByYear.find(
    record => record.year === Number(startYear)
  );

  const end = populationByYear.find(
    record => record.year === Number(endYear)
  );

  // Lasketaan muutokset.
  const calculateChange = (startValue, endValue) => {
    if (startValue == null || endValue == null) {
      return 0;
    }

    return endValue - startValue;
  };

  const calculatePercentageChange = (startValue, endValue) => {
    if (!startValue) {
      return 0;
    }

    return ((endValue - startValue) / startValue) * 100;
  };

  const calculateRelativeChange = (startValue, endValue) => {
    if (!start || !end) {
      return 0;
    }

    return (endValue - startValue) * 100;
  };

  const changes = start && end ? [
    {
      label: "0–14-vuotiaat",
      population: calculateChange(start.age0_14, end.age0_14),
      percentage: calculatePercentageChange(start.age0_14, end.age0_14),
      relative: calculateRelativeChange(
        start.age0_14_relative,
        end.age0_14_relative
      )
    },
    {
      label: "15–64-vuotiaat",
      population: calculateChange(start.age15_64, end.age15_64),
      percentage: calculatePercentageChange(start.age15_64, end.age15_64),
      relative: calculateRelativeChange(
        start.age15_64_relative,
        end.age15_64_relative
      )
    },
    {
      label: "65 vuotta täyttäneet",
      population: calculateChange(start.age65plus, end.age65plus),
      percentage: calculatePercentageChange(start.age65plus, end.age65plus),
      relative: calculateRelativeChange(
        start.age65plus_relative,
        end.age65plus_relative
      )
    }
  ] : [];

  const handleChange = (event) => {
    setAgeGroupView(event.target.value);
  };

  return (
    <Box sx={{ paddingBottom: 5 }}>

      <h3>Kokonaisväestö</h3>

      <LineChart
        dataset={populationByYear}
        grid={{ vertical: true, horizontal: true }}
        xAxis={[{
          dataKey: 'year',
          valueFormatter: value => value.toString(),
          tickMinStep: 1
        }]}
        yAxis={[{
          width: 100,
          valueFormatter: numberFormatter
        }]}
        series={[
          {
            dataKey: 'total',
            label: 'Väestö'
          }
        ]}
        height={300}
      />

      <h3>Väestö ikäryhmittäin</h3>

      <FormControl>
        <FormLabel id="select-agegroup-view">
          Näytä
        </FormLabel>

        <RadioGroup
          value={ageGroupView}
          onChange={handleChange}
        >
          <FormControlLabel
            value="numbers"
            control={<Radio />}
            label="Lukumäärä"
          />

          <FormControlLabel
            value="percentages"
            control={<Radio />}
            label="Prosenttiosuudet"
          />
        </RadioGroup>
      </FormControl>

      <BarChart
        dataset={populationByYear}
        grid={{ vertical: true, horizontal: true }}
        xAxis={[{
          dataKey: 'year',
          valueFormatter: value => value.toString()
        }]}
        yAxis={[{
          width: 100,
          valueFormatter: ageGroupView === "numbers"
            ? numberFormatter
            : percentageFormatter
        }]}
        series={
          ageGroupView === "numbers"
            ? [
                { dataKey: 'age0_14', label: '0–14' },
                { dataKey: 'age15_64', label: '15–64' },
                { dataKey: 'age65plus', label: '65+' }
              ]
            : [
                {
                  dataKey: 'age0_14_relative',
                  label: '0–14',
                  valueFormatter: percentageFormatter
                },
                {
                  dataKey: 'age15_64_relative',
                  label: '15–64',
                  valueFormatter: percentageFormatter
                },
                {
                  dataKey: 'age65plus_relative',
                  label: '65+',
                  valueFormatter: percentageFormatter
                }
              ]
        }
        height={300}
      />

      <h4>Muutokset ikäryhmittäin</h4>

      {!start || !end ? (
        <p>Valitulta aikaväliltä puuttuu väestötietoja.</p>
      ) : (
        changes.map(change => (
          <Box key={change.label} sx={{ paddingBottom: 1 }}>
            <p><strong>{change.label}:</strong></p>

            <p>
              Lukumäärän muutos: {plusFormatter(change.population)}
              {" "}({plusFormatter(change.percentage.toFixed(1))} %)
            </p>

            <p>
              Suhteellinen muutos:{" "}
              {plusFormatter(change.relative.toFixed(1))}
              {" "}prosenttiyksikköä
            </p>
          </Box>
        ))
      )}

    </Box>
  );
}

export default PopulationChart;
