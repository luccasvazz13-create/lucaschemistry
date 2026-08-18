"use client";

import { useEffect, useState } from "react";

const elementSymbols = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
const elementNames = "Hidrogênio|Hélio|Lítio|Berílio|Boro|Carbono|Nitrogênio|Oxigênio|Flúor|Neônio|Sódio|Magnésio|Alumínio|Silício|Fósforo|Enxofre|Cloro|Argônio|Potássio|Cálcio|Escândio|Titânio|Vanádio|Cromo|Manganês|Ferro|Cobalto|Níquel|Cobre|Zinco|Gálio|Germânio|Arsênio|Selênio|Bromo|Criptônio|Rubídio|Estrôncio|Ítrio|Zircônio|Nióbio|Molibdênio|Tecnécio|Rutênio|Ródio|Paládio|Prata|Cádmio|Índio|Estanho|Antimônio|Telúrio|Iodo|Xenônio|Césio|Bário|Lantânio|Cério|Praseodímio|Neodímio|Promécio|Samário|Európio|Gadolínio|Térbio|Disprósio|Hólmio|Érbio|Túlio|Itérbio|Lutécio|Háfnio|Tântalo|Tungstênio|Rênio|Ósmio|Irídio|Platina|Ouro|Mercúrio|Tálio|Chumbo|Bismuto|Polônio|Astato|Radônio|Frâncio|Rádio|Actínio|Tório|Protactínio|Urânio|Netúnio|Plutônio|Amerício|Cúrio|Berquélio|Califórnio|Einstênio|Férmio|Mendelévio|Nobélio|Laurêncio|Rutherfórdio|Dúbnio|Seabórgio|Bóhrio|Hássio|Meitnério|Darmstádio|Roentgênio|Copernício|Nihônio|Fleróvio|Moscóvio|Livermório|Tenessino|Oganessônio".split("|");
const periodGroups = [
  [1,18], [1,2,13,14,15,16,17,18],
  [1,2,13,14,15,16,17,18], Array.from({length:18},(_,i)=>i+1),
  Array.from({length:18},(_,i)=>i+1), Array.from({length:18},(_,i)=>i+1),
  Array.from({length:18},(_,i)=>i+1),
];
const counts = [2,8,8,18,18,32,32];

const pharmacology: Record<string, [string,string]> = {
  H:["combustíveis, síntese de amônia e hidrogenação","presente na água, no pH e em praticamente todos os fármacos orgânicos"],
  C:["aços, grafite, diamante, fibras e química orgânica","esqueleto molecular dos fármacos; carvão ativado como adsorvente"],
  N:["fertilizantes, atmosfera inerte e explosivos","aminas, amidas, heterociclos e nitrogênio líquido em criopreservação"],
  O:["metalurgia, tratamento de água e respiração assistida","oxigenoterapia, excipientes e grupos funcionais bioativos"],
  F:["fluoropolímeros, vidros e semicondutores","fluoração modula potência, seletividade e estabilidade metabólica de fármacos"],
  Na:["vidro, sabões e transferência de calor","NaCl em soluções isotônicas; sais sódicos elevam solubilidade"],
  Mg:["ligas leves, pirotecnia e metalurgia","antiácidos, laxantes e cofator enzimático"],
  P:["fertilizantes, detergentes e ligas","fosfatos em tampões, ATP e pró-fármacos fosforilados"],
  S:["ácido sulfúrico, vulcanização e fertilizantes","sulfonamidas, tióis e pontes dissulfeto em proteínas"],
  Cl:["PVC, branqueamento e desinfecção","cloretos em soluções e substituinte frequente em fármacos"],
  K:["fertilizantes, vidros e sabões","reposição eletrolítica e manutenção do potencial de membrana"],
  Ca:["cimento, metalurgia e corretivos de solo","suplementos, antiácidos e sinalização celular"],
  Fe:["aço, construção e catálise","suplementos antianêmicos, heme e contraste de nanopartículas"],
  Co:["superligas, baterias e pigmentos","centro metálico da vitamina B12; Co-60 em radioterapia"],
  Cu:["fiação, ligas e superfícies antimicrobianas","oligoelemento; complexos de cobre estudados como antimicrobianos"],
  Zn:["galvanização, latão e pilhas","óxido de zinco dermatológico; cofator de metaloenzimas"],
  Se:["vidro, fotocélulas e ligas","micronutriente antioxidante; sulfeto de selênio em dermatologia"],
  Br:["retardantes de chama, fotografia e fluidos","brometos históricos como sedativos; intermediários de síntese"],
  I:["antissépticos, catalisadores e lâmpadas","contraste iodado, hormônios tireoidianos e radioiodoterapia"],
  Pt:["catalisadores, joalheria e sensores","cisplatina, carboplatina e oxaliplatina em oncologia"],
  Au:["eletrônica, joalheria e catálise","radiofármacos e nanomateriais em diagnóstico/entrega de fármacos"],
  Hg:["instrumentação histórica e lâmpadas","uso farmacêutico hoje muito restrito pela toxicidade"],
  Tc:["traçadores e calibração nuclear","Tc-99m é central na medicina nuclear diagnóstica"],
  Gd:["ímãs, eletrônica e materiais ópticos","quelatos de gadolínio como contraste em ressonância magnética"],
  Li:["baterias, cerâmicas e ligas","carbonato de lítio como estabilizador do humor"],
};

