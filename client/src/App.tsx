import { LatLngExpression, Icon } from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import { useEffect, useState } from 'react';
import { ResourceNode, NodeType} from "./types"
import {
  userIcon,
  treeNodeIcon,
  stoneNodeIcon,
  copperNodeIcon,
  ironNodeIcon,
} from "./icons"

import 'leaflet/dist/leaflet.css';
import './App.css';

function getResourceIcon(nodeType: NodeType) {
  switch (nodeType) {
    case NodeType.TREE:
      return treeNodeIcon;
    case NodeType.ROCK_BASIC:
      return stoneNodeIcon;
    case NodeType.ROCK_COPPER:
      return copperNodeIcon;
    case NodeType.ROCK_IRON:
      return ironNodeIcon;
  }
}

async function fetchResourceNodes(
  lat: number, lon: number,
): Promise<ResourceNode[]> {
  const url = `http://localhost:8000/api/nodes?lat=${lat}&lon=${lon}&radius=${100}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource nodes: ${response.statusText}`);
    }

    const data: ResourceNode[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching resource nodes:", error);
    return [];
  }
};
export default function App() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [nodes, setNodes] = useState<ResourceNode[]>([
    {id: 9, lat:29.08285592455191, lon:-80.92710605018715, nodeType: NodeType.TREE}
  ]);

  async function loadResourceNodes() {
      if (!userPos) return;
      const [lat, lon] = userPos;
      // console.log(`Fetching coords ${lat}, ${lon}`);
      setNodes(await fetchResourceNodes(lat, lon));
  }

  useEffect(() => {
    loadResourceNodes();
  }, [userPos]);

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

  return <GameMap userPos={userPos} nodes={nodes} />;
}

async function copyCoordsToClipboard(lat: number, lon: number) {
  const coordsMsg = `${lat}, ${lon}`;
  await navigator.clipboard.writeText(coordsMsg);
}

function GameMap(props: {
  userPos: [number, number],
  nodes: ResourceNode[],
}) {
  const { userPos, nodes } = props;
  // if (nodes.length) console.log("node[0].lat:", nodes[0].lat);
  // console.log("userPos:", userPos);
  return (
    <MapContainer
      style={{height: "100vh"}}
      center={userPos}
      zoom={17}
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
      {nodes.map((node, idx) => (
        <Marker
          position={[node.lat, node.lon]}
          icon={getResourceIcon(node.nodeType)}
          key={idx}
        >
          <Popup>
            {node.nodeType}<br/>
            lat: {node.lat.toFixed(5)}{" "}
            lon: {node.lon.toFixed(5)}
            <br/>
            <button onClick={async () => {
              await copyCoordsToClipboard(node.lat, node.lon);
            }}>
              Copy to Clipboard
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap(); // gets the closest parent <MapContainer />
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}
