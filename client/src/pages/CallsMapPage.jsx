import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,

} from "react";
import Navbar from "../components/Navbar.jsx";
import { getUiStrings } from "../config/uiStrings.js";
import { useDirection } from "../context/useDirection.js";
import { fetchCallsMapData, fetchCallsMapDates } from "../utils/api.js";
import styles from "./CallsMapPage.module.css";
import CallMapView from "../components/CallMapView.jsx";
import { useMapContext } from "../context/MapContext";

const ISRAEL_CENTER = [31.5, 34.85];
const DEFAULT_ZOOM = 7;

/** * HELPER: Normalize points from API
 */
function normalizePoints(data) {
  if (!data?.points) return [];
  return data.points.map((p) => ({
    city: p.city,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    count: Number(p.count) || 0,
  }));
}

export default function CallsMapPage() {
  const { locale } = useDirection();
  const s = getUiStrings(locale);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dateRange, setDateRange] = useState({});
  const {
    displayPoints,
    setDisplayPoints,
    timeline,
    setTimeline,
    stepIndex,
    setStepIndex,
    gender,
    setGender,
  } = useMapContext();

  const cacheRef = useRef(new Map());
  const prevStepRef = useRef(0);
  const prevGenderRef = useRef(gender);

  useEffect(() => setMounted(true), []);

  /** 1. Fetch Min/Max dates and generate months for timeline */
  useEffect(() => {
    const generateTimeline = async () => {
      try {
        const { res, data } = await fetchCallsMapDates();
        if (!res.ok || !data.minDate || !data.maxDate) return;

        const start = new Date(data.minDate);
        const end = new Date(data.maxDate);
        setDateRange({ start: data.minDate, end: data.maxDate });

        const timeline = [];
        // formatter (created once)
        const formatter = new Intl.DateTimeFormat("en-US", {
          month: "short",
        });

        // start from first day of first month
        let current = new Date(start.getFullYear(), start.getMonth(), 1);

        while (current <= end) {
          const year = current.getFullYear();
          const month = current.getMonth() + 1;

          const from = `${year}-${String(month).padStart(2, "0")}-01`;

          // last day of month
          const lastDay = new Date(year, month, 0).getDate();
          const to = `${year}-${String(month).padStart(2, "0")}-${String(
            lastDay
          ).padStart(2, "0")}`;

          const label = `${formatter.format(current)} ${year}`;

          timeline.push({ from, to, label });

          // move to next month
          current.setMonth(current.getMonth() + 1);
        }

        setTimeline(timeline);
        console.log("timeline ", timeline);
      } catch (err) {
        console.error(err);
      }
    };

    generateTimeline();
  }, []);

  /** 2. Fetch data logic with caching */
  const loadData = useCallback(async (from, to, g) => {
    const key = `${from}_${to}_${g}`;
    const chched = cacheRef.current.get(key);
    if (chched) return chched;

    try {
      const { res, data } = await fetchCallsMapData(from, to, g);
      if (!res.ok) return [];
      const pts = normalizePoints(data);
      cacheRef.current.set(key, pts);
      return pts;
    } catch (err) {
      console.error("Fetch range error:", err);
      return [];
    }
  }, []);

  /** 3. Sync map data when step index or filters change */
  useEffect(() => {
    if (timeline.length === 0) return;

    const syncMap = async () => {
      const isGenderChange = prevGenderRef.current !== gender;
      if (isGenderChange) {
        let rebuilt = {};
        const step = timeline[stepIndex]["to"];
        rebuilt = await loadData(dateRange["start"], step, gender);
        setDisplayPoints(rebuilt);
      } else {
        const step = timeline[stepIndex];
        const newPoints = await loadData(step.from, step.to, gender);

        // Merge results (Growth effect)
        setDisplayPoints((prev) => {
          const next = { ...prev };
          newPoints.forEach((p) => {
            if (!next[p.city]) {
              next[p.city] = { ...p };
            } else {
              next[p.city].count += p.count;
            }
          });
          return next;
        });
      }
      prevStepRef.current = stepIndex;
      prevGenderRef.current = gender;
    };

    syncMap();
  }, [stepIndex, timeline, gender, loadData]);

  /** 4. Autoplay logic */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStepIndex((i) => {
        if (i < timeline.length - 1) return i + 1;
        setPlaying(false);
        return i;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [playing, timeline]);

  const pointsArray = useMemo(
    () => Object.values(displayPoints),
    [displayPoints]
  );

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

            <select
              value={gender}
              className={styles.genderSelect}
              onChange={(e) => {
                setGender(e.target.value);
                //setStepIndex(0);
                setDisplayPoints({});
              }}
            >
              <option value="all">{s.mapGenderFiltersAria}</option>
              <option value="female">{s.mapGenderFemale}</option>
              <option value="male">{s.mapGenderMale}</option>
            </select>
          </div>

          <input
            type="range"
            disabled={true}
            className={styles.slider}
            min={0}
            max={timeline.length > 0 ? timeline.length - 1 : 0}
            value={stepIndex}
            onChange={(e) => setStepIndex(Number(e.target.value))}
          />
        </div>

        <div className={styles.mapFrame}>
          <CallMapView points={pointsArray} callsUnit={s.mapCallsUnit} />
        </div>
      </main>
    </div>
  );
}
