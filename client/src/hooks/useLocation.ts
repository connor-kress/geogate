import { useEffect, useState } from "react";
import { Coords } from "../types";

export function useLocation() {
  const [position, setPosition] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setPosition(newCoords);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError(error.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, error };
}
