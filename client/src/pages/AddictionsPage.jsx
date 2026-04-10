import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  LineChart, Line, Legend,
  ResponsiveContainer,
} from 'recharts'
import Navbar from '../components/Navbar.jsx'
import { useDirection } from '../context/useDirection.js'
import { getUiStrings } from '../config/uiStrings.js'
import { getApiBase } from '../config/api.js'
import styles from './AddictionsPage.module.css'

const PAL = ['#9ec4d0', '#7eaa85', '#41645a', '#e8b84b', '#c5b4e3', '#e88f8f']
const TICK = { fontFamily: 'Heebo, system-ui, sans-serif', fill: '#41645a', fontSize: 13 }
const CS = { fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a', borderRadius: 8, fontSize: 13 }
const FONT = 'Heebo, system-ui, sans-serif'

/* 7 — Grouped bar: PTSD vs no-trauma, 4 substances */
function GroupedBar({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const ptsdLabel = locale === 'he' ? 'עם PTSD' : 'With PTSD'
  const baseLabel = locale === 'he' ? 'ללא PTSD' : 'Without PTSD'
  const data = labels.map((l, i) => ({
    name: l,
    ptsd: chart.values_ptsd[i],
    base: Math.abs(chart.values_base[i]),
  }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 24, right: 24, left: 16, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Legend wrapperStyle={{ ...TICK, fontSize: 13 }} />
        <Bar dataKey="base" name={baseLabel} fill="#e88f8f" radius={[4, 4, 0, 0]} barSize={22}>
          <LabelList dataKey="base" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontSize: 12, fill: '#e88f8f', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="ptsd" name={ptsdLabel} fill="#9ec4d0" radius={[4, 4, 0, 0]} barSize={22}>
          <LabelList dataKey="ptsd" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontSize: 12, fill: '#41645a', fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* 8 — Heatmap: 4x4 (custom SVG — Recharts has no heatmap) */
function lerp(a, b2, t) { return Math.round(a + (b2 - a) * t) }
function cellColor(v) {
  const t = v / 10
  return `rgb(${lerp(0xe1, 0x41, t)},${lerp(0xeb, 0x64, t)},${lerp(0xe2, 0x5a, t)})`
}
function HeatmapChart({ chart, locale }) {
  const rowLabels = locale === 'he' ? chart.row_labels_he : chart.row_labels_en
  const colLabels = locale === 'he' ? chart.labels_he : chart.labels_en
  const matrix = chart.values
  const W = 400, H = 280, pL = 120, pT = 46, pR = 10, pB = 10
  const cW = (W - pL - pR) / colLabels.length
  const cH = (H - pT - pB) / rowLabels.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {colLabels.map((l, j) => (
        <text key={j} x={pL + j * cW + cW / 2} y={pT - 10}
          textAnchor="middle" style={{ fontFamily: FONT, fontSize: '11px', fill: '#41645a', fontWeight: 600 }}>{l}</text>
      ))}
      {rowLabels.map((l, i) => (
        <text key={i} x={pL - 8} y={pT + i * cH + cH / 2}
          textAnchor="end" dominantBaseline="middle" style={{ fontFamily: FONT, fontSize: '11px', fill: '#41645a', fontWeight: 600 }}>{l}</text>
      ))}
      {matrix.map((row, i) => row.map((v, j) => (
        <g key={`${i}-${j}`}>
          <rect x={pL + j * cW + 2} y={pT + i * cH + 2} width={cW - 4} height={cH - 4}
            fill={cellColor(v)} rx={4} />
          <text x={pL + j * cW + cW / 2} y={pT + i * cH + cH / 2}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: FONT, fontSize: '14px', fill: v > 5 ? '#fff' : '#41645a', fontWeight: 700 }}>
            {v}
          </text>
        </g>
      )))}
    </svg>
  )
}

/* 9 — Simple bar: 28% vs 8% */
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

/* 10 — Descending bar: productivity level at each stage — NO floating */
function ProductivityDecline({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const running = [chart.values[0]]
  for (let i = 1; i < chart.values.length; i++) running.push(running[i - 1] + chart.values[i])
  const data = labels.map((l, i) => ({
    name: l,
    value: running[i],
    delta: i === 0 ? null : chart.values[i],
  }))
  const getColor = v => v >= 90 ? '#7eaa85' : v >= 75 ? '#9ec4d0' : v >= 65 ? '#e8b84b' : '#e88f8f'
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 32, right: 24, left: 24, bottom: 56 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={{ ...TICK, fontSize: 11 }} interval={0} angle={-14} textAnchor="end" />
        <YAxis tick={TICK} tickFormatter={v => `${v}%`} domain={[0, 110]} />
        <Tooltip
          formatter={(v, _name, props) => {
            const d = props.payload
            return [d.delta != null ? `${v}% (${d.delta}%)` : `${v}%`, '']
          }}
          contentStyle={CS}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={56}>
          {data.map((d, i) => <Cell key={i} fill={getColor(d.value)} />)}
          <LabelList dataKey="value" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, fill: '#41645a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* 11 — Line: 6 causal pathway stages */
function SimpleLineChart({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 32, right: 24, left: 16, bottom: 56 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10 }} interval={0} angle={-14} textAnchor="end" />
        <YAxis tick={TICK} domain={[50, 110]} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Line type="monotone" dataKey="value" stroke="#9ec4d0" strokeWidth={3}
          dot={{ r: 6, fill: '#9ec4d0', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }}>
          <LabelList dataKey="value" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, fill: '#41645a' }} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  )
}

