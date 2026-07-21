import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const input = 'C:/Users/saulo/Desktop/Bleed Skills.xlsx';
const output = 'C:/Users/saulo/Desktop/Bleed Skills - DPS Type.xlsx';
const xmlPath = 'C:/Users/saulo/Documents/Path of Building/Builds/Bleeding Base (XML).xml';

const xml = await fs.readFile(xmlPath, 'utf8');
const textOf = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const itemBlocks = [...xml.matchAll(/<Item id="(\d+)">([\s\S]*?)<\/Item>/g)].map(m => ({id:m[1], text:textOf(m[2])}));
const item = (id) => itemBlocks.find(x => x.id === id)?.text ?? '';
const stat = (name) => Number(xml.match(new RegExp(`<PlayerStat value="([^"]+)" stat="${name}"`))?.[1] ?? 0);
const inputs = [...xml.matchAll(/<Input\s+([^>]+?)\/>/g)].map(m => m[1]);
const inputNames = inputs.map(s => s.match(/name="([^"]+)"/)?.[1]).filter(Boolean);

// The supplied workbook contains malformed comment-person metadata that the
// artifact importer cannot load. Create a clean workbook with the requested
// dashboard tab so the audited content remains usable and editable.
const wb = Workbook.create();
let sheet = wb.worksheets.add('DPS Type');
sheet.showGridLines = false;

