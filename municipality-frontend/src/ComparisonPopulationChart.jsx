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

function ComparisonPopulationChart({ data1, data2, startYear, endYear }) {

  const [populationView, setPopulationView] = useState("numbers");

  const numberFormatter = (value) => new Intl.NumberFormat('fi-FI').format(value);

  const years = []
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  
  // Haetaan kunnan tiedot valitulta vuodelta
  const getYearData = (data, year) => {
    const record = data?.populationByYear?.[year];

    if (!record || Number(record.total) <= 0) {
      return null;
    }

    return record;
  };

  // Muodostetaan kuvaajan tiedot yhdelle kunnalle
  const createChartData = (data) => {
    const records = years.map(year => {
      const record = getYearData(data, year);

      if (!record) {
        return null;
      }

      return {
        year: year.toString(),
        total: Number(record.total),
        age0_14: Number(record.age0_14),
        age15_64: Number(record.age15_64),
        age65plus: Number(record.age65plus),

        // Ikäryhmien suhteelliset osuudet prosentteina
        age0_14_relative:
          Number(record.age0_14) / Number(record.total) * 100,

        age15_64_relative:
          Number(record.age15_64) / Number(record.total) * 100,

        age65plus_relative:
          Number(record.age65plus) / Number(record.total) * 100
      };
    });

    // Ensimmäinen vuosi, jolta kunnalla on väestöä
    const firstRecord = records.find(record => record !== null);

    const basePopulation = firstRecord?.total;

    return records.map(record => {
      if (!record || !basePopulation) {
        return {
          year: record?.year ?? null,
          total: null,
          totalIndex: null,
          age0_14_relative: null,
          age15_64_relative: null,
          age65plus_relative: null
        };
      }

      return {
        ...record,
        totalIndex: record.total / basePopulation * 100
      };
    });
  };

  const populationByYear1 = createChartData(data1);
  const populationByYear2 = createChartData(data2);

  // Suhteellisen muutoksen esitysmuoto
  const percentageFormatter = (value) => {
    if (value == null) return "–";

    const change = value - 100;

    return `${change > 0 ? "+" : ""}${change.toFixed(1)} %`;
  };

  const handleViewChange = (event) => {
    setPopulationView(event.target.value);
  };

  // Ikäryhmien osuudet valitun päättymisvuoden tiedoista
  const endRecord1 = getYearData(data1, endYear);
  const endRecord2 = getYearData(data2, endYear);

  const ageShare1_0_14 = endRecord1 ? (Number(endRecord1.age0_14) / Number(endRecord1.total)) * 100 : null;
  const ageShare1_15_64 = endRecord1 ? (Number(endRecord1.age15_64) / Number(endRecord1.total)) * 100 : null;
  const ageShare1_65plus = endRecord1 ? (Number(endRecord1.age65plus) / Number(endRecord1.total)) * 100 : null;
  const ageShare2_0_14 = endRecord2 ? (Number(endRecord2.age0_14) / Number(endRecord2.total)) * 100 : null;
  const ageShare2_15_64 = endRecord2 ? (Number(endRecord2.age15_64) / Number(endRecord2.total)) * 100 : null;
  const ageShare2_65plus = endRecord2 ? (Number(endRecord2.age65plus) / Number(endRecord2.total)) * 100 : null;

  const ageGroupData = [
    {
      ageGroup: "0–14-vuotiaat",
      municipality1: ageShare1_0_14,
      municipality2: ageShare2_0_14,
    },
    {
      ageGroup: "15–64-vuotiaat",
      municipality1: ageShare1_15_64,
      municipality2: ageShare2_15_64,
    },
    {
      ageGroup: "65 vuotta täyttäneet",
      municipality1: ageShare1_65plus,
      municipality2: ageShare2_65plus,
    },
  ];

  return (
    <Box sx={{ paddingBottom: 5 }}>

      <FormControl>
        <FormLabel>Näytä</FormLabel>

        <RadioGroup
          value={populationView}
          onChange={handleViewChange}
        >
          <FormControlLabel
            value="numbers"
            control={<Radio />}
            label="Vertaile lukumääriä"
          />

          <FormControlLabel
            value="percentages"
            control={<Radio />}
            label="Vertaile väestön suhteellista muutosta"
          />
        </RadioGroup>
      </FormControl>

      {populationView === "numbers" ? (
        <Box>
          <h4>Näytetään väestö lukuina</h4>

          <LineChart
            grid={{ vertical: true, horizontal: true }}
            xAxis={[{
              data: years.map(year => year.toString()),
              scaleType: 'point',
              valueFormatter: value => value.toString()
            }]}
            yAxis={[{
              width: 100,
              valueFormatter: numberFormatter
            }]}
            series={[
              {
                data: populationByYear1.map(entry => entry?.total ?? null),
                label: data1.municipalityName
              },
              {
                data: populationByYear2.map(entry => entry?.total ?? null),
                label: data2.municipalityName
              }
            ]}
            height={300}
          />
        </Box>
      ) : (
        <Box>
          <h4>
            Väestön suhteellinen muutos
          </h4>

          <p>
            Kummankin kunnan ensimmäinen saatavilla oleva vuosi
            valitulla aikavälillä = 100 %.
          </p>

          <LineChart
            grid={{ vertical: true, horizontal: true }}
            height={300}
            xAxis={[{
              data: years.map(year => year.toString()),
              scaleType: 'point',
              valueFormatter: value => value.toString()
            }]}
            yAxis={[{
              width: 100,
              valueFormatter: value => `${value} %`
            }]}
            series={[
              {
                data: populationByYear1.map(entry => entry?.totalIndex ?? null),
                label: data1.municipalityName,
                valueFormatter: percentageFormatter
              },
              {
                data: populationByYear2.map(entry => entry?.totalIndex ?? null),
                label: data2.municipalityName,
                valueFormatter: percentageFormatter
              }
            ]}
          />
        </Box>
      )}

      <Box sx={{ marginTop: 5 }}>
        <h4>
          Eri ikäryhmien suhteellinen osuus väestöstä vuonna {endYear}
        </h4>

        <BarChart
          dataset={ageGroupData}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "ageGroup",
              label: "Ikäryhmä",
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: 100,
              label: "Osuus väestöstä (%)",
            },
          ]}
          series={[
            {
              dataKey: "municipality1",
              label: data1.municipalityName,
              valueFormatter: (value) =>
                value == null ? "Ei tietoa" : `${value.toFixed(1)} %`,
            },
            {
              dataKey: "municipality2",
              label: data2.municipalityName,
              valueFormatter: (value) =>
                value == null ? "Ei tietoa" : `${value.toFixed(1)} %`,
            },
          ]}
          height={400}
        />

        {(!endRecord1 || !endRecord2) && (
          <p>
            Huomio: vähintään toiselta kunnalta puuttuu
            väestötieto vuodelta {endYear}.
            Sen ikäryhmän osuutta ei voida näyttää.
          </p>
        )}
      </Box>

    </Box>
  );
}

export default ComparisonPopulationChart;