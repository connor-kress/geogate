import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { copyCoordsToClipboard } from "../utils/coords"
import { Coords, ResourceNode } from "../types";
import { getResourceIcon, userIcon } from "../icons";
import { useEffect } from "react";
import { useUserStore } from "../stores/userStore";
import { useNodeStore } from "../stores/nodeStore";
import { useSessionStore } from "../stores/sessionStore";
import 'leaflet/dist/leaflet.css';
import { collectResourceNode } from "../api/websocket/resourceNodes";

export function GameMap() {
  const username = useUserStore((state) => state.username);
  const position = useSessionStore((store) => store.location);
  const nodes = useNodeStore((store) => store.nodes);

  if (!position) {
    return <h2 className="text-xl font-bold m-2">Syncing Position...</h2>;
  }

  return (
    <MapContainer
      className="h-full"
      center={[position.lat, position.lon]}
      zoom={18}
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
      <MapUpdater center={position} />
      <Marker position={[position.lat, position.lon]} icon={userIcon}>
        <Popup className="cursor-default">
          User: {username ? username : "None found"}<br/>
          lat: {position.lat.toFixed(5)}{" "}
          lon: {position.lon.toFixed(5)}
          <br/>
          <button
            className="border border-black rounded px-1 cursor-pointer hover:text-zinc-500 active:text-zinc-400"
            onClick={async () => await copyCoordsToClipboard(position)}
          >
            Copy to Clipboard
          </button>
        </Popup>
      </Marker>
      {nodes.map((node, idx) => (
        <Marker
          position={[node.coords.lat, node.coords.lon]}
          icon={getResourceIcon(node.nodeType)}
          key={idx}
        >
          <Popup className="cursor-default">
            Node: {node.nodeType}<br/>
            lat: {node.coords.lat.toFixed(5)}{" "}
            lon: {node.coords.lon.toFixed(5)}
            <br/>
            <button
              className="border border-black rounded px-1 cursor-pointer hover:text-zinc-500 active:text-zinc-400"
              onClick={async () => await copyCoordsToClipboard(node.coords)}
            >
              Copy to Clipboard
            </button><br />
            <button
              className="border border-black rounded px-1 cursor-pointer hover:text-zinc-500 active:text-zinc-400 mt-1"
              onClick={() => {
                // popup.close();
                collectResourceNode(node.id)
              }}
            >
              Collect node
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function MapUpdater({ center }: { center: Coords }) {
  const map = useMap(); // gets the closest parent <MapContainer />
  useEffect(() => {
    map.setView([center.lat, center.lon]);
  }, [center, map]);
  return null;
}
