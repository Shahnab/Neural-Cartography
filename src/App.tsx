/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Search, Map as MapIcon, Loader2 } from 'lucide-react';
import { MapControls, Text } from '@react-three/drei';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const CITIES = [
  // North America
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, d: 0.04 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437, d: 0.04 },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, d: 0.04 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lon: -122.4194, d: 0.04 },
  { name: 'Toronto', country: 'Canada', lat: 43.6510, lon: -79.3470, d: 0.04 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, d: 0.03 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, d: 0.04 },
  
  // South America
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, d: 0.05 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, d: 0.04 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, d: 0.04 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lon: -74.0721, d: 0.04 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428, d: 0.04 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693, d: 0.04 },

  // Europe
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, d: 0.04 },
  { name: 'Manchester', country: 'United Kingdom', lat: 53.4808, lon: -2.2426, d: 0.03 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, d: 0.03 },
  { name: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357, d: 0.03 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, d: 0.04 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.5820, d: 0.03 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, d: 0.04 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, d: 0.03 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, d: 0.03 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900, d: 0.03 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lon: 12.3155, d: 0.02 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, d: 0.03 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, d: 0.03 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, d: 0.03 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, d: 0.04 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, d: 0.03 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, d: 0.03 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, d: 0.03 },

  // Asia
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, d: 0.04 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, d: 0.04 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, d: 0.04 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, d: 0.04 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694, d: 0.03 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, d: 0.04 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, d: 0.04 },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, d: 0.04 },
  { name: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946, d: 0.04 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, d: 0.04 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, d: 0.03 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, d: 0.03 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, d: 0.04 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, d: 0.04 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, d: 0.04 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, d: 0.04 },

  // Africa
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, d: 0.04 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, d: 0.04 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, d: 0.04 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, d: 0.04 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, d: 0.04 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898, d: 0.04 },

  // Oceania
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, d: 0.04 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, d: 0.04 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, d: 0.04 },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762, d: 0.03 },
];

const GROUPED_CITIES = Object.entries(
  CITIES.reduce((acc, city, index) => {
    if (!acc[city.country]) acc[city.country] = [];
    acc[city.country].push({ ...city, index });
    return acc;
  }, {} as Record<string, (typeof CITIES[0] & { index: number })[]>)
).sort((a, b) => a[0].localeCompare(b[0]));