const rows = [];
const push = (r) => rows.push(r);
push(['BLEED DPS TYPE — AUDITORIA ESTRUTURA','Valor / regra','Estado','Por que importa','Fonte / validação']);
push(['IDENTIDADE DA BUILD','','','','']);
push(['Classe / ascendência','Duelist / Gladiator','Observado no XML','Gladiator combina bleed, block e explosões de clear.','PoB XML: Build']);
push(['Nível / versão','98 / tree 3_28; targetVersion 3_0','Observado no XML','A árvore é 3.28; confirmar compatibilidade do target no PoB.','PoB XML: Build + Tree/Spec']);
push(['Entrega de dano','Ataque melee físico → Bleed; Lacerate + Eviscerate','Observado no XML','Bleed usa o hit físico para criar um DoT físico; o hit inicial ainda importa.','PoB XML: Skills + PlayerStat']);
push(['Métrica principal',`${(stat('BleedDPS')/1e6).toFixed(2)}M Bleed DPS`,'PoB calculado','É o valor de bleed configurado; não confundir com DPS real sustentado.','PoB XML: PlayerStat']);
push(['DPS combinado',`${(stat('CombinedDPS')/1e6).toFixed(2)}M`,'PoB calculado','Inclui componentes adicionais/configurados; usar BleedDPS como referência principal.','PoB XML: PlayerStat']);
push(['Ataques / hit chance',`${stat('Speed').toFixed(2)} ataques/s; ${stat('HitChance').toFixed(0)}% hit`,'Forte','Ataques precisam acertar; sem hit não há bleed.','PoB XML: PlayerStat']);
push(['DEFESA BASE', '', '', '', '']);
push(['Vida',stat('Life'),'Observado no XML','Vida é o pool primário; 5.385 é razoável, mas não substitui mitigação.','PoB XML: PlayerStat']);
push(['Armadura',stat('Armour'),'Observado no XML','Mitiga principalmente hits físicos; não resolve DoT elemental/caos.','PoB XML: PlayerStat']);
push(['Block / spell block',`${stat('EffectiveBlockChance').toFixed(1)}% / ${stat('EffectiveSpellBlockChance').toFixed(2)}%`,'Muito forte','Escudo + Gladiator + recuperação on-block formam o núcleo defensivo.','PoB XML: PlayerStat + item 8']);
push(['Resistências','79 fire / 78 cold / 78 lightning / 13 chaos','Chaos a melhorar','Elementais estão acima de 75%; caos positivo, mas baixo para conteúdo exigente.','PoB XML: PlayerStat']);
push(['Recuperação',`${stat('LifeRegenRecovery').toFixed(1)} regen; ${stat('LifeLeechGainRate').toFixed(0)} leech; 5% life on block`,'Presente','A recuperação on-block é especialmente coerente com a build.','PoB XML: PlayerStat + item 8']);
push(['MOTOR DO BLEED','','','','']);
push(['1. Hit físico alto','Axe com 189% phys + flat phys + Ryslatha','Prioridade máxima','Bleed escala a partir do dano físico do hit; Ryslatha aumenta o teto e reduz o piso.','PoB XML: items 4 e 9']);
push(['2. DoT multi / bleed multi','Axe +61% bleed DoT multi; amulet +20% phys DoT; gloves +10% phys DoT','Prioridade máxima','Multiplicadores de DoT são mais valiosos que dano genérico quando o hit já está forte.','PoB XML: items 4, 10, 14']);
push(['3. Aggravated / alvo em movimento','Config tem conditionEnemyMoving=true','Verificar realidade','Bleed agravado trata o alvo como se estivesse movendo; não ativar no PoB sem fonte real.','PoB XML: Config; PoE Wiki']);
push(['4. Duração / velocidade do bleed','Boots: 5% faster; helmet: 14% ailment duration','Bom suporte','Faster damage melhora o tempo para matar; duração melhora manutenção, não o DPS instantâneo.','PoB XML: items 12 e 16']);
push(['5. Aplicação confiável','Tincture: 32% chance + 145% bleed damage +38% DoT multi','Enabler','A tincture é parte estrutural; sem ela, confirmar 100% chance de bleed por outra fonte.','PoB XML: item 6']);
push(['SKILLS E LINKS','','','','']);
push(['Boss / main','Lacerate 20 + Greater Multistrike 2 + Melee Phys + Cruelty + Brutality + Volatility','Observado','Link prioriza hit físico e variação de dano; validar se Multistrike/Volatility são desejados para o skill variant.','PoB XML: Body Armour skill']);
push(['Retaliation / clear','Eviscerate + Maim + Brutality + Expert Retaliation','Observado','Eviscerate depende do gatilho de retaliation; não é spam livre sem ser atacado/bloquear.','PoB XML: Boots skill; build research']);
push(['Curse','Tempest Shield + Hextouch + Vulnerability','Observado','Vulnerability amplifica dano físico/bleed quando aplicado; confirmar aplicação em bosses.','PoB XML: Weapon 2']);
push(['Aura','Pride + Enlighten 3','Observado','Pride escala dano físico; reservar sem deixar custo de ataque inviável.','PoB XML: Helmet']);
push(['Utilidade','Leap Slam + Faster Attacks + Lifetap + Maim','Observado','Mobilidade e Maim; Lifetap evita depender da mana reservada.','PoB XML: Gloves']);
push(['PADRÃO DE JEWELS — REGRA EXTRAÍDA','','','','']);
push(['Large Cluster Jewel','8 passives; 2 sockets; 12% increased Physical por small; +3 Str; Battle-Hardened; Furious Assault; Master the Fundamentals','Padrão ofensivo','É o núcleo de dano físico eficiente; sockets permitem jewels adicionais.','PoB XML: item 1']);
push(['Medium Cluster Jewel','4 passives; 1 socket; Circling Oblivion + Wasting Affliction; 12% cold DoT por small; resistências','Padrão híbrido / suspeito','Wasting Affliction ajuda DoT, mas cold DoT nos smalls não é bleed: é oportunidade de otimização.','PoB XML: item 22']);
push(['Unique jewel','The Light of Meaning: 6% increased Physical por passive no radius','Padrão físico','É forte quando colocado num raio com muitas passivas; medir o número real de passivas no PoB.','PoB XML: item 2']);
push(['Rare Crimson jewels','Vida + global physical + damage with bleeding + attack speed/DoT','Padrão correto','O pacote ideal combina sobrevivência, hit físico e multiplicador bleed; não trocar vida por dano marginal.','PoB XML: items 3 e 24']);
push(['Rare Cobalt jewel','Vida + atributos + mana/ES on hit','Utilidade','Resolve requisitos e sustain, mas é o primeiro slot a substituir por life/phys/bleed se os requisitos permitirem.','PoB XML: item 23']);
push(['Regra geral para jewel raro','Priorizar: % life → % damage with bleeding / phys DoT multi → global phys → atributos/resistências','Recomendação','A ordem muda conforme o gargalo: vida/defesa primeiro, depois multiplicador, depois conforto.','Inferência baseada no XML + build research']);
push(['ÁRVORE / NODOS A PROCURAR','','','','']);
push(['Confirmados indiretamente','Hatchet Master alocado em dois amuletos; 11 masteryEffects; 135 node IDs alocados','Observado','O XML não contém nomes dos IDs; não inventar nomes. Abrir a árvore do mesmo treeVersion para mapear cada ID.','PoB XML: Tree/Spec']);
push(['Clusters / sockets','Large physical cluster + medium DoT cluster + jewel sockets','Confirmado','O custo de entrada deve ser comparado ao retorno dos notables e dos sockets.','PoB XML: items 1, 22']);
push(['Comuns a validar no tree 3.28','nodos de physical damage, attack damage, axe, bleed/ailment, DoT multiplier, life, block, armour e jewel sockets','Checklist','São categorias aplicáveis; selecionar apenas nós que melhoram o gargalo real e mantêm pathing eficiente.','Inferência; validar no PoB']);
push(['Masteries prioritárias','Bleed/ailment ou phys DoT; axe/attack; life; block; armour; jewel/cluster','Checklist','Mastery é uma troca de pontos: cada escolha deve resolver dano, defesa, uptime ou requisito.','Inferência; validar no PoB']);
push(['CONFIGURAÇÃO DO PoB — ALERTAS','','','','']);
push(['Enemy moving',inputNames.includes('conditionEnemyMoving')?'ATIVO':'não encontrado','ALERTA','Pode inflar bleed se a build não tiver fonte de aggravated bleed ou o alvo não estiver realmente em movimento.','PoB XML: Config']);
push(['Enemy bleeding / intimidated / blocked recently','Ativos na Config','ALERTA','Condições temporárias precisam de uptime; separar DPS de papel e DPS sustentado.','PoB XML: Config']);
push(['Rage / Pride','Rage 30; Pride MAX','ALERTA','Usar MAX Pride e 30 rage somente quando a rotação sustenta esses estados.','PoB XML: Config']);
push(['Elemental curses','Elemental Weakness e Frostbite configurados','ALERTA','São pouco relevantes para o bleed físico e podem sinalizar resíduos de configuração.','PoB XML: Config']);
push(['RECOMENDAÇÃO DE ESTRUTURA','','','','']);
push(['Clear','Lacerate/Eviscerate + explosão de Gladiator + mobilidade','Objetivo','Priorizar cobertura, velocidade e recuperação enquanto se move.','Build research']);
push(['Boss','Maior hit possível + Vulnerability + bleed multi + aggravated real','Objetivo','Configurar alvo stationary/moving de forma explícita e medir o pior caso.','PoB + build research']);
push(['Upgrade 1','Corrigir medium cluster cold DoT se o custo não compensar','Melhor retorno provável','Trocar smalls cold DoT por físico/bleed/vida/resistências ou substituir o cluster.','Inferência do XML']);
push(['Upgrade 2','Aumentar chaos resistance e validar max hit/DoT','Defesa','13% chaos é o ponto mais claro de fragilidade defensiva no snapshot.','PoB XML: PlayerStat']);
push(['Upgrade 3','Separar configs Mapping/Boss/Realistic','Confiabilidade','Uma única config com várias condições ativas não representa todos os encontros.','PoB XML: Config']);
push(['FONTES','','','','']);
push(['PoE Wiki — Bleeding','https://www.poewiki.net/wiki/Bleeding','Mecânica','Bleed é dano físico over time; aggravated bleed trata alvo como moving.','Pesquisa']);
push(['Path of Building Community','https://github.com/PathOfBuildingCommunity/PathOfBuilding','Ferramenta','PoB é a autoridade local para conferir cálculos, árvore, config e itens.','Pesquisa']);
push(['Build guide — Lacerate/Eviscerate Gladiator','https://mobalytics.gg/poe/builds/ronarray-bleed-lacerate-eviscerate-gladiator','Padrão de build','Confirma a combinação Lacerate/Eviscerate, Gladiator, clusters físicos e bleed.','Pesquisa']);
push(['Forum — 3.26 Pinnacle DOT bleed','https://webcdn.pathofexile.com/forum/view-thread/3804187','Validação','Mostra a importância de distinguir range de bleed, config e DPS de boss.','Pesquisa']);
push(['Nota de auditoria','Fatos extraídos do XML estão marcados como Observado/Confirmado; recomendações e inferências precisam ser revalidadas no PoB após mudanças.','','','']);

