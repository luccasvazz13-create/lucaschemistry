"use client";

import { useEffect, useMemo, useState } from "react";
import { ChemistryLab, Gradebook, IraBadge } from "./chemistry-lab";

type CourseStatus = "Concluída" | "Cursando" | "Planejada" | "Dispensada";
type Discipline = {
  id: number;
  name: string;
  curriculumPeriod: number;
  hours: number;
  status: CourseStatus;
  tone: string;
  prerequisites?: string;
  term?: string;
  custom?: boolean;
};
type Elective = { id: string; name: string; hours: number; prerequisites?: string; area: string };
type Goal = { id: number; label: string; done: boolean };
type AccelerationTerm = { term: string; title: string; objective: string; courses: string[]; unlocks: string; note?: string };
type ActivityOption = { id: string; name: string; rule: string; icon: string; color: string };
type Weekday = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado";
type Meeting = { day: Weekday; start: string; end: string };
type ScheduleMap = Record<string, Meeting[]>;
type PostgradCourse = { code?: string; name: string; hours: number; kind: "Obrigatória" | "Possível"; priority?: boolean };

const tones = ["cyan", "lime", "violet", "orange", "pink"];
const course = (
  id: number,
  period: number,
  name: string,
  hours: number,
  prerequisites = "",
  status: CourseStatus = "Planejada",
  term?: string,
): Discipline => ({ id, name, curriculumPeriod: period, hours, prerequisites, status, term, tone: tones[(id - 1) % tones.length] });

const curriculum2012: Discipline[] = [
  course(1, 1, "Química Geral I", 60, "", "Concluída", "2026.1"),
  course(2, 1, "Química Geral Experimental", 30, "", "Concluída", "2026.1"),
  course(3, 1, "Cálculo Diferencial e Integral I", 90),
  course(4, 1, "Inglês Técnico e Científico", 60, "", "Concluída", "2026.1"),
  course(5, 1, "Introdução à Metodologia Científica", 60),
  course(6, 1, "Introdução ao Curso", 15, "", "Concluída", "2026.1"),
  course(7, 1, "Álgebra Linear e Geometria Analítica", 90, "", "Concluída", "2026.1"),

  course(8, 2, "Química Geral II", 60, "Química Geral I + Química Geral Experimental", "Cursando", "2026.2"),
  course(9, 2, "Estatística Aplicada à Química", 30, "", "Cursando", "2026.2"),
  course(10, 2, "Cálculo Diferencial e Integral II", 60, "Cálculo I", "Cursando", "2026.2"),
  course(11, 2, "Química Orgânica I", 90, "Química Geral I", "Cursando", "2026.2"),
  course(12, 2, "Equações Diferenciais", 60, "Cálculo I + Álgebra Linear e Geometria Analítica", "Cursando", "2026.2"),

  course(13, 3, "Química Analítica Qualitativa", 90, "Química Geral II"),
  course(14, 3, "Elementos de Química Quântica", 60, "Cálculo II + Equações Diferenciais"),
  course(15, 3, "Química Orgânica II", 60, "Química Orgânica I"),
  course(16, 3, "Física Fundamental I", 60),
  course(17, 3, "Física Experimental I/Q", 30),
  course(18, 3, "Fundamentos de Bioquímica", 60, "Química Orgânica I"),

  course(19, 4, "Química Analítica Quantitativa", 120, "Química Analítica Qualitativa + Estatística Aplicada à Química"),
  course(20, 4, "Química Inorgânica I", 60, "Química Geral I + Elementos de Química Quântica"),
  course(21, 4, "Física Fundamental II", 60, "Física Fundamental I + Física Experimental I/Q"),
  course(22, 4, "Física Experimental II/Q", 30, "Física Fundamental I + Física Experimental I/Q"),
  course(23, 4, "Físico-Química I", 60, "Física Fundamental I + Cálculo I"),

  course(24, 5, "Química Instrumental I", 60, "Química Analítica Quantitativa"),
  course(25, 5, "Química Inorgânica II", 60, "Química Inorgânica I"),
  course(26, 5, "Físico-Química II", 60, "Físico-Química I + Física Fundamental II"),
  course(27, 5, "Mineralogia", 60, "Química Inorgânica I"),
  course(28, 5, "Mecânica dos Fluidos", 60, "Cálculo II + Álgebra Linear e Geometria Analítica"),
  course(29, 5, "Química e Educação Ambiental", 30, "Química Orgânica I + Química Inorgânica I + Química Analítica Qualitativa"),

  course(30, 6, "Química dos Metais de Transição", 75, "Química Inorgânica II"),
  course(31, 6, "Química Orgânica III", 60, "Química Orgânica II"),
  course(32, 6, "Química Instrumental II", 60, "Química Analítica Quantitativa"),
  course(33, 6, "Desenho Técnico Industrial", 60, "", "Planejada", "2029.1"),
  course(34, 6, "Fenômeno de Transporte", 45, "Cálculo II + Equações Diferenciais"),

  course(35, 7, "Operações Unitárias I", 60, "Mecânica dos Fluidos + Fenômeno de Transporte"),
  course(36, 7, "Transmissão de Calor", 60, "Físico-Química II + Cálculo II + Álgebra Linear e Geometria Analítica"),
  course(37, 7, "Cinética Química Industrial", 30, "Físico-Química I"),
  course(38, 7, "Introdução à Economia", 60),

  course(39, 8, "Operações Unitárias II", 60, "Operações Unitárias I"),
  course(40, 8, "Segurança do Trabalho", 30, "", "Cursando", "2026.2"),
  course(41, 8, "Optativa I", 60),
  course(42, 8, "Optativa II", 60),
  course(43, 8, "Química dos Colóides e Superfície", 60, "Físico-Química II", "Cursando", "2026.2"),

  course(44, 9, "Química Inorgânica Industrial", 75, "Operações Unitárias II"),
  course(45, 9, "Química Orgânica Industrial", 75, "Operações Unitárias II"),
  course(46, 9, "Microbiologia Industrial", 90, "Operações Unitárias II + Fundamentos de Bioquímica"),
  course(47, 9, "Estágio I", 30, "Operações Unitárias II"),
  course(48, 10, "Estágio II", 180, "Estágio I + disciplinas industriais do 9º período"),
];

