import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { getUiStrings } from "../config/uiStrings.js";
import { useDirection } from "../context/useDirection.js";
import { useMapContext } from "../context/MapContext";
import InputsFilter from "../components/map/InputsFilter.jsx";
import FilterListIcon from "@mui/icons-material/FilterList";
import styles from "./CallsMapPage.module.css";
import { fetchCallsMapAggregated, fetchCallsMapDates } from "../utils/api.js";
import MapView from "../components/map/MapView.jsx";

const MAP_FILTERS_TITLE_ID = "map-filters-drawer-title";

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
  const { locale, dir } = useDirection();
  const s = getUiStrings(locale);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeBtnRef = useRef(null);

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

  useEffect(() => {
    if (!filtersOpen) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    const onKey = (e) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [filtersOpen]);

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
      <main className={styles.mainFull} lang={locale} dir={dir}>
        <header className={styles.pageHead}>
          <h1 className={styles.pageTitle}>{s.mapPageTitle}</h1>
        </header>

        <div className={styles.timelineDock}>
          <div className={styles.timelineInner}>
            <div className={styles.timelineRow}>
              <span>
                {s.mapTimeLabel}:{" "}
                <strong>{timeline[stepIndex]?.label || "…"}</strong>
              </span>
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className={styles.playBtn}
              >
                {playing ? s.mapPause : s.mapPlay}
              </button>
            </div>
            <div className={styles.sliderRow}>
              <input
                type="range"
                disabled={!timeline.length}
                className={styles.slider}
                min={0}
                max={Math.max(0, timeline.length - 1)}
                value={stepIndex}
                onChange={(e) => setStepIndex(Number(e.target.value))}
                aria-label={s.mapTimeLabel}
              />
            </div>
            <div className={styles.timelineEndHint}>
              {s.mapTimeLabel} →{" "}
              <strong>{timeline[timeline.length - 1]?.label}</strong>
            </div>
          </div>
        </div>

        <div className={styles.mapStage}>
          <div className={styles.mapFrame}>
            <MapView points={pointsArray} callsUnit={s.mapCallsUnit} />
          </div>

          <button
            type="button"
            className={styles.fabFilters}
            onClick={() => setFiltersOpen(true)}
            aria-label={s.mapOpenFiltersAria}
            aria-expanded={filtersOpen}
            aria-haspopup="dialog"
          >
            <FilterListIcon sx={{ fontSize: 26 }} aria-hidden />
          </button>

          {filtersOpen ? (
            <>
              <div
                className={styles.drawerBackdrop}
                onClick={() => setFiltersOpen(false)}
                role="presentation"
              />
              <aside
                className={`${styles.drawer} ${styles.drawerOpen}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={MAP_FILTERS_TITLE_ID}
              >
                <div className={styles.drawerHeader}>
                  <h2
                    id={MAP_FILTERS_TITLE_ID}
                    className={styles.drawerHeaderTitle}
                  >
                    {s.mapFiltersTitle}
                  </h2>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    className={styles.drawerClose}
                    onClick={() => setFiltersOpen(false)}
                    aria-label={s.mapCloseFiltersAria}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.drawerBody}>
                  <InputsFilter variant="drawer" />
                </div>
              </aside>
            </>
          ) : null}

          {loading ? (
            <div className={styles.mapLoading}>{s.mapLoading}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
