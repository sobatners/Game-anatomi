import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  FileText,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { type QuizQuestion } from '../data/respiratoryData';
import { computeScore, formatScore, type QuestionBank } from '../lib/questionBank';
import { respiAudio } from '../audio/respiAudio';

interface EvaluationQuizProps {
  bank: QuestionBank;
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onClearAnswers: (questionIds: string[]) => void;
  studentName: string;
  studentClass: string;
  onUpdateStudent: (name: string, cls: string) => void;
  completedMissionsCount: number;
  solvedCasesCount: number;
  lastQuizScore: number | null;
  onQuizFinish: (scorePct: number) => void;
}

export default function EvaluationQuiz({
  bank,
  answers,
  onAnswer,
  onClearAnswers,
  studentName,
  studentClass,
  onUpdateStudent,
  completedMissionsCount,
  solvedCasesCount,
  onQuizFinish,
}: EvaluationQuizProps) {
  const [submitted, setSubmitted] = useState(false);

  // Exit Ticket Reflection Fields
  const [learnedNote, setLearnedNote] = useState('');
  const [questionNote, setQuestionNote] = useState('');
  const [confidence, setConfidence] = useState<number>(4);
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);

  const quiz = bank.quiz;
  const totalQuestions = quiz.length;
  const answeredCount = quiz.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = quiz.filter((q) => answers[q.id] === q.correctIndex).length;

  // Penilaian keseluruhan: tiap soal = 100 / total seluruh soal (semua bagian)
  const summary = computeScore(bank, answers);
  const scorePct = summary.finalScore;
  const missionTotal = bank.missions.length;
  const caseTotal = bank.cases.length;

  const topicStats = Array.from(new Set(quiz.map((q) => q.topic))).map((topic) => {
    const qs = quiz.filter((q) => q.topic === topic);
    const right = qs.filter((q) => answers[q.id] === q.correctIndex).length;
    const answered = qs.filter((q) => answers[q.id] !== undefined).length;
    return {
      topic,
      total: qs.length,
      answered,
      right,
      pct: Math.round((right / qs.length) * 100),
    };
  });

  const handleChoose = (q: QuizQuestion, optIdx: number) => {
    if (submitted) return;
    onAnswer(q.id, optIdx);
    if (optIdx === q.correctIndex) {
      respiAudio.playCorrect();
    } else {
      respiAudio.playWrong();
    }
  };

  const handleFinishQuiz = () => {
    respiAudio.playOrganSelect();
    setSubmitted(true);
    onQuizFinish(scorePct);
  };

  const handleResetQuiz = () => {
    respiAudio.playClick();
    onClearAnswers(quiz.map((q) => q.id));
    setSubmitted(false);
    setDownloadedNotice(null);
  };

  const handleDownloadExitTicketPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer card
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(36, 36, 1028, 648, 20);
    ctx.fill();
    ctx.stroke();

    // Header band
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.roundRect(36, 36, 1028, 96, [20, 20, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('EXIT TICKET — RESPIQUEST KELAS X', 70, 86);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#E0F2FE';
    ctx.fillText('Evaluasi Pemahaman Anatomi & Fisiologi Sistem Pernapasan', 70, 114);

    // Student info
    const nama = studentName.trim() || 'Siswa Kelas X';
    const kelas = studentClass.trim() || 'X Kesehatan / IPA';
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    ctx.fillStyle = '#94A3B8';
    ctx.font = '15px sans-serif';
    ctx.fillText('NAMA SISWA', 70, 172);
    ctx.fillText('KELAS', 430, 172);
    ctx.fillText('TANGGAL', 720, 172);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(nama, 70, 202);
    ctx.fillText(kelas, 430, 202);
    ctx.fillText(dateStr, 720, 202);

    // Metrics boxes
    const metrics = [
      { label: 'NILAI AKHIR (0-100)', val: `${formatScore(scorePct)} (${summary.correct}/${summary.total})` },
      { label: 'MISI PETUALANGAN', val: `${completedMissionsCount} / ${missionTotal} Selesai` },
      { label: 'DIAGNOSIS KLINIS', val: `${solvedCasesCount} / ${caseTotal} Kasus` },
    ];
    metrics.forEach((m, idx) => {
      const bx = 70 + idx * 326;
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, 234, 304, 90, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(m.label, bx + 18, 264);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(m.val, bx + 18, 304);
    });

    // Topic breakdown
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(
      `Topik: ${topicStats.map((t) => `${t.topic} ${t.pct}%`).join('  ·  ')}  ·  Pemahaman Diri: ${confidence}/5`,
      70,
      366
    );

    // Reflection boxes
    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let cy = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, x, cy);
          line = words[n] + ' ';
          cy += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, cy);
    };

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(70, 392, 960, 112, 12);
    ctx.fill();
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('1. HAL BARU YANG SAYA PELAJARI HARI INI:', 90, 420);
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '16px sans-serif';
    drawWrappedText(
      learnedNote.trim() || 'Memahami struktur organ pernapasan, mekanika diafragma, dan suara paru.',
      90,
      450,
      910,
      24
    );

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(70, 520, 960, 112, 12);
    ctx.fill();
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('2. PERTANYAAN ATAU TOPIK YANG INGIN DIPERDALAM:', 90, 548);
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '16px sans-serif';
    drawWrappedText(
      questionNote.trim() || 'Tidak ada kendala berarti, siap praktik laboratorium lebih lanjut.',
      90,
      578,
      910,
      24
    );

    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText('RespiQuest · Laporan Exit Ticket Otomatis Siswa', 70, 662);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Exit_Ticket_${nama.replace(/\s+/g, '_')}.png`;
    a.click();
    respiAudio.playCorrect();
    setDownloadedNotice('Exit Ticket PNG berhasil diunduh!');
  };

  const handleDownloadExitTicketTXT = () => {
    const nama = studentName.trim() || 'Siswa Kelas X';
    const kelas = studentClass.trim() || 'X';
    const content = [
      '=== EXIT TICKET RESPIQUEST (ANATOMI & FISIOLOGI PERNAPASAN) ===',
      `Nama Siswa   : ${nama}`,
      `Kelas        : ${kelas}`,
      `Tanggal      : ${new Date().toLocaleString('id-ID')}`,
      `Nilai Akhir : ${formatScore(scorePct)} dari 100 (${summary.correct} dari ${summary.total} soal benar)`,
      `Status       : ${summary.passed ? 'Tuntas' : 'Belum Tuntas'} (KKM ${summary.kkm})`,
      ...summary.sections.map(
        (sec) => `${sec.label.padEnd(16)}: ${sec.correct}/${sec.total} benar (nilai ${formatScore(sec.sectionScore)})`
      ),
      ...topicStats.map((t) => `Topik ${t.topic.padEnd(10)}: ${t.pct}%`),
      `Misi Selesai : ${completedMissionsCount}/${missionTotal}`,
      `Kasus Klinik : ${solvedCasesCount}/${caseTotal}`,
      `Pemahaman    : ${confidence}/5`,
      '',
      'Hal baru yang dipelajari:',
      learnedNote.trim() || '-',
      '',
      'Hal yang masih ingin ditanyakan:',
      questionNote.trim() || '-',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Exit_Ticket_${nama.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    respiAudio.playClick();
    setDownloadedNotice('Exit Ticket TXT berhasil diunduh!');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0B1220] pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Student Identity */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs font-medium text-sky-400">
              Evaluasi Otomatis & Pemantauan Progres Real-Time
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Kuis Evaluasi & Exit Ticket Siswa
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Setiap jawaban langsung dikoreksi otomatis secara real-time. Di akhir kuis, unduh Exit Ticket dalam satu klik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={studentName}
              onChange={(e) => onUpdateStudent(e.target.value, studentClass)}
              placeholder="Nama Lengkap Siswa"
              className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              value={studentClass}
              onChange={(e) => onUpdateStudent(studentName, e.target.value)}
              placeholder="Kelas (mis. X-A)"
              className="w-28 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Real-Time Progress Monitor Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111A2E] border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Progres Pengerjaan</div>
            <div className="text-2xl font-bold font-mono-tabular text-white mt-1">
              {answeredCount}/{totalQuestions} Soal
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-[#111A2E] border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Nilai Akhir (0-100)</div>
            <div className="text-2xl font-bold font-mono-tabular text-emerald-400 mt-1">
              {formatScore(scorePct)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.correct} dari {summary.total} soal benar · KKM {summary.kkm}
            </div>
          </div>

          {topicStats.slice(0, 2).map((t) => (
            <div key={t.topic} className="bg-[#111A2E] border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400">Penguasaan {t.topic}</div>
              <div className="text-2xl font-bold font-mono-tabular text-sky-300 mt-1">
                {t.right}/{t.total} ({t.pct}%)
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {t.answered} dari {t.total} soal terjawab
              </div>
            </div>
          ))}
        </div>

        {/* Rekap Nilai Per Bagian */}
        <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-sky-400">Rekap Nilai Seluruh Bagian</div>
              <div className="text-3xl font-extrabold font-mono-tabular text-white">
                {formatScore(summary.finalScore)}
                <span className="text-base font-semibold text-slate-400"> / 100</span>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                summary.answered < summary.total
                  ? 'bg-slate-800 text-slate-300'
                  : summary.passed
                  ? 'bg-emerald-900/70 text-emerald-300'
                  : 'bg-rose-900/70 text-rose-300'
              }`}
            >
              {summary.answered < summary.total
                ? `Belum semua dijawab (${summary.answered}/${summary.total})`
                : summary.passed
                ? `Tuntas (KKM ${summary.kkm})`
                : `Belum Tuntas (KKM ${summary.kkm})`}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tiap soal bernilai {formatScore(Math.round(summary.pointPerQuestion * 100) / 100)} poin
            (100 ÷ {summary.total} soal). Soal salah atau belum dijawab = 0 poin. Jika sebuah bagian diulang,
            jawaban terakhir yang dihitung.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {summary.sections.map((sec) => (
              <div key={sec.key} className="rounded-xl bg-slate-900 border border-slate-800 p-2.5">
                <div className="text-[11px] text-slate-400">{sec.label}</div>
                <div className="text-sm font-bold font-mono-tabular text-white">
                  {sec.correct}/{sec.total} benar
                </div>
                <div className="text-[11px] text-sky-300 font-mono-tabular">
                  +{formatScore(sec.points)} poin
                  {sec.answered < sec.total ? ` · ${sec.total - sec.answered} belum` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {quiz.map((q, idx) => {
            const chosen = answers[q.id];
            const isAnswered = chosen !== undefined;
            const isRight = chosen === q.correctIndex;
            return (
              <div
                key={q.id}
                className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-sky-400 font-semibold">
                    Soal {idx + 1} · Topik: {q.topic}
                  </span>
                  {isAnswered && (
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        isRight ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isRight ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Benar</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Perlu Tinjau</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const picked = chosen === optIdx;
                    const rightOpt = optIdx === q.correctIndex;
                    let cls =
                      'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800';
                    if (isAnswered) {
                      if (rightOpt) cls = 'bg-emerald-950/80 border-emerald-500 text-emerald-100';
                      else if (picked) cls = 'bg-rose-950/80 border-rose-500 text-rose-100';
                      else cls = 'bg-slate-900/40 border-slate-800 text-slate-500';
                    }
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleChoose(q, optIdx)}
                        disabled={isAnswered}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors ${cls}`}
                      >
                        <span className="font-bold mr-1.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-sky-300">Pembahasan: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Finish Quiz Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111A2E] border border-slate-800 rounded-2xl p-5">
          <div>
            <div className="text-sm font-bold text-white">
              {submitted
                ? `Evaluasi Selesai · Nilai Akhir Kamu: ${formatScore(scorePct)}`
                : `Status Pengerjaan: ${answeredCount} dari ${totalQuestions} soal terisi`}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik "Selesaikan Evaluasi & Buat Exit Ticket" setelah menjawab untuk mengunci nilai dan mengunduh Exit Ticket.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Kuis</span>
            </button>
            {!submitted && (
              <button
                type="button"
                onClick={handleFinishQuiz}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Award className="w-4 h-4" />
                <span>Selesaikan Evaluasi & Buat Exit Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Exit Ticket Card (Always reachable after finishing or directly below) */}
        <div className="bg-[#111A2E] border border-sky-600/50 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-semibold text-sky-400">
                Exit Ticket Pembelajaran · Sekali Klik Unduh
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Kartu Exit Ticket: {studentName.trim() || 'Siswa Kelas X'} ({studentClass.trim() || 'X'})
              </h3>
            </div>
            <div className="text-right font-mono-tabular">
              <div className="text-xs text-slate-400">Rekap Otomatis</div>
              <div className="text-lg font-bold text-emerald-400">
                Nilai {formatScore(scorePct)} · {completedMissionsCount}/{missionTotal} Misi · {solvedCasesCount}/{caseTotal} Kasus
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                1. Satu hal baru yang paling kamu pahami hari ini:
              </label>
              <textarea
                rows={3}
                value={learnedNote}
                onChange={(e) => setLearnedNote(e.target.value)}
                placeholder="Contoh: Saya jadi paham kenapa diafragma turun saat menarik napas dan suara wheezing muncul saat asma."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                2. Hal yang masih ingin kamu tanyakan kepada guru:
              </label>
              <textarea
                rows={3}
                value={questionNote}
                onChange={(e) => setQuestionNote(e.target.value)}
                placeholder="Contoh: Bagaimana cara membedakan ronki basah dan ronki kering lebih cepat?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Tingkat Pemahaman Diri:</span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConfidence(num)}
                  className={`w-8 h-8 rounded-lg font-bold font-mono-tabular transition-colors ${
                    confidence === num
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadExitTicketTXT}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Unduh TXT</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadExitTicketPNG}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Exit Ticket (PNG 1-Klik)</span>
              </button>
            </div>
          </div>

          {downloadedNotice && (
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadedNotice}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
