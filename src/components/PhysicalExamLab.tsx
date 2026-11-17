import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Hand,
  Hammer,
  Stethoscope,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  LUNG_SOUNDS,
  type ClinicalCase,
  type PercussionTone,
} from '../data/respiratoryData';
import { respiAudio } from '../audio/respiAudio';

type IppaTab = 'inspeksi' | 'palpasi' | 'perkusi' | 'auskultasi';

interface PhysicalExamLabProps {
  cases: ClinicalCase[];
  solvedCases: string[];
  onSolveCase: (caseId: string) => void;
  /** merekam jawaban diagnosis untuk penilaian */
  onAnswerCase: (caseId: string, optionIndex: number) => void;
}

export default function PhysicalExamLab({
  cases,
  solvedCases,
  onSolveCase,
  onAnswerCase,
}: PhysicalExamLabProps) {
  const [caseIdx, setCaseIdx] = useState(0);
  const [ippaTab, setIppaTab] = useState<IppaTab>('inspeksi');
  const [checkedSteps, setCheckedSteps] = useState<Record<IppaTab, boolean>>({
    inspeksi: true,
    palpasi: false,
    perkusi: false,
    auskultasi: false,
  });
  const [lastPercussion, setLastPercussion] = useState<{
    side: 'Kanan' | 'Kiri';
    tone: PercussionTone;
  } | null>(null);
  const [playingSide, setPlayingSide] = useState<'Kanan' | 'Kiri' | null>(null);
  const [selectedDiag, setSelectedDiag] = useState<string | null>(null);

  const activeCase = cases[caseIdx];

  useEffect(() => {
    return () => {
      respiAudio.stopLungSound();
    };
  }, []);

  const handleSelectCase = (idx: number) => {
    respiAudio.playClick();
    respiAudio.stopLungSound();
    setPlayingSide(null);
    setCaseIdx(idx);
    setIppaTab('inspeksi');
    setCheckedSteps({ inspeksi: true, palpasi: false, perkusi: false, auskultasi: false });
    setLastPercussion(null);
    setSelectedDiag(null);
  };

  const handleSwitchTab = (tab: IppaTab) => {
    respiAudio.playClick();
    if (tab !== 'auskultasi') {
      respiAudio.stopLungSound();
      setPlayingSide(null);
    }
    setIppaTab(tab);
    setCheckedSteps((prev) => ({ ...prev, [tab]: true }));
  };

  const handlePercuss = (side: 'Kanan' | 'Kiri') => {
    const tone =
      side === 'Kanan' ? activeCase.ippa.perkusi.rightTone : activeCase.ippa.perkusi.leftTone;
    respiAudio.playPercussionSound(tone);
    setLastPercussion({ side, tone });
    setCheckedSteps((prev) => ({ ...prev, perkusi: true }));
  };

  const handleAuscultateSide = (side: 'Kanan' | 'Kiri') => {
    const soundId =
      side === 'Kanan'
        ? activeCase.ippa.auskultasi.rightSound
        : activeCase.ippa.auskultasi.leftSound;
    if (playingSide === side) {
      respiAudio.stopLungSound();
      setPlayingSide(null);
    } else {
      setPlayingSide(side);
      respiAudio.startLungSound(soundId);
      setCheckedSteps((prev) => ({ ...prev, auskultasi: true }));
    }
  };

  const handleSubmitDiagnosis = (choice: string) => {
    if (selectedDiag !== null) return;
    setSelectedDiag(choice);
    onAnswerCase(activeCase.id, activeCase.diagnosisOptions.indexOf(choice));
    if (choice === activeCase.correctDiagnosis) {
      respiAudio.playCorrect();
      onSolveCase(activeCase.id);
    } else {
      respiAudio.playWrong();
    }
  };

  const completedStepCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div className="h-full overflow-y-auto bg-[#0B1220] pt-4 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Case Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-medium text-sky-400">
              Laboratorium Pemeriksaan Fisik Paru (IPPA) & Simulasi Diagnosis
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Simulasi Pemeriksaan Fisik & Diagnosis Klinis
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Lakukan Inspeksi, Palpasi, Perkusi, dan Auskultasi secara berurutan pada pasien virtual untuk menegakkan diagnosis yang tepat.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {cases.map((c, idx) => {
              const solved = solvedCases.includes(c.id);
              const active = idx === caseIdx;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCase(idx)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white'
                      : solved
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/70'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Kasus {idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Vignette + Vital Signs Strip */}
        <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="text-xs text-sky-400 font-medium">
              Pasien: {activeCase.patientName} · Usia {activeCase.age} tahun
            </div>
            <h3 className="text-lg font-bold text-white">{activeCase.title}</h3>
            <p className="text-sm text-slate-300">{activeCase.complaint}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Laju Napas (RR)</div>
              <div className="text-base font-bold font-mono-tabular text-amber-300">
                {activeCase.vitals.rr} x/mnt
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Saturasi O₂</div>
              <div className="text-base font-bold font-mono-tabular text-sky-300">
                {activeCase.vitals.spo2}%
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Nadi</div>
              <div className="text-base font-bold font-mono-tabular text-white">
                {activeCase.vitals.hr} bpm
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Suhu Tubuh</div>
              <div className="text-base font-bold font-mono-tabular text-white">
                {activeCase.vitals.temp}
              </div>
            </div>
          </div>
        </div>

        {/* Main IPPA Examination Workbench + Diagnosis Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: IPPA Interactive Station */}
          <div className="lg:col-span-7 bg-[#111A2E] border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* 4-Step IPPA Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'inspeksi', label: '1. Inspeksi', icon: Eye },
                  { id: 'palpasi', label: '2. Palpasi', icon: Hand },
                  { id: 'perkusi', label: '3. Perkusi', icon: Hammer },
                  { id: 'auskultasi', label: '4. Auskultasi', icon: Stethoscope },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const active = ippaTab === id;
                const done = checkedSteps[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSwitchTab(id)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-sky-600 border-sky-500 text-white'
                        : done
                        ? 'bg-slate-900 border-emerald-700/60 text-emerald-300 hover:bg-slate-800'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active IPPA Station Body */}
            {ippaTab === 'inspeksi' && (
              <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">
                    Tahap 1: Inspeksi (Pengamatan Visual Dada)
                  </h4>
                  <span className="text-xs text-sky-400 font-medium">
                    Pola: {activeCase.ippa.inspeksi.breathingPattern}
                  </span>
                </div>

                {/* Visual Animated Thoracic Expansion Comparison */}
                <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-[#090F1D] border border-slate-800">
                  <div className="text-center space-y-2">
                    <div className="text-xs text-slate-400">Hemitoraks Kanan (Pasien)</div>
                    <div
                      className={`mx-auto w-24 h-28 rounded-2xl border-2 flex items-center justify-center text-xs font-semibold transition-transform ${
                        activeCase.ippa.inspeksi.symmetry === 'Tertinggal Kanan'
                          ? 'border-amber-500/80 bg-amber-950/30 text-amber-300'
                          : 'border-sky-500/70 bg-sky-950/30 text-sky-200'
                      }`}
                    >
                      {activeCase.ippa.inspeksi.symmetry === 'Tertinggal Kanan'
                        ? 'Gerak Tertinggal'
                        : 'Mengembang Aktif'}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xs text-slate-400">Hemitoraks Kiri (Pasien)</div>
                    <div
                      className={`mx-auto w-24 h-28 rounded-2xl border-2 flex items-center justify-center text-xs font-semibold transition-transform ${
                        activeCase.ippa.inspeksi.symmetry === 'Tertinggal Kiri'
                          ? 'border-amber-500/80 bg-amber-950/30 text-amber-300'
                          : 'border-sky-500/70 bg-sky-950/30 text-sky-200'
                      }`}
                    >
                      {activeCase.ippa.inspeksi.symmetry === 'Tertinggal Kiri'
                        ? 'Gerak Tertinggal'
                        : 'Mengembang Aktif'}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeCase.ippa.inspeksi.summary}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                  {activeCase.ippa.inspeksi.signs.map((s, i) => (
                    <span key={i} className="bg-slate-800 px-2.5 py-1 rounded-md">
                      • {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ippaTab === 'palpasi' && (
              <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white">
                  Tahap 2: Palpasi (Ekspansi Dada & Taktil Fremitus "77")
                </h4>
                <p className="text-xs text-slate-300">
                  Saat pasien mengucapkan "tujuh puluh tujuh", pemeriksa meraba getaran dinding dada kanan dan kiri.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#090F1D] border border-slate-800">
                    <div className="text-xs text-slate-400">Taktil Fremitus Paru Kanan</div>
                    <div
                      className={`text-base font-bold mt-1 ${
                        activeCase.ippa.palpasi.fremitusRight === 'Normal'
                          ? 'text-emerald-400'
                          : activeCase.ippa.palpasi.fremitusRight === 'Meningkat'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeCase.ippa.palpasi.fremitusRight}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#090F1D] border border-slate-800">
                    <div className="text-xs text-slate-400">Taktil Fremitus Paru Kiri</div>
                    <div
                      className={`text-base font-bold mt-1 ${
                        activeCase.ippa.palpasi.fremitusLeft === 'Normal'
                          ? 'text-emerald-400'
                          : activeCase.ippa.palpasi.fremitusLeft === 'Meningkat'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeCase.ippa.palpasi.fremitusLeft}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 text-xs text-slate-200 leading-relaxed">
                  <strong>Kesimpulan Palpasi:</strong> {activeCase.ippa.palpasi.expansion}.{' '}
                  {activeCase.ippa.palpasi.summary}
                </div>
              </div>
            )}

            {ippaTab === 'perkusi' && (
              <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">
                    Tahap 3: Perkusi (Mengetuk Lapangan Paru)
                  </h4>
                  <span className="text-xs text-sky-400">Klik tombol ketuk di bawah</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePercuss('Kanan')}
                    className="p-4 rounded-xl bg-[#090F1D] border border-slate-700 hover:border-sky-500 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Ketuk Paru Kanan</span>
                      <Hammer className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Klik untuk mendengar bunyi perkusi sisi kanan
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePercuss('Kiri')}
                    className="p-4 rounded-xl bg-[#090F1D] border border-slate-700 hover:border-sky-500 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Ketuk Paru Kiri</span>
                      <Hammer className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Klik untuk mendengar bunyi perkusi sisi kiri
                    </div>
                  </button>
                </div>

                {lastPercussion && (
                  <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-700/60 text-xs space-y-1">
                    <div className="font-bold text-sky-200 uppercase tracking-wide">
                      Hasil Ketukan Paru {lastPercussion.side}: {lastPercussion.tone.toUpperCase()}
                    </div>
                    <p className="text-slate-200">{activeCase.ippa.perkusi.summary}</p>
                    <p className="text-slate-400">{activeCase.ippa.perkusi.detail}</p>
                  </div>
                )}
              </div>
            )}

            {ippaTab === 'auskultasi' && (
              <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white">
                  Tahap 4: Auskultasi Paru Kanan & Kiri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAuscultateSide('Kanan')}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      playingSide === 'Kanan'
                        ? 'bg-sky-950 border-sky-500'
                        : 'bg-[#090F1D] border-slate-700 hover:border-sky-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Dengar Paru Kanan</span>
                      <Volume2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xs text-sky-300 mt-1">
                      {playingSide === 'Kanan'
                        ? `Sedang memutar: ${
                            LUNG_SOUNDS.find(
                              (s) => s.id === activeCase.ippa.auskultasi.rightSound
                            )?.name
                          }`
                        : 'Klik untuk menempelkan stetoskop'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuscultateSide('Kiri')}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      playingSide === 'Kiri'
                        ? 'bg-sky-950 border-sky-500'
                        : 'bg-[#090F1D] border-slate-700 hover:border-sky-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Dengar Paru Kiri</span>
                      <Volume2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xs text-sky-300 mt-1">
                      {playingSide === 'Kiri'
                        ? `Sedang memutar: ${
                            LUNG_SOUNDS.find(
                              (s) => s.id === activeCase.ippa.auskultasi.leftSound
                            )?.name
                          }`
                        : 'Klik untuk menempelkan stetoskop'}
                    </div>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 text-xs text-slate-200 leading-relaxed">
                  <strong>Temuan Auskultasi:</strong> {activeCase.ippa.auskultasi.summary} (
                  {activeCase.ippa.auskultasi.soundNote})
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary Log & Diagnosis Submission */}
          <div className="lg:col-span-5 bg-[#111A2E] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <span>Catatan Temuan & Diagnosis</span>
              </h4>
              <span className="text-xs font-mono-tabular text-slate-400">
                {completedStepCount}/4 Tahap IPPA
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-sky-400 font-semibold">Inspeksi: </span>
                <span className="text-slate-300">{activeCase.ippa.inspeksi.symmetry} · RR {activeCase.vitals.rr}x/mnt</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-sky-400 font-semibold">Palpasi: </span>
                <span className="text-slate-300">
                  {checkedSteps.palpasi
                    ? `Kanan: ${activeCase.ippa.palpasi.fremitusRight}, Kiri: ${activeCase.ippa.palpasi.fremitusLeft}`
                    : 'Buka tab Palpasi untuk memeriksa'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-sky-400 font-semibold">Perkusi: </span>
                <span className="text-slate-300">
                  {checkedSteps.perkusi
                    ? `Kanan: ${activeCase.ippa.perkusi.rightTone.toUpperCase()}, Kiri: ${activeCase.ippa.perkusi.leftTone.toUpperCase()}`
                    : 'Buka tab Perkusi dan ketuk dada pasien'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-sky-400 font-semibold">Auskultasi: </span>
                <span className="text-slate-300">
                  {checkedSteps.auskultasi
                    ? activeCase.ippa.auskultasi.summary
                    : 'Buka tab Auskultasi dan dengarkan suara paru'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-white mb-2.5">
                Pilih Diagnosis Klinis Paling Tepat:
              </div>
              <div className="space-y-2">
                {activeCase.diagnosisOptions.map((opt) => {
                  const chosen = selectedDiag === opt;
                  const isCorrect = opt === activeCase.correctDiagnosis;
                  let cls =
                    'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800';
                  if (selectedDiag !== null) {
                    if (isCorrect) cls = 'bg-emerald-950 border-emerald-500 text-emerald-100';
                    else if (chosen) cls = 'bg-rose-950 border-rose-500 text-rose-100';
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSubmitDiagnosis(opt)}
                      disabled={selectedDiag !== null}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDiag !== null && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  selectedDiag === activeCase.correctDiagnosis
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-100'
                    : 'bg-rose-950/60 border-rose-600/60 text-rose-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedDiag === activeCase.correctDiagnosis ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Diagnosis Tepat: {activeCase.correctDiagnosis}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Kurang Tepat — Jawaban Benar: {activeCase.correctDiagnosis}</span>
                    </>
                  )}
                </div>
                <p className="text-slate-200 leading-relaxed">{activeCase.explanation}</p>
                <button
                  type="button"
                  onClick={() => handleSelectCase(caseIdx)}
                  className="mt-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Ulangi Kasus Ini
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
