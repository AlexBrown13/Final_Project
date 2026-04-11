import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend,
  LineChart, Line,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts'
import Navbar from '../components/Navbar.jsx'
import { useDirection } from '../context/useDirection.js'
import { getUiStrings } from '../config/uiStrings.js'
import { getApiBase } from '../config/api.js'
import styles from './IsraelWarPage.module.css'

const PAL = ['#7eaa85', '#9ec4d0', '#41645a', '#e8b84b', '#c5b4e3', '#e88f8f']
const TICK = { fontFamily: 'Heebo, system-ui, sans-serif', fill: '#41645a', fontSize: 14 }
const CS = { fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a', borderRadius: 8, fontSize: 13 }
const FONT = 'Heebo, system-ui, sans-serif'

/* 1 — Bar: 38% vs 1% */
function SimpleBar({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 32, right: 24, left: 16, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={72}>
          {data.map((_, i) => <Cell key={i} fill={i === 0 ? '#e88f8f' : PAL[0]} />)}
          <LabelList dataKey="value" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, fill: '#41645a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* 2 — Grouped bar: 93K / 340K / 680K */
function GroupedBar3({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 32, right: 24, left: 24, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={fmtK} />
        <Tooltip formatter={v => [Number(v).toLocaleString(), '']} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={64}>
          {data.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
          <LabelList dataKey="value" position="top" formatter={fmtK}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, fill: '#41645a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* 3 — Pie: 18% / 59% / 19% */
function SimplePie({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={290}>
      <PieChart>
        <Pie data={data} cx="50%" cy="44%" outerRadius={105} dataKey="value"
          label={({ value, name }) => `${value}%`} labelLine>
          {data.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
        </Pie>
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Legend wrapperStyle={{ ...TICK, fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

/* 4 — Bar (4 bars): 3 components + total — NO floating */
function ComponentsBar({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const totalLabel = locale === 'he' ? `סה"כ` : `Total`
  const allVals = [...chart.values, chart.extra.total]
  const allLabels = [...labels, totalLabel]
  const data = allVals.map((v, i) => ({ name: allLabels[i], value: v, isTotal: i === allVals.length - 1 }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 32, right: 24, left: 24, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={{ ...TICK, fontSize: 12 }} interval={0} />
        <YAxis tick={TICK} tickFormatter={v => `$${v}B`} />
        <Tooltip formatter={v => [`$${v}B`, '']} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={56}>
          {data.map((d, i) => <Cell key={i} fill={d.isTotal ? '#41645a' : PAL[i % 3]} />)}
          <LabelList dataKey="value" position="top" formatter={v => `$${v}B`}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, fill: '#41645a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* 5 — Dual-axis combo: 12B workdays (bar) + $1T cost (line dot) */
function DualAxisCombo({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = [
    { name: labels[0], workdays: chart.values[0], cost: null },
    { name: labels[1], workdays: null, cost: chart.values[1] },
  ]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 32, right: 64, left: 16, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis yAxisId="L" tick={TICK} tickFormatter={v => `${v}B`} domain={[0, 15]} />
        <YAxis yAxisId="R" orientation="right" tick={TICK} tickFormatter={v => `$${v}T`} domain={[0, 1.5]} />
        <Tooltip contentStyle={CS} formatter={(v, name) => [name === 'workdays' ? `${v}B days` : `$${v}T`, '']} />
        <Legend wrapperStyle={{ ...TICK, fontSize: 13 }} />
        <Bar yAxisId="L" dataKey="workdays" name={locale === 'he' ? 'ימים (מיליארד)' : 'Workdays Lost (B)'} fill="#7eaa85" radius={[6, 6, 0, 0]} barSize={76}>
          <LabelList dataKey="workdays" position="top" formatter={v => v != null ? `${v}B` : ''}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, fill: '#41645a' }} />
        </Bar>
        <Line yAxisId="R" dataKey="cost" name={locale === 'he' ? 'עלות (טריליון $)' : 'Annual Cost (T$)'}
          stroke="#e88f8f" strokeWidth={3} connectNulls={false}
          dot={{ r: 12, fill: '#e88f8f', stroke: '#fff', strokeWidth: 2 }}>
          <LabelList dataKey="cost" position="top" formatter={v => v != null ? `$${v}T` : ''}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, fill: '#e88f8f' }} />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/* 6 — Line: €8.6K → €43K over 5 years */
function SimpleLineChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const fmt = v => `€${(v / 1000).toFixed(0)}K`
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 32, right: 24, left: 24, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} />
        <YAxis tick={TICK} tickFormatter={fmt} />
        <Tooltip formatter={v => [fmt(v), '']} contentStyle={CS} />
        <Line type="monotone" dataKey="value" stroke="#7eaa85" strokeWidth={3}
          dot={{ r: 6, fill: '#7eaa85', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }}>
          <LabelList dataKey="value" position="top" formatter={fmt}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, fill: '#41645a' }} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  )
}

function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case 'bar':          return <SimpleBar chart={chart} locale={locale} />
    case 'stacked_area': return <GroupedBar3 chart={chart} locale={locale} />
    case 'donut':        return <SimplePie chart={chart} locale={locale} />
    case 'stacked_bar':  return <ComponentsBar chart={chart} locale={locale} />
    case 'lollipop':     return <DualAxisCombo chart={chart} locale={locale} />
    case 'line':         return <SimpleLineChart chart={chart} locale={locale} />
    default:             return null
  }
}

export default function IsraelWarPage() {
  const { dir, locale } = useDirection()
  const s = getUiStrings(locale)
  const [data, setData] = useState(null)
  const [openCards, setOpenCards] = useState(new Set())

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/israel`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData([]))
  }, [])

  const toggle = id => setOpenCards(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} lang={locale} dir={dir}>
        <nav className={styles.breadcrumb}>{s.graphBreadcrumbHome} &rsaquo; {s.navGraphIsrael}</nav>
        <h1 className={styles.heroTitle}>{s.graphIsraelTitle}</h1>
        <p className={styles.heroSubtitle}>{s.graphIsraelSubtitle}</p>
        <div className={styles.infoBanner} role="note">{s.graphIsraelDesc}</div>
        {!data ? <p className={styles.loading}>{s.graphLoading}</p> : (
          <div className={styles.graphGrid}>
            {data.map(chart => (
              <div key={chart.id} className={styles.graphCard}>
                <p className={styles.cardTitle}>{locale === 'he' ? chart.title_he : chart.title_en}</p>
                {renderChart(chart, locale)}
                {(chart.explain_he || chart.explain_en) && (
                  <button className={styles.readMoreBtn} onClick={() => toggle(chart.id)}>
                    {openCards.has(chart.id) ? s.graphReadLess : s.graphReadMore}
                  </button>
                )}
                {openCards.has(chart.id) && (
                  <p className={styles.readMoreText}>{locale === 'he' ? chart.explain_he : chart.explain_en}</p>
                )}
                <p className={styles.cardSource}>{chart.source}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
