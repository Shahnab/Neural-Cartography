import fetch from 'node-fetch';

async function test() {
  const lat = 40.7128;
  const lon = -74.0060;
  const d = 0.03;
  const s = lat - d;
  const n = lat + d;
  const w = lon - d;
  const e = lon + d;

  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential"](${s},${w},${n},${e});
      way["waterway"~"river|canal"](${s},${w},${n},${e});
      way["railway"~"rail|subway|light_rail"](${s},${w},${n},${e});
      node["place"~"suburb|neighbourhood|city|town"](${s},${w},${n},${e});
    );
    out geom;
  `;

  const res = await fetch('https://lz4.overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `data=${encodeURIComponent(query)}`
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

test();
