import { useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Compass,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  ORGAN_DETAILS,
  type AdventureMission,
  type OrganId,
} from '../data/respiratoryData';
import { respiAudio } from '../audio/respiAudio';

interface AdventureModeProps {
  missions: AdventureMission[];
  compact: boolean;
  dockSlot?: ReactNode;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onClearAnswers: (questionIds: string[]) => void;
  selectedOrgan: OrganId;
  onFocusOrgan: (organ: OrganId) => void;
  onEnableXray: (xray: boolean) => void;
  completedMissions: number[];
  xp: number;
  onMissionComplete: (missionId: number, earnedXp: number) => void;
  onGoToLab: () => void;
  onGoToQuiz: () => void;
}

export default function AdventureMode({
  missions,
  compact,
  dockSlot,
  onAnswer,
  onClearAnswers,
  selectedOrgan,
  onFocusOrgan,
  onEnableXray,
  completedMissions,
  xp,
  onMissionComplete,
  onGoToLab,
  onGoToQuiz,
}: AdventureModeProps) {
  const [missionIdx, setMissionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [missionScore, setMissionScore] = useState(0);
  const [missionFinished, setMissionFinished] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const mission = missions[missionIdx];
  const question = mission.questions[questionIdx];
  const activeOrganDetail = ORGAN_DETAILS[selectedOrgan];

  const handleSelectMission = (idx: number) => {
    respiAudio.playClick();
    const target = missions[idx];
    setMissionIdx(idx);
    setQuestionIdx(0);
    setSelectedOption(null);
    setShowHint(false);
    setIsCorrect(null);
    setMissionScore(0);
    setMissionFinished(false);
    onFocusOrgan(target.targetOrgan);
    if (target.targetOrgan === 'bronchi' || target.targetOrgan === 'alveoli') {
      onEnableXray(true);
    }
  };

  const handleAnswer = (optIdx: number) => {
    if (isCorrect !== null) return;
    setSelectedOption(optIdx);
    const correct = optIdx === question.correctIndex;
    setIsCorrect(correct);
    onAnswer(question.id, optIdx);
    if (correct) {
      respiAudio.playCorrect();
      setMissionScore((prev) => prev + 1);
    } else {
      respiAudio.playWrong();
    }
  };

  const handleNextQuestion = () => {
    respiAudio.playClick();
    if (questionIdx < mission.questions.length - 1) {
      setQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
      setIsCorrect(null);
    } else {
      setMissionFinished(true);
      const earned = missionScore * 50 + 50;
      onMissionComplete(mission.id, earned);
    }
  };

  const handleNextMission = () => {
    if (missionIdx < missions.length - 1) {
      handleSelectMission(missionIdx + 1);
    } else {
      onGoToLab();
    }
  };

  const handleRetryMission = () => {
    respiAudio.playClick();
    onClearAnswers(mission.questions.map((q) => q.id));
    setQuestionIdx(0);
    setSelectedOption(null);
    setShowHint(false);
    setIsCorrect(null);
    setMissionScore(0);
    setMissionFinished(false);
  };

  return (
    <div className={compact ? 'space-y-3' : 'contents'}>
      {/* Top-Left Organ Inspector Readout (Solid surface, no backdrop-filter over WebGL) */}
      <div
        className={
          compact
            ? 'bg-[#0F172A] border border-slate-700/80 rounded-xl p-3'
            : 'pointer-events-auto absolute top-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)] bg-[#0F172A]/95 border border-slate-700/80 rounded-xl p-4 shadow-xl'
        }
      >
        <div className="flex items-center justify-between gap-2 text-xs text-sky-400 font-medium">
          <span>{activeOrganDetail.category}</span>
          <span className="text-slate-400 font-mono-tabular">
            {completedMissions.length}/{missions.length} Misi · {xp} XP
          </span>
        </div>
        <h3 className="mt-1 text-base font-bold text-white leading-snug">
          {activeOrganDetail.name}
        </h3>
        <p className="text-xs text-slate-400 italic">{activeOrganDetail.latinName}</p>
        <p className="mt-2 text-xs text-slate-200 leading-relaxed">
          {activeOrganDetail.shortRole}
        </p>
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1">
          {activeOrganDetail.keyFacts.slice(0, 2).map((fact, i) => (
            <p key={i} className="text-[11px] text-slate-300 leading-relaxed">
              • {fact}
            </p>
          ))}
        </div>
      </div>

      {compact && dockSlot}

      {/* Bottom-Docked Story & Quiz Deck (Collapsible so 3D view stays 100% clear) */}
      <div
        className={
          compact
            ? 'w-full'
            : 'pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-[min(920px,94vw)]'
        }
      >
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={() => setPanelCollapsed((c) => !c)}
            className="px-3.5 py-1 text-xs font-medium bg-[#0F172A]/95 text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {panelCollapsed ? 'Tampilkan Misi Petualangan' : 'Sembunyikan Panel Misi'}
          </button>
        </div>

        {!panelCollapsed && (
          <div className="bg-[#0F172A]/96 border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
            {/* Mission Stepper */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {missions.map((m, idx) => {
                  const done = completedMissions.includes(m.id);
                  const active = idx === missionIdx;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMission(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        active
                          ? 'bg-sky-600 text-white'
                          : done
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/70'
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>Misi {idx + 1}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  respiAudio.playOrganSelect();
                  onFocusOrgan(mission.targetOrgan);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-sky-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Fokus Organ 3D</span>
              </button>
            </div>

            {!missionFinished ? (
              <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Narrative Story Column */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="text-xs text-sky-400 font-medium">
                    {mission.narrator} · {mission.subtitle}
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug">
                    {mission.chapterTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {mission.storyText}
                  </p>
                  <div className="pt-1 text-xs text-amber-300/90 font-medium">
                    Petunjuk Aksi: {mission.missionObjective}
                  </div>
                </div>

                {/* Quiz Challenge Column */}
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                    <span>
                      Tantangan {questionIdx + 1} dari {mission.questions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHint((h) => !h)}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Tutup Petunjuk' : 'Buka Petunjuk'}</span>
                    </button>
                  </div>

                  {showHint && (
                    <div className="mb-2.5 px-3 py-2 rounded-lg bg-amber-950/60 border border-amber-700/50 text-xs text-amber-200">
                      {question.hint}
                    </div>
                  )}

                  <p className="text-sm font-semibold text-white mb-2.5 leading-snug">
                    {question.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.options.map((opt, idx) => {
                      const chosen = selectedOption === idx;
                      const rightChoice = idx === question.correctIndex;
                      let style =
                        'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80';
                      if (isCorrect !== null) {
                        if (rightChoice) {
                          style =
                            'bg-emerald-950/80 border-emerald-500 text-emerald-100';
                        } else if (chosen && !rightChoice) {
                          style = 'bg-rose-950/80 border-rose-500 text-rose-100';
                        } else {
                          style = 'bg-slate-900/60 border-slate-800 text-slate-500';
                        }
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswer(idx)}
                          disabled={isCorrect !== null}
                          className={`text-left px-3 py-2.5 rounded-lg border text-xs leading-snug transition-colors ${style}`}
                        >
                          <span className="font-bold mr-1.5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isCorrect !== null && (
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800">
                      <div className="flex items-start gap-2 text-xs">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span className="text-slate-200 leading-relaxed">
                          <strong className={isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                            {isCorrect ? 'Tepat sekali! ' : 'Belum tepat. '}
                          </strong>
                          {question.explanation}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 self-end sm:self-center whitespace-nowrap shrink-0"
                      >
                        <span>
                          {questionIdx < mission.questions.length - 1
                            ? 'Soal Berikutnya'
                            : 'Selesaikan Misi'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mission Summary */
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-emerald-700/40 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {mission.chapterTitle} Selesai!
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Jawaban benar: {missionScore}/{mission.questions.length} · Perolehan +{missionScore * 50 + 50} XP
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRetryMission}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Misi</span>
                  </button>
                  {missionIdx < missions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextMission}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <span>Lanjut Misi {missionIdx + 2}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onGoToLab}
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                      >
                        Masuk Lab Auskultasi
                      </button>
                      <button
                        type="button"
                        onClick={onGoToQuiz}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                      >
                        Kuis Evaluasi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