const officialElectives: Elective[] = [
  { id: "inorg3", name: "Química Inorgânica III", hours: 60, prerequisites: "Química Inorgânica II", area: "Inorgânica" },
  { id: "catalise", name: "Catálise Inorgânica", hours: 45, prerequisites: "Química dos Metais de Transição", area: "Inorgânica" },
  { id: "metfis-inorg", name: "Métodos Físicos em Química Inorgânica", hours: 60, prerequisites: "Química Inorgânica I", area: "Inorgânica" },
  { id: "biomoleculas", name: "Biomoléculas", hours: 45, prerequisites: "Química Orgânica I", area: "Bioquímica" },
  { id: "analitica-apl", name: "Química Analítica Aplicada", hours: 60, area: "Analítica" },
  { id: "top-analitica", name: "Tópicos em Química Analítica I", hours: 60, prerequisites: "Química Analítica Quantitativa", area: "Analítica" },
  { id: "eletroquimica", name: "Eletroquímica", hours: 60, prerequisites: "Física Fundamental I", area: "Físico-Química" },
  { id: "top-fq", name: "Tópicos em Físico-Química", hours: 30, prerequisites: "Físico-Química II", area: "Físico-Química" },
  { id: "polimeros", name: "Introdução à Ciência dos Polímeros", hours: 30, area: "Materiais" },
  { id: "fq-exp", name: "Físico-Química Experimental", hours: 60, prerequisites: "Físico-Química I", area: "Físico-Química" },
  { id: "top-org1", name: "Tópicos em Química Orgânica I", hours: 30, prerequisites: "Química Orgânica I", area: "Orgânica" },
  { id: "top-org2", name: "Tópicos em Química Orgânica II", hours: 60, prerequisites: "Química Orgânica II", area: "Orgânica" },
  { id: "separacao", name: "Métodos de Separação", hours: 60, prerequisites: "Química Orgânica III", area: "Orgânica" },
  { id: "estereo", name: "Estereoquímica Orgânica", hours: 30, prerequisites: "Química Orgânica III", area: "Orgânica" },
  { id: "alimentos", name: "Tecnologia de Alimentos", hours: 90, prerequisites: "Microbiologia Industrial", area: "Tecnológica" },
  { id: "historia", name: "História da Química", hours: 45, area: "Formação" },
  { id: "computacao", name: "Introdução à Computação", hours: 60, area: "Formação" },
  { id: "ecologia", name: "Ecologia Geral — Q", hours: 60, area: "Ambiental" },
  { id: "sintese", name: "Síntese Orgânica", hours: 60, prerequisites: "Química Orgânica II", area: "Orgânica" },
  { id: "metfis-org", name: "Métodos Físicos em Química Orgânica", hours: 60, prerequisites: "Química Orgânica II", area: "Orgânica" },
  { id: "org-exp2", name: "Química Orgânica Experimental II", hours: 60, prerequisites: "Química Orgânica II", area: "Orgânica" },
  { id: "patentes", name: "Tópicos de Química: Patentes, Marcas e Propriedade Intelectual", hours: 60, area: "Inovação" },
  { id: "empreendedorismo", name: "Empreendedorismo em Química", hours: 60, area: "Inovação" },
  { id: "seg-lab", name: "Tópicos em Segurança e Técnicas Básicas de Laboratório", hours: 60, area: "Laboratório" },
];

const priorityElectiveIds = ["ecologia", "computacao", "top-fq", "historia", "inorg3", "org-exp2"];

const activityOptions: ActivityOption[] = [
  { id: "monitoria", name: "Monitoria acadêmica", rule: "30h por semestre", icon: "⚗", color: "cyan" },
  { id: "ic", name: "Iniciação Científica", rule: "60h por semestre", icon: "⌬", color: "lime" },
  { id: "congresso", name: "Congresso", rule: "10h por congresso", icon: "✦", color: "violet" },
  { id: "minicurso", name: "Minicurso", rule: "Participante: metade da CH · Ministrante: CH integral", icon: "◫", color: "orange" },
  { id: "feira", name: "Feira de Ciências", rule: "Coordenador: 10h · Participante: 5h", icon: "✺", color: "pink" },
  { id: "estagio-extra", name: "Estágio extracurricular", rule: "50–100h = 20h · 100–200h = 40h · acima de 200h = 60h", icon: "◈", color: "cyan" },
  { id: "seminario", name: "Seminário", rule: "Ouvinte: 1h · Ministrante: 2h", icon: "◉", color: "lime" },
  { id: "extensao", name: "Curso de Extensão", rule: "Mesma regra do minicurso", icon: "⇄", color: "violet" },
  { id: "resumo", name: "Resumo publicado", rule: "5h por resumo", icon: "≋", color: "orange" },
  { id: "artigo", name: "Artigo publicado", rule: "15h por artigo", icon: "∑", color: "pink" },
];

