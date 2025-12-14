function YearDropdown({ onSelect }) {

  const years = []
  for (let y=1987; y<=2023; y++){
    years.push(y);
  }

  return (
    <select onChange={e => onSelect(e.target.value)}>
      <option value="">Kaikki vuodet</option>
      {years.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );
}

export default YearDropdown;