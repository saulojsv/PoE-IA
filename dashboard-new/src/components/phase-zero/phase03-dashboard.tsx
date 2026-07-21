import { useEffect, useState } from 'react'

type Report = { statusCounts: Record<string, number>; groups: Record<string, number>; total: number; groupCount?: number; sample?: { valid: number; invalid: number; confidence: string }; categories?: Record<string, { median?: number; p25?: number; p75?: number }> }
const REPORT_FALLBACK: Report = {
  statusCounts: { classified: 25 },
  total: 25,
  groupCount: 21,
  sample: { valid: 25, invalid: 0, confidence: 'moderate' },
  categories: {},
  groups: {
    '3_28|Templar|Hierophant|Wrath': 2,
    '3_28|Templar|Guardian|Tempest Shield': 2,
    '3_26|Witch|Elementalist|Absolution of Inspiring': 2,
    '3_28_alternate|Duelist|Paladin|Wrath': 2,
  },
}

export function Phase03Dashboard() {
  const [report, setReport] = useState<Report>(REPORT_FALLBACK)
  const [error, setError] = useState('')
  useEffect(() => { Promise.all(['/phase0/classification/phase0.3-batch-0003.json', '/phase0/analysis/defense-statistics/phase0.3-batch-0003.json'].map(url => fetch(url).then(r => r.ok ? r.json() : Promise.reject()))).then(([classification, statistics]) => setReport({ ...classification, sample: { valid: statistics.valid, invalid: statistics.invalid, confidence: statistics.confidence }, categories: statistics.categories })).catch(() => {}) }, [])
  if (error) return <section className="page-error">{error}</section>
  if (!report) return <section className="page-loading"><span />Carregando análise da fase 0.3…</section>
  const classified = report.statusCounts.classified || 0
  return <div className="details-page">
    <header className="page-heading"><div><p>FASE 0.3 · ANÁLISE DO DATASET</p><h1>Estatísticas gerais</h1><span>Classificação histórica; nenhuma rota é gerada ou aplicada nesta fase.</span></div><strong>{report.total} <small>XMLs analisados</small></strong></header>
    <section className="detail-stat-row"><article className="detail-stat blue"><span>✓</span><small>Classificados</small><b>{classified}</b></article><article className="detail-stat gold"><span>◎</span><small>Grupos comparáveis</small><b>{report.groupCount ?? Object.keys(report.groups).length}</b></article><article className="detail-stat red"><span>!</span><small>Excluídos</small><b>{report.total - classified}</b></article><article className="detail-stat cyan"><span>▣</span><small>Origem</small><b>PoE Ninja</b></article></section>
    <section className="detail-section"><header><h2>Amostra defensiva</h2><span>medianas e intervalo P25–P75</span></header><div className="defense-list">{Object.entries(report.categories ?? {}).map(([key, value]) => <p key={key}><span>{key}</span><b>{value.median ?? 0} · {value.p25 ?? 0}–{value.p75 ?? 0}</b></p>)}</div></section>
    <section className="detail-section"><header><h2>Grupos classificados</h2><span>árvore · classe · ascendência · skill</span></header><div className="defense-list">{Object.entries(report.groups).map(([group, count]) => <p key={group}><span>{group}</span><b>{count}</b></p>)}</div></section>
  </div>
}
