const fs = require('fs');

const API_KEY = '3d5d9630c59341874221b3bc64123aa5';

async function downloadData() {
  console.log("Fetching T10Y3M...");
  const spreadRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=T10Y3M&api_key=${API_KEY}&file_type=json`);
  const spreadJson = await spreadRes.json();
  
  console.log("Fetching DGS10...");
  const yieldRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${API_KEY}&file_type=json`);
  const yieldJson = await yieldRes.json();
  
  const yieldDict = {};
  yieldJson.observations.forEach(obs => {
    if (obs.value !== '.') yieldDict[obs.date] = parseFloat(obs.value);
  });
  
  const parsedData = spreadJson.observations
    .filter(obs => obs.value !== '.') 
    .map(obs => ({
      date: obs.date, // Store string instead of Date object for JSON
      spread: parseFloat(obs.value),
      yield10: yieldDict[obs.date] !== undefined ? yieldDict[obs.date] : null,
      dateString: obs.date
    }))
    .filter(obs => obs.yield10 !== null);
    
  fs.writeFileSync('./src/data/yieldCurveData.json', JSON.stringify(parsedData, null, 2));
  console.log(`Saved ${parsedData.length} observations to src/data/yieldCurveData.json!`);
}

downloadData().catch(console.error);
