import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { getUiStrings } from "../config/uiStrings.js";
import { useDirection } from "../context/useDirection.js";
import { useMapContext } from "../context/MapContext";
import InputsFilter from "../components/map/InputsFilter.jsx";
// import CallMapView from "../components/CallMapView.jsx";
import styles from "./CallsMapPage.module.css";
import { fetchCallsMapAggregated, fetchCallsMapDates } from "../utils/api.js";
import MapView from "../components/map/MapView.jsx";

const ISRAEL_CENTER = [31.5, 34.85];
const DEFAULT_ZOOM = 7;

/** Normalize API points */
function normalizePoints(data) {
  if (!data?.points) return [];
  return data.points
    .map((p) => ({
      city: p.city,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      count: Number(p.count) || 0,
      year: p.year,
      month: p.month,
    }))
    .filter((p) => p.latitude && p.longitude);
}

export default function CallsMapPage() {
  const { locale } = useDirection();
  const s = getUiStrings(locale);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [aggregatedData, setAggregatedData] = useState([]);
  const {
    timeline,
    setTimeline,
    stepIndex,
    setStepIndex,
    gender,
    startDateFilter,
    endDateFilter,
    aggregatedCache,
    setAggregatedCache,
    ages,
  } = useMapContext();

  useEffect(() => setMounted(true), []);

  /** 1. Generate timeline (month steps) */
  useEffect(() => {
    async function generateTimeline() {
      try {
        const { res, data } = await fetchCallsMapDates();
        if (!res.ok || !data.minDate || !data.maxDate) return;

        const start = new Date(data.minDate);
        const end = new Date(data.maxDate);

        const timelineArr = [];
        const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
        let current = new Date(start.getFullYear(), start.getMonth(), 1);

        while (current <= end) {
          const year = current.getFullYear();
          const month = current.getMonth() + 1;
          const from = `${year}-${String(month).padStart(2, "0")}-01`;
          const lastDay = new Date(year, month, 0).getDate();
          const to = `${year}-${String(month).padStart(2, "0")}-${String(
            lastDay
          ).padStart(2, "0")}`;
          const label = `${formatter.format(current)} ${year}`;

          timelineArr.push({ from, to, label, year, month });
          current.setMonth(current.getMonth() + 1);
        }

        setTimeline(timelineArr);
      } catch (err) {
        console.error(err);
      }
    }

    generateTimeline();
  }, [setTimeline]);

  /** 2. Load aggregated data once */
  const loadAllData = useCallback(
    async (from, to, g, agesParam) => {
      const key = `${from}_${to}_${g}_${agesParam}`;

      if (aggregatedCache[key]) {
        setAggregatedData(aggregatedCache[key]);
        return;
      }

      setLoading(true);
      const res = await fetchCallsMapAggregated(from, to, g, agesParam);
      const points = normalizePoints(res);

      setAggregatedCache((prev) => ({
        ...prev,
        [key]: points,
      }));
      setAggregatedData(points);
      setLoading(false);
    },
    [aggregatedCache, setAggregatedCache]
  );

  /** 3. Sync map whenever timeline/filters/gender change */
  // Fetch once per filter change
  useEffect(() => {
    if (!timeline.length) return;

    const startStr = startDateFilter
      ? startDateFilter.format("YYYY-MM-DD")
      : timeline[0]?.from;

    const endStr = endDateFilter
      ? endDateFilter.format("YYYY-MM-DD")
      : timeline[timeline.length - 1]?.to;

    if (!startStr || !endStr) return;

    const agesParam = ages.join(",");

    loadAllData(startStr, endStr, gender, agesParam);
  }, [gender, startDateFilter, endDateFilter, timeline, ages, loadAllData]);

  // -------------------------------
  // 4. CUMULATIVE LOGIC
  // -------------------------------
  const pointsArray = useMemo(() => {
    if (!aggregatedData.length || !timeline.length) return [];

    const result = {};

    for (let i = 0; i <= stepIndex; i++) {
      const step = timeline[i];

      aggregatedData.forEach((p) => {
        if (p.year === step.year && p.month === step.month) {
          if (!result[p.city]) {
            result[p.city] = { ...p };
          } else {
            result[p.city].count += p.count;
          }
        }
      });
    }

    return Object.values(result);
  }, [aggregatedData, stepIndex, timeline]);

  /** 5. Autoplay timeline */
  useEffect(() => {
    if (!playing) return;

    const intervalId = setInterval(() => {
      setStepIndex((i) => {
        if (i < timeline.length - 1) return i + 1;
        setPlaying(false);
        return i;
      });
    }, 1200);

    return () => clearInterval(intervalId);
  }, [playing, timeline, setStepIndex]);

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h1>{s.mapPageTitle}</h1>

        <div className={styles.controls}>
          <div className={styles.topRow}>
            <span>
              {s.mapTimeLabel}:{" "}
              <strong>{timeline[stepIndex]?.label || "..."}</strong>
            </span>
            <button
              onClick={() => setPlaying(!playing)}
              className={styles.playBtn}
            >
              {playing ? s.mapPause : s.mapPlay}
            </button>
          </div>

          <input
            type="range"
            disabled={!timeline.length}
            className={styles.slider}
            min={0}
            max={timeline.length - 1}
            value={stepIndex}
            onChange={(e) => setStepIndex(Number(e.target.value))}
          />
          <span>
            {s.mapTimeLabel}:{" "}
            <strong>{timeline[timeline.length - 1]?.label}</strong>
          </span>
        </div>

        <div>
          <InputsFilter />
        </div>

        <div className={styles.mapFrame}>
          <MapView points={pointsArray} callsUnit={s.mapCallsUnit} />
        </div>

        {loading && <p>Loading...</p>}
      </main>
    </div>
  );
}