function classify(z:number, symbol:string) {
  if (z >= 57 && z <= 71) return "Lantanídeo";
  if (z >= 89 && z <= 103) return "Actinídeo";
  if ([2,10,18,36,54,86,118].includes(z)) return "Gás nobre";
  if ([9,17,35,53,85,117].includes(z)) return "Halogênio";
  if ([3,11,19,37,55,87].includes(z)) return "Metal alcalino";
  if ([4,12,20,38,56,88].includes(z)) return "Alcalino-terroso";
  if ([1,6,7,8,15,16,34].includes(z)) return "Não metal";
  if ([5,14,32,33,51,52].includes(z)) return "Semimetal";
  if (z >= 21 && z <= 112) return "Metal de transição";
  return "Metal representativo";
}

const genericUses: Record<string,[string,string]> = {
  "Gás nobre":["iluminação, atmosferas inertes e criogenia","imagem, anestesia ou pesquisa biomédica, conforme o elemento"],
  "Halogênio":["desinfecção e síntese de materiais","intermediários e substituintes em química medicinal"],
  "Metal alcalino":["baterias, sais e síntese química","eletrólitos e sais farmacêuticos"],
  "Alcalino-terroso":["ligas, cerâmicas e construção","suplementos, antiácidos e biomateriais"],
  "Não metal":["energia, materiais e síntese","base estrutural e metabólica de moléculas bioativas"],
  "Semimetal":["semicondutores, vidros e ligas","diagnóstico, biomateriais e pesquisa toxicológica"],
  "Lantanídeo":["ímãs, lasers, fósforos e catalisadores","contraste, bioimagem e sondas luminescentes"],
  "Actinídeo":["energia e pesquisa nuclear","radioisótopos em terapia, diagnóstico e pesquisa"],
  "Metal de transição":["ligas, catálise e eletrônica","complexos metálicos, enzimas e agentes diagnósticos"],
  "Metal representativo":["ligas, revestimentos e eletrônica","sais, excipientes e pesquisa de materiais biomédicos"],
};

const elements = (() => {
  let z = 1; const result: Array<{z:number;symbol:string;name:string;group:number;period:number;category:string;uses:string;pharma:string}> = [];
  counts.forEach((count, p) => {
    const groups = periodGroups[p];
    for (let i=0;i<count;i++,z++) {
      const symbol=elementSymbols[z-1], category=classify(z,symbol), special=pharmacology[symbol] ?? genericUses[category];
      let group = groups[i] ?? (z >= 57 && z <= 71 ? 3 : z >= 89 && z <= 103 ? 3 : Math.min(18,i+1));
      let period=p+1;
      if (z>=58&&z<=71) { group=z-55; period=8; }
      else if (z>=90&&z<=103) { group=z-87; period=9; }
      else if (z>=72&&z<=86) group=z-68;
      else if (z>=104&&z<=118) group=z-100;
      else if (z===57||z===89) group=3;
      result.push({z,symbol,name:elementNames[z-1],group,period,category,uses:special[0],pharma:special[1]});
    }
  }); return result;
})();