const accelerationPlan: AccelerationTerm[] = [
  { term: "2026.2", title: "Abrir três cadeias de uma vez", objective: "Antecipar componentes de períodos avançados enquanto conclui a base matemática, geral e orgânica.", courses: ["Cálculo II", "Equações Diferenciais", "Química Geral II", "Estatística Aplicada", "Química Orgânica I", "Segurança do Trabalho", "Química dos Colóides e Superfície"], unlocks: "Fenômeno de Transporte, Orgânica II e avanço da cadeia industrial." },
  { term: "2027.1", title: "Consolidar Física e antecipar Transporte", objective: "Fechar a base do 3º período e puxar uma disciplina-chave do 6º.", courses: ["Física Fundamental I", "Física Experimental I/Q", "Química Analítica Qualitativa", "Elementos de Química Quântica", "Química Orgânica II", "Fenômeno de Transporte"], unlocks: "Física II, Físico-Química I, Orgânica III e parte da cadeia tecnológica." },
  { term: "2027.2", title: "Abrir Físico-Química e concluir Orgânica III", objective: "Avançar simultaneamente nas cadeias analítica, inorgânica, física e orgânica.", courses: ["Física Fundamental II", "Física Experimental II/Q", "Química Inorgânica I", "Físico-Química I", "Química Analítica Quantitativa", "Química Orgânica III", "Química e Educação Ambiental"], unlocks: "Físico-Química II, Instrumental I e a sequência orgânica industrial." },
  { term: "2028.1", title: "Atacar o núcleo tecnológico", objective: "Priorizar Operações Unitárias I e as disciplinas que alimentam o bloco industrial.", courses: ["Físico-Química II", "Mineralogia", "Química Inorgânica II", "Mecânica dos Fluidos", "Química Instrumental I", "Operações Unitárias I", "Introdução à Economia", "Cinética Química Industrial"], unlocks: "Operações Unitárias II e Estágio I." },
  { term: "2028.2", title: "Concluir Operações II e iniciar estágio", objective: "Fechar a maior parte do núcleo industrial antes do último ano.", courses: ["Química dos Metais de Transição", "Química Instrumental II", "Operações Unitárias II", "Estágio I", "Química Orgânica Industrial", "Microbiologia Industrial"], unlocks: "Estágio II e reta final da integralização." },
  { term: "2029.1", title: "Limpar as pendências finais", objective: "Concluir as últimas obrigatórias e encaixar optativas ou ajustes de oferta.", courses: ["Transmissão de Calor", "Química Inorgânica Industrial", "DCO0029 · Desenho Técnico Industrial · 60h", "Optativas e ajustes"], unlocks: "Semestre final dedicado ao estágio.", note: "Desenho Técnico Industrial foi movida para cá após o conflito de horário em 2026.2." },
  { term: "2029.2", title: "Integralização final", objective: "Encerrar o curso com foco total na experiência profissional.", courses: ["Estágio II"], unlocks: "Bacharelado concluído e transição imediata para a pós-graduação." },
];

const starterGoals: Goal[] = [
  { id: 1, label: "Manter o IRA acima de 8,0", done: false },
  { id: 2, label: "Conquistar o 1º projeto de pesquisa", done: false },
  { id: 3, label: "Conquistar o 2º projeto de pesquisa", done: false },
  { id: 4, label: "Realizar a 1ª monitoria", done: false },
  { id: 5, label: "Realizar a 2ª monitoria", done: false },
];

const scheduleKey = (term: string, courseName: string) => `${term}::${courseName}`;
const m = (day: Weekday, start: string, end: string): Meeting => ({ day, start, end });
const initialSchedules: ScheduleMap = {
  [scheduleKey("2026.2", "Cálculo II")]: [m("Segunda", "08:00", "10:00"), m("Quarta", "08:00", "10:00")],
  [scheduleKey("2026.2", "Equações Diferenciais")]: [m("Terça", "08:00", "10:00"), m("Quinta", "08:00", "10:00")],
  [scheduleKey("2026.2", "Química Geral II")]: [m("Terça", "10:00", "12:00"), m("Quinta", "10:00", "12:00")],
  [scheduleKey("2026.2", "Estatística Aplicada")]: [m("Sexta", "08:00", "10:00")],
  [scheduleKey("2026.2", "Química Orgânica I")]: [m("Segunda", "10:00", "12:00"), m("Quarta", "10:00", "12:00"), m("Sexta", "10:00", "12:00")],
  [scheduleKey("2026.2", "Segurança do Trabalho")]: [m("Sexta", "14:00", "16:00")],
  [scheduleKey("2026.2", "Química dos Colóides e Superfície")]: [m("Terça", "14:00", "15:00"), m("Quinta", "14:00", "16:00")],
  [scheduleKey("2027.1", "Analítica Qualitativa")]: [m("Terça", "08:00", "10:00"), m("Quinta", "08:00", "12:00")],
  [scheduleKey("2027.1", "Fenômeno de Transporte")]: [m("Sexta", "09:00", "12:00")],
  [scheduleKey("2027.2", "Física Fundamental II")]: [m("Segunda", "10:00", "12:00"), m("Quarta", "10:00", "12:00")],
  [scheduleKey("2027.2", "Física Experimental II")]: [m("Quinta", "14:00", "16:00")],
  [scheduleKey("2027.2", "Inorgânica I")]: [m("Segunda", "08:00", "10:00"), m("Quarta", "08:00", "10:00")],
  [scheduleKey("2027.2", "Físico-Química I")]: [m("Segunda", "14:00", "16:00"), m("Quarta", "14:00", "16:00")],
  [scheduleKey("2027.2", "Analítica Quantitativa")]: [m("Terça", "14:00", "18:00"), m("Quinta", "14:00", "18:00")],
  [scheduleKey("2027.2", "Orgânica III")]: [m("Terça", "10:00", "12:00"), m("Quinta", "10:00", "12:00")],
  [scheduleKey("2027.2", "Educação Ambiental")]: [m("Sexta", "18:00", "20:00")],
  [scheduleKey("2028.1", "Físico-Química II")]: [m("Segunda", "08:00", "10:00"), m("Quarta", "08:00", "10:00")],
  [scheduleKey("2028.1", "Mineralogia")]: [m("Quarta", "15:00", "17:00"), m("Sexta", "15:00", "17:00")],
  [scheduleKey("2028.1", "Química Inorgânica II")]: [m("Terça", "08:00", "10:00"), m("Quinta", "08:00", "10:00")],
  [scheduleKey("2028.2", "Química dos Metais de Transição")]: [m("Terça", "14:00", "16:00"), m("Quinta", "14:00", "17:00")],
  [scheduleKey("2028.2", "Química Instrumental II")]: [m("Sexta", "14:00", "18:00")],
  [scheduleKey("2028.2", "Operações Unitárias II")]: [m("Segunda", "14:00", "16:00"), m("Quarta", "14:00", "16:00")],
  [scheduleKey("2028.2", "Estágio I")]: [m("Sábado", "08:00", "10:00")],
  [scheduleKey("2029.2", "Estágio II")]: [m("Sábado", "08:00", "12:00")],
};

