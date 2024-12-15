import { LatLngExpression, Icon } from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './App.css';
import { useEffect, useState } from 'react';

// https://www.flaticon.com/free-icon/rhombus_10239023?term=diamond+shape&page=1&position=25&origin=search&related_id=10239023
const userIcon = new Icon({
  iconUrl: "/diamond.png",
  iconSize: [24, 30],
  iconAnchor: [12, 15],
  className: "cursor-default",
});

export default function App() {
  const [userPos, setUserPos] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("User location:",
                    [pos.coords.latitude, pos.coords.longitude])
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.log("Geolocation error:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId); // cleanup
  }, []);

  if (!userPos) {
    return <h2>Locating Position...</h2>;
  }

  return (
    <MapContainer
      style={{height: "100vh"}}
      center={userPos}
      zoom={16}
      dragging={false}
      zoomControl={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      keyboard={false}
      boxZoom={false}
      touchZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={userPos} />
      <Marker position={userPos} icon={userIcon} />
    </MapContainer>
  );
}

function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap(); // gets the closest parent <MapContainer />
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}
