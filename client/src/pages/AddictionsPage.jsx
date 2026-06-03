import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ScatterChart, Scatter, ZAxis,
  BarChart, Bar, LabelList, Cell,
  ResponsiveContainer, defs as SvgDefs,
} from 'recharts'
import Navbar from '../components/Navbar.jsx'
import { useDirection } from '../context/useDirection.js'
import { getUiStrings } from '../config/uiStrings.js'
import { getApiBase } from '../config/api.js'
import styles from './AddictionsPage.module.css'

const COLORS = ['#9ec4d0', '#7eaa85', '#41645a', '#e8b84b', '#c5b4e3', '#e88f8f']
const ACCENT = '#9ec4d0'
const DARK = '#41645a'
const TICK = { fontFamily: 'Heebo, system-ui, sans-serif', fill: DARK, fontSize: 12 }
const CS = { fontFamily: 'Heebo, system-ui, sans-serif', color: DARK, borderRadius: '8px' }
const FONT = 'Heebo, system-ui, sans-serif'

/* ─────────────────────────────────────────────
   1. RISK CURVE — line with gradient fill
───────────────────────────────────────────── */
function RiskCurve({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const xLabel = locale === 'he' ? chart.extra.x_label_he : chart.extra.x_label_en
  const yLabel = locale === 'he' ? chart.extra.y_label_he : chart.extra.y_label_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c8dde4" />
              <stop offset="50%" stopColor="#e8b84b" />
              <stop offset="100%" stopColor="#e88f8f" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.1)" />
          <XAxis dataKey="name" tick={{ ...TICK, fontSize: 11 }} label={{ value: xLabel, position: 'insideBottom', offset: -28, style: { fontFamily: FONT, fill: DARK, fontSize: 11 } }} />
          <YAxis tick={TICK} domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: FONT, fill: DARK, fontSize: 10 } }} />
          <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={CS} />
          <ReferenceLine y={50} stroke="#e8b84b" strokeDasharray="5 3" label={{ value: '50%', position: 'right', style: { ...TICK, fontSize: 10, fill: '#b59a00' } }} />
          <Line type="monotone" dataKey="value" stroke="url(#riskGrad)" strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props
              const pct = payload.value
              const color = pct < 30 ? '#9ec4d0' : pct < 60 ? '#e8b84b' : '#e88f8f'
              return <circle key={cx} cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─────────────────────────────────────────────
   2. CAUSAL LOOP — SVG cyclic diagram
───────────────────────────────────────────── */
function CausalLoop({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const W = 320, H = 280, cx = W / 2, cy = H / 2, R = 100
  const n = labels.length
  const pts = labels.map((_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), label: labels[i] }
  })

  const arrowId = 'arrowhead'
  const arrows = pts.map((from, i) => {
    const to = pts[(i + 1) % n]
    const dx = to.x - from.x, dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / len, ny = dy / len
    const nodeR = 30
    const x1 = from.x + nx * nodeR, y1 = from.y + ny * nodeR
    const x2 = to.x - nx * nodeR, y2 = to.y - ny * nodeR
    return { x1, y1, x2, y2, color: COLORS[i % COLORS.length] }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={280} aria-label={locale === 'he' ? 'לולאת משוב' : 'feedback loop'}>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={DARK} />
        </marker>
      </defs>
      {arrows.map((a, i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
          stroke={a.color} strokeWidth={2.5} markerEnd={`url(#${arrowId})`} />
      ))}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={30} fill={COLORS[i % COLORS.length]} opacity={0.18} />
          <circle cx={p.x} cy={p.y} r={30} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
          <foreignObject x={p.x - 28} y={p.y - 18} width={56} height={36}>
            <div xmlns="http://www.w3.org/1999/xhtml"
              style={{ fontFamily: FONT, fontSize: '9px', color: DARK, textAlign: 'center', lineHeight: 1.25, fontWeight: 600 }}>
              {p.label}
            </div>
          </foreignObject>
        </g>
      ))}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: FONT, fontSize: '10px', fill: DARK, fontWeight: 700 }}>
        {locale === 'he' ? '↺ לולאה' : '↺ Loop'}
      </text>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   3. RISK MATRIX — scatter with quadrant bg
