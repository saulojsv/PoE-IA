import { useEffect, useMemo, useState } from 'react'
import { loadDashboardData, validSkills } from '../../data/poe-data'
import { loadPassiveTree } from '../../data/passive-tree'

type DamageTab = {
  id: string
  label: string
  title: string
  summary: string
  depends: string[]
  scale: string[]
  avoid: string[]
  pob: string[]
  sources: string[]
  priority: { step: string; title: string; why: string; skills: string; tradeoff: string }[]
  keywords?: string[]
  skillHints?: string[]
}

const tabs: DamageTab[] = [
  {
    id: 'bleed',
    label: 'Bleed',
    title: 'Bleed: physical attack hit -> physical DoT',
    summary: 'Bleed nasce de hit fisico de ataque. O ganho real vem de base fisica, chance/acerto, bleed/phys DoT multi e alvo moving/aggravated.',
    depends: [
      'Base: dano fisico do hit que aplica o bleed; arma/skill com hit grande pesa mais que tooltip DPS.',
      'Aplicacao: chance to bleed, hit chance/Resolute Technique e velocidade suficiente para renovar bons rolls.',
      'Multiplicadores: physical damage, damage over time, physical DoT multiplier, bleeding damage, faster bleeding.',
      'Uptime: duration, moving/aggravated, Vulnerability, Pride, tincture/flasks e buffs sustentaveis.',
      'Arquetipo: Lacerate/Eviscerate, Puncture/Snipe e Earthquake escalam hit, velocidade e duracao de formas diferentes.',
    ],
    scale: [
      'Priorizar alto physical hit e bleed/phys DoT multiplier antes de dano generico.',
      'Validar aggravated bleed ou enemy moving; sem fonte real, nao usar como regra de boss.',
      'Em Gladiator, block tambem e motor de gameplay quando habilita retaliation/Eviscerate.',
    ],
    avoid: [
      'Impale, elemental penetration, cold DoT e chaos DoT nao escalam bleed.',
      'Melee/attack/weapon damage so ajuda se o texto aplicar a ailment/bleeding ou a base que calcula o bleed.',
      'Combined DPS nao substitui bleed min/max, chance, duration e uptime.',
    ],
    pob: [
      'Checar chance to bleed, hit chance, bleed min/max, moving/aggravated, Vulnerability, Pride, Rage, tincture e flasks.',
      'Criar configs: realista, boss parado, boss moving/aggravated e mapping.',
      'Usar a worksheet local como base para marcar observado, inferido e alerta.',
    ],
    sources: [
      'PoE Wiki: Bleeding, Ailment, Damage over time',
      'Worksheet: checkzip2/unzipped/xl/worksheets/sheet1.xml',
      'Local: bleed_build_comparison.md',
      'YouTube: Optimizing Every Bleed Skill - Complete Bleed Analysis [PoE 3.25]',
      'Forum/Mobalytics: Lacerate/Eviscerate Gladiator 3.28/3.29',
    ],
    priority: [
      { step: '1', title: 'Base física do hit', why: 'Cada bleed nasce do hit físico que o aplica; uma arma com hit alto vale mais que DPS de tooltip.', skills: 'Lacerate, Eviscerate, Puncture, Snipe, Earthquake', tradeoff: 'Prioridade alta; perde valor se a habilidade não for a fonte do bleed.' },
      { step: '2', title: 'Bleed e Physical DoT Multiplier', why: 'Multiplica o dano do ailment sem exigir mais velocidade de ataque.', skills: 'Todas as skills de bleed', tradeoff: 'Rota eficiente para boss; não melhora hit puro nem impale.' },
      { step: '3', title: 'Aplicação e uptime', why: 'Chance, acerto, duração e alvo moving/aggravated determinam quanto do dano realmente permanece.', skills: 'Lacerate/Eviscerate: block e retaliation; Puncture/Snipe: hit carregado; Earthquake: duração', tradeoff: 'Mais velocidade pode melhorar aplicação, mas não o maior bleed individual.' },
    ],
  },
  {
    id: 'ignite',
    label: 'Fire / Ignite',
    title: 'Fire: hit elemental ou ignite fire DoT',
    summary: 'Fire hit e Ignite nao escalam igual. Ignite usa base fire do hit e vira burning/fire DoT; hit fire usa crit, velocidade e penetration.',
    depends: [
      'Base: added/conversion/gain as fire, gem level e efetividade da skill.',
      'Ignite: chance/all damage can ignite, fire DoT multi, burning damage, ailment damage, DoT multi e duration.',
      'Hit fire: fire/elemental damage, spell/attack damage aplicavel, crit, velocidade, penetration e exposure.',
      'Mitigacao alvo: exposure e curses reduzem resistencia; penetration e principalmente leitura de hit.',
    ],
    scale: [
      'Escolher hit fire ou ignite antes de investir; hibrido sem regra clara desperdiça affix.',
      'Para ignite, aumentar base do hit + fire/DoT multiplier + chance + uptime.',
      'Para hit, aumentar crit/velocidade/penetration/exposure e dano base.',
    ],
    avoid: [
      'Attack/cast speed quase nao aumenta single-target ignite se o ignite forte ja tem uptime.',
      'Fire penetration nao e um multiplicador direto de DoT.',
      'RF/burning ground nao aplicam ignite se nao houver hit.',
    ],
    pob: [
      'Separar Ignite DPS de hit DPS; conferir chance, duration, exposure, curse e enemy resistance.',
      'Desligar shock/culling/buffs impossiveis antes de comparar builds.',
      'Se usar Elementalist, validar a fonte de all damage can ignite.',
    ],
    sources: [
      'PoE Wiki: Ignite, Fire damage, Ailment',
      'PoEDB: Fire Mastery',
      'YouTube: Path of Exile Guide Damage Over Time; EK/Arc/Reap Ignite videos with PoB',
      'Forum: burning damage vs ignite vs fire DoT',
    ],
    priority: [
      { step: '1', title: 'Escolher Hit ou Ignite', why: 'O hit usa crit, velocidade e pen; Ignite usa o hit-base e multiplicadores de DoT.', skills: 'Fireball, Detonate Dead, Wave of Conviction, Explosive Arrow', tradeoff: 'Misturar as duas rotas costuma gastar afixos sem ganho proporcional.' },
      { step: '2', title: 'Base de fogo e nível da gem', why: 'Ignite depende do maior hit que o aplica; gem level aumenta a base de muitas skills.', skills: 'Fireball, DD, EA e skills de ignite', tradeoff: 'Ganho alto, mas depende de a skill realmente gerar o hit que incendeia.' },
      { step: '3', title: 'Fire DoT Multi e uptime', why: 'Depois da base, multiplicador de DoT, chance e duração sustentam o incêndio.', skills: 'Todas as skills de Ignite', tradeoff: 'Attack/cast speed vale para reaplicar, não para aumentar o Ignite já ativo.' },
    ],
  },
  {
    id: 'cold',
    label: 'Cold',
    title: 'Cold: hit, chill/freeze ou cold DoT',
    summary: 'Cold pode ser dano de hit, controle por chill/freeze ou cold DoT. Cada rota usa atributos diferentes.',
    depends: [
      'Hit cold: added/conversion cold, gem level, crit, velocidade, cold/elemental damage e cold penetration.',
      'Chill/freeze: tamanho do hit cold, ailment effect, duration e limiar do alvo.',
      'Cold DoT: gem level, cold DoT multiplier, DoT multiplier, duration/area, exposure e curse.',
      'Controle: efeito em mapas nao garante mesmo efeito em bosses.',
    ],
    scale: [
      'Cold DoT: priorizar gem level, cold DoT multi e uptime de debuffs.',
      'Hit cold: priorizar base/conversion, crit, speed e penetration.',
      'Chill/freeze: priorizar hit efetivo e ailment effect, nao tooltip isolado.',
    ],
    avoid: [
      'Cold DoT nao escala com crit/attack speed se a skill nao hit/reaplica por velocidade.',
      'Medium cold DoT cluster nao ajuda bleed sem cold DoT real.',
      'Penetration ajuda hit; DoT precisa reducao de resistencia aplicavel.',
    ],
    pob: [
      'Separar abas de hit cold, cold DoT e controle.',
      'Conferir exposure/curse, gem level, duration, chill/freeze effect e boss ailment threshold.',
      'Marcar qualquer cold DoT em build bleed como alerta ate provar sinergia.',
    ],
    sources: [
      'PoE Wiki: Chill, Damage over time, Damage conversion',
      'PoEDB: Damage over time',
      'Worksheet local: alerta de medium cold DoT em bleed',
    ],
    priority: [
      { step: '1', title: 'Separar Hit, Controle e Cold DoT', why: 'São três motores diferentes: hit usa crit/pen, chill/freeze usa tamanho do hit, DoT usa gem level e DoT multi.', skills: 'Cold Snap, Vortex, Creeping Frost, Ice Shot, Glacial Cascade', tradeoff: 'Escolher uma rota evita investir em stats que outra variante não usa.' },
      { step: '2', title: 'Base correta da skill', why: 'Gem level pesa no DoT; flat/conversão e velocidade pesam no hit.', skills: 'Cold DoT: Vortex/Cold Snap; Hit: Ice Shot/Glacial Cascade', tradeoff: 'Cold DoT não recebe crit ou attack speed sem uma parte de hit reaplicável.' },
      { step: '3', title: 'Exposure, curse e duração', why: 'Mantém o dano e reduz resistência do alvo quando a mecânica permite.', skills: 'Cold DoT e hit cold', tradeoff: 'Controle visto em mapas pode cair em bosses por threshold de ailment.' },
    ],
  },
  {
    id: 'lightning',
    label: 'Lightning',
    title: 'Lightning: hit, shock e variancia',
    summary: 'Lightning e principalmente hit. Shock e um multiplicador indireto porque faz o alvo tomar mais dano, mas precisa magnitude real.',
    depends: [
      'Base: added/conversion lightning, gem level e faixa minimo/maximo.',
      'Hit: lightning/elemental damage, crit, cast/attack speed, penetration, exposure e curse.',
      'Shock: tamanho do hit, chance/effect of shock, ailment threshold e uptime.',
      'Variancia: dano maximo alto nao resolve se o minimo/medio for ruim.',
    ],
    scale: [
      'Aumentar base + crit/speed/penetration para hit.',
      'Investir em shock effect apenas quando a build aplica shock relevante em boss.',
      'Registrar shock real separado do DPS proprio da skill.',
    ],
    avoid: [
      'Shock alto configurado sem fonte real distorce todo estudo.',
      'Lightning nao escala bleed, poison ou cold DoT salvo conversao/regra explicita.',
      'Nao comparar pelo maior roll lightning apenas.',
    ],
    pob: [
      'Checar shock chance/effect, enemy ailment threshold, penetration, exposure, crit e dano minimo.',
      'Separar dano da skill e dano extra global causado pelo shock.',
      'Usar configs sem shock para baseline e com shock validado para teto.',
    ],
    sources: [
      'PoE Wiki: Shock, Ailment, Damage conversion',
      'YouTube: 3.28 planned builds with Elemental Hit/Lightning examples',
      'YouTube/builds: shock configurado como alerta de auditoria',
    ],
    priority: [
      { step: '1', title: 'Dano médio do hit', why: 'Lightning tem faixa ampla; aumentar o hit médio evita que o pico máximo esconda um resultado inconsistente.', skills: 'Lightning Strike, Arc, Spark, Elemental Hit', tradeoff: 'Mais dano máximo sem mínimo/velocidade pode piorar consistência.' },
      { step: '2', title: 'Crit, velocidade e pen', why: 'São multiplicadores diretos do hit quando a skill aplica esses marcadores.', skills: 'Lightning Strike, Arc, Spark e hits lightning', tradeoff: 'Não transfere automaticamente para shock ou DoT.' },
      { step: '3', title: 'Shock validado', why: 'Shock aumenta o dano recebido, mas sua magnitude depende do hit relativo à vida do alvo.', skills: 'Skills lightning que aplicam shock', tradeoff: 'Use baseline sem shock e teto com shock real; config manual alta não é regra de boss.' },
    ],
  },
  {
    id: 'chaos',
    label: 'Chaos DoT',
    title: 'Chaos: hit chaos ou non-ailment chaos DoT',
    summary: 'Chaos nao e elemental. Hit chaos e chaos DoT usam levers diferentes; Wither, curse e chaos resistance sao centrais.',
    depends: [
      'Hit chaos: added/conversion/gain as chaos, chaos damage, crit, velocidade e reducao de chaos resistance.',
      'Chaos DoT: gem level, chaos DoT multiplier, DoT multiplier, duration/area e Wither.',
      'Alvo: Despair/curse, Wither stacks e chaos resistance.',
      'Defesa propria: chaos res baixa torna dano alto menos jogavel.',
    ],
    scale: [
      'Chaos DoT: gem level + chaos DoT multi + Wither consistente.',
      'Hit chaos: base/conversion + crit/speed se a skill realmente bate.',
      'Validar uptime de Wither e curse antes de trocar itens por dano.',
    ],
    avoid: [
      'Elemental penetration/exposure nao reduz chaos resistance.',
      'Crit e attack speed nao escalam DoT estatico se a skill nao hit/reaplica.',
      'Nao misturar poison com chaos DoT sem separar stacks.',
    ],
    pob: [
      'Checar Wither stacks, Despair, enemy chaos resistance, gem level e chaos DoT multi.',
      'Separar hit chaos, chaos DoT e poison em leituras diferentes.',
      'Marcar vida/chaos res baixa como alerta de gameplay.',
    ],
    sources: [
      'PoE Wiki: Chaos damage, Damage over time',
      'PoEDB: Damage over time',
      'Forum: Question on Poison and Chaos Damage',
    ],
    priority: [
      { step: '1', title: 'Escolher Hit Chaos ou Chaos DoT', why: 'Hit usa crit/velocidade; DoT usa gem level, Chaos DoT Multi e uptime.', skills: 'Essence Drain, Soulrend, Bane, Forbidden Rite', tradeoff: 'Não usar elemental penetration em uma rota puramente chaos.' },
      { step: '2', title: 'Gem level e Chaos DoT Multi', why: 'São os multiplicadores estruturais do DoT não-ailment.', skills: 'Essence Drain, Soulrend, Bane e chaos DoT', tradeoff: 'O ganho cai se Wither/curse não estiverem ativos.' },
      { step: '3', title: 'Wither, Despair e resistência', why: 'Debuffs sustentados definem o dano efetivo contra rares e bosses.', skills: 'Todas as skills chaos DoT', tradeoff: 'Mais dano sem defesa ou recuperação pode piorar o resultado jogável.' },
    ],
  },
  {
    id: 'poison',
    label: 'Poison',
    title: 'Poison: physical/chaos hit -> stacking chaos DoT',
    summary: 'Poison vem de hits fisicos/chaos por padrao, aplica stacks e escala por chance, hit rate, duration, faster poison, Wither e chaos/DoT multi.',
    depends: [
      'Base: dano fisico e chaos do hit; outros tipos exigem regra especifica.',
      'Aplicacao: hit chance, chance to poison ate 100% e hits por segundo.',
      'Stacks: cada hit aplica no maximo um poison; duracao sustenta ramp.',
      'Multiplicadores: poison, chaos, damage over time, chaos DoT multi, poison/DoT multi.',
      'Alvo: Wither, Despair/curse e chaos resistance.',
    ],
    scale: [
      'Garantir 100% chance e acerto real antes de buscar dano caro.',
      'Aumentar base fisica/chaos, hit rate, duration/faster poison e chaos/DoT multi.',
      'Usar Wither consistente; sem ele o teto de boss cai muito.',
    ],
    avoid: [
      'Mais de 100% chance to poison nao cria stack extra no mesmo hit.',
      'Total DPS de hit nao mede ramp, stacks nem uptime.',
      'Elemental damage so ajuda poison com regra que permita esse tipo contribuir.',
    ],
    pob: [
      'Checar poison chance, poisons applied recently, duration, stacks, Wither, Despair e ramp time.',
      'Separar mapping e boss; poison longo pode parecer melhor no PoB que na pratica.',
      'Conferir defesa junto do dano: vida/res/recuperacao.',
    ],
    sources: [
      'PoE Wiki: Poison',
      'PoEDB: Poison',
      'YouTube: Perfect Agony Poisonous Concoction Assassin 3.28; Poison build 3.28',
      'Reddit: PConc 3.28 e debates all damage can poison',
      'Forum: Question on Poison and Chaos Damage',
    ],
    priority: [
      { step: '1', title: '100% chance e acerto', why: 'Sem aplicação garantida, nenhum investimento em stacks chega ao alvo.', skills: 'PConc, Cobra Lash, Venom Gyre, Toxic Rain', tradeoff: 'É o primeiro gate; dano nominal antes dele é enganoso.' },
      { step: '2', title: 'Hit rate e stacks', why: 'Cada hit pode aplicar um poison; velocidade sustenta o ramp até o limite prático.', skills: 'PConc e ataques rápidos: Cobra Lash/Venom Gyre', tradeoff: 'Mais velocidade vale menos quando o alvo morre antes do ramp.' },
      { step: '3', title: 'Duration, DoT Multi e Wither', why: 'Aumentam dano por stack e o tempo para manter a pilha no boss.', skills: 'Todas as skills de poison', tradeoff: 'Compare mapping e boss separadamente; ramp longo não é clear instantâneo.' },
    ],
  },
  {
    id: 'physical-hit',
    label: 'Physical Hit',
    title: 'Physical hit: base para hit, bleed, poison e conversao',
    summary: 'Physical hit e dano imediato. Tambem pode ser base de bleed, poison ou conversao elemental/chaos.',
    depends: [
      'Base: physical DPS local da arma, flat phys, gem level e efetividade da skill.',
      'Hit: accuracy, attack speed, crit, impale, overwhelm e increased/more physical aplicavel.',
      'Conversao: se convertido, o tipo final passa a usar penetration/exposure desse tipo.',
      'Defesa alvo: armour, physical reduction e reflect quando houver hit.',
    ],
    scale: [
      'Hit puro: equilibrar base, accuracy, speed, crit/impale e overwhelm.',
      'Bleed/poison: tratar hit fisico como base, nao como metrica final.',
      'Conversion: seguir a cadeia ate o tipo final antes de escolher mods.',
    ],
    avoid: [
      'Impale escala hit fisico, nao bleed.',
      'Aumentar hit fisico pode nao aumentar DoT se o modificador nao aplicar ao ailment.',
      'Accuracy baixa invalida qualquer plano baseado em hit.',
    ],
    pob: [
      'Checar hit chance, crit, impale, overwhelm, speed, conversion e reflect.',
      'Se objetivo for ailment, abrir a metrica separada do ailment.',
      'Comparar melee, bow e slam separadamente.',
    ],
    sources: [
      'PoE Wiki: Damage, Damage conversion, Reflect',
      'Worksheet local: physical hit como base do bleed',
    ],
    priority: [
      { step: '1', title: 'Base e acerto', why: 'Hit físico só existe quando a skill acerta; arma, flat físico e gem level formam o ponto de partida.', skills: 'Boneshatter, Flicker Strike, Cyclone, skills de ataque', tradeoff: 'Accuracy baixa anula crit, impale e qualquer ailment baseado no hit.' },
      { step: '2', title: 'Crit, velocidade e multiplicadores', why: 'São ganhos diretos do hit quando compatíveis com a skill.', skills: 'Ataques físicos e spells com hit físico', tradeoff: 'Impale é do hit; bleed e poison devem ser lidos em métricas próprias.' },
      { step: '3', title: 'Conversão e defesa do alvo', why: 'Após conversão, o tipo final decide pen/exposure; armour e reflect continuam relevantes conforme o hit.', skills: 'Conversion builds e ataques físicos', tradeoff: 'Escolher mods antes de seguir a cadeia de conversão gera rota errada.' },
    ],
  },
]

