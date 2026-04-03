import { memo, useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function radiusFromCount(count) {
  return Math.min(34, 4 + Math.sqrt(count) * 1.3);
}

export default memo(function CallsMapView({ points, callsUnit }) {
  return (
    <MapContainer
      center={[31.5, 34.85]} // ISRAEL_CENTER
      zoom={7} // DEFAULT_ZOOM
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p, index) => (
        <AnimatedCityMarker key={index} {...p} callsUnit={callsUnit} />
      ))}
    </MapContainer>
  );
});

const AnimatedCityMarker = ({
  city,
  latitude,
  longitude,
  count,
  callsUnit,
}) => {
  const targetR = radiusFromCount(count);
  const [radius, setRadius] = useState(0);
  const radiusRef = useRef(0);

  useEffect(() => {
    const controls = animate(radiusRef.current, targetR, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        radiusRef.current = v;
        setRadius(v);
      },
    });
    return () => controls.stop();
  }, [targetR]);

  return (
    <CircleMarker
      center={[latitude, longitude]}
      radius={radius}
      pathOptions={{
        color: "#41645a",
        weight: 1,
        fillColor: "#7eaa85",
        fillOpacity: 0.72,
      }}
    >
      <Popup>
        <strong>{city}</strong>
        <br />
        {count} {callsUnit}
      </Popup>
    </CircleMarker>
  );
};
