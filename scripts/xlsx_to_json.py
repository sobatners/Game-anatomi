#!/usr/bin/env python3
"""Mengubah soal/Soal_RespiQuest.xlsx menjadi public/data/soal.json.

Dijalankan otomatis oleh GitHub Actions setiap deploy.
Jalankan manual (opsional):  pip install openpyxl  &&  python scripts/xlsx_to_json.py
Jika ada kesalahan pengisian, skrip berhenti dengan pesan yang menyebut tab & baris.
"""
import hashlib
import json
import sys
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "soal" / "Soal_RespiQuest.xlsx"
OUT = ROOT / "public" / "data" / "soal.json"
LETTERS = "ABCDE"
MISSION_COUNT = 5
CASE_COUNT = 4

errors = []


def err(sheet, row, msg):
    errors.append(f"[Tab {sheet}, baris {row}] {msg}")


def text(v):
    return "" if v is None else str(v).strip()


def read_rows(ws, anchor):
    """Cari baris judul (yang memuat kata `anchor`), kembalikan list (nomor_baris, {kolom: nilai})."""
    header_row, headers = None, {}
    for r in range(1, 15):
        vals = [text(c.value).lower() for c in ws[r]]
        if any(v.startswith(anchor) for v in vals):
            header_row = r
            for i, v in enumerate(vals):
                if v:
                    headers[v] = i
            break
    if header_row is None:
        err(ws.title, 3, f'Baris judul kolom tidak ditemukan (harus ada kolom "{anchor}"). Jangan ubah baris judul.')
        return []

    def col(*keys):
        for k in keys:
            for h, i in headers.items():
                if h.startswith(k):
                    return i
        return None

    rows = []
    for r in range(header_row + 1, ws.max_row + 1):
        cells = [c.value for c in ws[r]]
        if not any(text(v) for v in cells):
            continue
        rows.append((r, cells, col))
    return rows


def parse_options(sheet, r, cells, col):
    opts = []
    for L in LETTERS:
        i = col(f"opsi {L.lower()}")
        v = text(cells[i]) if i is not None and i < len(cells) else ""
        opts.append(v)
    # opsi harus berurutan tanpa celah
    while opts and not opts[-1]:
        opts.pop()
    if len(opts) < 2:
        err(sheet, r, "Minimal 2 opsi jawaban (Opsi A dan Opsi B) harus diisi.")
    if any(not o for o in opts):
        err(sheet, r, "Ada opsi kosong di tengah. Isi opsi berurutan A, B, C, ... tanpa celah.")
    return opts


def parse_answer(sheet, r, cells, col, opts):
    i = col("jawaban benar")
    L = text(cells[i]).upper() if i is not None and i < len(cells) else ""
    if L not in LETTERS or LETTERS.index(L) >= len(opts):
        err(sheet, r, f'Kolom "Jawaban Benar" berisi "{L}" tetapi harus huruf yang menunjuk ke opsi terisi (A-{LETTERS[max(len(opts)-1,0)]}).')
        return 0
    return LETTERS.index(L)


def get(cells, col, *keys):
    i = col(*keys)
    return text(cells[i]) if i is not None and i < len(cells) else ""


def main():
    if not SRC.exists():
        sys.exit(f"File tidak ditemukan: {SRC}")
    wb = load_workbook(SRC, data_only=True)

    def sheet(name):
        if name not in wb.sheetnames:
            errors.append(f'Tab "{name}" tidak ada. Jangan menghapus atau mengganti nama tab.')
            return None
        return wb[name]

    # Pengaturan
    kkm = 75
    ws = sheet("Pengaturan")
    if ws:
        for row in ws.iter_rows(min_row=1, max_row=30, values_only=True):
            if row and row[0] and text(row[0]).lower().startswith("kkm"):
                try:
                    kkm = max(0, min(100, int(float(row[1]))))
                except (TypeError, ValueError):
                    err("Pengaturan", 4, "Nilai KKM harus berupa angka 0-100.")
                break

    # Misi
    missions = {}
    for n in range(1, MISSION_COUNT + 1):
        name = f"Misi_{n}"
        ws = sheet(name)
        qs = []
        if ws:
            for k, (r, cells, col) in enumerate(read_rows(ws, "pertanyaan"), start=1):
                q = get(cells, col, "pertanyaan")
                if not q:
                    err(name, r, "Kolom Pertanyaan kosong.")
                opts = parse_options(name, r, cells, col)
                qs.append({
                    "id": f"m{n}q{k}",
                    "question": q,
                    "options": opts,
                    "correctIndex": parse_answer(name, r, cells, col, opts),
                    "hint": get(cells, col, "petunjuk") or "Baca kembali materi pada organ yang sedang dipelajari.",
                    "explanation": get(cells, col, "pembahasan"),
                })
            if not qs:
                err(name, 4, "Belum ada soal. Isi minimal 1 soal.")
        missions[str(n)] = qs

    # Diagnosis
    cases = {}
    name = "Diagnosis_Klinis"
    ws = sheet(name)
    if ws:
        for r, cells, col in read_rows(ws, "no kasus"):
            try:
                no = int(float(text(cells[col("no kasus")])))
            except (TypeError, ValueError):
                err(name, r, 'Kolom "No Kasus" harus angka 1-4.')
                continue
            if not 1 <= no <= CASE_COUNT:
                err(name, r, f"No Kasus {no} tidak dikenal. Game hanya memiliki kasus 1-{CASE_COUNT}.")
                continue
            opts = parse_options(name, r, cells, col)
            cases[str(no)] = {
                "options": opts,
                "correctIndex": parse_answer(name, r, cells, col, opts),
                "explanation": get(cells, col, "pembahasan"),
            }
        for no in range(1, CASE_COUNT + 1):
            if str(no) not in cases:
                err(name, 4, f"Kasus nomor {no} belum diisi.")

    # Kuis
    quiz = []
    name = "Kuis_Evaluasi"
    ws = sheet(name)
    if ws:
        for k, (r, cells, col) in enumerate(read_rows(ws, "pertanyaan"), start=1):
            q = get(cells, col, "pertanyaan")
            if not q:
                err(name, r, "Kolom Pertanyaan kosong.")
            opts = parse_options(name, r, cells, col)
            quiz.append({
                "id": f"k{k}",
                "topic": get(cells, col, "topik") or "Umum",
                "question": q,
                "options": opts,
                "correctIndex": parse_answer(name, r, cells, col, opts),
                "explanation": get(cells, col, "pembahasan"),
            })
        if not quiz:
            err(name, 4, "Belum ada soal kuis.")

    if errors:
        print("GAGAL membaca spreadsheet. Perbaiki hal berikut lalu upload ulang:\n", file=sys.stderr)
        for e in errors:
            print(" - " + e, file=sys.stderr)
        sys.exit(1)

    data = {"kkm": kkm, "missions": missions, "cases": cases, "quiz": quiz}
    digest = hashlib.sha1(json.dumps(data, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()[:10]
    data = {"version": digest, **data}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(len(v) for v in missions.values()) + len(cases) + len(quiz)
    print(f"Berhasil: {total} soal ditulis ke {OUT.relative_to(ROOT)} (versi {digest}, KKM {kkm})")


if __name__ == "__main__":
    main()