export function DPSType() {
  const [active, setActive] = useState(tabs[0].id)
  const tab = tabs.find(item => item.id === active) || tabs[0]
  const [tree, setTree] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  useEffect(() => { loadPassiveTree().then(setTree); loadDashboardData().then(({ data }) => setSkills(validSkills(data))).catch(() => setSkills([])) }, [])
  const focusNodes = useMemo(() => {
    if (!tree) return []
    const terms = (tab.keywords || ({ bleed: ['bleed', 'bleeding'], ignite: ['fire', 'burning', 'ignite'], cold: ['cold', 'chill', 'freeze'], lightning: ['lightning', 'shock'], chaos: ['chaos', 'wither'], poison: ['poison'], 'physical-hit': ['physical', 'attack'], 'damage-over-time': ['damage over time', 'dot'] } as Record<string, string[]>)[tab.id] || [tab.label]).map(term => term.toLowerCase())
    return Object.values(tree.nodes).filter((node: any) => terms.some(term => `${node.name} ${node.stats.join(' ')}`.toLowerCase().includes(term)) && (node.isNotable || node.isKeystone || node.isMastery)).slice(0, 24)
  }, [tree, tab])
  const relatedSkills = useMemo(() => {
    const hints = (tab.skillHints || ({ bleed: ['bleed', 'puncture', 'lacerate', 'eviscerate'], ignite: ['fire', 'ignite', 'detonate dead', 'explosive arrow'], cold: ['cold', 'vortex', 'ice', 'winter'], lightning: ['lightning', 'arc', 'spark', 'storm'], chaos: ['chaos', 'essence drain', 'soulrend', 'bane'], poison: ['poison', 'toxic', 'cobra', 'venom'], 'physical-hit': ['boneshatter', 'flicker', 'cyclone'], 'damage-over-time': ['dot', 'vortex', 'essence drain'] } as Record<string, string[]>)[tab.id] || []).map(item => item.toLowerCase())
    return skills.filter(skill => hints.some(hint => skill.skill.toLowerCase().includes(hint))).slice(0, 12)
  }, [skills, tab])

  return <div className="details-page">
    <header className="page-heading">
      <div><p>DPS TYPE - REGRAS DE ESCALA</p><h1>DPS por tipo</h1><span>Foco em atributos, mecanica, PoB config e gameplay; nao em alvo fixo de DPS.</span></div>
      <strong>{tabs.length} <small>tipos</small></strong>
    </header>
    <section className="stage-wrap" aria-label="Tipos de DPS">
      {tabs.map(item => <button key={item.id} className={`stage ${item.id === active ? 'chosen' : ''}`} onClick={() => setActive(item.id)}><b>{item.label.slice(0, 1)}</b><div><span>{item.label}</span><small>{item.id}</small></div></button>)}
    </section>
    <section className="detail-section">
      <header><h2>{tab.title}</h2><span>{tab.summary}</span></header>
      <RuleBlock title="Depende de" rows={tab.depends} />
      <section className="dps-lab-grid"><DpsTree type={tab.label} nodes={focusNodes} /><SkillCards skills={relatedSkills} hints={tab.skillHints || []} /></section>
      <RuleBlock title="Como escalar" rows={tab.scale} />
      <RuleBlock title="Nao confundir" rows={tab.avoid} />
      <RuleBlock title="Checklist PoB" rows={tab.pob} />
      <PriorityFlow steps={tab.priority} />
      <RuleBlock title="Fontes" rows={tab.sources} />
    </section>
  </div>
}

