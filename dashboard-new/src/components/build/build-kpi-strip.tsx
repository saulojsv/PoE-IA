import { Activity, Coins, Crosshair, Gauge, Heart, Shield } from 'lucide-react'
import { metrics } from '../../data/mock-build'
import type { BuildStage } from '../../types/build'
const icons=[Crosshair,Shield,Heart,Gauge,Coins]
export function BuildKpiStrip({stage}:{stage:BuildStage}){return <div className="kpi-strip">{metrics.map((m,i)=>{const Icon=icons[i]; const v=stage==='league-start'?m.value:i===0?'24.8M':m.value;return <article className={'kpi '+m.tone} key={m.id}><Icon/><div><small>{m.label}</small><strong>{v}</strong>{m.change?<span><Activity/> +{m.change}% <em>vs previous</em></span>:<span>{m.description}</span>}</div></article>})}</div>}
