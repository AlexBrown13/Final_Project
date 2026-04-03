import { createContext, useContext, useState } from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [displayPoints, setDisplayPoints] = useState({});
  const [gender, setGender] = useState("all");
  return (
    <MapContext.Provider
      value={{
        stepIndex,
        setStepIndex,
        timeline,
        setTimeline,
        displayPoints,
        setDisplayPoints,
        gender,
        setGender,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  return useContext(MapContext);
}