const moleculeModes = {
  "Orgânica": [
    {name:"Ácido acetilsalicílico", formula:"C₉H₈O₄", mass:"180,16 g·mol⁻¹", structure:"anel aromático + carboxila + éster", note:"Exemplo de acetilação; princípio ativo da aspirina."},
    {name:"Paracetamol", formula:"C₈H₉NO₂", mass:"151,16 g·mol⁻¹", structure:"anel aromático + amida + fenol", note:"Arquitetura de um analgésico e antitérmico clássico."},
    {name:"Cafeína", formula:"C₈H₁₀N₄O₂", mass:"194,19 g·mol⁻¹", structure:"heterociclo xantínico metilado", note:"Antagonista de receptores de adenosina."},
  ],
  "Inorgânica": [
    {name:"Cloreto de sódio", formula:"NaCl", mass:"58,44 g·mol⁻¹", structure:"rede iônica Na⁺/Cl⁻", note:"Base de soluções isotônicas e reposição eletrolítica."},
    {name:"Sulfato de magnésio", formula:"MgSO₄", mass:"120,37 g·mol⁻¹", structure:"Mg²⁺ + ânion sulfato", note:"Uso clínico depende da formulação e indicação."},
    {name:"Cisplatina", formula:"[Pt(NH₃)₂Cl₂]", mass:"300,05 g·mol⁻¹", structure:"complexo quadrado-planar de Pt(II)", note:"Antineoplásico que forma adutos com DNA."},
  ],
  "Previsão de reação": [
    {name:"Neutralização", formula:"HCl + NaOH → NaCl + H₂O", mass:"ácido + base", structure:"transferência de próton", note:"Produtos prováveis: sal e água; reação fortemente favorecida."},
    {name:"Esterificação", formula:"RCOOH + R′OH ⇌ RCOOR′ + H₂O", mass:"equilíbrio", structure:"substituição nucleofílica acílica", note:"Prevê éster + água; rendimento depende do equilíbrio e das condições."},
    {name:"Precipitação", formula:"AgNO₃ + NaCl → AgCl↓ + NaNO₃", mass:"dupla troca", structure:"formação de sólido pouco solúvel", note:"AgCl é o precipitado esperado em meio aquoso."},
    {name:"Oxidação de álcool", formula:"RCH₂OH + [O] → RCHO → RCOOH", mass:"redox", structure:"aumento de ligações C–O", note:"Produto depende do oxidante e do controle das condições."},
  ],
};