const masterCourses: PostgradCourse[] = [
  { name: "Metodologia Científica", hours: 30, kind: "Obrigatória" },
  { name: "Bioestatística", hours: 30, kind: "Obrigatória" },
  { name: "Pesquisa e Desenvolvimento de Medicamentos", hours: 60, kind: "Obrigatória" },
  { name: "Atividade de Pesquisa I", hours: 30, kind: "Obrigatória" },
  { name: "Mecanismos Gerais da Ação e Metabolismo de Fármacos", hours: 60, kind: "Obrigatória" },
  { name: "Seminários", hours: 15, kind: "Obrigatória" },
  { name: "Farmacologia de Produtos Naturais", hours: 45, kind: "Possível", priority: true },
  { name: "Métodos de Avaliação Toxicológica", hours: 45, kind: "Possível", priority: true },
  { name: "Bioética e Instrumentação em Farmacologia", hours: 30, kind: "Possível", priority: true },
  { name: "EtnoFarmacologia", hours: 30, kind: "Possível", priority: true },
  { name: "Farmacogenômica", hours: 30, kind: "Possível" },
  { name: "Fisiologia de Órgãos e Sistemas", hours: 60, kind: "Possível" },
  { name: "Avanços em Biologia Celular e Molecular", hours: 45, kind: "Possível" },
  { name: "Cancerologia Experimental", hours: 45, kind: "Possível" },
];

const doctorateCourses: PostgradCourse[] = [
  { code: "CPPGFARM/CCS001", name: "Ética no Uso de Animais em Pesquisa e Desenho Experimental", hours: 30, kind: "Obrigatória" },
  { code: "CPPGFARM/CCS002", name: "Tópicos Avançados em Farmacologia", hours: 60, kind: "Obrigatória" },
  { code: "PPGFARM002", name: "Farmacologia Geral", hours: 30, kind: "Obrigatória" },
  { code: "PPGFARM003", name: "Farmacologia Autonômica", hours: 30, kind: "Obrigatória" },
  { code: "PPGFARM001", name: "Farmacologia da Dor", hours: 30, kind: "Possível", priority: true },
  { code: "PPGFARM004", name: "Farmacologia da Inflamação", hours: 30, kind: "Possível", priority: true },
  { code: "CPPGFARM/CCS006", name: "Imunofarmacologia", hours: 30, kind: "Possível", priority: true },
  { code: "CPPGFARM/CCS004", name: "Toxicologia Pré-clínica de Substâncias Bioativas", hours: 30, kind: "Possível", priority: true },
  { code: "CPPGFARM/CCS005", name: "Modelos Experimentais para Estudos Fisiofarmacológicos", hours: 30, kind: "Possível", priority: true },
  { code: "PPGFARM/CCS003", name: "Tópicos Especiais em Bioquímica e Biologia Molecular", hours: 30, kind: "Possível" },
  { code: "PPGFARM025", name: "Fisiofarmacologia do Sistema Nitrérgico", hours: 30, kind: "Possível" },
  { code: "PPGFARM026", name: "Endocrinologia e Metabolismo I", hours: 45, kind: "Possível" },
];

const roadmap = [
  { date: "2026 — 2029", eyebrow: "Fundação", title: "Bacharelado em Química", copy: "Concluir a graduação em rota acelerada, construir experiência em laboratório e aproximar o currículo da farmacologia.", tag: "agora" },
  { date: "2030 — 2032", eyebrow: "Especialização", title: "Mestrado em Ciências Farmacêuticas", copy: "Prioridade: Farmacologia e Toxicologia de Produtos Naturais e Sintéticos.", tag: "próximo" },
  { date: "2032 +", eyebrow: "Profundidade", title: "Doutorado em Farmacologia", copy: "Investigar mecanismos de ação, farmacodinâmica e inflamação com identidade científica própria.", tag: "destino" },
];