const fetchCityDetails = async (cityIndex: number) => {
  const city = CITIES[cityIndex];
  const { name, country, lat, lon, d } = city;
  
  // 1. Fetch exact city boundary from Nominatim
  const nomQuery = encodeURIComponent(`${name}, ${country}`);
  const nomRes = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${nomQuery}&polygon_geojson=1&format=json`);
  const nomData = await nomRes.json();
  
  let boundaryRings: [number, number][][] = [];
  let s = lat - d;
  let n = lat + d;
  let w = lon - d;
  let e = lon + d;

  if (nomData && nomData.length > 0) {
    const cityItem = nomData.find((d: any) => d.geojson && (d.geojson.type === 'Polygon' || d.geojson.type === 'MultiPolygon')) || nomData[0];
    if (cityItem && cityItem.geojson) {
      if (cityItem.geojson.type === 'Polygon') {
        boundaryRings = cityItem.geojson.coordinates;
      } else if (cityItem.geojson.type === 'MultiPolygon') {
        cityItem.geojson.coordinates.forEach((poly: any) => {
          boundaryRings.push(...poly);
        });
      }
      // Use the bounding box from Nominatim, but limit its size to prevent massive Overpass queries
      if (cityItem.boundingbox) {
        const bboxS = parseFloat(cityItem.boundingbox[0]);
        const bboxN = parseFloat(cityItem.boundingbox[1]);
        const bboxW = parseFloat(cityItem.boundingbox[2]);
        const bboxE = parseFloat(cityItem.boundingbox[3]);
        
        const cx = (bboxW + bboxE) / 2;
        const cy = (bboxS + bboxN) / 2;
        
        const MAX_DEG = 0.15; // Limit to roughly 15km x 15km
        s = Math.max(bboxS, cy - MAX_DEG / 2);
        n = Math.min(bboxN, cy + MAX_DEG / 2);
        w = Math.max(bboxW, cx - MAX_DEG / 2);
        e = Math.min(bboxE, cx + MAX_DEG / 2);
      }
    }
  }

  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential"](${s},${w},${n},${e});
      way["waterway"~"river|canal"](${s},${w},${n},${e});
      way["railway"~"rail|subway|light_rail"](${s},${w},${n},${e});
    );
    out geom;
  `;

  const endpoints = [
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter',
    'https://overpass.osm.ch/api/interpreter'
  ];

  let data = null;
  let lastError = null;

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        data = await res.json();
        if (data && data.elements) break; // Success, exit loop
      } else {
        lastError = new Error(`HTTP ${res.status} from ${endpoint}`);
      }
    } catch (err: any) {
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error(`Timeout (15s) from ${endpoint}`);
      }
    }
    
    // Small delay before trying next endpoint if not the last one
    if (i < endpoints.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (!data || !data.elements) {
    console.error("Overpass API failed:", lastError);
    throw new Error("GEOSPATIAL DATA EXTRACTION FAILED: ALL ENDPOINTS BUSY OR TIMED OUT. PLEASE RETRY IN A FEW SECONDS.");
  }
  
  const roads: [number, number][][] = [];
  const water: [number, number][][] = [];
  const railways: [number, number][][] = [];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  // Add boundary rings to min/max calculation
  boundaryRings.forEach(ring => {
    ring.forEach(([lon, lat]) => {
      minX = Math.min(minX, lon);
      maxX = Math.max(maxX, lon);
      minY = Math.min(minY, lat);
      maxY = Math.max(maxY, lat);
    });
  });

  data.elements.forEach((el: any) => {
    if (el.type === 'way' && el.geometry) {
      const pts: [number, number][] = el.geometry.map((g: any) => {
        minX = Math.min(minX, g.lon);
        maxX = Math.max(maxX, g.lon);
        minY = Math.min(minY, g.lat);
        maxY = Math.max(maxY, g.lat);
        return [g.lon, g.lat];
      });
      if (el.tags && el.tags.waterway) {
        water.push(pts);
      } else if (el.tags && el.tags.railway) {
        railways.push(pts);
      } else {
        roads.push(pts);
      }
    }
  });

  if (roads.length === 0 && water.length === 0 && railways.length === 0 && boundaryRings.length === 0) {
    throw new Error("NO MAP DATA FOUND FOR THIS LOCATION");
  }

  // If we have no data but we do have boundaries, we still need a valid center
  if (minX === Infinity) {
    minX = w; maxX = e; minY = s; maxY = n;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = Math.max(maxX - minX, maxY - minY) / 20;

  const normalize = (lon: number, lat: number): [number, number] => {
    return [(lon - cx) / scale, (lat - cy) / scale];
  };

  const normalizedRoads = roads.map(pts => pts.map(([lon, lat]) => normalize(lon, lat)));
  const normalizedWater = water.map(pts => pts.map(([lon, lat]) => normalize(lon, lat)));
  const normalizedRailways = railways.map(pts => pts.map(([lon, lat]) => normalize(lon, lat)));
  const normalizedBoundaries = boundaryRings.map(pts => pts.map(([lon, lat]) => normalize(lon, lat)));

  return { 
    roads: normalizedRoads, 
    water: normalizedWater, 
    railways: normalizedRailways,
    boundaries: normalizedBoundaries
  };
};

const buildLineSegments = (lines: [number, number][][]) => {
  let count = 0;
  lines.forEach(line => {
    count += (line.length - 1) * 2;
  });
  
  const positions = new Float32Array(count * 3);
  let idx = 0;
  lines.forEach(line => {
    for (let i = 0; i < line.length - 1; i++) {
      positions[idx++] = line[i][0];
      positions[idx++] = line[i][1];
      positions[idx++] = 0;
      
      positions[idx++] = line[i+1][0];
      positions[idx++] = line[i+1][1];
      positions[idx++] = 0;
    }
  });
  return positions;
};

function RunnerGroup({ 
  id,
  positions, 
  color, 
  runnerColor, 
  startIdx, 
  maxCount, 
  duration, 
  trailLength, 
  runnerSize,
  onUpdateHead,
  onComplete
}: { 
  id: string,
  positions: Float32Array, 
  color: string, 
  runnerColor: string, 
  startIdx: number, 
  maxCount: number, 
  duration: number, 
  trailLength: number, 
  runnerSize: number,
  onUpdateHead: (id: string, pos: THREE.Vector3 | null) => void,
  onComplete: (id: string) => void
}) {
  const lineGeoRef = useRef<THREE.BufferGeometry>(null);
  const linePointsGeoRef = useRef<THREE.BufferGeometry>(null);
  const runnerGeoRef = useRef<THREE.BufferGeometry>(null);
  const headMeshRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const progress = useRef(0);
  const completed = useRef(false);
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (progress.current < 1) {
      progress.current += delta / duration;
      if (progress.current >= 1) {
        progress.current = 1;
        if (!completed.current) {
          completed.current = true;
          if (runnerGeoRef.current) runnerGeoRef.current.setDrawRange(0, 0);
          if (lineGeoRef.current) lineGeoRef.current.setDrawRange(startIdx, maxCount);
          if (linePointsGeoRef.current) linePointsGeoRef.current.setDrawRange(startIdx, maxCount);
          if (headMeshRef.current) headMeshRef.current.visible = false;
          onUpdateHead(id, null);
          onComplete(id);
        }
      } else {
        if (lineGeoRef.current && runnerGeoRef.current && linePointsGeoRef.current) {
          const currentCount = Math.floor(progress.current * (maxCount / 2)) * 2;
          lineGeoRef.current.setDrawRange(startIdx, currentCount);
          linePointsGeoRef.current.setDrawRange(startIdx, currentCount);
          
          // Ensure trail length is always a multiple of 2 (line segments)
          const safeTrailLength = Math.floor(trailLength / 2) * 2;
          const runnerStart = startIdx + Math.max(0, currentCount - safeTrailLength);
          const runnerCount = Math.min(currentCount, safeTrailLength);
          runnerGeoRef.current.setDrawRange(runnerStart, runnerCount);

          if (currentCount > 0) {
            const headIdx = startIdx + currentCount - 1;
            vec.set(
              positions[headIdx * 3],
              positions[headIdx * 3 + 1],
              positions[headIdx * 3 + 2]
            );
            onUpdateHead(id, vec);
            if (headMeshRef.current) {
              headMeshRef.current.position.copy(vec);
              headMeshRef.current.visible = true;
            }
          }
        }
      }
    }

    // Animate head
    if (headMeshRef.current && headMeshRef.current.visible) {
      if (haloRef.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.15;
        haloRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group>
      {/* Permanent Map Lines */}
      <lineSegments>
        <bufferGeometry ref={lineGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
      </lineSegments>
      
      {/* Permanent Map Points (adds the glowing dotted texture) */}
      <points>
        <bufferGeometry ref={linePointsGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={color} size={runnerSize * 0.5} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </points>

      {/* Active Runner Trail */}
      <points>
        <bufferGeometry ref={runnerGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={runnerColor} size={runnerSize * 1.5} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* Minimalistic Glowing Head */}
      <group ref={headMeshRef} visible={false}>
        <pointLight color={runnerColor} intensity={1.5} distance={3} decay={2} />
        <mesh ref={coreRef}>
          <sphereGeometry args={[runnerSize * 1.5, 16, 16]} />
          <meshBasicMaterial color={runnerColor} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={haloRef}>
          <sphereGeometry args={[runnerSize * 3.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[runnerSize * 0.6, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function AnimatedLayer({ 
  idPrefix,
  positions, 
  color, 
  runnerColor, 
  numRunners = 1, 
  duration = 60,
  trailLength = 800,
  runnerSize = 0.15,
  onUpdateHead,
  onComplete
}: { 
  idPrefix: string,
  positions: Float32Array, 
  color: string, 
  runnerColor: string, 
  numRunners?: number, 
  duration?: number,
  trailLength?: number,
  runnerSize?: number,
  onUpdateHead: (id: string, pos: THREE.Vector3 | null) => void,
  onComplete: (id: string) => void
}) {
  useEffect(() => {
    if (positions.length === 0) {
      for (let i = 0; i < numRunners; i++) {
        onComplete(`${idPrefix}-${i}`);
      }
    }
  }, [positions.length, numRunners, idPrefix, onComplete]);

  if (positions.length === 0) return null;
  
  const totalVertices = positions.length / 3;
  const verticesPerRunner = Math.floor((totalVertices / numRunners) / 2) * 2;

  return (
    <group>
      {Array.from({ length: numRunners }).map((_, i) => {
        const startIdx = i * verticesPerRunner;
        const maxCount = (i === numRunners - 1) ? totalVertices - startIdx : verticesPerRunner;
        return (
          <RunnerGroup
            key={i}
            id={`${idPrefix}-${i}`}
            positions={positions}
            color={color}
            runnerColor={runnerColor}
            startIdx={startIdx}
            maxCount={maxCount}
            duration={duration}
            trailLength={trailLength}
            runnerSize={runnerSize}
            onUpdateHead={onUpdateHead}
            onComplete={onComplete}
          />
        );
      })}
    </group>
  );
}

function CornerFrames({ headsRef }: { headsRef: React.MutableRefObject<Map<string, THREE.Vector3>> }) {
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const circleGeoRef = useRef<THREE.BufferGeometry>(null);
  const circleMatRef = useRef<THREE.LineBasicMaterial>(null);
  
  // Max 20 agents, each has 4 corners (16 vertices) + data bars (8 vertices)
  const positions = useMemo(() => new Float32Array(20 * 24 * 3), []);
  const circlePositions = useMemo(() => {
    const pts = new Float32Array(64 * 3);
    for (let i = 0; i < 32; i++) {
      const ang = (i / 32) * Math.PI * 2;
      const nextAng = ((i + 1) / 32) * Math.PI * 2;
      pts[i * 6] = Math.cos(ang);
      pts[i * 6 + 1] = Math.sin(ang);
      pts[i * 6 + 2] = 0;
      pts[i * 6 + 3] = Math.cos(nextAng);
      pts[i * 6 + 4] = Math.sin(nextAng);
      pts[i * 6 + 5] = 0;
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (!geoRef.current) return;
    const heads = Array.from(headsRef.current.values());
    let vertexCount = 0;
    const size = 0.35; // Much larger L-frame
    const arm = 0.12; // Longer arm
    const time = state.clock.elapsedTime;

    heads.forEach((head) => {
      const x = head.x;
      const y = head.y;
      const z = head.z;

      // Dynamic rotation/wobble for the frame
      const wobbleX = Math.sin(time * 2 + x) * 0.02;
      const wobbleY = Math.cos(time * 2 + y) * 0.02;

      // Top Left
      positions[vertexCount++] = x - size + wobbleX; positions[vertexCount++] = y + size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x - size + arm + wobbleX; positions[vertexCount++] = y + size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x - size + wobbleX; positions[vertexCount++] = y + size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x - size + wobbleX; positions[vertexCount++] = y + size - arm + wobbleY; positions[vertexCount++] = z;

      // Top Right
      positions[vertexCount++] = x + size + wobbleX; positions[vertexCount++] = y + size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size - arm + wobbleX; positions[vertexCount++] = y + size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size + wobbleX; positions[vertexCount++] = y + size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size + wobbleX; positions[vertexCount++] = y + size - arm + wobbleY; positions[vertexCount++] = z;

      // Bottom Left
      positions[vertexCount++] = x - size + wobbleX; positions[vertexCount++] = y - size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x - size + arm + wobbleX; positions[vertexCount++] = y - size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x - size + wobbleX; positions[vertexCount++] = y - size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x - size + wobbleX; positions[vertexCount++] = y - size + arm + wobbleY; positions[vertexCount++] = z;

      // Bottom Right
      positions[vertexCount++] = x + size + wobbleX; positions[vertexCount++] = y - size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size - arm + wobbleX; positions[vertexCount++] = y - size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size + wobbleX; positions[vertexCount++] = y - size + wobbleY; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size + wobbleX; positions[vertexCount++] = y - size + arm + wobbleY; positions[vertexCount++] = z;

      // Data bars (simulated scanning readout)
      const barH = 0.15 * Math.sin(time * 8 + x * 10);
      positions[vertexCount++] = x + size + 0.08; positions[vertexCount++] = y - size; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size + 0.08; positions[vertexCount++] = y - size + 0.08 + barH; positions[vertexCount++] = z;
      
      const barH2 = 0.12 * Math.cos(time * 10 + y * 8);
      positions[vertexCount++] = x + size + 0.12; positions[vertexCount++] = y - size; positions[vertexCount++] = z;
      positions[vertexCount++] = x + size + 0.12; positions[vertexCount++] = y - size + 0.06 + barH2; positions[vertexCount++] = z;
    });

    geoRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geoRef.current.setDrawRange(0, vertexCount / 3);

    if (matRef.current) {
      matRef.current.opacity = 0.4 + Math.sin(time * 12) * 0.2;
    }
    if (circleMatRef.current) {
      circleMatRef.current.opacity = 0.1 + Math.sin(time * 8) * 0.05;
    }
  });

  return (
    <group>
      <lineSegments>
        <bufferGeometry ref={geoRef} />
        <lineBasicMaterial ref={matRef} color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </lineSegments>
      {/* Scanning Circles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={i} visible={false} ref={(el) => {
          if (el) {
            const heads = Array.from(headsRef.current.values());
            if (heads[i]) {
              el.position.copy(heads[i]);
              el.visible = true;
              const s = 0.25 + Math.sin(Date.now() * 0.005 + i) * 0.05;
              el.scale.set(s, s, s);
            } else {
              el.visible = false;
            }
          }
        }}>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={circlePositions.length / 3}
                array={circlePositions}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function RunnerInteractions({ headsRef }: { headsRef: React.MutableRefObject<Map<string, THREE.Vector3>> }) {
  const linesGeoRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const pointsGeoRef = useRef<THREE.BufferGeometry>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  
  const positions = useMemo(() => new Float32Array(200 * 3), []); // max 100 interaction lines
  const midpoints = useMemo(() => new Float32Array(100 * 3), []); // max 100 interaction points

  useFrame((state) => {
    if (!linesGeoRef.current || !pointsGeoRef.current) return;
    const heads = Array.from(headsRef.current.values());
    let lineCount = 0;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < heads.length; i++) {
      for (let j = i + 1; j < heads.length; j++) {
        const dist = heads[i].distanceTo(heads[j]);
        if (dist < 3.0) { // Increased threshold for interaction
          // Create a "scanning beam" effect between agents
          positions[lineCount * 6] = heads[i].x;
          positions[lineCount * 6 + 1] = heads[i].y;
          positions[lineCount * 6 + 2] = heads[i].z;
          positions[lineCount * 6 + 3] = heads[j].x;
          positions[lineCount * 6 + 4] = heads[j].y;
          positions[lineCount * 6 + 5] = heads[j].z;
          
          // Midpoint pulses
          midpoints[lineCount * 3] = (heads[i].x + heads[j].x) / 2;
          midpoints[lineCount * 3 + 1] = (heads[i].y + heads[j].y) / 2;
          midpoints[lineCount * 3 + 2] = (heads[i].z + heads[j].z) / 2;
          
          lineCount++;
          if (lineCount >= 100) break;
        }
      }
      if (lineCount >= 100) break;
    }
    
    linesGeoRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    linesGeoRef.current.setDrawRange(0, lineCount * 2);
    
    pointsGeoRef.current.setAttribute('position', new THREE.BufferAttribute(midpoints, 3));
    pointsGeoRef.current.setDrawRange(0, lineCount);

    if (materialRef.current) {
      materialRef.current.opacity = 0.1 + Math.sin(time * 15) * 0.1;
      materialRef.current.color.setHSL(0.1, 1, 0.5 + Math.sin(time * 5) * 0.2);
    }
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.size = 0.12 + Math.sin(time * 20) * 0.04;
      pointsMaterialRef.current.opacity = 0.4 + Math.sin(time * 18) * 0.4;
    }
  });

  return (
    <group>
      <lineSegments>
        <bufferGeometry ref={linesGeoRef} />
        <lineBasicMaterial ref={materialRef} color="#ffaa00" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points>
        <bufferGeometry ref={pointsGeoRef} />
        <pointsMaterial ref={pointsMaterialRef} color="#ffffff" size={0.12} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

function CityLabelAgent({ 
  cityName, 
  onComplete, 
  onUpdateHead 
}: { 
  cityName: string, 
  onComplete: (id: string) => void,
  onUpdateHead: (id: string, pos: THREE.Vector3 | null) => void
}) {
  const [positions, setPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    const loader = new FontLoader();
    // Load a standard font from a reliable CDN
    loader.load('https://unpkg.com/three@0.150.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const shapes = font.generateShapes(cityName.toUpperCase(), 1.2);
      const lines: [number, number][][] = [];
      
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      shapes.forEach(shape => {
        // Use getSpacedPoints for more uniform and detailed tracing
        const points = shape.getSpacedPoints(40);
        const line: [number, number][] = [];
        points.forEach(p => {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
          line.push([p.x, p.y]);
        });
        lines.push(line);

        shape.holes.forEach(hole => {
          const hPoints = hole.getSpacedPoints(20);
          const hLine: [number, number][] = [];
          hPoints.forEach(p => {
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
            hLine.push([p.x, p.y]);
          });
          lines.push(hLine);
        });
      });

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      // Center the lines and slightly elevate them so they sit above the map
      const centeredLines = lines.map(line => 
        line.map(p => [p[0] - cx, p[1] - cy] as [number, number])
      );

      setPositions(buildLineSegments(centeredLines));
    });
  }, [cityName]);

  if (!positions) return null;

  return (
    <group position={[0, 0, 0.5]}>
      <AnimatedLayer 
        idPrefix="label"
        positions={positions}
        color="#ffffff"
        runnerColor="#ffffff"
        numRunners={1}
        duration={60} // Match other agents' duration
        trailLength={600}
        runnerSize={0.04}
        onUpdateHead={onUpdateHead}
        onComplete={onComplete}
      />
    </group>
  );
}

function AreaFrames({ isComplete }: { isComplete: boolean }) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  
  const positions = useMemo(() => {
    const pts = new Float32Array(16 * 3); // 4 corners * 2 lines * 2 vertices
    const size = 10.5; // Slightly larger than the 20x20 area
    const arm = 1.5;
    
    let idx = 0;
    // Top Left
    pts[idx++] = -size; pts[idx++] = size; pts[idx++] = 0;
    pts[idx++] = -size + arm; pts[idx++] = size; pts[idx++] = 0;
    pts[idx++] = -size; pts[idx++] = size; pts[idx++] = 0;
    pts[idx++] = -size; pts[idx++] = size - arm; pts[idx++] = 0;

    // Top Right
    pts[idx++] = size; pts[idx++] = size; pts[idx++] = 0;
    pts[idx++] = size - arm; pts[idx++] = size; pts[idx++] = 0;
    pts[idx++] = size; pts[idx++] = size; pts[idx++] = 0;
    pts[idx++] = size; pts[idx++] = size - arm; pts[idx++] = 0;

    // Bottom Left
    pts[idx++] = -size; pts[idx++] = -size; pts[idx++] = 0;
    pts[idx++] = -size + arm; pts[idx++] = -size; pts[idx++] = 0;
    pts[idx++] = -size; pts[idx++] = -size; pts[idx++] = 0;
    pts[idx++] = -size; pts[idx++] = -size + arm; pts[idx++] = 0;

    // Bottom Right
    pts[idx++] = size; pts[idx++] = -size; pts[idx++] = 0;
    pts[idx++] = size - arm; pts[idx++] = -size; pts[idx++] = 0;
    pts[idx++] = size; pts[idx++] = -size; pts[idx++] = 0;
    pts[idx++] = size; pts[idx++] = -size + arm; pts[idx++] = 0;

    return pts;
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    if (isComplete) {
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, 0, 0.05);
    } else {
      matRef.current.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial ref={matRef} color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

function CityMap({ data, cityName, onComplete, onAgentComplete, isComplete, forceFit }: { data: any, cityName: string, onComplete: () => void, onAgentComplete: (id: string) => void, isComplete: boolean, forceFit: number }) {
  const { camera, controls } = useThree();
  
  const roadPositions = useMemo(() => buildLineSegments(data.roads), [data.roads]);
  const waterPositions = useMemo(() => buildLineSegments(data.water), [data.water]);
  const railwayPositions = useMemo(() => buildLineSegments(data.railways), [data.railways]);
  const boundaryPositions = useMemo(() => buildLineSegments(data.boundaries), [data.boundaries]);

  // Center camera on load or when forceFit changes
  useEffect(() => {
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);
    if (controls) {
      const mapControls = controls as any;
      mapControls.target.set(0, 0, 0);
      mapControls.update();
    }
  }, [data, forceFit, camera, controls]);

  const headsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const onUpdateHead = useCallback((id: string, pos: THREE.Vector3 | null) => {
    if (pos) {
      headsRef.current.set(id, pos.clone());
    } else {
      headsRef.current.delete(id);
    }
  }, []);

  const completionRef = useRef(new Set<string>());
  const handleComplete = useCallback((id: string) => {
    completionRef.current.add(id);
    onAgentComplete(id);
    if (completionRef.current.size === 7) { // 3 roads + 1 water + 1 railway + 1 boundary + 1 label = 7 runners total
      onComplete();
    }
  }, [onComplete, onAgentComplete]);

  return (
    <group>
      <AreaFrames isComplete={isComplete} />
      <RunnerInteractions headsRef={headsRef} />
      <CornerFrames headsRef={headsRef} />
           <AnimatedLayer 
        idPrefix="boundaries"
        positions={boundaryPositions} 
        color="#ff3300" 
        runnerColor="#ffaa00" 
        numRunners={1} 
        duration={60} 
        trailLength={1500}
        runnerSize={0.03}
        onUpdateHead={onUpdateHead}
        onComplete={handleComplete}
      />
      <AnimatedLayer 
        idPrefix="roads"
        positions={roadPositions} 
        color="#cc4400" 
        runnerColor="#ffcc00" 
        numRunners={3} 
        duration={60} 
        trailLength={1200}
        runnerSize={0.02}
        onUpdateHead={onUpdateHead}
        onComplete={handleComplete}
      />
      <AnimatedLayer 
        idPrefix="water"
        positions={waterPositions} 
        color="#ff8800" 
        runnerColor="#ffee88" 
        numRunners={1} 
        duration={60} 
        trailLength={1000}
        runnerSize={0.02}
        onUpdateHead={onUpdateHead}
        onComplete={handleComplete}
      />
      <AnimatedLayer 
        idPrefix="railways"
        positions={railwayPositions} 
        color="#ffaa00" 
        runnerColor="#ffffff" 
        numRunners={1} 
        duration={60} 
        trailLength={800}
        runnerSize={0.02}
        onUpdateHead={onUpdateHead}
        onComplete={handleComplete}
      />
      <CityLabelAgent 
        cityName={cityName} 
        onComplete={handleComplete} 
        onUpdateHead={onUpdateHead} 
      />
    </group>
  );
}

type AgentStatus = 'idle' | 'working' | 'done';

const AGENTS = [
  { id: 'boundaries-0', label: 'AGENT 01 [BOUNDARIES]' },
  { id: 'roads-0', label: 'AGENT 02 [ROADS SEC A]' },
  { id: 'roads-1', label: 'AGENT 03 [ROADS SEC B]' },
  { id: 'roads-2', label: 'AGENT 04 [ROADS SEC C]' },
  { id: 'water-0', label: 'AGENT 05 [WATERWAYS]' },
  { id: 'railways-0', label: 'AGENT 06 [RAILWAYS]' },
  { id: 'label-0', label: 'AGENT 07 [IDENTIFICATION]' },
];

export default function App() {
  const [cityIndex, setCityIndex] = useState(14);
  const [cityData, setCityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);
  const [forceFit, setForceFit] = useState(0);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [searchId, setSearchId] = useState(0);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setCityData(null);
    setIsDrawingComplete(false);
    setSearchId(s => s + 1);
    
    const initialStatuses: Record<string, AgentStatus> = {};
    AGENTS.forEach(a => initialStatuses[a.id] = 'working');
    setAgentStatuses(initialStatuses);

    try {
      const data = await fetchCityDetails(cityIndex);
      setCityData(data);
    } catch (err: any) {
      setError(err.message);
      const errorStatuses: Record<string, AgentStatus> = {};
      AGENTS.forEach(a => errorStatuses[a.id] = 'idle');
      setAgentStatuses(errorStatuses);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentComplete = useCallback((id: string) => {
    setAgentStatuses(prev => ({ ...prev, [id]: 'done' }));
  }, []);

  return (
    <div className="w-full h-screen bg-[#050505] text-white font-mono overflow-hidden relative">
      <div className="absolute top-0 left-0 p-6 z-10 flex flex-col items-start pointer-events-none">
        <h1 className="text-2xl tracking-[0.3em] uppercase font-light mb-2 flex items-center gap-3 text-white">
          <MapIcon className="w-6 h-6 text-orange-500" />
          Neural Cartography
        </h1>
        <p className="text-xs text-white/50 tracking-widest uppercase">
          Distributed Agent Mapping Protocol
        </p>
      </div>

      <div className="absolute top-24 left-6 z-10 flex flex-col gap-3 pointer-events-none">
        {AGENTS.map(agent => {
          const status = agentStatuses[agent.id] || 'idle';
          return (
            <div key={agent.id} className="flex items-center gap-3 text-[10px] tracking-widest">
              <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'working' ? 'bg-orange-500 animate-pulse' : 
                status === 'done' ? 'bg-orange-700' : 
                'bg-neutral-800'
              }`} />
              <span className={
                status === 'working' ? 'text-white' : 
                status === 'done' ? 'text-white/50' : 
                'text-neutral-700'
              }>
                {agent.label} ... {status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {isDrawingComplete && (
        <button 
          onClick={() => setForceFit(f => f + 1)}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-orange-500/10 border border-orange-500/20 text-white px-4 py-2 text-xs tracking-widest hover:bg-orange-500/20 transition-colors backdrop-blur-md pointer-events-auto"
        >
          RE-CENTER MAP
        </button>
      )}

      <div className="absolute top-6 right-6 z-10 w-full max-w-xs flex flex-col gap-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-neutral-500 pointer-events-none">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-orange-500" /> : <Search className="w-5 h-5" />}
          </div>
          <select
            value={cityIndex}
            onChange={(e) => setCityIndex(Number(e.target.value))}
            disabled={loading}
            className="w-full bg-black/50 border border-orange-500/20 focus:border-orange-500/50 rounded-none py-4 pl-12 pr-10 text-sm tracking-widest outline-none transition-colors backdrop-blur-sm text-orange-400 appearance-none cursor-pointer disabled:opacity-50"
          >
            {GROUPED_CITIES.map(([country, cities]) => (
              <optgroup key={country} label={country.toUpperCase()} className="bg-black text-orange-500/50 font-bold">
                {cities.map(({ name, index }) => (
                  <option key={index} value={index} className="bg-[#111] text-orange-400 font-normal">
                    {name.toUpperCase()}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
            ▼
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-4 bg-orange-500/10 border border-orange-500/50 text-white tracking-[0.3em] uppercase hover:bg-orange-500/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'INITIATING...' : 'INITIATE PROTOCOL'}
        </button>

        {error && (
          <div className="text-red-500 text-xs tracking-widest text-center bg-red-500/10 py-2 border border-red-500/20">
            ERROR: {error}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-6 z-10 text-xs text-white/50 tracking-widest uppercase pointer-events-none">
        Concept by Shahnab
      </div>

      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={['#020202']} />
        <ambientLight intensity={0.5} />
        <MapControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05} 
          maxDistance={50} 
          minDistance={2} 
          enableRotate={false}
          screenSpacePanning={true}
        />
        {cityData && (
          <CityMap 
            key={`${searchId}`}
            data={cityData} 
            cityName={GROUPED_CITIES.flatMap(g => g[1]).find(c => c.index === cityIndex)?.name || ''}
            onComplete={() => setIsDrawingComplete(true)} 
            onAgentComplete={handleAgentComplete}
            isComplete={isDrawingComplete}
            forceFit={forceFit}
          />
        )}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
