import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Ear,
  Play,
  RotateCcw,
  Square,
  Stethoscope,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  LUNG_SOUNDS,
  THORAX_HOTSPOTS,
  type LungSoundId,
  type ThoraxHotspot,
} from '../data/respiratoryData';
import { respiAudio } from '../audio/respiAudio';

export default function AuscultationLab() {
  const [viewSide, setViewSide] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedSoundId, setSelectedSoundId] = useState<LungSoundId>('vesicular');
  const [activeHotspot, setActiveHotspot] = useState<ThoraxHotspot>(THORAX_HOTSPOTS[1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inspirasi' | 'ekspirasi' | 'jeda'>('jeda');
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Mini Challenge State ("Tebak Suara Paru")
  const [challengeMode, setChallengeMode] = useState(false);
  const [mysterySoundId, setMysterySoundId] = useState<LungSoundId>('wheezing');
  const [challengeAnswer, setChallengeAnswer] = useState<LungSoundId | null>(null);
  const [challengeScore, setChallengeScore] = useState({ correct: 0, total: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeProfile = LUNG_SOUNDS.find((s) => s.id === selectedSoundId) ?? LUNG_SOUNDS[0];
  const visibleHotspots = THORAX_HOTSPOTS.filter((h) => h.view === viewSide);

  useEffect(() => {
    return () => {
      respiAudio.stopLungSound();
    };
  }, []);

  // Real-time Oscilloscope Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const dataArray = new Uint8Array(64);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#090f1d';
      ctx.fillRect(0, 0, w, h);

      // Subtle clinical grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const analyser = respiAudio.getAnalyser();
      if (isPlaying && analyser) {
        analyser.getByteTimeDomainData(dataArray);
        ctx.strokeStyle =
          activeProfile.category === 'Normal' && !challengeMode ? '#38bdf8' : '#fb7185';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const sliceWidth = w / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, activeProfile.category, challengeMode]);

  const startPlayback = (soundId: LungSoundId) => {
    setIsPlaying(true);
    respiAudio.startLungSound(soundId, (phase, prog) => {
      setBreathPhase(phase);
      setPhaseProgress(prog);
    });
  };

  const stopPlayback = () => {
    respiAudio.stopLungSound();
    setIsPlaying(false);
    setBreathPhase('jeda');
    setPhaseProgress(0);
  };

  const handleTogglePlay = () => {
    const targetSound = challengeMode ? mysterySoundId : selectedSoundId;
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(targetSound);
    }
  };

  const handleSelectHotspot = (spot: ThoraxHotspot) => {
    respiAudio.playClick();
    setActiveHotspot(spot);
    if (!challengeMode) {
      setSelectedSoundId(spot.defaultSound);
      startPlayback(spot.defaultSound);
    }
  };

  const handleSelectSound = (id: LungSoundId) => {
    respiAudio.playClick();
    setSelectedSoundId(id);
    startPlayback(id);
  };

  const startNewChallenge = () => {
    respiAudio.playClick();
    const pool: LungSoundId[] = ['vesicular', 'wheezing', 'crackles', 'rhonchi', 'stridor'];
    const randomId = pool[Math.floor(Math.random() * pool.length)];
    setMysterySoundId(randomId);
    setChallengeAnswer(null);
    setChallengeMode(true);
    startPlayback(randomId);
  };

  const handleAnswerChallenge = (guess: LungSoundId) => {
    if (challengeAnswer !== null) return;
    setChallengeAnswer(guess);
    const isRight = guess === mysterySoundId;
    if (isRight) respiAudio.playCorrect();
    else respiAudio.playWrong();
    setChallengeScore((s) => ({
      correct: s.correct + (isRight ? 1 : 0),
      total: s.total + 1,
    }));
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0B1220] pt-4 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-medium text-sky-400">
              Laboratorium Keterampilan Klinis · Auskultasi Paru
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Lab Auskultasi Suara Paru Normal & Abnormal
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Letakkan stetoskop pada titik-titik dada depan atau punggung untuk mendengar perbedaan suara napas sehat dan suara napas patologis.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setChallengeMode(false);
                stopPlayback();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                !challengeMode
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mode Eksplorasi Suara
            </button>
            <button
              type="button"
              onClick={startNewChallenge}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                challengeMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              <Ear className="w-4 h-4" />
              <span>Tebak Suara Paru</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: Interactive Thorax Stethoscope Map */}
          <div className="lg:col-span-5 bg-[#111A2E] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>Peta Titik Stetoskop</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewSide('anterior')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewSide === 'anterior'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dada Depan
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('posterior')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewSide === 'posterior'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Punggung
                </button>
              </div>
            </div>

            {/* Interactive SVG Torso & Lung Silhouette */}
            <div className="relative mx-auto w-full max-w-[330px] aspect-[3/4] bg-[#090F1D] rounded-xl border border-slate-800/90 overflow-hidden">
              <svg viewBox="0 0 100 120" className="w-full h-full">
                {/* Torso outline */}
                <path
                  d="M38,8 C42,6 58,6 62,8 L64,18 L84,26 C89,29 91,36 90,46 L86,105 L14,105 L10,46 C9,36 11,29 16,26 L36,18 Z"
                  fill="#17233b"
                  stroke="#334155"
                  strokeWidth="1.2"
                />
                {/* Trachea */}
                <rect x="47.5" y="10" width="5" height="22" rx="2" fill="#38bdf8" opacity="0.35" />
                {/* Right Lung Silhouette */}
                <path
                  d="M46,27 C34,26 24,38 22,55 C20,69 24,78 33,78 C40,78 46,74 47,68 Z"
                  fill="#e11d48"
                  fillOpacity="0.22"
                  stroke="#fb7185"
                  strokeWidth="0.9"
                />
                {/* Left Lung Silhouette */}
                <path
                  d="M54,27 C66,26 76,38 78,55 C80,69 76,78 67,78 C60,78 54,74 53,68 Z"
                  fill="#e11d48"
                  fillOpacity="0.22"
                  stroke="#fb7185"
                  strokeWidth="0.9"
                />
                {/* Clavicle / Spine reference */}
                {viewSide === 'anterior' ? (
                  <path
                    d="M24,25 Q50,31 76,25 M50,28 L50,68"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="0.9"
                    strokeDasharray="2 2"
                  />
                ) : (
                  <line
                    x1="50"
                    y1="16"
                    x2="50"
                    y2="88"
                    stroke="#64748b"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}
              </svg>

              {/* Clickable Stethoscope Hotspots (>=44px touch targets) */}
              {visibleHotspots.map((spot) => {
                const isActive = activeHotspot.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => handleSelectHotspot(spot)}
                    title={spot.label}
                    style={{ left: `${spot.x}%`, top: `${spot.y * 0.83}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                      isActive ? 'scale-110 z-10' : 'hover:scale-105'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-sky-500 border-white text-white shadow-lg shadow-sky-500/40'
                          : 'bg-slate-900/90 border-sky-400 text-sky-300'
                      }`}
                    >
                      S
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="font-semibold text-sky-300">{activeHotspot.label}</div>
              <p className="text-slate-300 mt-0.5">{activeHotspot.areaNote}</p>
            </div>
          </div>

          {/* Right Zone: Waveform Player + Sound Library or Challenge */}
          <div className="lg:col-span-7 space-y-5">
            {/* Oscilloscope & Player Card */}
            <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs text-slate-400">
                    {challengeMode ? 'Mode Tantangan · Identifikasi Suara Misterius' : 'Monitor Gelombang Akustik'}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {challengeMode
                      ? 'Dengarkan Suara Napas Berikut Ini'
                      : `${activeProfile.name} (${activeProfile.englishName})`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Hentikan Suara' : 'Putar Auskultasi'}</span>
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={640}
                height={110}
                className="w-full h-28 rounded-xl border border-slate-800"
              />

              {/* Breathing Cycle Indicator */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div
                  className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                    breathPhase === 'inspirasi' && isPlaying
                      ? 'bg-sky-950 border-sky-500 text-sky-200'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400'
                  }`}
                >
                  1. Inspirasi (Tarik Napas)
                </div>
                <div
                  className={`px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
                    breathPhase === 'ekspirasi' && isPlaying
                      ? 'bg-amber-950 border-amber-500 text-amber-200'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400'
                  }`}
                >
                  2. Ekspirasi (Buang Napas)
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 font-mono-tabular">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isPlaying ? `${Math.round(phaseProgress * 100)}%` : 'Siap'}</span>
                </div>
              </div>
            </div>

            {!challengeMode ? (
              <>
                {/* Sound Library Grid */}
                <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-sky-400" />
                      <span>Katalog Suara Paru Normal & Abnormal</span>
                    </h4>
                    <span className="text-xs text-slate-400">Klik untuk mendengarkan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {LUNG_SOUNDS.map((sound) => {
                      const active = sound.id === selectedSoundId;
                      const isNormal = sound.category === 'Normal';
                      return (
                        <button
                          key={sound.id}
                          type="button"
                          onClick={() => handleSelectSound(sound.id)}
                          className={`text-left p-3 rounded-xl border transition-colors ${
                            active
                              ? 'bg-sky-950/70 border-sky-500'
                              : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white">{sound.name}</span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isNormal ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {sound.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {sound.character}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Sound Clinical Breakdown */}
                <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">
                      Analisis Suara: {activeProfile.name}
                    </h4>
                    <span
                      className={`text-xs font-semibold ${
                        activeProfile.category === 'Normal' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Kategori: {activeProfile.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-sky-400 font-semibold mb-1">Karakter & Waktu</div>
                      <p className="text-slate-200 leading-relaxed">{activeProfile.character}</p>
                      <p className="text-slate-400 mt-1.5">{activeProfile.timing}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-sky-400 font-semibold mb-1">Penyebab & Contoh Klinis</div>
                      <p className="text-slate-200 leading-relaxed">{activeProfile.cause}</p>
                      <p className="text-amber-300 mt-1.5 font-medium">
                        Contoh: {activeProfile.clinicalExample}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Blind Auscultation Challenge Panel */
              <div className="bg-[#111A2E] border border-amber-700/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Tantangan Tebak Suara Paru
                    </h4>
                    <p className="text-xs text-slate-300">
                      Dengarkan rekaman di atas lalu pilih jenis suara paru yang paling sesuai.
                    </p>
                  </div>
                  <div className="text-xs font-mono-tabular text-amber-300 font-semibold">
                    Skor Latihan: {challengeScore.correct}/{challengeScore.total}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LUNG_SOUNDS.filter((s) =>
                    ['vesicular', 'wheezing', 'crackles', 'rhonchi', 'stridor'].includes(s.id)
                  ).map((sound) => {
                    const isPicked = challengeAnswer === sound.id;
                    const isTarget = mysterySoundId === sound.id;
                    let cls =
                      'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800';
                    if (challengeAnswer !== null) {
                      if (isTarget) cls = 'bg-emerald-950 border-emerald-500 text-emerald-100';
                      else if (isPicked) cls = 'bg-rose-950 border-rose-500 text-rose-100';
                      else cls = 'bg-slate-900/40 border-slate-800 text-slate-500';
                    }
                    return (
                      <button
                        key={sound.id}
                        type="button"
                        onClick={() => handleAnswerChallenge(sound.id)}
                        disabled={challengeAnswer !== null}
                        className={`text-left p-3 rounded-xl border text-xs transition-colors ${cls}`}
                      >
                        <div className="font-bold text-sm">{sound.name}</div>
                        <div className="text-slate-400 mt-0.5">{sound.category}</div>
                      </button>
                    );
                  })}
                </div>

                {challengeAnswer !== null && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2 text-xs">
                      {challengeAnswer === mysterySoundId ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-slate-200">
                        Suara yang diputar adalah{' '}
                        <strong className="text-white">
                          {LUNG_SOUNDS.find((s) => s.id === mysterySoundId)?.name}
                        </strong>{' '}
                        — {LUNG_SOUNDS.find((s) => s.id === mysterySoundId)?.cause}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={startNewChallenge}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Soal Suara Baru</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
