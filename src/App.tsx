import { useEffect, useState } from 'react';
import { BookOpen, Play, Volume2, VolumeX } from 'lucide-react';
import RespiratoryScene3D from './components/RespiratoryScene3D';
import AdventureMode from './components/AdventureMode';
import AuscultationLab from './components/AuscultationLab';
import PhysicalExamLab from './components/PhysicalExamLab';
import EvaluationQuiz from './components/EvaluationQuiz';
import Dock3D, { type BreathMode, type BreathRate } from './components/Dock3D';
import LearningModuleWindow, {
  type ModuleWindowState,
} from './components/LearningModuleWindow';
import { ORGAN_DETAILS, type OrganId } from './data/respiratoryData';
import { respiAudio } from './audio/respiAudio';
import { useLayout } from './hooks/useLayout';
import { DEFAULT_BANK, loadQuestionBank, type QuestionBank } from './lib/questionBank';

type AppMode = 'adventure' | 'auscultation' | 'ippa' | 'quiz';

interface SavedProgress {
  studentName: string;
  studentClass: string;
  completedMissions: number[];
  solvedCases: string[];
  xp: number;
  lastQuizScore: number | null;
  /** jawaban siswa: id soal -> indeks opsi yang dipilih (dipakai untuk penilaian) */
  answers: Record<string, number>;
  /** versi bank soal saat jawaban dibuat; bila soal diubah guru, jawaban lama dibersihkan */
  dataVersion: string;
}

const STORAGE_KEY = 'respiquest_progress_v2';

const EMPTY_PROGRESS: SavedProgress = {
  studentName: '',
  studentClass: 'X',
  completedMissions: [],
  solvedCases: [],
  xp: 0,
  lastQuizScore: null,
  answers: {},
  dataVersion: '',
};

function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as Partial<SavedProgress>) };
  } catch {
    // ignore storage errors
  }
  return { ...EMPTY_PROGRESS };
}

