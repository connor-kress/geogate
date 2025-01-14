import { Coords } from "../types";

export function getRandomCoordinates(
  coords: Coords, radius: number
): Coords {
  const { lat, lon } = coords;
  // Convert radius in km to rough lat/lon degrees
  const degreeOffset = radius / 111_111; // 111,111m per degree at the equator
  const latOffset = (Math.random() * 2 - 1) * degreeOffset;
  const lonOffset = (Math.random() * 2 - 1) * degreeOffset;
  return {
    lat: lat + latOffset,
    lon: lon + lonOffset
  };
}
