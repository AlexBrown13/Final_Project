import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts'
import Navbar from '../components/Navbar.jsx'
import { useDirection } from '../context/useDirection.js'
import { getUiStrings } from '../config/uiStrings.js'
import { getApiBase } from '../config/api.js'
import styles from './EmotionalRegulationPage.module.css'

const CHART_COLORS = ['#7eaa85', '#9ec4d0', '#41645a', '#f6e4dc', '#f8e087', '#c5b4e3']
const TICK_STYLE = { fontFamily: 'Heebo, system-ui, sans-serif', fill: '#41645a', fontSize: 14 }

function SimpleBarChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 55 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.1)" />
        <XAxis dataKey="name" tick={{ ...TICK_STYLE, fontSize: 13 }} interval={0} textAnchor="middle" />
        <YAxis tick={TICK_STYLE} unit="%" />
        <Tooltip
          formatter={(value, name, props) => {
            const range = chart.extra?.ranges?.[props.index]
            return [range ? `${value}% (${range})` : `${value}%`, name]
          }}
          contentStyle={{ fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a' }}
        />
        <Bar dataKey="value" fill="#7eaa85" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function RiskIndexBarChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  const yLabel = locale === 'he' ? chart.extra?.y_unit_he : chart.extra?.y_unit_en
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 55 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.1)" />
        <XAxis dataKey="name" tick={{ ...TICK_STYLE, fontSize: 13 }} interval={0} textAnchor="middle" />
        <YAxis tick={TICK_STYLE} label={{ value: yLabel, angle: -90, position: 'insideLeft', style: TICK_STYLE, offset: 10 }} />
        <Tooltip contentStyle={{ fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function GroupedBarChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const series = chart.extra?.series ?? []
  const data = labels.map((label, i) => {
    const row = { name: label }
    series.forEach(s => {
      const key = locale === 'he' ? s.name_he : s.name_en
      row[key] = s.values[i]
    })
    return row
  })
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.1)" />
        <XAxis dataKey="name" tick={{ ...TICK_STYLE, fontSize: 13 }} interval={0} textAnchor="middle" />
        <YAxis tick={TICK_STYLE} />
        <Tooltip contentStyle={{ fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a' }} />
        <Legend wrapperStyle={TICK_STYLE} />
        {series.map((s, i) => (
          <Bar
            key={i}
            dataKey={locale === 'he' ? s.name_he : s.name_en}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieDonutChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={110}
          dataKey="value"
          label={({ name, value }) => `${value}%`}
          labelLine={false}
        >
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip
          formatter={(v) => `${v}%`}
          contentStyle={{ fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a' }}
        />
        <Legend wrapperStyle={TICK_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function RadarSpiderChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = labels.map((label, i) => ({ subject: label, value: chart.values[i] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(65,100,90,0.15)" />
        <PolarAngleAxis dataKey="subject" tick={{ ...TICK_STYLE, fontSize: 13 }} />
        <PolarRadiusAxis domain={[0, 10]} tick={{ ...TICK_STYLE, fontSize: 11 }} />
        <Radar dataKey="value" stroke="#7eaa85" fill="#7eaa85" fillOpacity={0.35} />
        <Tooltip contentStyle={{ fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a' }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function renderChart(chart, locale) {
  if (chart.chart_type === 'grouped_bar') return <GroupedBarChart chart={chart} locale={locale} />
  if (chart.chart_type === 'pie') return <PieDonutChart chart={chart} locale={locale} />
  if (chart.chart_type === 'radar') return <RadarSpiderChart chart={chart} locale={locale} />
  if (chart.id === 'nightmares_opioid_risk') return <RiskIndexBarChart chart={chart} locale={locale} />
  return <SimpleBarChart chart={chart} locale={locale} />
}

export default function EmotionalRegulationPage() {
  const { dir, locale } = useDirection()
  const s = getUiStrings(locale)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/emotional`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData([]))
  }, [])

  const bannerText = locale === 'he'
    ? '50%–75% מוותיקי מלחמה עם PTSD סובלים גם מהפרעת שימוש בחומרים'
    : '50–75% of war veterans with PTSD also have a substance use disorder'

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} lang={locale} dir={dir}>
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          {s.graphBreadcrumbHome} &rsaquo; {s.navGraphEmotional}
        </nav>

        <h1 className={styles.heroTitle}>{s.graphEmotionalTitle}</h1>
        <p className={styles.heroSubtitle}>{s.graphEmotionalSubtitle}</p>

        <div className={styles.infoBanner} role="note">
          {bannerText}
        </div>

        {!data ? (
          <p className={styles.loading}>{s.graphLoading}</p>
        ) : (
          <div className={styles.graphGrid}>
            {data.map(chart => (
              <div key={chart.id} className={styles.graphCard}>
                <p className={styles.cardTitle}>
                  {locale === 'he' ? chart.title_he : chart.title_en}
                </p>
                {renderChart(chart, locale)}
                <p className={styles.cardSource}>{chart.source}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