───────────────────────────────────────────── */
function RiskMatrix({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const xLabel = locale === 'he' ? chart.extra.x_label_he : chart.extra.x_label_en
  const yLabel = locale === 'he' ? chart.extra.y_label_he : chart.extra.y_label_en
  const points = chart.values.map((p, i) => ({ ...p, label: labels[i], fill: COLORS[i] }))

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    return (
      <g>
        <circle cx={cx} cy={cy} r={payload.size} fill={payload.fill} fillOpacity={0.75} stroke={payload.fill} strokeWidth={2} />
        <text x={cx} y={cy - payload.size - 6} textAnchor="middle" style={{ fontFamily: FONT, fontSize: '11px', fill: DARK, fontWeight: 700 }}>{payload.label}</text>
      </g>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 18, right: 20, left: 15, bottom: 40 }}>
          <defs>
            <linearGradient id="q1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e88f8f" stopOpacity={0.12} /><stop offset="100%" stopColor="#e88f8f" stopOpacity={0.25} /></linearGradient>
            <linearGradient id="q2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9ec4d0" stopOpacity={0.1} /><stop offset="100%" stopColor="#9ec4d0" stopOpacity={0.18} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.1)" />
          <XAxis type="number" dataKey="x" domain={[0, 100]} tick={TICK} tickFormatter={(v) => `${v}%`}
            label={{ value: xLabel, position: 'insideBottom', offset: -28, style: { fontFamily: FONT, fill: DARK, fontSize: 10 } }} />
          <YAxis type="number" dataKey="y" domain={[0, 100]} tick={TICK} tickFormatter={(v) => `${v}%`}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: FONT, fill: DARK, fontSize: 10 } }} />
          <ZAxis dataKey="size" range={[120, 400]} />
          <ReferenceLine x={50} stroke={DARK} strokeDasharray="4 3" strokeOpacity={0.3} />
          <ReferenceLine y={50} stroke={DARK} strokeDasharray="4 3" strokeOpacity={0.3} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={CS}
            formatter={(v, name) => [`${v}%`, name === 'x' ? xLabel : yLabel]} />
          <Scatter data={points} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: 22, right: 24, fontFamily: FONT, fontSize: 9, color: '#e88f8f', fontWeight: 700, opacity: 0.8 }}>
        {locale === 'he' ? 'סיכון גבוה' : 'HIGH RISK'}
      </div>
      <div style={{ position: 'absolute', bottom: 52, left: 24, fontFamily: FONT, fontSize: 9, color: '#9ec4d0', fontWeight: 700, opacity: 0.8 }}>
        {locale === 'he' ? 'סיכון נמוך' : 'LOW RISK'}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   4. SANKEY FLOW — custom SVG funnel/flow