const statusOrder: CourseStatus[] = ["Planejada", "Cursando", "Concluída", "Dispensada"];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Home() {
  const [disciplines, setDisciplines] = useState(curriculum2012);
  const [goals, setGoals] = useState(starterGoals);
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);
  const [activityHours, setActivityHours] = useState<Record<string, number>>({});
  const [schedules, setSchedules] = useState<ScheduleMap>(initialSchedules);
  const [activeRoadmap, setActiveRoadmap] = useState(0);
  const [activeAcceleration, setActiveAcceleration] = useState(0);
  const [activePeriod, setActivePeriod] = useState<number | "all">(1);
  const [curriculumView, setCurriculumView] = useState<"mandatory" | "electives" | "activities">("mandatory");
  const [courseSearch, setCourseSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newDiscipline, setNewDiscipline] = useState("");
  const [newTerm, setNewTerm] = useState("2026.2");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedCurriculum = window.localStorage.getItem("atlas-curriculum-2012-v2");
    if (storedCurriculum) {
      setDisciplines(JSON.parse(storedCurriculum));
    } else {
      const priorCurriculum = window.localStorage.getItem("atlas-curriculum-2012-v1");
      if (priorCurriculum) {
        const migrated = (JSON.parse(priorCurriculum) as Discipline[]).map((item) => item.id === 33 ? { ...item, status: "Planejada" as CourseStatus, term: "2029.1" } : item);
        setDisciplines(migrated);
      }
      const legacy = !priorCurriculum ? window.localStorage.getItem("atlas-disciplines") : null;
      if (legacy) {
        const previous = JSON.parse(legacy) as Array<Partial<Discipline> & { name: string; status: CourseStatus; period?: string }>;
        const merged = curriculum2012.map((item) => {
          const match = previous.find((old) => {
            const oldName = normalize(old.name);
            const newName = normalize(item.name);
            return oldName === newName || newName.includes(oldName) || oldName.includes(newName);
          });
          return match ? { ...item, status: match.status, term: match.term ?? match.period } : item;
        });
        setDisciplines(merged);
      }
    }
    const storedGoals = window.localStorage.getItem("atlas-goals-v2");
    if (storedGoals) setGoals(JSON.parse(storedGoals));
    const storedElectives = window.localStorage.getItem("atlas-electives-2012");
    if (storedElectives) setSelectedElectives(JSON.parse(storedElectives));
    const storedActivities = window.localStorage.getItem("atlas-activities-2012");
    if (storedActivities) setActivityHours(JSON.parse(storedActivities));
    const storedSchedules = window.localStorage.getItem("atlas-schedules-v1");
    if (storedSchedules) setSchedules({ ...initialSchedules, ...JSON.parse(storedSchedules) });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("atlas-curriculum-2012-v2", JSON.stringify(disciplines));
  }, [disciplines, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("atlas-goals-v2", JSON.stringify(goals));
  }, [goals, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("atlas-electives-2012", JSON.stringify(selectedElectives));
  }, [selectedElectives, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("atlas-activities-2012", JSON.stringify(activityHours));
  }, [activityHours, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("atlas-schedules-v1", JSON.stringify(schedules));
  }, [schedules, hydrated]);

  const completedCourses = disciplines.filter((item) => item.status === "Concluída" || item.status === "Dispensada");
  const completedHours = completedCourses.reduce((total, item) => total + item.hours, 0);
  const progress = Math.round((completedHours / 2955) * 100);
  const currentCourses = disciplines;
  const selectedElectiveHours = officialElectives.filter((item) => selectedElectives.includes(item.id)).reduce((total, item) => total + item.hours, 0);
  const totalActivityHours = Math.min(Object.values(activityHours).reduce((total, hours) => total + hours, 0), 200);
  const activeTermPlan = accelerationPlan[activeAcceleration];
  const weekDays: Weekday[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const activeWeek = weekDays.map((day) => ({
    day,
    entries: activeTermPlan.courses.flatMap((courseName) => (schedules[scheduleKey(activeTermPlan.term, courseName)] ?? [])
      .filter((meeting) => meeting.day === day)
      .map((meeting) => ({ courseName, ...meeting })))
      .sort((a, b) => a.start.localeCompare(b.start)),
  }));
  const unscheduledCourses = activeTermPlan.courses.filter((courseName) => !(schedules[scheduleKey(activeTermPlan.term, courseName)] ?? []).length);
  const weekendEntries = activeTermPlan.courses.flatMap((courseName) => (schedules[scheduleKey(activeTermPlan.term, courseName)] ?? [])
    .filter((meeting) => meeting.day === "Sábado")
    .map((meeting) => ({ courseName, ...meeting })));

  const visibleMandatory = useMemo(() => {
    const query = normalize(courseSearch.trim());
    return disciplines.filter((item) => {
      if (item.custom) return false;
      const periodMatches = activePeriod === "all" || item.curriculumPeriod === activePeriod;
      const searchMatches = !query || normalize(`${item.name} ${item.prerequisites ?? ""}`).includes(query);
      return periodMatches && searchMatches;
    });
  }, [activePeriod, courseSearch, disciplines]);

  const visibleElectives = useMemo(() => {
    const query = normalize(courseSearch.trim());
    return officialElectives.filter((item) => !query || normalize(`${item.name} ${item.area} ${item.prerequisites ?? ""}`).includes(query));
  }, [courseSearch]);

  function cycleStatus(id: number) {
    setDisciplines((current) => current.map((item) => item.id === id ? { ...item, status: statusOrder[(statusOrder.indexOf(item.status) + 1) % statusOrder.length] } : item));
  }

  function addDiscipline(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newDiscipline.trim();
    if (!name) return;
    setDisciplines((current) => [...current, { id: Date.now(), name, curriculumPeriod: 0, hours: 0, term: newTerm.trim() || "A definir", status: "Planejada", tone: tones[current.length % tones.length], custom: true }]);
    setNewDiscipline("");
    setShowAdd(false);
  }

  function toggleGoal(id: number) {
    setGoals((current) => current.map((goal) => goal.id === id ? { ...goal, done: !goal.done } : goal));
  }

  function toggleElective(id: string) {
    setSelectedElectives((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function updateActivity(id: string, value: number) {
    setActivityHours((current) => ({ ...current, [id]: Math.max(0, Math.min(60, Number.isFinite(value) ? value : 0)) }));
  }

  function addMeeting(term: string, courseName: string) {
    const key = scheduleKey(term, courseName);
    setSchedules((current) => ({ ...current, [key]: [...(current[key] ?? []), m("Segunda", "08:00", "10:00")] }));
  }

  function updateMeeting(term: string, courseName: string, index: number, patch: Partial<Meeting>) {
    const key = scheduleKey(term, courseName);
    setSchedules((current) => ({ ...current, [key]: (current[key] ?? []).map((meeting, meetingIndex) => meetingIndex === index ? { ...meeting, ...patch } : meeting) }));
  }

  function removeMeeting(term: string, courseName: string, index: number) {
    const key = scheduleKey(term, courseName);
    setSchedules((current) => ({ ...current, [key]: (current[key] ?? []).filter((_, meetingIndex) => meetingIndex !== index) }));
  }

  return (
    <main>
      <nav className="topbar" aria-label="Navegação principal">
        <a className="brand" href="#inicio" aria-label="Atlas Acadêmico, início"><span className="brand-mark">Q</span><span>ATLAS ACADÊMICO</span></a>
        <div className="nav-meta"><span className="private-pill"><i /> ACESSO PRIVADO</span><a href="#matriz">Grade + horas</a><a href="#aceleracao">Plano acelerado</a><a href="#laboratorio">Laboratório</a><a href="#rota">Minha rota</a></div>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="kicker"><span>01</span> PLANO DE CARREIRA CIENTÍFICA</p>
          <h1>O futuro começa<br /><em>no laboratório do presente.</em></h1>
          <p className="hero-lead">Da graduação em Química à Farmacologia: cada aula, pesquisa e escolha transforma potência em realidade.</p>
        </div>
        <div className="atom"><div className="orbit orbit-a" aria-hidden="true"><span /></div><div className="orbit orbit-b" aria-hidden="true"><span /></div><div className="orbit orbit-c" aria-hidden="true"><span /></div><div className="nucleus"><small>LUCAS</small><strong>CROWLEY VAZ</strong><IraBadge /></div><div className="flask flask-a" aria-hidden="true"><i /></div><div className="flask flask-b" aria-hidden="true"><i /></div><div className="test-tubes" aria-hidden="true"><i /><i /><i /></div></div>
      </section>

      <section className="dashboard" aria-labelledby="painel-title">
        <div className="section-heading">
          <div><p className="kicker"><span>02</span> PAINEL DE BANCADA</p><h2 id="painel-title">O semestre, em movimento.</h2></div>
          <p>Clique no status de cada disciplina para atualizar o progresso. As alterações ficam salvas neste navegador.</p>
        </div>

        <div className="dashboard-grid">
          <article className="progress-card">
            <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><div><strong>{progress}%</strong><span>da carga curricular</span></div></div>
            <div className="progress-copy">
              <p className="overline">VISÃO RÁPIDA</p><h3>{completedCourses.length} componentes integralizados</h3>
              <p>A grade completa agora está no mapa — 8 períodos planejados para transformar consistência em formação científica.</p>
              <div className="mini-stats"><span><b>{disciplines.filter((d) => d.status === "Cursando").length}</b> cursando</span><span><b>{completedHours}h</b> integralizadas</span><span><b>2029.2</b> conclusão-alvo</span></div>
            </div>
          </article>

          <div className="discipline-list">
            {currentCourses.map((discipline) => (
              <article className={`discipline ${discipline.tone}`} key={discipline.id}>
                <span className="discipline-code">{discipline.term ?? `${discipline.curriculumPeriod}º período`} · {discipline.hours}h</span>
                <h3>{discipline.name}</h3>
                <button onClick={() => cycleStatus(discipline.id)} className={`status status-${normalize(discipline.status).replace(" ", "-")}`}><span /> {discipline.status}</button>
              </article>
            ))}
            {showAdd ? (
              <form className="add-discipline-form" onSubmit={addDiscipline}>
                <label htmlFor="discipline-name">Nova disciplina</label><input id="discipline-name" value={newDiscipline} onChange={(event) => setNewDiscipline(event.target.value)} placeholder="Ex.: Farmacologia" autoFocus />
                <label htmlFor="discipline-term">Semestre</label><input id="discipline-term" value={newTerm} onChange={(event) => setNewTerm(event.target.value)} />
                <div><button type="button" onClick={() => setShowAdd(false)}>Cancelar</button><button type="submit">Adicionar</button></div>
              </form>
            ) : (
              <button className="add-discipline" onClick={() => setShowAdd(true)}><span>+</span><div><strong>Adicionar disciplina livre</strong><small>Inclua eletivas externas ou componentes especiais.</small></div></button>
            )}
          </div>
        </div>

        <div className="goals-panel">
          <div className="goals-intro"><p className="overline">METAS DE REAÇÃO</p><h3>O que precisa acontecer a seguir?</h3><p>Marque os avanços conforme eles deixarem de ser planos e virarem evidências.</p></div>
          <div className="goals-list">
            {goals.map((goal) => <label className={goal.done ? "goal done" : "goal"} key={goal.id}><input type="checkbox" checked={goal.done} onChange={() => toggleGoal(goal.id)} /><span className="goal-check">✓</span><span>{goal.label}</span></label>)}
          </div>
          <div className="goals-score"><strong>{goals.filter((goal) => goal.done).length}/{goals.length}</strong><span>metas avançadas</span></div>
        </div>
        <p className="alchemy-note"><span>✦</span> “A natureza revela suas virtudes ocultas a quem aprende a observar.” <small>— inspiração na filosofia natural de Cornelius Agrippa</small></p>

        <div className="curriculum-panel" id="matriz">
          <div className="curriculum-heading">
            <div><p className="overline">MATRIZ CURRICULAR · UFPI</p><h3>A graduação inteira, período por período.</h3><p>Estrutura do Bacharelado com Atribuições Tecnológicas criada em 2012 no SIGAA.</p></div>
            <div className="curriculum-facts"><span><b>8</b> períodos planejados</span><span><b>2.955h</b> curso</span><span><b>120h</b> optativas</span><span><b>200h</b> atividades</span></div>
          </div>

          <div className="curriculum-toolbar">
            <div className="view-tabs" role="tablist" aria-label="Tipo de componente">
              <button role="tab" aria-selected={curriculumView === "mandatory"} className={curriculumView === "mandatory" ? "active" : ""} onClick={() => setCurriculumView("mandatory")}>Grade obrigatória</button>
              <button role="tab" aria-selected={curriculumView === "electives"} className={curriculumView === "electives" ? "active" : ""} onClick={() => setCurriculumView("electives")}>Catálogo de optativas</button>
              <button role="tab" aria-selected={curriculumView === "activities"} className={curriculumView === "activities" ? "active" : ""} onClick={() => setCurriculumView("activities")}>Atividades · 200h</button>
            </div>
            {curriculumView !== "activities" && <label className="course-search"><span>⌕</span><input value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Buscar disciplina ou pré-requisito" aria-label="Buscar disciplina ou pré-requisito" /></label>}
          </div>

          {curriculumView === "mandatory" ? (
            <>
              <div className="period-filter" aria-label="Filtrar por período">
                <button className={activePeriod === "all" ? "active" : ""} onClick={() => setActivePeriod("all")}>Todas</button>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((period) => <button key={period} className={activePeriod === period ? "active" : ""} onClick={() => setActivePeriod(period)}>{period}º</button>)}
              </div>
              <div className="course-table">
                <div className="course-table-head"><span>Componente</span><span>Pré-requisito</span><span>CH</span><span>Status</span></div>
                {visibleMandatory.map((item) => (
                  <article className="course-row" key={item.id}>
                    <div><span className="period-dot">{item.curriculumPeriod}º</span><strong>{item.name}</strong></div>
                    <p>{item.prerequisites || "—"}</p><b>{item.hours}h</b>
                    <button onClick={() => cycleStatus(item.id)} className={`status status-${normalize(item.status).replace(" ", "-")}`}><span /> {item.status}</button>
                  </article>
                ))}
                {visibleMandatory.length === 0 && <p className="empty-state">Nenhuma disciplina encontrada.</p>}
              </div>
            </>
          ) : curriculumView === "electives" ? (
            <>
              <div className="elective-progress">
                <div><span>Plano de optativas</span><strong>{selectedElectiveHours}h / 120h mínimas</strong></div>
                <div className="elective-bar"><i style={{ width: `${Math.min((selectedElectiveHours / 120) * 100, 100)}%` }} /></div>
              </div>
              <div className="priority-note"><span>6 prioridades recuperadas</span><p>Estas foram as optativas que você já havia escolhido. O destaque é uma lista de interesse; use “Adicionar ao plano” para fechar as 120h que realmente cursará.</p></div>
              <div className="elective-grid">
                {visibleElectives.map((item) => (
                  <button key={item.id} className={`${selectedElectives.includes(item.id) ? "elective-card selected" : "elective-card"} ${priorityElectiveIds.includes(item.id) ? "priority" : ""}`} onClick={() => toggleElective(item.id)} aria-pressed={selectedElectives.includes(item.id)}>
                    <span>{item.area} · {item.hours}h {priorityElectiveIds.includes(item.id) && <b>PRIORIDADE</b>}</span><strong>{item.name}</strong><small>{item.prerequisites ? `Pré: ${item.prerequisites}` : "Sem pré-requisito indicado"}</small><i>{selectedElectives.includes(item.id) ? "No meu plano ✓" : "+ Adicionar ao plano"}</i>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="activities-view">
              <div className="activities-meter">
                <div className="activity-vessel"><i style={{ height: `${Math.min((totalActivityHours / 200) * 100, 100)}%` }} /><strong>{totalActivityHours}h</strong><span>de 200h</span></div>
                <div><p className="overline">HORAS ACADÊMICO-CIENTÍFICO-CULTURAIS</p><h4>Complete o frasco ao longo do curso.</h4><p>O PPC limita cada tipo de atividade a 60h. Informe apenas as horas que pretende submeter ou que já foram validadas.</p></div>
              </div>
              <div className="activity-grid">
                {activityOptions.map((item) => (
                  <article className={`activity-card ${item.color}`} key={item.id}>
                    <span className="activity-icon">{item.icon}</span><div><h5>{item.name}</h5><p>{item.rule}</p></div>
                    <label><span>Horas</span><input type="number" min="0" max="60" value={activityHours[item.id] ?? 0} onChange={(event) => updateActivity(item.id, Number(event.target.value))} aria-label={`Horas de ${item.name}`} /><b>/ 60</b></label>
                  </article>
                ))}
              </div>
              <div className="activity-caveat"><strong>Como comprovar?</strong><p>O PPC de 2012 define as equivalências, mas não lista os documentos. Guarde certificados, declarações e comprovantes; a validação final cabe à coordenação.</p></div>
            </div>
          )}

          <div className="source-note"><span>Fonte curricular</span><p>PPC/UFPI — Bacharelado em Química com Atribuições Tecnológicas; matriz, optativas e regras das 200h.</p><a href="https://sigaa.ufpi.br/sigaa/verProducao?idProducao=341095&key=ee4dbbdbc3bd3556766c398341973ac5" target="_blank" rel="noreferrer">Abrir PPC oficial ↗</a></div>
        </div>

        <div className="acceleration-panel" id="aceleracao">
          <div className="acceleration-heading">
            <div><p className="overline">PROJETO PRÓTON · ROTA ACELERADA</p><h3>Antecipar agora para concluir em 2029.2.</h3></div>
            <div className="time-gain"><strong>≈ 1 ano</strong><span>de antecipação</span></div>
          </div>
          <p className="acceleration-intro">O plano prioriza pré-requisitos e o caminho crítico. A execução depende da oferta real do SIGAA e de não haver choque de horários.</p>
          <div className="acceleration-tabs" role="tablist" aria-label="Semestres do plano acelerado">
            {accelerationPlan.map((semester, index) => <button key={semester.term} role="tab" aria-selected={activeAcceleration === index} className={activeAcceleration === index ? "active" : ""} onClick={() => setActiveAcceleration(index)}><span>{semester.term}</span><small>{semester.courses.length} {semester.courses.length === 1 ? "componente" : "componentes"}</small></button>)}
          </div>
          <article className="acceleration-detail">
            <div className="acceleration-copy"><span>{accelerationPlan[activeAcceleration].term}</span><h4>{accelerationPlan[activeAcceleration].title}</h4><p>{accelerationPlan[activeAcceleration].objective}</p></div>
            <div className="semester-courses">{accelerationPlan[activeAcceleration].courses.map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>)}</div>
            <div className="unlock-card"><span>DESBLOQUEIA</span><strong>{accelerationPlan[activeAcceleration].unlocks}</strong>{accelerationPlan[activeAcceleration].note && <p>{accelerationPlan[activeAcceleration].note}</p>}</div>
          </article>
          <section className="schedule-lab" aria-labelledby="schedule-title">
            <div className="schedule-heading"><div><span className="overline">AGENDA EDITÁVEL · {activeTermPlan.term}</span><h4 id="schedule-title">Horários do período</h4></div><p>Edite os encontros ou adicione os horários quando as novas turmas forem publicadas.</p></div>
            <div className="schedule-editor">
              {activeTermPlan.courses.map((courseName) => {
                const meetings = schedules[scheduleKey(activeTermPlan.term, courseName)] ?? [];
                return <article className="schedule-course" key={courseName}>
                  <div className="schedule-course-title"><strong>{courseName}</strong><button onClick={() => addMeeting(activeTermPlan.term, courseName)}>+ horário</button></div>
                  {meetings.length ? <div className="meeting-list">{meetings.map((meeting, index) => <div className="meeting-row" key={`${courseName}-${index}`}>
                    <select value={meeting.day} onChange={(event) => updateMeeting(activeTermPlan.term, courseName, index, { day: event.target.value as Weekday })} aria-label={`Dia de ${courseName}`}>
                      {[...weekDays, "Sábado" as Weekday].map((day) => <option key={day}>{day}</option>)}
                    </select>
                    <input type="time" value={meeting.start} onChange={(event) => updateMeeting(activeTermPlan.term, courseName, index, { start: event.target.value })} aria-label={`Início de ${courseName}`} />
                    <span>—</span>
                    <input type="time" value={meeting.end} onChange={(event) => updateMeeting(activeTermPlan.term, courseName, index, { end: event.target.value })} aria-label={`Fim de ${courseName}`} />
                    <button className="remove-meeting" onClick={() => removeMeeting(activeTermPlan.term, courseName, index)} aria-label={`Remover horário de ${courseName}`}>×</button>
                  </div>)}</div> : <span className="undefined-time">Sem horário definido ainda</span>}
                </article>;
              })}
            </div>
            <div className="weekly-wrap">
              <div className="weekly-heading"><span>SEMANA · {activeTermPlan.term}</span><small>Somente horários já definidos</small></div>
              <div className="weekly-grid">
                {activeWeek.map(({ day, entries }) => <div className="week-day" key={day}><strong>{day}</strong><div>{entries.length ? entries.map((entry) => <article key={`${entry.courseName}-${entry.start}`}><time>{entry.start}–{entry.end}</time><span>{entry.courseName}</span></article>) : <em>livre</em>}</div></div>)}
              </div>
              {unscheduledCourses.length > 0 && <div className="unscheduled-strip"><strong>Sem horário definido ainda</strong><span>{unscheduledCourses.join(" · ")}</span></div>}
              {weekendEntries.length > 0 && <div className="weekend-strip"><strong>Fora da grade Seg–Sex</strong><span>{weekendEntries.map((entry) => `${entry.courseName}: sábado ${entry.start}–${entry.end}`).join(" · ")}</span></div>}
            </div>
            <Gradebook terms={accelerationPlan.map(({ term, courses }) => ({ term, courses }))} />
          </section>
          <div className="critical-path"><span>Caminho crítico</span><p>Cálculo II → Equações Diferenciais → Fenômeno de Transporte → Operações Unitárias I → Operações Unitárias II → Estágio I → Estágio II</p></div>
        </div>
      </section>

      <ChemistryLab />

      <section className="route" id="rota" aria-labelledby="rota-title">
        <div className="section-heading inverse"><div><p className="kicker"><span>04</span> ROTA DE SÍNTESE</p><h2 id="rota-title">Química → Farmacologia → Docência.</h2></div><p>Selecione uma etapa para abrir o foco estratégico.</p></div>
        <div className="roadmap-tabs" role="tablist" aria-label="Etapas da formação">
          {roadmap.map((stage, index) => <button key={stage.title} className={activeRoadmap === index ? "active" : ""} onClick={() => setActiveRoadmap(index)} role="tab" aria-selected={activeRoadmap === index}><span>{stage.date}</span>{stage.title}</button>)}
        </div>
        <article className="roadmap-detail"><div className="stage-index">0{activeRoadmap + 1}</div><div><p className="overline">{roadmap[activeRoadmap].eyebrow} · {roadmap[activeRoadmap].tag}</p><h3>{roadmap[activeRoadmap].title}</h3><p>{roadmap[activeRoadmap].copy}</p></div><div className="route-target"><span>OBJETIVO FINAL</span><strong>Professor universitário<br />+ pesquisador</strong></div></article>
        <div className="postgrad-lab">
          <div className="postgrad-heading"><div><p className="overline">PRÓXIMAS TRANSMUTAÇÕES</p><h3>As disciplinas depois da graduação.</h3></div><p>Obrigatórias oficiais e possibilidades coerentes com as duas linhas de pesquisa escolhidas.</p></div>
          <div className="postgrad-columns">
            <article className="postgrad-program master">
              <header><span>2030 — 2032</span><h4>Mestrado em Ciências Farmacêuticas</h4><p>Farmacologia e Toxicologia de Produtos Naturais e Sintéticos</p></header>
              <div className="postgrad-list">{masterCourses.map((item) => <div className={item.priority ? "postgrad-course priority" : "postgrad-course"} key={item.name}><span>{item.kind}{item.priority ? " · foco" : ""}</span><strong>{item.name}</strong><b>{item.hours}h</b></div>)}</div>
              <a href="https://sigaa.ufpi.br/sigaa/public/programa/curriculo.jsf?id=606&lc=pt_BR" target="_blank" rel="noreferrer">Grade oficial do PPGCF ↗</a>
            </article>
            <article className="postgrad-program doctorate">
              <header><span>2032 +</span><h4>Doutorado em Farmacologia</h4><p>Farmacologia da Inflamação e da Dor</p></header>
              <div className="postgrad-list">{doctorateCourses.map((item) => <div className={item.priority ? "postgrad-course priority" : "postgrad-course"} key={item.name}><span>{item.kind}{item.priority ? " · foco" : ""}</span><strong>{item.name}</strong><b>{item.hours}h</b></div>)}</div>
              <a href="https://sigaa.ufpi.br/sigaa/public/programa/secao_extra.jsf?extra=569754010&id=608&lc=pt_BR" target="_blank" rel="noreferrer">Disciplinas oficiais do PPGFarm ↗</a>
            </article>
          </div>
          <blockquote>“A obra começa quando a intenção aceita a disciplina do tempo.” <span>— máxima alquímica para esta rota</span></blockquote>
        </div>
      </section>

      <footer><span>ATLAS Q. / LUCAS CROWLEY VAZ</span><p>Conhecimento é matéria; constância é o fogo que a transforma.</p><a href="#inicio">Voltar ao topo ↑</a></footer>
    </main>
  );
}
