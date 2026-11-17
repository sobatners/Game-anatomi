import {
  ADVENTURE_MISSIONS,
  CLINICAL_CASES,
  EVALUATION_QUIZ,
  type AdventureMission,
  type ClinicalCase,
  type QuizQuestion,
} from '../data/respiratoryData';

/** Kumpulan seluruh soal game (dari spreadsheet -> soal.json, atau data bawaan). */
export interface QuestionBank {
  version: string;
  kkm: number;
  missions: AdventureMission[];
  cases: ClinicalCase[];
  quiz: QuizQuestion[];
  source: 'spreadsheet' | 'bawaan';
}

export const DEFAULT_BANK: QuestionBank = {
  version: 'bawaan',
  kkm: 75,
  missions: ADVENTURE_MISSIONS,
  cases: CLINICAL_CASES,
  quiz: EVALUATION_QUIZ,
  source: 'bawaan',
};

interface RawQuestion {
  id: string;
  topic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
  explanation: string;
}

interface RawBank {
  version: string;
  kkm: number;
  missions: Record<string, RawQuestion[]>;
  cases: Record<string, { options: string[]; correctIndex: number; explanation: string }>;
  quiz: RawQuestion[];
}

function validQuestion(q: RawQuestion): boolean {
  return (
    !!q &&
    typeof q.question === 'string' &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex < q.options.length
  );
}

function mergeBank(raw: RawBank): QuestionBank {
  const missions = ADVENTURE_MISSIONS.map((m) => {
    const list = raw.missions?.[String(m.id)];
    if (!Array.isArray(list) || list.length === 0 || !list.every(validQuestion)) {
      throw new Error(`Soal Misi ${m.id} tidak valid`);
    }
    return {
      ...m,
      questions: list.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        hint: q.hint ?? '',
        explanation: q.explanation ?? '',
      })),
    };
  });

  const cases = CLINICAL_CASES.map((c, i) => {
    const r = raw.cases?.[String(i + 1)];
    if (!r || !Array.isArray(r.options) || r.options.length < 2 || !r.options[r.correctIndex]) {
      throw new Error(`Soal Diagnosis Kasus ${i + 1} tidak valid`);
    }
    return {
      ...c,
      diagnosisOptions: r.options,
      correctDiagnosis: r.options[r.correctIndex],
      explanation: r.explanation ?? c.explanation,
    };
  });

  if (!Array.isArray(raw.quiz) || raw.quiz.length === 0 || !raw.quiz.every(validQuestion)) {
    throw new Error('Soal Kuis tidak valid');
  }
  const quiz: QuizQuestion[] = raw.quiz.map((q) => ({
    id: q.id,
    topic: q.topic || 'Umum',
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation ?? '',
  }));

  return {
    version: String(raw.version || 'spreadsheet'),
    kkm: Number.isFinite(raw.kkm) ? raw.kkm : 75,
    missions,
    cases,
    quiz,
    source: 'spreadsheet',
  };
}

/** Muat soal dari data/soal.json. Bila gagal, pakai data bawaan agar game tetap jalan. */
export async function loadQuestionBank(): Promise<QuestionBank> {
  try {
    const url = `${import.meta.env.BASE_URL}data/soal.json?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return mergeBank((await res.json()) as RawBank);
  } catch (err) {
    console.warn('[RespiQuest] Gagal memuat soal.json, memakai soal bawaan.', err);
    return DEFAULT_BANK;
  }
}

/* ------------------------------ PENILAIAN ------------------------------ */

export const caseAnswerId = (c: ClinicalCase) => `d:${c.id}`;

export interface SectionScore {
  key: string;
  label: string;
  total: number;
  answered: number;
  correct: number;
  /** nilai 0-100 untuk bagian ini saja */
  sectionScore: number;
  /** poin yang disumbangkan ke nilai akhir */
  points: number;
}

export interface ScoreSummary {
  total: number;
  answered: number;
  correct: number;
  pointPerQuestion: number;
  /** nilai akhir 0-100 (semua benar = 100) */
  finalScore: number;
  passed: boolean;
  kkm: number;
  sections: SectionScore[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeScore(bank: QuestionBank, answers: Record<string, number>): ScoreSummary {
  const defs: { key: string; label: string; items: { id: string; correctIndex: number }[] }[] = [
    ...bank.missions.map((m) => ({
      key: `misi-${m.id}`,
      label: `Misi ${m.id}`,
      items: m.questions.map((q) => ({ id: q.id, correctIndex: q.correctIndex })),
    })),
    {
      key: 'diagnosis',
      label: 'Diagnosis Klinis',
      items: bank.cases.map((c) => ({
        id: caseAnswerId(c),
        correctIndex: c.diagnosisOptions.indexOf(c.correctDiagnosis),
      })),
    },
    {
      key: 'kuis',
      label: 'Kuis Evaluasi',
      items: bank.quiz.map((q) => ({ id: q.id, correctIndex: q.correctIndex })),
    },
  ];

  const total = defs.reduce((a, d) => a + d.items.length, 0);
  const pointPerQuestion = total === 0 ? 0 : 100 / total;

  const sections: SectionScore[] = defs.map((d) => {
    const answered = d.items.filter((it) => answers[it.id] !== undefined).length;
    const correct = d.items.filter((it) => answers[it.id] === it.correctIndex).length;
    return {
      key: d.key,
      label: d.label,
      total: d.items.length,
      answered,
      correct,
      sectionScore: d.items.length === 0 ? 0 : round1((correct / d.items.length) * 100),
      points: round1(correct * pointPerQuestion),
    };
  });

  const correct = sections.reduce((a, s) => a + s.correct, 0);
  const answered = sections.reduce((a, s) => a + s.answered, 0);
  const finalScore = total === 0 ? 0 : round1((correct / total) * 100);

  return {
    total,
    answered,
    correct,
    pointPerQuestion,
    finalScore,
    passed: finalScore >= bank.kkm,
    kkm: bank.kkm,
    sections,
  };
}

export const formatScore = (n: number) =>
  n.toLocaleString('id-ID', { maximumFractionDigits: 1 });
