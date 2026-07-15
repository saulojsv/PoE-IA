import { useMemo, useState } from 'react'
import { ArrowRight, Filter, Heart, Search, Shield, Sparkles, Swords, X, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BuildRow, ExploreFilters } from '../../types/build'
import { usePoeBundle } from '../../data/use-poe-bundle'
import { spriteFor } from '../../data/poe-data'

const initial: ExploreFilters = { query: '', skill: '', ascendancy: '', gem: '', item: '', minLevel: 1, minDps: 0, minEhp: 0, minLife: 0, minEnergyShield: 0, minResistance: 0, minBlock: 0, minSuppression: 0 }
const fmt = (value: number) => Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)
const full = (value: number) => Math.round(value || 0).toLocaleString('pt-BR')

function meets(build: BuildRow, filters: ExploreFilters) {
  const haystack = `${build.skill} ${build.class} ${build.ascendancy} ${build.gems.join(' ')} ${build.items.join(' ')}`.toLowerCase()
  const resist = Math.min(build.fire_resist || 0, build.cold_resist || 0, build.lightning_resist || 0, build.chaos_resist || 0)
  return (!filters.query || haystack.includes(filters.query.toLowerCase())) && (!filters.skill || build.skill === filters.skill) && (!filters.ascendancy || build.ascendancy === filters.ascendancy) && (!filters.gem || build.gems.some(gem => gem === filters.gem)) && (!filters.item || build.items.some(item => item === filters.item)) && build.level >= filters.minLevel && build.combined_dps >= filters.minDps && build.ehp >= filters.minEhp && build.life >= filters.minLife && build.energy_shield >= filters.minEnergyShield && resist >= filters.minResistance && build.block >= filters.minBlock && build.suppression >= filters.minSuppression
}

function Metric({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) { return <span className={`explore-metric ${tone}`}><Icon /> <small>{label}</small><b>{value}</b></span> }

export function ExploreBuilds() {
  const { bundle, error } = usePoeBundle()
  const [filters, setFilters] = useState(initial)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const navigate = useNavigate()
  const builds = useMemo(() => bundle?.data.builds.filter(build => meets(build, filters)).sort((a, b) => b.combined_dps - a.combined_dps) || [], [bundle, filters])
  const skills = useMemo(() => Array.from(new Set(bundle?.data.builds.map(build => build.skill))).filter(Boolean).sort(), [bundle])
  const ascendancies = useMemo(() => Array.from(new Set(bundle?.data.builds.map(build => build.ascendancy))).filter(Boolean).sort(), [bundle])
  const gems = useMemo(() => Array.from(new Set(bundle?.data.builds.flatMap(build => build.gems))).filter(Boolean).sort(), [bundle])
  const items = useMemo(() => Array.from(new Set(bundle?.data.builds.flatMap(build => build.items))).filter(Boolean).sort(), [bundle])
  const update = (key: keyof ExploreFilters, value: string | number) => setFilters(current => ({ ...current, [key]: value }))

  if (error) return <div className="page-error">{error}</div>
  if (!bundle) return <div className="page-loading"><span />Carregando builds de Mirage…</div>
  return <div className="explore-page">
    <header className="page-heading"><div><p><Sparkles /> MIRAGE · POE 3.28</p><h1>Explore builds</h1><span>Compare construções reais do dataset local e abra os detalhes antes de editar.</span></div><strong>{builds.length.toLocaleString('pt-BR')} <small>builds</small></strong></header>
    <section className="explore-toolbar" aria-label="Filtros de builds"><label className="explore-search"><Search /><input value={filters.query} onChange={event => update('query', event.target.value)} placeholder="Buscar skill, ascendência, gem ou item" /></label><select value={filters.skill} onChange={event => update('skill', event.target.value)}><option value="">Todas as skills</option>{skills.map(skill => <option key={skill}>{skill}</option>)}</select><select value={filters.ascendancy} onChange={event => update('ascendancy', event.target.value)}><option value="">Todas as ascendências</option>{ascendancies.map(value => <option key={value}>{value}</option>)}</select><button className={`filter-toggle ${filtersOpen ? 'active' : ''}`} onClick={() => setFiltersOpen(value => !value)}><Filter /> Filtros avançados</button><button className="clear-filter" onClick={() => setFilters(initial)} aria-label="Limpar filtros"><X /></button></section>
    {filtersOpen && <section className="filter-deck">
      <label>Gem<select value={filters.gem} onChange={event => update('gem', event.target.value)}><option value="">Todas</option>{gems.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Item<select value={filters.item} onChange={event => update('item', event.target.value)}><option value="">Todos</option>{items.map(value => <option key={value}>{value}</option>)}</select></label>
      {[['Nível mínimo', 'minLevel'], ['DPS mínimo', 'minDps'], ['EHP mínimo', 'minEhp'], ['Vida mínima', 'minLife'], ['ES mínimo', 'minEnergyShield'], ['Resistência mínima', 'minResistance'], ['Block mínimo', 'minBlock'], ['Suppression mínima', 'minSuppression']].map(([label, key]) => <label key={key}>{label}<input type="number" min="0" value={filters[key as keyof ExploreFilters] as number} onChange={event => update(key as keyof ExploreFilters, Number(event.target.value))} /></label>)}
    </section>}
    {!builds.length ? <section className="explore-empty"><Swords /><h2>Nenhuma build encontrada</h2><p>Reduza ou limpe os filtros para voltar ao dataset de Mirage.</p><button onClick={() => setFilters(initial)}>Limpar filtros</button></section> : <section className="build-card-grid">{builds.slice(0, 180).map(build => <BuildCard key={build.file} build={build} sprites={bundle.sprites} onOpen={() => navigate(`/explore/${encodeURIComponent(build.file)}`)} />)}</section>}
  </div>
}

function BuildCard({ build, sprites, onOpen }: { build: BuildRow; sprites: Record<string, string>; onOpen: () => void }) {
  const keyItems = build.item_details.slice(0, 4)
  return <article className="build-card"><div className="build-card-top"><div><span>{build.ascendancy || build.class}</span><h2>{build.skill || 'Unknown skill'}</h2><p>Level {build.level} · {build.class}</p></div><b>{fmt(build.combined_dps)}<small>DPS</small></b></div><div className="build-card-metrics"><Metric icon={Zap} label="DPS" value={fmt(build.combined_dps)} tone="blue" /><Metric icon={Shield} label="EHP" value={fmt(build.ehp)} tone="gold" /><Metric icon={Heart} label="Life" value={full(build.life)} tone="red" /></div><div className="build-card-items">{keyItems.map((item, index) => <i key={`${item.name}-${index}`} title={`${item.name} — ${item.base}`}>{spriteFor(item, sprites) ? <img src={spriteFor(item, sprites)} alt="" /> : <span>{item.base.slice(0, 1)}</span>}</i>)}<small>{build.items.length} items · {build.gems.length} gems</small></div><button onClick={onOpen}>Ver detalhes <ArrowRight /></button></article>
}
