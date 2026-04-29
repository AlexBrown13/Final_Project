import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useDirection } from "../../context/useDirection.js";
import { getApiBase } from "../../config/api.js";
import styles from "./ExploreSearchPage.module.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Text,
} from "recharts";

const DEFAULT_MIN_YEAR = 2010;
const DEFAULT_MAX_YEAR = new Date().getFullYear();
const TICK = {
  fontFamily: "Heebo, system-ui, sans-serif",
  fill: "#41645a",
  fontSize: 12,
};
const CS = {
  fontFamily: "Heebo, system-ui, sans-serif",
  color: "#41645a",
  borderRadius: 10,
  border: "1px solid rgba(126,170,133,0.25)",
  boxShadow: "0 10px 28px rgba(65,100,90,0.14)",
  fontSize: 12,
  background: "#ffffff",
};

const COLORS = [
  { fill: "#7eaa85", stroke: "#53705a" },
  { fill: "#9ec4d0", stroke: "#9ec4d0" },
  { fill: "#e8b84b", stroke: "#916f1f" },
  { fill: "#c5b4e3", stroke: "#7a60ab" },
];

function formatDateInput(year) {
  return `${String(year).padStart(4, "0")}-01-01`;
}

function parseYearFromDate(value, fallback) {
  const parsed = Number.parseInt((value || "").slice(0, 4), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseDateSafe(dateValue) {
  const d = new Date(dateValue);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatLabel(dateValue, locale) {
  const d = parseDateSafe(dateValue);
  if (!d) return dateValue;
  return d.toLocaleString(locale === "he" ? "he-IL" : "en-US", {
    month: "short",
    year: "numeric",
  });
}

function sortByDate(data) {
  return [...data].sort((a, b) => {
    const da = parseDateSafe(a.date);
    const db = parseDateSafe(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });
}

function MiniTrendChart({ feature, color, data, locale }) {
  return (
    <AreaChart data={data} margin={{ top: 30, right: 16, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`mini-${feature}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color.fill} stopOpacity={0.55} />
          <stop offset="100%" stopColor={color.fill} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <Text
        x={16}
        y={18}
        textAnchor="start"
        fontSize={14}
        fontWeight="bold"
        fill={color.stroke}
      >
        {feature}
      </Text>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
      <XAxis dataKey="date" tick={false} />
      <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={TICK} />
      <Tooltip
        labelFormatter={(value) => formatLabel(value, locale)}
        contentStyle={CS}
      />
      <Area
        type="monotone"
        dataKey={feature}
        stroke={color.stroke}
        strokeWidth={2.5}
        fill={`url(#mini-${feature})`}
      />
    </AreaChart>
  );
}

export default function ExploreSearchPage() {
  const { dir, locale } = useDirection();
  const [trendsData, setTrendsData] = useState(null);
  const [subjectFeatures, setSubjectFeatures] = useState([]);
  const [visibleFeatures, setVisibleFeatures] = useState(new Set());
  const [startDate, setStartDate] = useState(formatDateInput(DEFAULT_MIN_YEAR));
  const [endDate, setEndDate] = useState(formatDateInput(DEFAULT_MAX_YEAR));

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/trends`);
        const data = await res.json();
        if (res.ok && data) {
          setTrendsData(sortByDate(data.data_trends || []));
          setSubjectFeatures(data.features || []);
          return;
        }
        setTrendsData([]);
      } catch {
        setTrendsData([]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setVisibleFeatures(new Set(subjectFeatures));
  }, [subjectFeatures]);

  const ui = useMemo(
    () =>
      locale === "he"
        ? {
            title: "מגמות חיפוש לאורך זמן",
            subtitle: "בחרו טווח תאריכים ועיינו במגמות לפי נושא",
            dateRangeTitle: "סינון לפי טווח תאריכים",
            fromDate: "מתאריך",
            toDate: "עד תאריך",
            allTime: "כל התקופה",
            recent5Years: "5 שנים אחרונות",
            recent1Years: "1 שנים אחרונות",
            noDataInRange: "לא נמצאו נתונים בטווח התאריכים שנבחר.",
          }
        : {
            title: "Search Interest Over Time",
            subtitle: "Choose a date range and explore trends by topic",
            dateRangeTitle: "Filter by Date Range",
            fromDate: "From",
            toDate: "To",
            allTime: "All Time",
            recent5Years: "Last 5 Years",
            recent1Years: "Last 1 Years",
            noDataInRange: "No data found for the selected date range.",
          },
    [locale]
  );

  const scopedData = useMemo(() => {
    if (!Array.isArray(trendsData)) return [];
    const startYear = parseYearFromDate(startDate, DEFAULT_MIN_YEAR);
    const endYear = parseYearFromDate(endDate, DEFAULT_MAX_YEAR);
    const minYear = Math.min(startYear, endYear);
    const maxYear = Math.max(startYear, endYear);
    return trendsData.filter((item) => {
      const date = parseDateSafe(item.date);
      if (!date) return false;
      const y = date.getFullYear();
      return y >= minYear && y <= maxYear;
    });
  }, [trendsData, startDate, endDate]);

  const toggleFeature = (feature) => {
    setVisibleFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      return next;
    });
  };

  const setPresetYears = (yearsBack) => {
    const nowYear = new Date().getFullYear();
    setEndDate(formatDateInput(nowYear));
    setStartDate(formatDateInput(nowYear - yearsBack));
  };

  const setAllTime = () => {
    setStartDate(formatDateInput(DEFAULT_MIN_YEAR));
    setEndDate(formatDateInput(DEFAULT_MAX_YEAR));
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} lang={locale} dir={dir}>
        <h1 className={styles.title}>{ui.title}</h1>
        <p className={styles.subtitle}>{ui.subtitle}</p>

        <section className={styles.rangePanel} aria-label={ui.dateRangeTitle}>
          <p className={styles.rangeTitle}>{ui.dateRangeTitle}</p>
          <div className={styles.rangeRow}>
            <label className={styles.rangeField}>
              <span>{ui.fromDate}</span>
              <input
                className={styles.dateInput}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className={styles.rangeField}>
              <span>{ui.toDate}</span>
              <input
                className={styles.dateInput}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          <div className={styles.presetRow}>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={setAllTime}
            >
              {ui.allTime}
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => setPresetYears(5)}
            >
              {ui.recent5Years}
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => setPresetYears(1)}
            >
              {ui.recent1Years}
            </button>
          </div>
        </section>

        {trendsData == null ? (
          <p className={styles.loading}>
            {locale === "he" ? "טוען נתונים…" : "Loading data…"}
          </p>
        ) : scopedData.length === 0 ? (
          <p className={styles.emptyState}>{ui.noDataInRange}</p>
        ) : (
          <>
            <div className={styles.miniGrid}>
              {subjectFeatures.map((feature, index) => (
                <div key={feature} className={styles.miniCard}>
                  <ResponsiveContainer width="100%" height={170}>
                    <MiniTrendChart
                      feature={feature}
                      color={COLORS[index % COLORS.length]}
                      data={scopedData}
                      locale={locale}
                    />
                  </ResponsiveContainer>
                </div>
              ))}
            </div>

            <div className={styles.chipRow}>
              {subjectFeatures.map((feature, index) => {
                const active = visibleFeatures.has(feature);
                const color = COLORS[index % COLORS.length];
                return (
                  <button
                    key={`feature-${feature}`}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    aria-pressed={active}
                    className={styles.featureBtn}
                    style={{
                      borderColor: color.stroke,
                      background: active ? color.fill : "#fff",
                      color: active ? "#17302a" : color.stroke,
                    }}
                  >
                    {feature}
                  </button>
                );
              })}
            </div>

            <div className={styles.mainChartCard}>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart
                  data={scopedData}
                  margin={{ top: 20, right: 20, left: 6, bottom: 24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(65,100,90,0.12)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={TICK}
                    tickFormatter={(value) => formatLabel(value, locale)}
                    minTickGap={22}
                  />
                  <YAxis domain={[0, 100]} tick={TICK} />
                  <Tooltip
                    labelFormatter={(value) => formatLabel(value, locale)}
                    contentStyle={CS}
                  />
                  <Legend wrapperStyle={{ ...TICK, fontSize: 12 }} />
                  {subjectFeatures.map((feature, index) =>
                    visibleFeatures.has(feature) ? (
                      <Line
                        key={feature}
                        type="monotone"
                        dataKey={feature}
                        // stroke={COLORS[index % COLORS.length].stroke}
                        stroke={COLORS[index % COLORS.length].stroke}
                        strokeWidth={2.8}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ) : null
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
