import { createContext, useContext, useState } from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [displayPoints, setDisplayPoints] = useState({});
  const [gender, setGender] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);

  const [aggregatedCache, setAggregatedCache] = useState({});
  const [ages, setAges] = useState([1, 2, 3, 4, 5]);

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
        startDateFilter,
        setStartDateFilter,
        endDateFilter,
        setEndDateFilter,

        aggregatedCache,
        setAggregatedCache,
        ages,
        setAges,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  return useContext(MapContext);
}
