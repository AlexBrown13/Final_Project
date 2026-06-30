/**
 * Self-contained chart renderers for the NATAL research data on the results page.
 * Built with Recharts + SVG in the SAME method as the /graphs/* pages
 * (AddictionsPage etc.), but kept entirely separate from them — these read from
 * natalData.js and accept a per-persona `tone` for palette only.
 *
 * Chart types (chart.chart_type):
 *   natal_bar       — vertical comparison bars (2–4 cols)
 *   natal_hbar      — horizontal ranked bars
 *   natal_stat_ring — single big % donut ring
 *   natal_cluster   — 4 cluster cards as proportion bars
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell,
  PieChart, Pie, ResponsiveContainer,
} from 'recharts'

const TONES = {
  warm:     { palette: ['#c07840', '#7da984', '#d89a5b', '#b9926f', '#9aa67e', '#cf8f6a'], axis: '#7d7567', grid: 'rgba(124,117,103,0.14)', track: '#ece4d6', font: "'Source Sans 3', system-ui, sans-serif" },
  teal:     { palette: ['#41645a', '#7eaa85', '#9ec4d0', '#6f9b8e', '#c5b4a0', '#5a8a7c'], axis: '#5d6b58', grid: 'rgba(65,100,90,0.12)', track: '#e2ece4', font: "'Source Sans 3', system-ui, sans-serif" },
  dark:     { palette: ['#4fc3a1', '#2f6675', '#9ec4d0', '#62b0c4', '#7ec9b6', '#3f8fa0'], axis: '#90a2a9', grid: 'rgba(144,162,169,0.18)', track: '#1c2c2a', font: "'IBM Plex Sans', system-ui, sans-serif" },
}

function getTone(tone) {
  return TONES[tone] || TONES.teal
}

function lbls(chart, locale) {
  return locale === 'he' ? chart.labels_he : chart.labels_en
}

/* ── vertical bars ─────────────────────────────────────────────────────────── */
function NatalBar({ chart, locale, t }) {
  const labels = lbls(chart, locale)
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  const tick = { fontFamily: t.font, fill: t.axis, fontSize: 12 }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 18, right: 12, left: 0, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ ...tick, fontSize: 11 }} interval={0} />
        <YAxis tick={tick} tickFormatter={(v) => (v <= 5 ? v : `${v}%`)} />
        <Tooltip contentStyle={{ fontFamily: t.font, borderRadius: 8 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={86}>
          {data.map((_, i) => <Cell key={i} fill={t.palette[i % t.palette.length]} />)}
          <LabelList dataKey="value" position="top" formatter={(v) => (chart.values[0] <= 5 ? v : `${v}%`)} style={{ ...tick, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── horizontal ranked bars ────────────────────────────────────────────────── */
function NatalHBar({ chart, locale, t }) {
  const labels = lbls(chart, locale)
  const data = chart.values.map((v, i) => ({ name: labels[i], value: v }))
  const tick = { fontFamily: t.font, fill: t.axis, fontSize: 11 }
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 46)}>
      <BarChart data={data} layout="vertical" margin={{ top: 6, right: 48, left: 6, bottom: 6 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
        <XAxis type="number" tick={tick} domain={[0, 'dataMax']} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ ...tick, fontSize: 10.5 }} width={150} />
        <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ fontFamily: t.font, borderRadius: 8 }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((_, i) => <Cell key={i} fill={t.palette[i % t.palette.length]} />)}
          <LabelList dataKey="value" position="right" formatter={(v) => `${v}%`} style={{ ...tick, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── single big % ring ─────────────────────────────────────────────────────── */
function NatalStatRing({ chart, locale, t }) {
  const labels = lbls(chart, locale)
  const main = chart.values[0]
  const data = [
    { name: labels[0], value: main },
    { name: labels[1], value: 100 - main },
  ]
  return (
    <div style={{ position: 'relative', width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={66} outerRadius={92} startAngle={90} endAngle={-270} stroke="none">
            <Cell fill={t.palette[0]} />
            <Cell fill={t.track} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: 34, color: t.palette[0], lineHeight: 1 }}>{main}%</span>
        <span style={{ fontFamily: t.font, fontSize: 11.5, color: t.axis, marginTop: 6, maxWidth: '14ch', textAlign: 'center' }}>{labels[0]}</span>
      </div>
    </div>
  )
}

/* ── 4 cluster proportion bars ─────────────────────────────────────────────── */
function NatalCluster({ chart, locale, t }) {
  const labels = lbls(chart, locale)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 2px' }}>
      {labels.map((label, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: t.font, fontSize: 12.5, color: t.axis, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{label}</span>
            <span style={{ fontWeight: 700, color: t.palette[i % t.palette.length] }}>{chart.values[i]}%</span>
          </div>
          <div style={{ height: 12, borderRadius: 99, background: t.track, overflow: 'hidden' }}>
            <div style={{ width: `${chart.values[i]}%`, height: '100%', borderRadius: 99, background: t.palette[i % t.palette.length] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function renderNatal(chart, locale, t) {
  switch (chart.chart_type) {
    case 'natal_bar':       return <NatalBar chart={chart} locale={locale} t={t} />
    case 'natal_hbar':      return <NatalHBar chart={chart} locale={locale} t={t} />
    case 'natal_stat_ring': return <NatalStatRing chart={chart} locale={locale} t={t} />
    case 'natal_cluster':   return <NatalCluster chart={chart} locale={locale} t={t} />
    default:                return null
  }
}

/**
 * A single research chart card: title + chart + collapsible explanation + source.
 */
export function NatalChartCard({ chart, locale, tone = 'teal', cardStyle, titleStyle, sourceStyle, explainOpen, onToggle, readMoreLabel, readLessLabel }) {
  const t = getTone(tone)
  const title = locale === 'he' ? chart.title_he : chart.title_en
  const explain = locale === 'he' ? chart.explain_he : chart.explain_en
  return (
    <div style={cardStyle}>
      <p style={titleStyle}>{title}</p>
      {renderNatal(chart, locale, t)}
      {explain && (
        <button
          type="button"
          onClick={onToggle}
          style={{ background: 'transparent', border: 'none', padding: '8px 0 0', cursor: 'pointer', color: t.palette[0], fontFamily: t.font, fontSize: 13, fontWeight: 600 }}
        >
          {explainOpen ? (readLessLabel || (locale === 'he' ? 'סגור' : 'Close')) : (readMoreLabel || (locale === 'he' ? 'קרא עוד' : 'Read more'))}
        </button>
      )}
      {explainOpen && explain && (
        <p style={{ fontFamily: t.font, fontSize: 14, lineHeight: 1.6, color: t.axis, margin: '8px 0 0' }}>{explain}</p>
      )}
      <p style={sourceStyle}>{chart.source}</p>
    </div>
  )
}

/**
 * A gentle prose stat block for low-data personas.
 */
export function NatalTextBlock({ block, locale, cardStyle, statStyle, labelStyle, bodyStyle, sourceStyle }) {
  const label = locale === 'he' ? block.label_he : block.label_en
  const body = locale === 'he' ? block.body_he : block.body_en
  return (
    <div style={cardStyle}>
      {block.stat && <div style={statStyle}>{block.stat}</div>}
      <p style={labelStyle}>{label}</p>
      <p style={bodyStyle}>{body}</p>
      {block.source && <p style={sourceStyle}>{block.source}</p>}
    </div>
  )
}
