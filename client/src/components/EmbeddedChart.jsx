import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, LineChart, Line, ResponsiveContainer,
} from 'recharts'
import { getApiBase } from '../config/api.js'
import styles from './EmbeddedChart.module.css'

const PAL = ['#7eaa85', '#9ec4d0', '#41645a', '#e8b84b', '#c5b4e3', '#e88f8f']
const TICK = { fontFamily: 'Heebo, system-ui, sans-serif', fill: '#41645a', fontSize: 12 }
const CS = { fontFamily: 'Heebo, system-ui, sans-serif', color: '#41645a', borderRadius: 8, fontSize: 12 }
const FONT = 'Heebo, system-ui, sans-serif'

function fmtVal(v, yUnit) {
  if (yUnit === '%' || yUnit === '% change') return `${v}%`
  if (yUnit === 'euro') return `€${(v / 1000).toFixed(0)}K`
  if (yUnit === 'billion USD') return `$${v}B`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return String(v)
}

/* ── Simple / stacked-bar / lollipop → bar ── */
function BarRenderer({ chart, locale, height }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const yUnit = chart.extra?.y_unit
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  const fmt = v => fmtVal(v, yUnit)
  const barSize = data.length <= 2 ? 72 : data.length <= 3 ? 52 : 36
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 28, right: 20, left: 12, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={v => fmtVal(v, yUnit)} />
        <Tooltip formatter={v => [fmt(v), '']} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={barSize}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 && data.length === 2 ? '#e88f8f' : PAL[i % PAL.length]} />
          ))}
          <LabelList dataKey="value" position="top" formatter={fmt}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, fill: '#41645a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Line chart ── */
function LineRenderer({ chart, locale, height }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const yUnit = chart.extra?.y_unit
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  const fmt = v => fmtVal(v, yUnit)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 28, right: 20, left: 12, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} />
        <YAxis tick={TICK} tickFormatter={v => fmtVal(v, yUnit)} />
        <Tooltip formatter={v => [fmt(v), '']} contentStyle={CS} />
        <Line type="monotone" dataKey="value" stroke="#7eaa85" strokeWidth={3}
          dot={{ r: 5, fill: '#7eaa85', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }}>
          <LabelList dataKey="value" position="top" formatter={fmt}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11, fill: '#41645a' }} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ── Donut / pie ── */
