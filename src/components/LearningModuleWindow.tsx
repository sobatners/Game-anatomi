import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import {
  generateDownloadableModuleHTML,
  LEARNING_MODULES,
} from '../data/respiratoryData';
import { respiAudio } from '../audio/respiAudio';

export type ModuleWindowState = 'closed' | 'open' | 'minimized';

interface LearningModuleWindowProps {
  windowState: ModuleWindowState;
  onChangeState: (state: ModuleWindowState) => void;
  /** HP / layar kecil: jendela modul tampil layar penuh */
  compact?: boolean;
}

export default function LearningModuleWindow({
  windowState,
  onChangeState,
  compact = false,
}: LearningModuleWindowProps) {
  const [activeBabIdx, setActiveBabIdx] = useState(0);
  const [expandedMode, setExpandedMode] = useState(false);
  const [revealedCheck, setRevealedCheck] = useState<Record<string, boolean>>({});
  const [downloadFeedback, setDownloadFeedback] = useState(false);

  if (windowState === 'closed') return null;

  const activeModule = LEARNING_MODULES[activeBabIdx];

  const handleDownloadModule = () => {
    respiAudio.playCorrect();
    const html = generateDownloadableModuleHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Modul_Anatomi_Fisiologi_Pernapasan_Kelas_X.html';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadFeedback(true);
    window.setTimeout(() => setDownloadFeedback(false), 3000);
  };

  // MINIMIZED FLOATING DOCK FOR MULTITASKING
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-3 right-3 z-50 w-[min(370px,calc(100vw-1.5rem))] mb-[env(safe-area-inset-bottom)] bg-[#0F172A] border border-sky-500/60 rounded-xl shadow-2xl p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-sky-400">
            Modul Di-Minimize · Multitasking Aktif
          </div>
          <div className="text-xs font-bold text-white truncate">
            {activeModule.chapter}: {activeModule.title}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadModule}
            title="Unduh Modul (1-Klik)"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              respiAudio.playClick();
              onChangeState('open');
            }}
            title="Pulihkan Layar Modul"
            className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Buka</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeState('closed')}
            title="Tutup Modul"
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/70 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // OPEN FLOATING / SPLIT READER WINDOW (Allows Minimize + Resize + 1-Click Download)
  return (
    <div
      className={`fixed z-50 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
        compact
          ? 'inset-2'
          : expandedMode
          ? 'inset-4 sm:inset-8'
          : 'bottom-4 right-4 w-[min(560px,calc(100vw-2rem))] h-[min(640px,calc(100dvh-6rem))]'
      }`}
    >
      {/* Window Title Bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-sm font-bold text-white truncate">
            Modul Pembelajaran Interaktif Kelas X
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadModule}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadFeedback ? 'Terunduh!' : 'Unduh Modul'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              respiAudio.playClick();
              onChangeState('minimized');
            }}
            title="Minimize ke pojok layar untuk multitasking"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              respiAudio.playClick();
              setExpandedMode((e) => !e);
            }}
            title={expandedMode ? 'Perkecil jendela' : 'Perbesar layar penuh'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChangeState('closed')}
            title="Tutup modul"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/70 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chapter Selector Strip */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 overflow-x-auto shrink-0">
        {LEARNING_MODULES.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              respiAudio.playClick();
              setActiveBabIdx(idx);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              idx === activeBabIdx
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {m.chapter}
          </button>
        ))}
      </div>

      {/* Module Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <div className="text-xs font-semibold text-sky-400">{activeModule.chapter}</div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            {activeModule.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {activeModule.summary}
          </p>
        </div>

        <div className="space-y-3">
          {activeModule.points.map((pt, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
            >
              <h4 className="text-sm font-bold text-sky-300">{pt.heading}</h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{pt.body}</p>
            </div>
          ))}
        </div>

        {activeModule.table && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-sky-300">
                <tr>
                  {activeModule.table.headers.map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold border-b border-slate-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeModule.table.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="bg-slate-900/40">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-3 py-2 text-slate-200 ${
                          cIdx === 1 ? 'font-mono-tabular text-sky-300' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Interactive Quick Check */}
        <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-700/50 space-y-2">
          <button
            type="button"
            onClick={() =>
              setRevealedCheck((prev) => ({
                ...prev,
                [activeModule.id]: !prev[activeModule.id],
              }))
            }
            className="w-full flex items-center justify-between gap-2 text-left text-xs font-semibold text-sky-200"
          >
            <span>Uji Pemahaman Singkat: {activeModule.quickCheck.question}</span>
            {revealedCheck[activeModule.id] ? (
              <ChevronUp className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" />
            )}
          </button>
          {revealedCheck[activeModule.id] && (
            <p className="text-xs text-emerald-200 pt-2 border-t border-sky-800/60 leading-relaxed">
              <strong>Jawaban: </strong>
              {activeModule.quickCheck.answer}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Multitasking Tip Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
        <span>Tip: Klik ikon Minimize di kanan atas untuk membaca sambil praktik di Lab/3D.</span>
        <button
          type="button"
          onClick={() => onChangeState('minimized')}
          className="text-sky-400 hover:text-sky-300 font-semibold whitespace-nowrap shrink-0"
        >
          Minimize Sekarang
        </button>
      </div>
    </div>
  );
}
