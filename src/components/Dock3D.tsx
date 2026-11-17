import { ChevronDown, ChevronUp, Eye, Wind } from 'lucide-react';
import { ORGAN_DETAILS, type OrganId } from '../data/respiratoryData';

export type BreathMode = 'auto' | 'inspirasi' | 'ekspirasi';
export type BreathRate = 'normal' | 'olahraga';

interface Dock3DProps {
  compact: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  selectedOrgan: OrganId;
  onSelectOrgan: (organ: OrganId) => void;
  xrayMode: boolean;
  onToggleXray: () => void;
  breathMode: BreathMode;
  onChangeBreathMode: (m: BreathMode) => void;
  breathRate: BreathRate;
  onToggleBreathRate: () => void;
}

const ORGAN_LABEL: Record<OrganId, string> = {
  overview: 'Semua',
  nasal: 'Hidung',
  larynx: 'Laring',
  trachea: 'Trakea',
  bronchi: 'Bronkus',
  lungs: 'Paru',
  alveoli: 'Alveolus',
  diaphragm: 'Diafragma',
};

export default function Dock3D(p: Dock3DProps) {
  const wrapper = p.compact
    ? 'w-full flex flex-col items-stretch'
    : 'pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[96vw]';

  return (
    <div className={wrapper}>
      <button
        type="button"
        onClick={p.onToggleCollapsed}
        className="mb-1 self-center px-3 py-1.5 rounded-md bg-[#0F172A]/95 border border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0"
      >
        {p.collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Buka Kontrol 3D</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Sembunyikan Kontrol 3D</span>
          </>
        )}
      </button>

      {!p.collapsed && (
        <div className="bg-[#0F172A]/96 border border-slate-700 rounded-xl px-3 py-2 shadow-xl flex flex-wrap items-center justify-center gap-2">
          <div
            className={`flex items-center gap-1 overflow-x-auto ${
              p.compact ? 'w-full pb-1' : 'max-w-[60vw]'
            }`}
          >
            {(Object.keys(ORGAN_DETAILS) as OrganId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => p.onSelectOrgan(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  p.selectedOrgan === id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ORGAN_LABEL[id]}
              </button>
            ))}
          </div>

          {!p.compact && <div className="h-5 w-px bg-slate-700 hidden sm:block" />}

          <button
            type="button"
            onClick={p.onToggleXray}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              p.xrayMode
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>X-Ray</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {(
              [
                { id: 'auto', label: 'Napas Auto' },
                { id: 'inspirasi', label: 'Inspirasi' },
                { id: 'ekspirasi', label: 'Ekspirasi' },
              ] as const
            ).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => p.onChangeBreathMode(b.id)}
                className={`px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  p.breathMode === b.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={p.onToggleBreathRate}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              p.breathRate === 'olahraga'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{p.breathRate === 'olahraga' ? 'Laju Olahraga' : 'Laju Istirahat'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