function PieRenderer({ chart, locale, height }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="42%" outerRadius={90} innerRadius={40}
          dataKey="value" label={({ value }) => `${value}%`} labelLine>
          {data.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
        </Pie>
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Legend wrapperStyle={{ ...TICK, fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

/* ── Waterfall (productivity decline) ── */
function WaterfallRenderer({ chart, locale, height }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const running = [chart.values[0]]
  for (let i = 1; i < chart.values.length; i++) running.push(running[i - 1] + chart.values[i])
  const data = labels.map((l, i) => ({ name: l, value: running[i] }))
  const getColor = v => v >= 90 ? '#7eaa85' : v >= 75 ? '#9ec4d0' : v >= 65 ? '#e8b84b' : '#e88f8f'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 28, right: 20, left: 12, bottom: 52 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10 }} interval={0} angle={-14} textAnchor="end" />
        <YAxis tick={TICK} tickFormatter={v => `${v}%`} domain={[0, 110]} />
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={52}>
          {data.map((d, i) => <Cell key={i} fill={getColor(d.value)} />)}
          <LabelList dataKey="value" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, fill: '#41645a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Diverging bar (PTSD vs baseline) ── */
function DivergingBarRenderer({ chart, locale, height }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const ptsdLabel = locale === 'he' ? 'עם PTSD' : 'With PTSD'
  const baseLabel = locale === 'he' ? 'ללא PTSD' : 'Without PTSD'
  const data = labels.map((l, i) => ({
    name: l, ptsd: chart.values_ptsd[i], base: Math.abs(chart.values_base[i]),
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 28, right: 20, left: 12, bottom: 44 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.12)" />
        <XAxis dataKey="name" tick={TICK} interval={0} />
        <YAxis tick={TICK} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={CS} />
        <Legend wrapperStyle={{ ...TICK, fontSize: 11 }} />
        <Bar dataKey="base" name={baseLabel} fill="#e88f8f" radius={[4, 4, 0, 0]} barSize={20}>
          <LabelList dataKey="base" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontSize: 10, fill: '#e88f8f', fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="ptsd" name={ptsdLabel} fill="#9ec4d0" radius={[4, 4, 0, 0]} barSize={20}>
          <LabelList dataKey="ptsd" position="top" formatter={v => `${v}%`}
            style={{ fontFamily: FONT, fontSize: 10, fill: '#41645a', fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Heatmap (custom SVG) ── */
function lerp(a, b, t) { return Math.round(a + (b - a) * t) }
function cellColor(v) {
  const t = v / 10
  return `rgb(${lerp(0xe1, 0x41, t)},${lerp(0xeb, 0x64, t)},${lerp(0xe2, 0x5a, t)})`
}
function HeatmapRenderer({ chart, locale }) {
  const rowLabels = locale === 'he' ? chart.row_labels_he : chart.row_labels_en
  const colLabels = locale === 'he' ? chart.labels_he : chart.labels_en
  const isRtl = locale === 'he'
  const W = 460; const pL = isRtl ? 150 : 120; const pR = 10
  const pT = isRtl ? 68 : 46; const pB = 10; const H = isRtl ? 300 : 280
  const cW = (W - pL - pR) / colLabels.length
  const cH = (H - pT - pB) / rowLabels.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {colLabels.map((l, j) => {
        const cx = pL + j * cW + cW / 2
        const words = l.split(' ')
        return (
          <text key={j} x={cx} y={pT - (words.length > 1 ? 24 : 10)} textAnchor="middle"
            style={{ fontFamily: FONT, fontSize: '10px', fill: '#41645a', fontWeight: 600 }}>
            {words.map((w, wi) => <tspan key={wi} x={cx} dy={wi === 0 ? 0 : '1.3em'}>{w}</tspan>)}
          </text>
        )
      })}
      {rowLabels.map((l, i) => (
        <text key={i} x={pL - 8} y={pT + i * cH + cH / 2}
          textAnchor={isRtl ? 'start' : 'end'} direction={isRtl ? 'rtl' : undefined}
          dominantBaseline="middle"
          style={{ fontFamily: FONT, fontSize: '10px', fill: '#41645a', fontWeight: 600 }}>{l}</text>
      ))}
      {chart.values.map((row, i) => row.map((v, j) => (
        <g key={`${i}-${j}`}>
          <rect x={pL + j * cW + 2} y={pT + i * cH + 2} width={cW - 4} height={cH - 4}
            fill={cellColor(v)} rx={4} />
          <text x={pL + j * cW + cW / 2} y={pT + i * cH + cH / 2}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: FONT, fontSize: '13px', fill: v > 5 ? '#fff' : '#41645a', fontWeight: 700 }}>
            {v}
          </text>
        </g>
      )))}
    </svg>
  )
}

function renderChart(chart, locale, height) {
  switch (chart.chart_type) {
    case 'bar':
    case 'stacked_bar':
    case 'stacked_area':
    case 'lollipop':
      return <BarRenderer chart={chart} locale={locale} height={height} />
    case 'line':
      return <LineRenderer chart={chart} locale={locale} height={height} />
    case 'donut':
      return <PieRenderer chart={chart} locale={locale} height={height} />
    case 'waterfall':
      return <WaterfallRenderer chart={chart} locale={locale} height={height} />
    case 'diverging_bar':
      return <DivergingBarRenderer chart={chart} locale={locale} height={height} />
    case 'heatmap':
      return <HeatmapRenderer chart={chart} locale={locale} />
    default:
      return null
  }
}

export default function EmbeddedChart({ endpoint, chartId, locale, height = 260 }) {
  const [chart, setChart] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${getApiBase()}/graphs/${endpoint}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setChart(data.find(c => c.id === chartId) ?? null)
      })
      .catch(() => { /* stay null silently */ })
    return () => { cancelled = true }
  }, [endpoint, chartId])

  if (!chart) {
    return <div className={styles.loading} aria-hidden="true" style={{ minHeight: height }} />
  }

  const title = locale === 'he' ? chart.title_he : chart.title_en
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>{title}</figcaption>
      {renderChart(chart, locale, height)}
      <p className={styles.source}>{chart.source}</p>
    </figure>
  )
}
