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
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
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

function formatBarValue(v, yUnit) {
  if (yUnit === "%") return `${v}%`;
  return String(v);
}

function yTickFormatter(yUnit) {
  if (yUnit === "%") return (val) => `${val}%`;
  return (val) => String(val);
}

/** Vertical bars — prevalence, impact scores, severity, etc. */
function SleepBarChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit ?? "";
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const fmt = (v) => formatBarValue(v, yUnit);
  const barSize = data.length > 3 ? 40 : 56;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 28, right: 20, left: 8, bottom: 52 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(65,100,90,0.12)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ ...TICK, fontSize: 11 }}
          interval={0}
          angle={-16}
          textAnchor="end"
          height={72}
        />
        <YAxis
          tick={TICK}
          tickFormatter={yTickFormatter(yUnit)}
          label={
            yUnit && yUnit !== "%"
              ? {
                  value: yUnit,
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontFamily: FONT,
                    fontSize: 11,
                    fill: "rgba(65,100,90,0.65)",
                  },
                }
              : undefined
          }
        />
        <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={barSize + 24}>
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
              fontSize: 13,
              fill: "#41645a",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Pie — substance mix for sleep (percent shares) */
function SleepPieChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="46%"
          innerRadius={58}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ value }) => `${value}%`}
          labelLine={{ stroke: "rgba(65,100,90,0.35)" }}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={PAL[i % PAL.length]}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={CS} />
        <Legend
          verticalAlign="bottom"
          height={42}
          wrapperStyle={{ ...TICK, fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Trend — sequential cycle intensity with area fill */
function SleepTrendChart({ chart, locale }) {
  const labels = locale === "he" ? chart.labels_he : chart.labels_en;
  const yUnit = chart.extra?.y_unit ?? "";
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }));
  const pad = 8;
  const minV = Math.min(...chart.values);
  const maxV = Math.max(...chart.values);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 28, right: 20, left: 8, bottom: 8 }}
      >
        <defs>
          <linearGradient
            id={`sleepArea-${chart.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#9ec4d0" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#9ec4d0" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis
          dataKey="name"
          tick={{ ...TICK, fontSize: 10 }}
          interval={0}
          angle={-14}
          textAnchor="end"
          height={68}
        />
        <YAxis
          domain={[Math.max(0, minV - pad), maxV + pad]}
          tick={TICK}
          label={
            yUnit
              ? {
                  value: yUnit,
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontFamily: FONT,
                    fontSize: 11,
                    fill: "rgba(65,100,90,0.65)",
                  },
                }
              : undefined
          }
        />
        <Tooltip formatter={(v) => [String(v), ""]} contentStyle={CS} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#41645a"
          strokeWidth={2.5}
          fill={`url(#sleepArea-${chart.id})`}
          dot={{ r: 5, fill: "#7eaa85", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 8, fill: "#41645a", stroke: "#fff", strokeWidth: 2 }}
        >
          <LabelList
            dataKey="value"
            position="top"
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 12,
              fill: "#41645a",
            }}
          />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case "pie":
      return <SleepPieChart chart={chart} locale={locale} />;
    case "line":
      return <SleepTrendChart chart={chart} locale={locale} />;
    case "bar":
      return <SleepBarChart chart={chart} locale={locale} />;
    default:
      return null;
  }
}

export default function SleepPage() {
  const { dir, locale } = useDirection();
  const s = getUiStrings(locale);
  const [data, setData] = useState(null);
  const [openCards, setOpenCards] = useState(new Set());

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/sleep`)
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
          {s.graphBreadcrumbHome} &rsaquo; {s.navGraphSleep}
        </nav>
        <h1 className={styles.heroTitle}>{s.graphSleepTitle}</h1>
        <p className={styles.heroSubtitle}>{s.graphSleepSubtitle}</p>
        <div className={styles.infoBanner} role="note">
          {s.graphSleepDesc}
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
