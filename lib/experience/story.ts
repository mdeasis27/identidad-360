import type { Heading } from "@/design-system/demo/project-story";

type Tally = { mismatched: number; waiting: number };

export interface IdentidadStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (seats: number) => string; yes: string; no: string; seatsLabel: string; seatsHint: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; withCheck: string; withoutCheck: string; mismatched: string; waiting: (n: number) => string; sentence: (withCheck: Tally, withoutCheck: Tally) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; tapeLabel: (n: number) => string; tape: { served: string; rerouted: string; lost: string }; resolvedOf: (n: number) => string; puzzle: { registry: string; document: string; fits: string; board: string; analysts: (n: number) => string; tomorrow: string; halfPiece: string; batch: (from: number, to: number) => string; summary: (assembled: number, reviewed: number, waiting: number, total: number) => string } };
}

export const STORY: Record<"en" | "es", IdentidadStory> = {
  en: {
    name: "Identity evidence",
    oneLiner: "Builds a customer profile from several sources and sets aside the ones that don't match.",
    chips: ["Identity", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "Picture a puzzle made from pieces of several boxes. Most pieces fit. When two of them clearly don't, you don't force them together: you set them aside for someone to look at.",
        "Identity evidence assembles a customer profile from a public registry and an ID document, and cross-checks them. A profile whose sources contradict each other goes to an analyst. If no analyst is free today, it waits until tomorrow.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the pieces", means: "the registry and the document" },
        { term: "two pieces that don't fit", means: "a conflict between sources" },
        { term: "setting them aside", means: "sending the profile to an analyst" },
        { term: "forcing them together", means: "assembling without the cross-check" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Twenty people apply for credit today. For six of them, the registry and the document say different things.",
      question: (k) => `Before you run it, place a bet: with ${k === 1 ? "1 analyst" : `${k} analysts`} today, are at least 17 of the 20 profiles resolved today?`,
      yes: "Yes, 17 or more",
      no: "No, fewer than 17",
      seatsLabel: "Analysts available today",
      seatsHint: "Each analyst reviews one conflicting profile per day.",
      note: "Each square is one applicant. Blue was reviewed by an analyst today. Red is a profile with a conflict that has to wait until tomorrow.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The profiles could not be assembled.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "With the cross-check", accent: "or without it" },
      lead: "Same twenty applicants and the same analysts. Without the cross-check, nothing waits, because nothing is caught.",
      withCheck: "With the cross-check",
      withoutCheck: "Without it",
      mismatched: "profiles built from pieces that don't match",
      waiting: (n) => (n === 1 ? "1 waits until tomorrow" : `${n} wait until tomorrow`),
      sentence: (withCheck, without) => {
        if (without.mismatched === withCheck.mismatched) return "This time both settings built the same profiles.";
        const waits = withCheck.waiting === 0 ? "nobody had to wait" : withCheck.waiting === 1 ? "one profile waits until tomorrow" : `${withCheck.waiting} profiles wait until tomorrow`;
        return `With the cross-check, ${waits}. Without it, everything looks done today, and ${without.mismatched === 1 ? "one profile was" : `${without.mismatched} profiles were`} built from pieces that don't match.`;
      },
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When a credit team pulls identity data from more than one source and a wrong profile costs more than a day of waiting.",
      notLabel: "Not needed",
      not: "When there is a single trusted source and nothing to compare it with.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I made the tradeoff visible. Catching conflicts creates work, and the analyst count decides how much of it gets done today. Skipping the check makes the queue look empty, and the cost shows up later as profiles nobody should trust.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "The twenty applicants are a fixed fictional set. Every third one has a conflict; two others lack the document, which lowers coverage to 50% without sending them to review.",
        "Each profile goes through the same assembly function the demo used before. Conflicts take analyst seats in order.",
        "Tests pin the counts at 2 and 3 analysts and sweep the slider to prove the bet can go either way.",
        "Stack: Next.js 16, TypeScript, Vitest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "Which profiles got resolved today",
      caption: "Each profile joins a registry piece and an ID piece. If they fit, it goes green into the puzzle. If they clash, an analyst looks at it today or it waits until tomorrow.",
      tapeLabel: (n) => `${n} applicants, in the order they applied`,
      tape: { served: "assembled on its own", rerouted: "reviewed today", lost: "waits until tomorrow" },
      resolvedOf: (n) => `${n} of 20 resolved today`,
      puzzle: {
        registry: "Registry",
        document: "ID document",
        fits: "Does it fit?",
        board: "Today's puzzle",
        analysts: (n) => (n === 0 ? "No analysts today" : n === 1 ? "1 analyst today" : `${n} analysts today`),
        tomorrow: "Left for tomorrow",
        halfPiece: "dashed half: the ID document is missing",
        batch: (from, to) => `Profiles ${from} to ${to}`,
        summary: (a, r, w, n) => `Puzzle of ${n} profiles: ${a} fit on their own, ${r} reviewed by an analyst today, ${w} left for tomorrow.`,
      },
    },
  },
  es: {
    name: "Identidad 360°",
    oneLiner: "Arma el perfil de un cliente con datos de varias fuentes y aparta los que no cuadran.",
    chips: ["Identidad", "2 min", "Demo en vivo"],
    analogy: {
      heading: { before: "La", accent: "analogía" },
      paragraphs: [
        "Imagina un rompecabezas con piezas de varias cajas. Casi todas encajan. Cuando dos claramente no, no las fuerzas: las apartas para que alguien las mire.",
        "Identidad 360° arma el perfil de un cliente con un registro público y una identificación, y los cruza. Un perfil cuyas fuentes se contradicen va con un analista. Si hoy no hay analista libre, espera a mañana.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "las piezas", means: "el registro y la identificación" },
        { term: "dos piezas que no encajan", means: "un conflicto entre fuentes" },
        { term: "apartarlas", means: "mandar el perfil con un analista" },
        { term: "forzarlas", means: "armar el perfil sin cruzar datos" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Hoy piden crédito veinte personas. En seis de ellas, el registro y la identificación dicen cosas distintas.",
      question: (k) => `Antes de correrlo, apuesta: con ${k === 1 ? "1 analista" : `${k} analistas`} hoy, ¿se resuelven hoy al menos 17 de los 20 perfiles?`,
      yes: "Sí, 17 o más",
      no: "No, menos de 17",
      seatsLabel: "Analistas disponibles hoy",
      seatsHint: "Cada analista revisa un perfil con conflicto por día.",
      note: "Cada cuadrito es un solicitante. Los azules los revisó un analista hoy. Uno rojo es un perfil con conflicto que tiene que esperar a mañana.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudieron armar los perfiles.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Cruzando datos", accent: "o sin cruzarlos" },
      lead: "Los mismos veinte solicitantes y los mismos analistas. Sin cruzar datos nada espera, porque nada se detecta.",
      withCheck: "Cruzando datos",
      withoutCheck: "Sin cruzarlos",
      mismatched: "perfiles armados con piezas que no cuadran",
      waiting: (n) => (n === 1 ? "1 espera a mañana" : `${n} esperan a mañana`),
      sentence: (withCheck, without) => {
        if (without.mismatched === withCheck.mismatched) return "Esta vez los dos ajustes armaron los mismos perfiles.";
        const waits = withCheck.waiting === 0 ? "nadie tuvo que esperar" : withCheck.waiting === 1 ? "un perfil espera a mañana" : `${withCheck.waiting} perfiles esperan a mañana`;
        return `Cruzando datos, ${waits}. Sin cruzarlos todo parece listo hoy, y ${without.mismatched === 1 ? "un perfil quedó armado" : `${without.mismatched} perfiles quedaron armados`} con piezas que no cuadran.`;
      },
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve?" },
      worthLabel: "Vale la pena",
      worth: "Cuando un equipo de crédito saca datos de identidad de más de una fuente y un perfil equivocado cuesta más que un día de espera.",
      notLabel: "No hace falta",
      not: "Cuando hay una sola fuente confiable y nada con qué compararla.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Hice visible el costo. Detectar conflictos genera trabajo, y el número de analistas decide cuánto se resuelve hoy. Saltarse el cruce deja la fila vacía, y el costo aparece después como perfiles en los que nadie debería confiar.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Los veinte solicitantes son un lote ficticio fijo. Uno de cada tres tiene un conflicto; a otros dos les falta la identificación, lo que baja la cobertura a 50% sin mandarlos a revisión.",
        "Cada perfil pasa por la misma función de armado que usaba el demo. Los conflictos toman lugares de analista en orden.",
        "Los tests fijan los conteos con 2 y 3 analistas y recorren el slider para comprobar que la apuesta puede salir para los dos lados.",
        "Stack: Next.js 16, TypeScript, Vitest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Qué perfiles se resolvieron hoy",
      caption: "Cada perfil junta una pieza del registro y otra de la identificación. Si encajan, entra verde al rompecabezas. Si chocan, un analista lo revisa hoy o espera a mañana.",
      tapeLabel: (n) => `${n} solicitantes, en el orden en que llegaron`,
      tape: { served: "armado solo", rerouted: "revisado hoy", lost: "espera a mañana" },
      resolvedOf: (n) => `${n} de 20 resueltos hoy`,
      puzzle: {
        registry: "Registro",
        document: "Identificación",
        fits: "¿Encaja?",
        board: "El rompecabezas de hoy",
        analysts: (n) => (n === 0 ? "Sin analistas hoy" : n === 1 ? "1 analista hoy" : `${n} analistas hoy`),
        tomorrow: "Espera a mañana",
        halfPiece: "media pieza punteada: falta la identificación",
        batch: (from, to) => `Perfiles ${from} a ${to}`,
        summary: (a, r, w, n) => `Rompecabezas de ${n} perfiles: ${a} encajan solos, ${r} los revisa un analista hoy, ${w} esperan a mañana.`,
      },
    },
  },
};