type Formula = {name:string; equation:string; use:string; vars:Array<{key:string;label:string;unit:string;default:number}>; solve:(unknown:string,v:Record<string,number>)=>number};
const formulas: Formula[] = [
  {name:"Molaridade",equation:"M = n / V",use:"Preparo e análise de soluções. Use V em litros.",vars:[{key:"M",label:"Molaridade",unit:"mol·L⁻¹",default:0.1},{key:"n",label:"Quantidade",unit:"mol",default:0.05},{key:"V",label:"Volume",unit:"L",default:0.5}],solve:(u,v)=>u==="M"?v.n/v.V:u==="n"?v.M*v.V:v.n/v.M},
  {name:"Quantidade de matéria",equation:"n = m / MM",use:"Converte massa em mol usando a massa molar.",vars:[{key:"n",label:"Quantidade",unit:"mol",default:1},{key:"m",label:"Massa",unit:"g",default:58.44},{key:"MM",label:"Massa molar",unit:"g·mol⁻¹",default:58.44}],solve:(u,v)=>u==="n"?v.m/v.MM:u==="m"?v.n*v.MM:v.m/v.n},
  {name:"Diluição",equation:"C₁V₁ = C₂V₂",use:"Calcula volumes ou concentrações antes e depois de uma diluição.",vars:[{key:"C1",label:"Concentração inicial",unit:"mol·L⁻¹",default:1},{key:"V1",label:"Volume inicial",unit:"mL",default:10},{key:"C2",label:"Concentração final",unit:"mol·L⁻¹",default:0.1},{key:"V2",label:"Volume final",unit:"mL",default:100}],solve:(u,v)=>u==="C1"?v.C2*v.V2/v.V1:u==="V1"?v.C2*v.V2/v.C1:u==="C2"?v.C1*v.V1/v.V2:v.C1*v.V1/v.C2},
  {name:"Gás ideal",equation:"PV = nRT",use:"Relaciona pressão, volume, temperatura e quantidade de gás; R = 0,082057 L·atm·mol⁻¹·K⁻¹.",vars:[{key:"P",label:"Pressão",unit:"atm",default:1},{key:"V",label:"Volume",unit:"L",default:24.46},{key:"n",label:"Quantidade",unit:"mol",default:1},{key:"T",label:"Temperatura",unit:"K",default:298.15}],solve:(u,v)=>{const R=.082057;return u==="P"?v.n*R*v.T/v.V:u==="V"?v.n*R*v.T/v.P:u==="n"?v.P*v.V/(R*v.T):v.P*v.V/(v.n*R)}},
  {name:"Beer–Lambert",equation:"A = εbc",use:"Quantificação espectrofotométrica em uma faixa linear de absorbância.",vars:[{key:"A",label:"Absorbância",unit:"—",default:0.75},{key:"e",label:"Absortividade ε",unit:"L·mol⁻¹·cm⁻¹",default:15000},{key:"b",label:"Caminho óptico",unit:"cm",default:1},{key:"c",label:"Concentração",unit:"mol·L⁻¹",default:.00005}],solve:(u,v)=>u==="A"?v.e*v.b*v.c:u==="e"?v.A/(v.b*v.c):u==="b"?v.A/(v.e*v.c):v.A/(v.e*v.b)},
  {name:"pH",equation:"pH = −log₁₀[H⁺]",use:"Estima acidez a partir da concentração de H⁺ em solução ideal diluída.",vars:[{key:"pH",label:"pH",unit:"—",default:7},{key:"H",label:"[H⁺]",unit:"mol·L⁻¹",default:1e-7}],solve:(u,v)=>u==="pH"?-Math.log10(v.H):10**(-v.pH)},
  {name:"Calorimetria",equation:"q = mcΔT",use:"Estima calor sensível sem mudança de fase.",vars:[{key:"q",label:"Calor",unit:"J",default:4180},{key:"m",label:"Massa",unit:"g",default:100},{key:"c",label:"Calor específico",unit:"J·g⁻¹·K⁻¹",default:4.18},{key:"dT",label:"Variação de temperatura",unit:"K",default:10}],solve:(u,v)=>u==="q"?v.m*v.c*v.dT:u==="m"?v.q/(v.c*v.dT):u==="c"?v.q/(v.m*v.dT):v.q/(v.m*v.c)},
  {name:"Velocidade de reação",equation:"v = k[A]ᵐ",use:"Simula uma lei de velocidade para um reagente e ordem aparente m.",vars:[{key:"v",label:"Velocidade",unit:"mol·L⁻¹·s⁻¹",default:.02},{key:"k",label:"Constante k",unit:"variável",default:.2},{key:"A",label:"Concentração [A]",unit:"mol·L⁻¹",default:.1},{key:"m",label:"Ordem m",unit:"—",default:1}],solve:(u,v)=>u==="v"?v.k*v.A**v.m:u==="k"?v.v/(v.A**v.m):u==="A"?(v.v/v.k)**(1/v.m):Math.log(v.v/v.k)/Math.log(v.A)},
  {name:"Energia livre",equation:"ΔG = ΔH − TΔS",use:"Avalia espontaneidade termodinâmica mantendo unidades coerentes.",vars:[{key:"G",label:"ΔG",unit:"kJ·mol⁻¹",default:-10},{key:"H",label:"ΔH",unit:"kJ·mol⁻¹",default:-40},{key:"T",label:"Temperatura",unit:"K",default:300},{key:"S",label:"ΔS",unit:"kJ·mol⁻¹·K⁻¹",default:-.1}],solve:(u,v)=>u==="G"?v.H-v.T*v.S:u==="H"?v.G+v.T*v.S:u==="T"?(v.H-v.G)/v.S:(v.H-v.G)/v.T},
  {name:"Henderson–Hasselbalch",equation:"pH = pKₐ + log([A⁻]/[HA])",use:"Planejamento aproximado de tampões ácido fraco/base conjugada.",vars:[{key:"pH",label:"pH",unit:"—",default:4.76},{key:"pKa",label:"pKₐ",unit:"—",default:4.76},{key:"A",label:"[A⁻]",unit:"mol·L⁻¹",default:.1},{key:"HA",label:"[HA]",unit:"mol·L⁻¹",default:.1}],solve:(u,v)=>u==="pH"?v.pKa+Math.log10(v.A/v.HA):u==="pKa"?v.pH-Math.log10(v.A/v.HA):u==="A"?v.HA*10**(v.pH-v.pKa):v.A/10**(v.pH-v.pKa)},
];