───────────────────────────────────────────── */
function SankeyFlow({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const values = chart.values
  const W = 340, H = 270
  const nodeH = 32, gap = (H - nodeH * labels.length) / (labels.length - 1)
  const maxVal = values[0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-label={locale === 'he' ? 'זרימת השפעה' : 'impact flow'}>
      {labels.map((label, i) => {
        const barW = Math.max(40, (values[i] / maxVal) * (W - 80))
        const x = (W - barW) / 2
        const y = i * (nodeH + gap)
        const nextW = i < labels.length - 1 ? Math.max(40, (values[i + 1] / maxVal) * (W - 80)) : barW
        const nextX = (W - nextW) / 2
        const nextY = y + nodeH + gap

        return (
          <g key={i}>
            {i < labels.length - 1 && (
              <path
                d={`M${x},${y + nodeH} L${x + barW},${y + nodeH} L${nextX + nextW},${nextY} L${nextX},${nextY} Z`}
                fill={COLORS[i % COLORS.length]}
                opacity={0.18}
              />
            )}
            <rect x={x} y={y} width={barW} height={nodeH} rx={6}
              fill={COLORS[i % COLORS.length]} opacity={0.85} />
            <text x={W / 2} y={y + nodeH / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: FONT, fontSize: '11px', fill: '#fff', fontWeight: 700 }}>
              {label}
            </text>
            <text x={W - 10} y={y + nodeH / 2 + 1} textAnchor="end" dominantBaseline="middle"
              style={{ fontFamily: FONT, fontSize: '10px', fill: DARK, fontWeight: 600 }}>
              {values[i]}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─────────────────────────────────────────────
   5. HORIZONTAL BAR (causal chain — kept)
───────────────────────────────────────────── */
function HorizontalBar({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,100,90,0.1)" />
        <XAxis type="number" tick={TICK} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ ...TICK, fontSize: 10 }} width={160} />
        <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={CS} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          <LabelList dataKey="value" position="right" formatter={(v) => `${v}%`} style={{ ...TICK, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─────────────────────────────────────────────
   6. NETWORK GRAPH — SVG hub-and-spoke
───────────────────────────────────────────── */
function NetworkGraph({ chart, locale }) {
  const labels = locale === 'he' ? chart.labels_he : chart.labels_en
  const W = 320, H = 280
  const cx = W / 2, cy = H / 2
  const hubR = 38, nodeR = 28, orbitR = 105
  const satellites = labels.slice(1)
  const n = satellites.length

  const satPts = satellites.map((label, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle), label }
  })

  const crossLinks = [
    [0, 2], [1, 3],
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-label={labels[0]}>
      <defs>
        <marker id="net-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill={DARK} opacity={0.5} />
        </marker>
      </defs>

      {satPts.map((p, i) => {
        const dx = p.x - cx, dy = p.y - cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len, ny = dy / len
        return (
          <line key={i}
            x1={cx + nx * hubR} y1={cy + ny * hubR}
            x2={p.x - nx * nodeR} y2={p.y - ny * nodeR}
            stroke={COLORS[(i + 1) % COLORS.length]} strokeWidth={2} strokeDasharray="4 2"
            markerEnd="url(#net-arrow)" opacity={0.7} />
        )
      })}

      {crossLinks.map(([a, b], i) => {
        const from = satPts[a], to = satPts[b]
        return (
          <line key={`cl-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={DARK} strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />
        )
      })}

      {satPts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={nodeR} fill={COLORS[(i + 1) % COLORS.length]} opacity={0.2} />
          <circle cx={p.x} cy={p.y} r={nodeR} fill="none" stroke={COLORS[(i + 1) % COLORS.length]} strokeWidth={2} />
          <foreignObject x={p.x - nodeR + 2} y={p.y - nodeR + 6} width={nodeR * 2 - 4} height={nodeR * 2 - 12}>
            <div xmlns="http://www.w3.org/1999/xhtml"
              style={{ fontFamily: FONT, fontSize: '9px', color: DARK, textAlign: 'center', lineHeight: 1.2, fontWeight: 600 }}>
              {p.label}
            </div>
          </foreignObject>
        </g>
      ))}

      <circle cx={cx} cy={cy} r={hubR} fill={ACCENT} opacity={0.88} />
      <foreignObject x={cx - hubR + 4} y={cy - 14} width={hubR * 2 - 8} height={28}>
        <div xmlns="http://www.w3.org/1999/xhtml"
          style={{ fontFamily: FONT, fontSize: '11px', color: '#fff', textAlign: 'center', fontWeight: 700, lineHeight: 1.2 }}>
          {labels[0]}
        </div>
      </foreignObject>
    </svg>
  )
}

/* ─── Router ─── */
function renderChart(chart, locale) {
  switch (chart.chart_type) {
    case 'risk_curve': return <RiskCurve chart={chart} locale={locale} />
    case 'causal_loop': return <CausalLoop chart={chart} locale={locale} />
    case 'risk_matrix': return <RiskMatrix chart={chart} locale={locale} />
    case 'sankey_flow': return <SankeyFlow chart={chart} locale={locale} />
    case 'network_graph': return <NetworkGraph chart={chart} locale={locale} />
    case 'horizontal_bar': return <HorizontalBar chart={chart} locale={locale} />
    default: return null
  }
}

export default function AddictionsPage() {
  const { dir, locale } = useDirection()
  const s = getUiStrings(locale)
  const [data, setData] = useState(null)
  const [openCards, setOpenCards] = useState(new Set())

  useEffect(() => {
    fetch(`${getApiBase()}/graphs/addictions`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]))
  }, [])

  const toggle = (id) => setOpenCards((prev) => {
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
            {data.map((chart) => (
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
