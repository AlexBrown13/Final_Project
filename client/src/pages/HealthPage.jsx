import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar.jsx";
import { useDirection } from "../context/useDirection.js";
import { getUiStrings } from "../config/uiStrings.js";
import { getApiBase } from "../config/api.js";
import styles from "./AddictionsPage.module.css";

const PAL = ["#9ec4d0", "#7eaa85", "#41645a", "#e8b84b", "#c5b4e3", "#e88f8f"];
const TICK = {
  fontFamily: "Heebo, system-ui, sans-serif",
  fill: "#41645a",
  fontSize: 13,
};
const CS = {
  fontFamily: "Heebo, system-ui, sans-serif",
  color: "#41645a",
  borderRadius: 8,
  fontSize: 13,
};
const FONT = "Heebo, system-ui, sans-serif";

function formatByUnit(v, yUnit) {
  if (yUnit === "%" || yUnit === "% change") {
    const n = Number(v);
    const text = Number.isInteger(n) ? String(n) : n.toFixed(1);
    return `${text}%`;
  }
  if (yUnit === "cases") return String(v);
  return String(v);
}

function tickFormatterForUnit(yUnit) {
  if (yUnit === "%" || yUnit === "% change") return (v) => `${v}%`;
  return (v) => String(v);
}

/** Bar charts for ISRAEL_HEALTH_DATA — values + labels + optional y_unit in extra */
function HealthBarChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit;
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const fmt = (v) => formatByUnit(v, yUnit);
  const barSize = data.length > 2 ? 48 : 72;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 32, right: 24, left: 16, bottom: 44 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={tickFormatterForUnit(yUnit)} />
        <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={barSize}>
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
              fontSize: 15,
              fill: "#41645a",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Line chart (e.g. diabetes prevalence over two years) */
function HealthLineChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit;
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const fmt = (v) => formatByUnit(v, yUnit);
  const domainMin = Math.min(...chart.values) - 0.3;
  const domainMax = Math.max(...chart.values) + 0.3;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 32, right: 24, left: 16, bottom: 44 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis
          tick={TICK}
          domain={[domainMin, domainMax]}
          tickFormatter={tickFormatterForUnit(yUnit)}
        />
        <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={CS} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#7eaa85"
          strokeWidth={3}
          dot={{ r: 6, fill: "#7eaa85", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        >
          <LabelList
            dataKey="value"
            position="top"
            formatter={fmt}
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              fill: "#41645a",
            }}
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case "bar":
      return <HealthBarChart chart={chart} locale={locale} />;
    case "line":
      return <HealthLineChart chart={chart} locale={locale} />;
    default:
      return null;
  }
}

export default function HealthPage() {
  const { dir, locale } = useDirection();
  const s = getUiStrings(locale);
  const [data, setData] = useState(null);
  const [openCards, setOpenCards] = useState(new Set());

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/health`)
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
          {s.graphBreadcrumbHome} &rsaquo; {s.navGraphHealth}
        </nav>
        <h1 className={styles.heroTitle}>{s.graphHealthTitle}</h1>
        <p className={styles.heroSubtitle}>{s.graphHealthSubtitle}</p>
        <div className={styles.infoBanner} role="note">
          {s.graphHealthDesc}
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
