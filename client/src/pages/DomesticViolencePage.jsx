import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
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
import styles from "./DomesticViolencePage.module.css";

const PAL = ["#c36b7d", "#8b9ea7", "#d1b48c", "#5b6972", "#e2a6b1"];
const TICK = {
  fontFamily: "Heebo, system-ui, sans-serif",
  fill: "#3d3e4b",
  fontSize: 12,
};
const CS = {
  fontFamily: "Heebo, system-ui, sans-serif",
  color: "#3d3e4b",
  borderRadius: 8,
  fontSize: 12,
};
const FONT = "Heebo, system-ui, sans-serif";

function formatValue(v, yUnit) {
  if (yUnit === "percent" || yUnit === "%") return `${v}%`;
  return String(v);
}

function DomesticLineChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit ?? "";
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 28, right: 24, left: 18, bottom: 42 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,62,75,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={(v) => formatValue(v, yUnit)} />
        <Tooltip formatter={(v) => [formatValue(v, yUnit), ""]} contentStyle={CS} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#c36b7d"
          strokeWidth={3}
          dot={{ r: 6, fill: "#c36b7d", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        >
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v) => formatValue(v, yUnit)}
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12,
              fill: "#3d3e4b",
            }}
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function DomesticBarChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit ?? "";
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const isRtl = locale === "he";
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 18, right: 32, left: 12, bottom: 18 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,62,75,0.12)" />
        <XAxis
          type="number"
          tick={TICK}
          tickFormatter={(v) => formatValue(v, yUnit)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={TICK}
          width={isRtl ? 130 : 110}
        />
        <Tooltip formatter={(v) => [formatValue(v, yUnit), ""]} contentStyle={CS} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
          {data.map((_, i) => (
            <Cell key={i} fill={PAL[i % PAL.length]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v) => formatValue(v, yUnit)}
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12,
              fill: "#3d3e4b",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DomesticPieChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="46%"
          outerRadius={105}
          dataKey="value"
          nameKey="name"
          label={({ value }) => `${value}%`}
          labelLine
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PAL[i % PAL.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={CS} />
        <Legend wrapperStyle={{ ...TICK, fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case "line":
      return <DomesticLineChart chart={chart} locale={locale} />;
    case "bar":
      return <DomesticBarChart chart={chart} locale={locale} />;
    case "pie":
      return <DomesticPieChart chart={chart} locale={locale} />;
    default:
      return null;
  }
}

export default function DomesticViolencePage() {
  const { dir, locale } = useDirection();
  const s = getUiStrings(locale);
  const [data, setData] = useState(null);
  const [openCards, setOpenCards] = useState(new Set());

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/domestic-violence`)
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
          {s.graphBreadcrumbHome} &rsaquo; {s.navGraphDomestic}
        </nav>
        <h1 className={styles.heroTitle}>{s.graphDomesticTitle}</h1>
        <p className={styles.heroSubtitle}>{s.graphDomesticSubtitle}</p>
        <div className={styles.infoBanner} role="note">
          {s.graphDomesticDesc}
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