function DpsTree({ type, nodes }: { type: string; nodes: any[] }) {
  return <section className="dps-tree-panel"><header><div><h3>Passive Tree focada</h3><span>Base 3.28 · nodos relevantes para {type}</span></div><b>{nodes.length}</b></header><object className="dps-tree-svg" data="/poe-tree/skilltree-3.28.svg" type="image/svg+xml" title={`Passive Tree ${type}`} /><div className="dps-node-list">{nodes.map(node => <article key={node.id} className={node.isKeystone ? 'keystone' : node.isMastery ? 'mastery' : 'notable'}><i>{node.isKeystone ? 'K' : node.isMastery ? 'M' : 'N'}</i><div><strong>{node.name || 'Unnamed node'}</strong><small>{node.stats.slice(0, 2).join(' · ')}</small></div></article>)}</div></section>
}

function SkillCards({ skills, hints }: { skills: any[]; hints: string[] }) {
  return <section className="dps-skill-panel"><header><div><h3>Skills relacionadas</h3><span>Codex local · relação de estudo, não lista exaustiva</span></div><b>{skills.length}</b></header><div className="dps-skill-grid">{skills.length ? skills.map(skill => <article key={skill.skill}><div className="skill-sprite">✦</div><div><strong>{skill.skill}</strong><small>{skill.builds} builds · melhor DPS {Math.round(skill.best_dps || 0).toLocaleString('pt-BR')}</small></div></article>) : <p className="dps-empty">Nenhuma skill do Codex bateu nos termos: {hints.join(', ')}.</p>}</div></section>
}

function PriorityFlow({ steps }: { steps: DamageTab['priority'] }) {
  const [open, setOpen] = useState(0)
  return <section className="priority-flow">
    <div className="priority-heading"><div><h3>Fluxo de decisão</h3><span>Comece no primeiro gate; só avance quando ele estiver validado.</span></div><small>{open + 1}/{steps.length}</small></div>
    <div className="flow-track">{steps.map((step, index) => <button key={step.step} className={`flow-card ${index === open ? 'active' : ''}`} onClick={() => setOpen(index)}><i>{step.step}</i><strong>{step.title}</strong><span>{step.why}</span><em>Skills: {step.skills}</em><small>{step.tradeoff}</small></button>)}</div>
  </section>
}

function RuleBlock({ title, rows }: { title: string; rows: string[] }) {
  if (title === 'Depende de') return <section className="depends-cards"><header><h3>{title}</h3><span>Variáveis que alteram o resultado</span></header><div>{rows.map((row, index) => <article key={`${title}-${index}`}><i>{String(index + 1).padStart(2, '0')}</i><p>{row}</p></article>)}</div></section>
  return <div className="defense-list">
    {rows.map((row, index) => <p key={`${title}-${index}`}><span>{title}</span><b>{row}</b></p>)}
  </div>
}