/* 12 — Horizontal bar: severity of each risk behavior, with frequency label */
function SeverityBar({ chart, locale }) {
  const behaviors = chart.values
  const sevLabel = locale === 'he' ? 'חומרה' : 'Severity (0–100)'
  const data = behaviors
    .map(b => ({
      name: locale === 'he' ? b.label_he : b.label_en,
      severity: b.y,
      frequency: b.x,
      prevalence: b.z,
    }))
    .sort((a, b2) => b2.severity - a.severity)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 16, right: 80, left: 100, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" horizontal={false} />
        <XAxis type="number" tick={TICK} domain={[0, 100]} tickFormatter={v => `${v}`} label={{ value: sevLabel, position: 'insideBottom', offset: -4, style: { fontFamily: FONT, fontSize: 12, fill: '#41645a' } }} />
        <YAxis type="category" dataKey="name" tick={TICK} width={95} />
        <Tooltip
          formatter={(v, name, props) => {
            const d = props.payload
            return [`${locale === 'he' ? 'חומרה' : 'Severity'}: ${d.severity}  |  ${locale === 'he' ? 'תדירות' : 'Freq'}: ${d.frequency}%  |  ${locale === 'he' ? 'שכיחות' : 'Prev'}: ${d.prevalence}%`, '']
          }}
          contentStyle={CS}
        />
        <Bar dataKey="severity" radius={[0, 6, 6, 0]} barSize={34}>
          {data.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
          <LabelList dataKey="severity" position="right"
            formatter={(v, entry) => {
              const d = data.find(r => r.severity === v)
              return `${v}  (${locale === 'he' ? 'תד' : 'fr'} ${d?.frequency}%)`
            }}
            style={{ fontFamily: FONT, fontSize: 12, fill: '#41645a', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case 'diverging_bar': return <GroupedBar chart={chart} locale={locale} />
    case 'heatmap':       return <HeatmapChart chart={chart} locale={locale} />
    case 'bar':           return <SimpleBar chart={chart} locale={locale} />
    case 'waterfall':     return <ProductivityDecline chart={chart} locale={locale} />
    case 'sankey':        return <SimpleLineChart chart={chart} locale={locale} />
    case 'bubble':        return <SeverityBar chart={chart} locale={locale} />
    default:              return null
  }
}

export default function AddictionsPage() {
  const { dir, locale } = useDirection()
  const s = getUiStrings(locale)
  const [data, setData] = useState(null)
  const [openCards, setOpenCards] = useState(new Set())

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/addictions`)
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
        <nav className={styles.breadcrumb}>{s.graphBreadcrumbHome} &rsaquo; {s.navGraphAddictions}</nav>
        <h1 className={styles.heroTitle}>{s.graphAddictionsTitle}</h1>
        <p className={styles.heroSubtitle}>{s.graphAddictionsSubtitle}</p>
        <div className={styles.infoBanner} role="note">{s.graphAddictionsDesc}</div>
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
