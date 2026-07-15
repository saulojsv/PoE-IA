import { ArrowLeft, ChevronRight, Edit3, Heart, Shield, Sparkles, Zap } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createDraftFromBuild, upsertDraft } from '../../data/drafts'
import { usePoeBundle } from '../../data/use-poe-bundle'
import { mapEquipment, spriteFor } from '../../data/poe-data'

const number = (value: number) => Math.round(value || 0).toLocaleString('pt-BR')

export function BuildDetails() {
  const { file = '' } = useParams()
  const navigate = useNavigate()
  const { bundle, error } = usePoeBundle()
  if (error) return <div className="page-error">{error}</div>
  if (!bundle) return <div className="page-loading"><span />Carregando detalhes…</div>
  const build = bundle.data.builds.find(candidate => candidate.file === decodeURIComponent(file))
  if (!build) return <div className="explore-empty"><h2>Build não encontrada</h2><Link to="/explore">Voltar para Explore Builds</Link></div>
  const equipment = mapEquipment(build.item_details, bundle.baseMods)
  const openLab = () => { const draft = upsertDraft(createDraftFromBuild(build)); navigate(`/build-lab/${draft.id}`) }
  return <div className="details-page">
    <Link className="back-link" to="/explore"><ArrowLeft /> Explore Builds</Link>
    <header className="details-hero"><div><p><Sparkles /> DATASET LOCAL · MIRAGE 3.28</p><h1>{build.skill}</h1><div className="detail-tags"><span>{build.ascendancy}</span><span>{build.class}</span><span>Level {build.level}</span></div></div><button className="primary-action" onClick={openLab}><Edit3 /> Editar no Build Lab <ChevronRight /></button></header>
    <section className="detail-stat-row"><Stat icon={Zap} label="Combined DPS" value={number(build.combined_dps)} tone="blue" /><Stat icon={Shield} label="Effective HP" value={number(build.ehp)} tone="gold" /><Stat icon={Heart} label="Vida" value={number(build.life)} tone="red" /><Stat icon={Shield} label="Energy Shield" value={number(build.energy_shield)} tone="cyan" /></section>
    <div className="details-grid"><section className="detail-section"><header><h2>Equipment</h2><span>{build.item_details.length} itens importados</span></header><div className="detail-equipment">{Object.values(equipment).filter(Boolean).map(item => item && <article key={item.id}><i>{item.raw && spriteFor(item.raw, bundle.sprites) ? <img src={spriteFor(item.raw, bundle.sprites)} alt="" /> : '+'}</i><div><small>{item.slot}</small><b>{item.name}</b><span>{item.baseType}</span></div></article>)}</div></section><section className="detail-section"><header><h2>Defesas</h2><span>snapshot do PoB</span></header><div className="defense-list">{[['Fire resistance', build.fire_resist], ['Cold resistance', build.cold_resist], ['Lightning resistance', build.lightning_resist], ['Chaos resistance', build.chaos_resist], ['Attack block', build.block], ['Spell block', build.spell_block], ['Spell suppression', build.suppression]].map(([label, value]) => <p key={label as string}><span>{label}</span><b>{number(value as number)}%</b></p>)}</div></section><section className="detail-section detail-wide"><header><h2>Skills e gems</h2><span>{build.gems.length} gems</span></header><div className="gem-tags">{build.gems.map(gem => <span key={gem}>{gem}</span>)}</div></section></div>
  </div>
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) { return <article className={`detail-stat ${tone}`}><Icon /><small>{label}</small><b>{value}</b></article> }
