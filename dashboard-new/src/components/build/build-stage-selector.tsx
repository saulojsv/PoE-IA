import type { BuildStage } from '../../types/build'
import { stages } from '../../data/mock-build'
export function BuildStageSelector({selected,onSelect}:{selected:BuildStage;onSelect:(id:BuildStage)=>void}){return <section className="stage-wrap">{stages.map((s,i)=><button onClick={()=>onSelect(s.id)} className={'stage '+(s.id===selected?'chosen':'')} key={s.id}><b>{i+1}</b><span>{s.label}<small>{s.description}</small></span></button>)}</section>}
