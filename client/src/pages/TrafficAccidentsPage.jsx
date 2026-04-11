import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../components/Navbar.jsx";
import { useDirection } from "../context/useDirection.js";
import { getUiStrings } from "../config/uiStrings.js";
import { getApiBase } from "../config/api.js";
import styles from "./TrafficAccidentsPage.module.css";

const PAL = ["#e8b84b", "#7eaa85", "#9ec4d0", "#41645a", "#e88f8f"];
const TICK = {
  fontFamily: "Heebo, system-ui, sans-serif",
  fill: "#314a55",
  fontSize: 12,
};
const CS = {
  fontFamily: "Heebo, system-ui, sans-serif",
  color: "#314a55",
  borderRadius: 8,
  fontSize: 12,
};
const FONT = "Heebo, system-ui, sans-serif";

function formatValue(v, yUnit) {
  if (yUnit && yUnit.includes("percent")) return `${v}%`;
  if (yUnit === "%") return `${v}%`;
  return String(v);
}

function TrafficBarChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit ?? "";
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const fmt = (v) => formatValue(v, yUnit);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 28, right: 18, left: 12, bottom: 42 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(49,74,85,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={(v) => formatValue(v, yUnit)} />
        <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={PAL[i % PAL.length]} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={fmt}
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12,
              fill: "#314a55",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TrafficLineChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit ?? "";
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const minV = Math.min(...chart.values);
  const maxV = Math.max(...chart.values);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 28, right: 18, left: 12, bottom: 42 }}
      >
        <defs>
          <linearGradient id={`trafficArea-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8b84b" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#e8b84b" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(49,74,85,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis
          tick={TICK}
          domain={[minV - 20, maxV + 20]}
          tickFormatter={(v) => formatValue(v, yUnit)}
        />
        <Tooltip formatter={(v) => [formatValue(v, yUnit), ""]} contentStyle={CS} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#e88f8f"
          strokeWidth={2.5}
          fill={`url(#trafficArea-${chart.id})`}
          dot={{ r: 5, fill: "#e88f8f", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 7 }}
        >
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v) => formatValue(v, yUnit)}
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12,
              fill: "#314a55",
            }}
          />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function TrafficPieChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="46%"
          innerRadius={55}
          outerRadius={98}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ value }) => `${value}`}
          labelLine={{ stroke: "rgba(49,74,85,0.35)" }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PAL[i % PAL.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [String(v), ""]} contentStyle={CS} />
        <Legend
          verticalAlign="bottom"
          height={40}
          wrapperStyle={{ ...TICK, fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case "line":
      return <TrafficLineChart chart={chart} locale={locale} />;
    case "bar":
      return <TrafficBarChart chart={chart} locale={locale} />;
    case "pie":
      return <TrafficPieChart chart={chart} locale={locale} />;
    default:
      return null;
  }
}

export default function TrafficAccidentsPage() {
  const { dir, locale } = useDirection();
  const s = getUiStrings(locale);
  const [data, setData] = useState(null);
  const [openCards, setOpenCards] = useState(new Set());

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/traffic`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  const toggle = (id) =>
    setOpenCards((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} lang={locale} dir={dir}>
        <nav className={styles.breadcrumb}>
          {s.graphBreadcrumbHome} &rsaquo; {s.navGraphTraffic}
        </nav>
        <div className={styles.heroPanel}>
          <h1 className={styles.heroTitle}>{s.graphTrafficTitle}</h1>
          <p className={styles.heroSubtitle}>{s.graphTrafficSubtitle}</p>
          <div className={styles.infoBanner} role="note">
            {s.graphTrafficDesc}
          </div>
        </div>
        {!data ? (
          <p className={styles.loading}>{s.graphLoading}</p>
        ) : (
          <div className={styles.graphGrid}>
            {data.map((chart) => (
              <div key={chart.id} className={styles.graphCard}>
                <p className={styles.cardTitle}>
                  {locale === "he" ? chart.title_he : chart.title_en}
                </p>
                {renderChart(chart, locale)}
                {(chart.explain_he || chart.explain_en) && (
                  <button
                    type="button"
                    className={styles.readMoreBtn}
                    onClick={() => toggle(chart.id)}
                  >
                    {openCards.has(chart.id)
                      ? s.graphReadLess
                      : s.graphReadMore}
                  </button>
                )}
                {openCards.has(chart.id) && (
                  <p className={styles.readMoreText}>
                    {locale === "he" ? chart.explain_he : chart.explain_en}
                  </p>
                )}
                <p className={styles.cardSource}>{chart.source}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
