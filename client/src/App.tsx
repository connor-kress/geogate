import { LatLngExpression } from 'leaflet';
import {
  MapContainer,
  TileLayer,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import './App.css'

function App() {
  const centerPos: LatLngExpression = [29.648643, -82.349709];

  return (
    <MapContainer style={{height: "100vh"}} center={centerPos}
                  zoom={16} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

export default App