export default function App() {
  const layout = useLayout();
  const portrait = layout.mode === 'portrait';

  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<AppMode>('adventure');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganId>('overview');
  const [xrayMode, setXrayMode] = useState(false);
  const [breathMode, setBreathMode] = useState<BreathMode>('auto');
  const [breathRate, setBreathRate] = useState<BreathRate>('normal');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [moduleState, setModuleState] = useState<ModuleWindowState>('closed');

  const [progress, setProgress] = useState<SavedProgress>(() => loadProgress());
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const activeBank = bank ?? DEFAULT_BANK;

  // Muat soal dari spreadsheet (soal.json). Gagal -> soal bawaan.
  useEffect(() => {
    let cancelled = false;
    loadQuestionBank().then((b) => {
      if (!cancelled) setBank(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Soal diubah guru -> jawaban lama tidak relevan lagi, bersihkan (nama & kelas tetap).
  useEffect(() => {
    if (!bank) return;
    setProgress((p) =>
      p.dataVersion === bank.version
        ? p
        : {
            ...EMPTY_PROGRESS,
            studentName: p.studentName,
            studentClass: p.studentClass,
            dataVersion: bank.version,
          }
    );
  }, [bank]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage errors
    }
  }, [progress]);

  const startGame = (nextMode?: AppMode) => {
    if (!bank) return;
    if (nextMode) {
      respiAudio.playClick();
      setMode(nextMode);
    } else {
      respiAudio.playOrganSelect();
    }
    setStarted(true);
  };

  // Keyboard shortcuts for Title Screen start (Enter/Space) & Mute (M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (!started && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (bank) {
          respiAudio.playOrganSelect();
          setStarted(true);
        }
      } else if (e.key.toLowerCase() === 'm') {
        setMuted((prev) => {
          const next = !prev;
          respiAudio.setMuted(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [started, bank]);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    respiAudio.setMuted(next);
  };

  const handleSwitchMode = (nextMode: AppMode) => {
    respiAudio.playClick();
    if (nextMode !== 'auscultation' && nextMode !== 'ippa') {
      respiAudio.stopLungSound();
    }
    setMode(nextMode);
  };

  const handleSelectOrgan = (organ: OrganId) => {
    respiAudio.playOrganSelect();
    setSelectedOrgan(organ);
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setProgress((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: optionIndex },
    }));
  };

  const handleClearAnswers = (questionIds: string[]) => {
    setProgress((prev) => {
      const next = { ...prev.answers };
      questionIds.forEach((id) => delete next[id]);
      return { ...prev, answers: next };
    });
  };

  const handleResetAll = () => {
    if (window.confirm('Hapus semua progres, jawaban, dan nilai di perangkat ini?')) {
      setProgress((p) => ({
        ...EMPTY_PROGRESS,
        studentName: p.studentName,
        studentClass: p.studentClass,
        dataVersion: p.dataVersion,
      }));
    }
  };

  const handleMissionComplete = (missionId: number, earnedXp: number) => {
    setProgress((prev) => {
      const already = prev.completedMissions.includes(missionId);
      return {
        ...prev,
        completedMissions: already
          ? prev.completedMissions
          : [...prev.completedMissions, missionId],
        xp: already ? prev.xp : prev.xp + earnedXp,
      };
    });
  };

  const handleSolveCase = (caseId: string) => {
    setProgress((prev) => {
      const already = prev.solvedCases.includes(caseId);
      return {
        ...prev,
        solvedCases: already ? prev.solvedCases : [...prev.solvedCases, caseId],
        xp: already ? prev.xp : prev.xp + 75,
      };
    });
  };

  const handleQuizFinish = (scorePct: number) => {
    setProgress((prev) => ({
      ...prev,
      lastQuizScore: scorePct,
    }));
  };

  // ------------------------- LAYAR JUDUL -------------------------
  if (!started) {
    return (
      <div className="safe-pad relative w-full h-dvh overflow-hidden bg-[#0B1220]">
        <div className="absolute inset-0">
          <RespiratoryScene3D
            selectedOrgan="overview"
            onSelectOrgan={() => {}}
            xrayMode={false}
            breathMode="auto"
            breathRate="normal"
            autoRotate={true}
          />
        </div>

        {/* Scrim agar teks terbaca tanpa menutup model 3D */}
        <div
          className={`pointer-events-none absolute inset-0 ${
            portrait
              ? 'bg-gradient-to-t from-[#0B1220] via-[#0B1220]/85 to-transparent'
              : 'bg-gradient-to-r from-[#0B1220]/95 via-[#0B1220]/65 to-transparent'
          }`}
        />

        <div
          className={`pointer-events-none relative z-10 h-full flex flex-col p-4 sm:p-10 lg:p-14 ${
            portrait ? 'justify-end gap-3' : 'justify-between max-w-xl'
          }`}
        >
          {!portrait && (
            <div className="text-xs font-medium text-sky-400 [@media(max-height:520px)]:hidden">
              Media Pembelajaran Interaktif Kelas X · Anatomi & Fisiologi
            </div>
          )}

          <div className="pointer-events-auto max-h-full overflow-y-auto space-y-4 sm:space-y-5 pr-1">
            <div className="flex items-center gap-3.5">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="shrink-0">
                <rect width="48" height="48" rx="12" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                <path d="M24 9V21" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                <path
                  d="M24 20C20 20 13 24 13 33C13 37 16 39 19 39C21 39 22.5 37 22.5 34V24"
                  stroke="#FB7185"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M24 20C28 20 35 24 35 33C35 37 32 39 29 39C27 39 25.5 37 25.5 34V24"
                  stroke="#FB7185"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  RespiQuest
                </h1>
                <p className="text-sm text-sky-300 font-medium">
                  Ekspedisi Sistem Pernapasan Manusia
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-balance [@media(max-height:520px)]:hidden">
              Jelajahi organ pernapasan 3D secara langsung, dengarkan suara paru normal & abnormal di Lab Auskultasi, praktikkan pemeriksaan fisik IPPA, dan selesaikan kuis evaluasi otomatis beserta Exit Ticket.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <input
                type="text"
                value={progress.studentName}
                onChange={(e) => setProgress((p) => ({ ...p, studentName: e.target.value }))}
                placeholder="Nama Siswa (opsional)"
                className="col-span-2 px-3.5 py-2.5 rounded-xl bg-[#0F172A]/90 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                value={progress.studentClass}
                onChange={(e) => setProgress((p) => ({ ...p, studentClass: e.target.value }))}
                placeholder="Kelas (X)"
                className="px-3.5 py-2.5 rounded-xl bg-[#0F172A]/90 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!bank}
                onClick={() => startGame()}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{bank ? 'Mulai Petualangan' : 'Memuat soal…'}</span>
              </button>

              <button
                type="button"
                disabled={!bank}
                onClick={() => startGame('auscultation')}
                className="px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-60 text-slate-200 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Masuk Lab Paru
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetAll}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2"
            >
              Hapus progres & nilai di perangkat ini
            </button>
          </div>

          {!portrait && (
            <div className="text-xs text-slate-400 [@media(max-height:520px)]:hidden">
              {layout.isTouch
                ? 'Geser: putar 3D · Cubit: zoom · Ketuk organ'
                : 'Seret Putar 3D · Gulir Zoom · Klik Organ · Enter Mulai · M Suara'}
            </div>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'adventure', label: layout.compact ? 'Petualangan' : 'Petualangan 3D' },
    { id: 'auscultation', label: layout.compact ? 'Auskultasi' : 'Lab Auskultasi' },
    { id: 'ippa', label: layout.compact ? 'IPPA' : 'Lab IPPA & Diagnosis' },
    { id: 'quiz', label: layout.compact ? 'Kuis & Nilai' : 'Kuis, Nilai & Exit Ticket' },
  ] as const;

  const dock = (compact: boolean) => (
    <Dock3D
      compact={compact}
      collapsed={dockCollapsed}
      onToggleCollapsed={() => setDockCollapsed((c) => !c)}
      selectedOrgan={selectedOrgan}
      onSelectOrgan={handleSelectOrgan}
      xrayMode={xrayMode}
      onToggleXray={() => {
        respiAudio.playClick();
        setXrayMode((x) => !x);
      }}
      breathMode={breathMode}
      onChangeBreathMode={setBreathMode}
      breathRate={breathRate}
      onToggleBreathRate={() => setBreathRate((r) => (r === 'normal' ? 'olahraga' : 'normal'))}
    />
  );

  const adventureProps = {
    missions: activeBank.missions,
    selectedOrgan,
    onFocusOrgan: handleSelectOrgan,
    onEnableXray: setXrayMode,
    completedMissions: progress.completedMissions,
    xp: progress.xp,
    onMissionComplete: handleMissionComplete,
    onAnswer: handleAnswer,
    onClearAnswers: handleClearAnswers,
    onGoToLab: () => handleSwitchMode('auscultation'),
    onGoToQuiz: () => handleSwitchMode('quiz'),
  };

  const scene = (
    <RespiratoryScene3D
      selectedOrgan={selectedOrgan}
      onSelectOrgan={handleSelectOrgan}
      xrayMode={xrayMode}
      breathMode={breathMode}
      breathRate={breathRate}
    />
  );

  return (
    <div className="safe-pad relative w-full h-dvh overflow-hidden bg-[#0B1220] flex flex-col">
      {/* Header: tinggi ringkas di HP */}
      <header className="relative z-30 shrink-0 h-12 sm:h-16 px-2 sm:px-6 bg-[#0F172A]/95 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-6">
        <button
          type="button"
          onClick={() => setStarted(false)}
          className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-300 transition-colors"
        >
          RespiQuest
        </button>

        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto min-w-0 flex-1 sm:justify-center">
          {navItems.map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchMode(item.id)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleMute}
            title={muted ? 'Aktifkan Suara (M)' : 'Bisukan Suara (M)'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
          <button
            type="button"
            onClick={() => {
              respiAudio.playClick();
              setModuleState((s) => (s === 'open' ? 'minimized' : 'open'));
            }}
            className="px-2.5 sm:px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{layout.compact ? 'Modul' : 'Modul Belajar'}</span>
          </button>
        </div>
      </header>

      <main className="relative flex-1 min-h-0 w-full">
        {mode === 'adventure' &&
          (layout.compact ? (
            <div className={`flex w-full h-full ${portrait ? 'flex-col' : 'flex-row'}`}>
              {/* Area 3D */}
              <div
                className={`relative shrink-0 ${
                  portrait ? 'h-[38%] min-h-[190px] w-full' : 'h-full w-[50%]'
                }`}
              >
                {scene}
                <div className="pointer-events-none absolute left-2 top-2 px-2.5 py-1 rounded-md bg-[#0F172A]/90 border border-slate-700 text-[11px] font-semibold text-sky-300">
                  {ORGAN_DETAILS[selectedOrgan].name}
                </div>
                <div className="pointer-events-none absolute right-2 bottom-2 text-[10px] text-slate-400">
                  Geser: putar · Cubit: zoom · Ketuk organ
                </div>
              </div>

              {/* Panel misi (bisa digulir) */}
              <div className="flex-1 min-h-0 min-w-0 overflow-y-auto p-3 pb-6 bg-[#0B1220] border-t sm:border-t-0 border-slate-800">
                <AdventureMode {...adventureProps} compact dockSlot={dock(true)} />
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {scene}
              <AdventureMode {...adventureProps} compact={false} />
              {dock(false)}
            </div>
          ))}

        {mode === 'auscultation' && <AuscultationLab />}

        {mode === 'ippa' && (
          <PhysicalExamLab
            cases={activeBank.cases}
            solvedCases={progress.solvedCases}
            onSolveCase={handleSolveCase}
            onAnswerCase={(caseId, idx) => handleAnswer(`d:${caseId}`, idx)}
          />
        )}

        {mode === 'quiz' && (
          <EvaluationQuiz
            bank={activeBank}
            answers={progress.answers}
            onAnswer={handleAnswer}
            onClearAnswers={handleClearAnswers}
            studentName={progress.studentName}
            studentClass={progress.studentClass}
            onUpdateStudent={(name, cls) =>
              setProgress((p) => ({ ...p, studentName: name, studentClass: cls }))
            }
            completedMissionsCount={progress.completedMissions.length}
            solvedCasesCount={progress.solvedCases.length}
            lastQuizScore={progress.lastQuizScore}
            onQuizFinish={handleQuizFinish}
          />
        )}
      </main>

      {/* Jendela Modul Belajar (tetap ada di semua tab) */}
      <LearningModuleWindow
        windowState={moduleState}
        onChangeState={setModuleState}
        compact={layout.compact}
      />
    </div>
  );
}