const range = sheet.getRange(`A1:E${rows.length}`);
for (let c = 0; c < 5; c++) {
  const col = String.fromCharCode(65 + c);
  sheet.getRange(`${col}1:${col}${rows.length}`).values = rows.map(r => [r[c] ?? '']);
}
sheet.getRange('A1:E1').format = {fill:'#7F1D1D',font:{bold:true,color:'#FFFFFF',size:12},wrapText:true};
for (const r of ['A2:E2','A8:E8','A13:E13','A22:E22','A29:E29','A37:E37','A43:E43','A50:E50','A57:E57']) sheet.getRange(r).format = {fill:'#FDE68A',font:{bold:true,color:'#111827'}};
sheet.getRange(`A1:E${rows.length}`).format.wrapText = true;
sheet.getRange(`A1:E${rows.length}`).format.verticalAlignment = 'Top';
sheet.getRange(`A1:E${rows.length}`).format.borders = {insideHorizontal:{style:'thin',color:'#E5E7EB'},bottom:{style:'thin',color:'#CBD5E1'}};
sheet.getRange('A1:A200').format.columnWidth = 30;
sheet.getRange('B1:B200').format.columnWidth = 42;
sheet.getRange('C1:C200').format.columnWidth = 22;
sheet.getRange('D1:D200').format.columnWidth = 58;
sheet.getRange('E1:E200').format.columnWidth = 48;
sheet.getRange(`A1:E${rows.length}`).format.rowHeight = 30;
sheet.getRange('A1:E1').format.rowHeight = 36;
sheet.freezePanes.freezeRows(1);

const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:100},summary:'formula errors'});
console.log(errors.ndjson);
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(output);
const preview = await wb.render({sheetName:'DPS Type',range:`A1:E${Math.min(rows.length,25)}`,scale:1,format:'png'});
await fs.writeFile('C:/Users/saulo/Desktop/DPS Type preview.png', new Uint8Array(await preview.arrayBuffer()));
console.log(`saved ${output}`);