export function IraBadge() {
  const [ira,setIra]=useState("");
  useEffect(()=>setIra(localStorage.getItem("lucas-ira")??""),[]);
  return <label className="ira-badge"><span>IRA ATUAL</span><input aria-label="IRA atual" inputMode="decimal" placeholder="—" value={ira} onChange={e=>{setIra(e.target.value);localStorage.setItem("lucas-ira",e.target.value)}} /></label>;
}

export function Gradebook({terms}:{terms:Array<{term:string;courses:string[]}>}) {
  const [term,setTerm]=useState("2026.1"); const [grades,setGrades]=useState<Record<string,string>>({});
  const allTerms=[{term:"2026.1",courses:["Química Geral I","Química Geral Experimental","Inglês Técnico e Científico","Introdução ao Curso","Álgebra Linear e Geometria Analítica"]},...terms];
  useEffect(()=>{try{setGrades(JSON.parse(localStorage.getItem("lucas-grades")||"{}"))}catch{}},[]);
  const update=(course:string,value:string)=>{const next={...grades,[`${term}::${course}`]:value};setGrades(next);localStorage.setItem("lucas-grades",JSON.stringify(next))};
  const courses=allTerms.find(t=>t.term===term)?.courses??[];
  const nums=courses.map(c=>Number(grades[`${term}::${c}`])).filter(n=>Number.isFinite(n)&&n>=0&&n<=10);
  return <section className="gradebook" aria-labelledby="grades-title"><div className="gradebook-head"><div><span className="overline">CADERNO DE NOTAS</span><h4 id="grades-title">Médias por período</h4></div><strong>{nums.length?`${(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2)} média simples`:"Aguardando notas"}</strong></div><div className="grade-tabs">{allTerms.map(t=><button key={t.term} className={t.term===term?"active":""} onClick={()=>setTerm(t.term)}>{t.term}</button>)}</div><div className="grade-grid">{courses.map(c=><label key={c}><span>{c}</span><input type="number" min="0" max="10" step="0.01" placeholder="—" value={grades[`${term}::${c}`]??""} onChange={e=>update(c,e.target.value)} /></label>)}</div><small>As médias e o IRA são registros pessoais editáveis e ficam salvos neste navegador.</small></section>;
}

