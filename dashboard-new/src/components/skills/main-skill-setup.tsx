import { Link2, Zap } from 'lucide-react'
const gems=[['Lightning Arrow','active'],['Inspiration','support'],['Trinity','support'],['Elemental Damage','support']]
export function MainSkillSetup(){return <section className="panel skills"><div className="panel-title"><span><Link2/> Main Skill Setup</span><button>6-Link</button></div><div className="gem-chain">{gems.map(([name,type],i)=><div key={name} className="gem-wrap"><div className={'gem '+type}>{i===0?<Zap/>:<span>{i+1}</span>}</div><small>{name}</small></div>)}</div><p>Bow · 6 sockets · <b>20% quality</b></p></section>}