export function ChemistryLab() {
  const [selected,setSelected]=useState(elements[5]); const [query,setQuery]=useState("");
  const [mode,setMode]=useState<keyof typeof moleculeModes>("Orgânica"); const [molecule,setMolecule]=useState(0);
  const [formulaIndex,setFormulaIndex]=useState(0); const formula=formulas[formulaIndex];
  const [unknown,setUnknown]=useState(formula.vars[0].key); const [values,setValues]=useState<Record<string,number>>(()=>Object.fromEntries(formula.vars.map(v=>[v.key,v.default])));
  const chooseFormula=(index:number)=>{const f=formulas[index];setFormulaIndex(index);setUnknown(f.vars[0].key);setValues(Object.fromEntries(f.vars.map(v=>[v.key,v.default])))};
  const result=formula.solve(unknown,values); const visible=elements.filter(e=>!query||`${e.name} ${e.symbol} ${e.z}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="chem-lab" id="laboratorio" aria-labelledby="lab-title">
    <div className="lab-heading"><div><p className="kicker"><span>03</span> LABORATÓRIO INTERATIVO</p><h2 id="lab-title">Da tabela ao mecanismo.</h2></div><p>Explore elementos, estruturas, reações e equações como uma bancada digital de estudo.</p></div>
    <section className="periodic-module"><div className="module-heading"><div><span className="overline">118 ELEMENTOS · PASSE O MOUSE OU TOQUE</span><h3>Tabela periódica farmacêutica</h3></div><label className="element-search">⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Elemento, símbolo ou Z" /></label></div><div className="periodic-layout"><div className="periodic-table">{visible.map(e=><button key={e.z} onMouseEnter={()=>setSelected(e)} onFocus={()=>setSelected(e)} onClick={()=>setSelected(e)} className={`element-cell category-${e.category.normalize("NFD").replace(/[^a-zA-Z]/g,"").toLowerCase()} ${selected.z===e.z?"selected":""}`} style={{gridColumn:e.group,gridRow:e.period}}><small>{e.z}</small><strong>{e.symbol}</strong><span>{e.name}</span></button>)}</div><aside className="element-card"><div className="element-symbol"><span>{selected.z}</span><strong>{selected.symbol}</strong><small>{selected.name}</small></div><div><span className="element-category">{selected.category} · período {selected.period} · grupo {selected.group}</span><h4>Aplicações principais</h4><p>{selected.uses}.</p><h4>Farmácia e ciências farmacêuticas</h4><p>{selected.pharma}.</p></div></aside></div></section>
    <div className="lab-two-columns"><section className="molecule-module"><div className="module-heading"><div><span className="overline">SINTETIZADOR CONCEITUAL</span><h3>Moléculas e reações</h3></div></div><div className="mode-tabs">{Object.keys(moleculeModes).map(key=><button key={key} className={mode===key?"active":""} onClick={()=>{setMode(key as keyof typeof moleculeModes);setMolecule(0)}}>{key}</button>)}</div><div className="molecule-options">{moleculeModes[mode].map((m,i)=><button key={m.name} className={i===molecule?"active":""} onClick={()=>setMolecule(i)}>{m.name}</button>)}</div><article className="molecule-stage"><div className="molecule-orbit"><i/><i/><i/><span>{moleculeModes[mode][molecule].formula}</span></div><div><span className="overline">RESULTADO SIMULADO</span><h4>{moleculeModes[mode][molecule].name}</h4><p className="big-formula">{moleculeModes[mode][molecule].formula}</p><dl><div><dt>Massa / classe</dt><dd>{moleculeModes[mode][molecule].mass}</dd></div><div><dt>Arquitetura</dt><dd>{moleculeModes[mode][molecule].structure}</dd></div></dl><p>{moleculeModes[mode][molecule].note}</p></div></article><small className="safety-note">Modelo educacional: prevê padrões gerais, não substitui literatura, software químico ou protocolo experimental.</small></section>
      <section className="formula-module"><div className="module-heading"><div><span className="overline">FORMULÁRIO DINÂMICO</span><h3>Equações essenciais</h3></div></div><div className="formula-picker">{formulas.map((f,i)=><button key={f.name} className={i===formulaIndex?"active":""} onClick={()=>chooseFormula(i)}>{f.name}</button>)}</div><article className="formula-workbench"><div><span className="overline">{formula.name}</span><strong>{formula.equation}</strong><p>{formula.use}</p></div><div className="formula-controls"><label>Calcular incógnita<select value={unknown} onChange={e=>setUnknown(e.target.value)}>{formula.vars.map(v=><option key={v.key} value={v.key}>{v.label} ({v.key})</option>)}</select></label>{formula.vars.filter(v=>v.key!==unknown).map(v=><label key={v.key}>{v.label}<span><input type="number" step="any" value={values[v.key]} onChange={e=>setValues({...values,[v.key]:Number(e.target.value)})}/><small>{v.unit}</small></span></label>)}<output><span>{formula.vars.find(v=>v.key===unknown)?.label}</span><strong>{Number.isFinite(result)?result.toPrecision(6):"Indefinido"}</strong><small>{formula.vars.find(v=>v.key===unknown)?.unit}</small></output></div></article></section>
    </div>
  </section>;
}
