export type OrganId =
  | 'overview'
  | 'nasal'
  | 'larynx'
  | 'trachea'
  | 'bronchi'
  | 'lungs'
  | 'alveoli'
  | 'diaphragm';

export interface OrganDetail {
  id: OrganId;
  name: string;
  latinName: string;
  category: 'Saluran Atas' | 'Saluran Bawah' | 'Organ Utama' | 'Otot Pernapasan' | 'Keseluruhan';
  shortRole: string;
  description: string;
  keyFacts: string[];
  clinicalNote: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export const ORGAN_DETAILS: Record<OrganId, OrganDetail> = {
  overview: {
    id: 'overview',
    name: 'Sistem Pernapasan Manusia',
    latinName: 'Systema Respiratorium',
    category: 'Keseluruhan',
    shortRole: 'Menyuplai oksigen (O₂) ke darah dan membuang karbon dioksida (CO₂) dari tubuh.',
    description:
      'Sistem pernapasan terdiri dari saluran napas bagian atas, saluran napas bagian bawah, sepasang paru-paru, serta otot diafragma yang bekerja sama mengatur keluar-masuknya udara.',
    keyFacts: [
      'Frekuensi napas normal remaja/dewasa saat istirahat: 12–20 kali per menit.',
      'Paru kanan memiliki 3 lobus, sedangkan paru kiri memiliki 2 lobus karena memberi ruang bagi jantung.',
      'Klik langsung pada bagian organ 3D untuk melihat detail anatomi dan fungsinya.',
    ],
    clinicalNote: 'Gunakan mode X-Ray untuk melihat percabangan bronkus dan aliran oksigen di dalam paru.',
    cameraPos: [0, 0.8, 7.6],
    cameraTarget: [0, 0.2, 0],
  },
  nasal: {
    id: 'nasal',
    name: 'Rongga Hidung & Faring',
    latinName: 'Cavum Nasi & Pharynx',
    category: 'Saluran Atas',
    shortRole: 'Menyaring debu, menghangatkan, dan melembapkan udara yang baru masuk.',
    description:
      'Udara pertama kali masuk melalui lubang hidung menuju rongga hidung yang dilapisi rambut halus (silia) dan selaput lendir (mukus), lalu diteruskan ke faring (persimpangan saluran napas dan cerna).',
    keyFacts: [
      'Konka nasalis memperluas permukaan rongga hidung agar udara cepat hangat sesuai suhu tubuh.',
      'Silia dan mukus menjebak partikel debu serta kuman sebelum mencapai paru-paru.',
      'Faring terbagi menjadi nasofaring, orofaring, dan laringofaring.',
    ],
    clinicalNote: 'Bernapas lewat hidung lebih sehat daripada lewat mulut karena udara tersaring dan lembap.',
    cameraPos: [1.9, 3.1, 3.2],
    cameraTarget: [0, 2.75, 0.15],
  },
  larynx: {
    id: 'larynx',
    name: 'Laring (Pangkal Tenggorokan)',
    latinName: 'Larynx',
    category: 'Saluran Atas',
    shortRole: 'Menghasilkan suara melalui pita suara dan mencegah makanan masuk ke saluran napas.',
    description:
      'Laring terletak di antara faring dan trakea. Di dalamnya terdapat katup epiglotis yang otomatis menutup saluran napas saat menelan serta sepasang pita suara yang bergetar menghasilkan suara.',
    keyFacts: [
      'Tersusun atas tulang rawan tiroid (jakun) dan tulang rawan krikoid.',
      'Epiglotis bertindak sebagai pintu pengaman agar kita tidak tersedak saat makan/minum.',
      'Pita suara bergetar oleh hembusan udara dari paru-paru untuk berbicara.',
    ],
    clinicalNote: 'Pembengkakan di area laring dapat menimbulkan suara napas nyaring saat inspirasi yang disebut stridor.',
    cameraPos: [1.8, 2.15, 2.9],
    cameraTarget: [0, 1.9, 0],
  },
  trachea: {
    id: 'trachea',
    name: 'Trakea (Batang Tenggorokan)',
    latinName: 'Trachea',
    category: 'Saluran Bawah',
    shortRole: 'Saluran udara utama berbentuk pipa yang diperkuat cincin tulang rawan.',
    description:
      'Trakea menghubungkan laring dengan bronkus utama. Dindingnya diperkuat 16–20 cincin tulang rawan hialin berbentuk huruf C agar saluran tetap terbuka dan tidak kempis saat tekanan napas berubah.',
    keyFacts: [
      'Panjang trakea manusia dewasa sekitar 10–12 cm dengan diameter ±2 cm.',
      'Lapisan dalamnya memiliki epitel bersilia yang mendorong lendir kotor ke atas (refleks batuk).',
      'Ujung bawah trakea bercabang dua pada titik bernama karina.',
    ],
    clinicalNote: 'Bagian belakang cincin C yang terbuka memberi ruang bagi kerongkongan saat menelan makanan.',
    cameraPos: [2.1, 1.35, 3.2],
    cameraTarget: [0, 1.15, 0],
  },
  bronchi: {
    id: 'bronchi',
    name: 'Bronkus & Bronkiolus',
    latinName: 'Bronchus & Bronchiolus',
    category: 'Saluran Bawah',
    shortRole: 'Membagi aliran udara secara merata ke seluruh lobus paru kanan dan kiri.',
    description:
      'Trakea bercabang menjadi bronkus primer kanan dan kiri, lalu terus bercabang menjadi bronkus sekunder (lobaris), bronkus tersier (segmental), hingga saluran sangat kecil bernama bronkiolus.',
    keyFacts: [
      'Bronkus primer kanan lebih lebar, lebih pendek, dan lebih vertikal dibanding bronkus kiri.',
      'Bronkiolus tidak lagi memiliki cincin tulang rawan, melainkan dikelilingi otot polos.',
      'Saat serangan asma, otot polos bronkiolus berkontraksi (menyempit) sehingga muncul suara mengi (wheezing).',
    ],
    clinicalNote: 'Penyempitan bronkiolus meningkatkan hambatan aliran udara terutama saat membuang napas.',
    cameraPos: [2.0, 0.55, 3.6],
    cameraTarget: [0, 0.4, 0],
  },
  lungs: {
    id: 'lungs',
    name: 'Paru-Paru (Pulmo)',
    latinName: 'Pulmo Dexter & Sinister',
    category: 'Organ Utama',
    shortRole: 'Organ utama respirasi yang menampung jutaan alveolus dan dibungkus selaput pleura.',
    description:
      'Paru-paru merupakan sepasang organ bertekstur spons elastis di dalam rongga dada. Paru kanan terdiri dari 3 lobus (atas, tengah, bawah), sedangkan paru kiri terdiri dari 2 lobus (atas, bawah) dengan lekukan jantung.',
    keyFacts: [
      'Dilindungi oleh tulang rusuk dan dibungkus dua lapis selaput pleura berisi cairan pelumas.',
      'Tekanan negatif di rongga pleura menjaga paru tetap mengembang.',
      'Jika udara masuk ke rongga pleura disebut Pneumotoraks; jika cairan berlebih disebut Efusi Pleura.',
    ],
    clinicalNote: 'Pada pemeriksaan perkusi dada yang sehat, paru-paru menghasilkan suara sonor (resonan).',
    cameraPos: [0, 0.4, 5.5],
    cameraTarget: [0, 0.25, 0],
  },
  alveoli: {
    id: 'alveoli',
    name: 'Alveolus (Kantung Udara)',
    latinName: 'Alveoli Pulmonis',
    category: 'Organ Utama',
    shortRole: 'Tempat pertukaran gas O₂ dan CO₂ secara difusi dengan pembuluh darah kapiler.',
    description:
      'Di ujung bronkiolus terdapat sekumpulan kantung udara mikroskopis berdinding sangat tipis (hanya 1 lapis sel) yang dikelilingi jaring-jaring pembuluh darah kapiler.',
    keyFacts: [
      'Terdapat sekitar 300–500 juta alveolus di kedua paru dengan total luas permukaan ±70 m².',
      'O₂ berdifusi dari alveolus masuk ke darah (diikat hemoglobin), sedangkan CO₂ berdifusi keluar ke alveolus.',
      'Cairan surfaktan melapisi bagian dalam alveolus agar tidak lengket/kolaps saat mengempis.',
    ],
    clinicalNote: 'Jika alveolus terisi cairan atau nanah akibat infeksi (pneumonia), terdengar suara ronki basah halus (crackles).',
    cameraPos: [-1.45, -0.1, 2.85],
    cameraTarget: [-0.95, -0.15, 0.1],
  },
  diaphragm: {
    id: 'diaphragm',
    name: 'Otot Diafragma',
    latinName: 'Diaphragma Thoracis',
    category: 'Otot Pernapasan',
    shortRole: 'Penggerak utama mekanisme inspirasi dan ekspirasi dengan mengubah volume rongga dada.',
    description:
      'Diafragma adalah sekat otot berbentuk kubah yang memisahkan rongga dada (toraks) dan rongga perut (abdomen). Kontraksinya menjadi kunci pernapasan perut.',
    keyFacts: [
      'Inspirasi (menarik napas): diafragma berkontraksi dan mendatar ke bawah → volume dada membesar → tekanan paru turun → udara masuk.',
      'Ekspirasi (membuang napas): diafragma relaksasi dan melengkung ke atas → volume dada mengecil → tekanan naik → udara keluar.',
      'Saat beraktivitas berat, otot antar tulang rusuk luar ikut membantu mengangkat tulang rusuk.',
    ],
    clinicalNote: 'Kontraksi diafragma secara tiba-tiba dan berulang menyebabkan cegukan.',
    cameraPos: [0.3, -1.25, 4.7],
    cameraTarget: [0, -1.15, 0],
  },
};

export interface MissionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface AdventureMission {
  id: number;
  chapterTitle: string;
  subtitle: string;
  targetOrgan: OrganId;
  narrator: string;
  storyText: string;
  missionObjective: string;
  questions: MissionQuestion[];
}

export const ADVENTURE_MISSIONS: AdventureMission[] = [
  {
    id: 1,
    chapterTitle: 'Misi 1: Gerbang Udara Pertama',
    subtitle: 'Rongga Hidung & Faring',
    targetOrgan: 'nasal',
    narrator: 'Dr. Raka · Pemandu Ekspedisi',
    storyText:
      'Selamat datang di Ekspedisi Napas! Bayangkan dirimu mengecil seukuran molekul Oksigen (O₂). Perjalanan kita dimulai saat manusia menarik napas pagi yang sejuk. Kita meluncur masuk melewati rambut-rambut halus dan selaput hangat di Rongga Hidung sebelum bertemu persimpangan bernama Faring.',
    missionObjective: 'Klik organ Rongga Hidung pada model 3D, amati fungsinya, lalu pecahkan tantangan misi.',
    questions: [
      {
        id: 'm1q1',
        question: 'Mengapa udara lebih baik masuk melalui hidung dibandingkan mulut saat bernapas?',
        options: [
          'Hidung menyaring debu, menghangatkan, dan melembapkan udara',
          'Hidung langsung menukar oksigen dengan darah tanpa paru-paru',
          'Mulut tidak terhubung dengan tenggorokan sama sekali',
          'Udara lewat hidung tidak membutuhkan bantuan diafragma',
        ],
        correctIndex: 0,
        hint: 'Perhatikan peran rambut halus (silia), selaput lendir (mukus), dan konka di dalam rongga hidung.',
        explanation:
          'Rongga hidung memiliki silia dan mukus untuk menyaring debu/kuman serta pembuluh darah di konka untuk menghangatkan dan melembapkan udara.',
      },
      {
        id: 'm1q2',
        question: 'Bagian saluran napas atas yang menjadi persimpangan jalur udara dan jalur makanan disebut...',
        options: ['Alveolus', 'Faring', 'Bronkiolus', 'Diafragma'],
        correctIndex: 1,
        hint: 'Letaknya tepat di belakang rongga hidung dan rongga mulut.',
        explanation:
          'Faring (tekak) merupakan persimpangan antara saluran pernapasan (menuju laring) dan saluran pencernaan (menuju kerongkongan).',
      },
    ],
  },
  {
    id: 2,
    chapterTitle: 'Misi 2: Menara Suara & Terowongan Cincin',
    subtitle: 'Laring & Trakea',
    targetOrgan: 'trachea',
    narrator: 'Dr. Raka · Pemandu Ekspedisi',
    storyText:
      'Kita berhasil melewati faring! Di depan tampak katup pelindung (epiglotis) di Laring yang sigap menutup saat air minum lewat, lalu terbuka kembali agar kita meluncur turun ke terowongan kokoh bernama Trakea yang dikelilingi cincin-cincin tulang rawan.',
    missionObjective: 'Arahkan kamera ke Laring atau Trakea pada model 3D, lalu jawab dua pertanyaan berikut.',
    questions: [
      {
        id: 'm2q1',
        question: 'Katup pada laring yang menutup saluran napas ketika kita menelan makanan agar tidak tersedak adalah...',
        options: ['Pleura', 'Epiglotis', 'Silia', 'Karina'],
        correctIndex: 1,
        hint: 'Katup ini berada tepat di bagian atas pangkal tenggorokan (laring).',
        explanation:
          'Epiglotis menutup pintu masuk laring saat proses menelan sehingga makanan/minuman masuk ke kerongkongan, bukan ke trakea.',
      },
      {
        id: 'm2q2',
        question: 'Apa fungsi cincin tulang rawan berbentuk huruf C pada dinding trakea?',
        options: [
          'Menghasilkan sel darah merah baru',
          'Menjaga agar saluran trakea tetap terbuka dan tidak kempis',
          'Mengubah gas karbon dioksida menjadi oksigen',
          'Mendorong makanan turun menuju lambung',
        ],
        correctIndex: 1,
        hint: 'Bayangkan selang penyedot yang harus tetap kokoh saat udara ditarik kuat.',
        explanation:
          'Cincin tulang rawan hialin menjaga trakea tetap terbuka (paten) meskipun tekanan udara di dalam berubah saat menarik napas kuat.',
      },
    ],
  },
  {
    id: 3,
    chapterTitle: 'Misi 3: Percabangan Hutan Napas',
    subtitle: 'Bronkus & Bronkiolus',
    targetOrgan: 'bronchi',
    narrator: 'Dr. Raka · Pemandu Ekspedisi',
    storyText:
      'Terowongan trakea kini bercabang dua di titik karina! Jalur sebelah kanan tampak sedikit lebih lebar dan lurus, sedangkan jalur kiri melengkung memberi ruang untuk detak jantung. Cabang-cabang ini makin mengecil seperti ranting pohon menuju bagian dalam paru-paru.',
    missionObjective: 'Aktifkan mode X-Ray di panel kontrol bawah untuk melihat percabangan bronkus di dalam paru-paru!',
    questions: [
      {
        id: 'm3q1',
        question: 'Urutan aliran udara yang benar setelah melewati trakea adalah...',
        options: [
          'Laring → Bronkus → Alveolus',
          'Bronkus → Bronkiolus → Alveolus',
          'Alveolus → Bronkiolus → Bronkus',
          'Bronkiolus → Faring → Paru-paru',
        ],
        correctIndex: 1,
        hint: 'Cabang besar disebut bronkus, cabang halusnya disebut bronkiolus, lalu bermuara di kantung udara.',
        explanation:
          'Setelah trakea, udara masuk ke bronkus primer, menyebar ke cabang lebih kecil (bronkiolus), dan berakhir di alveolus.',
      },
      {
        id: 'm3q2',
        question: 'Mengapa paru-paru kanan memiliki 3 lobus sedangkan paru-paru kiri hanya 2 lobus?',
        options: [
          'Karena paru kiri tidak ikut bernapas',
          'Karena sisi kiri rongga dada memberi ruang untuk jantung',
          'Karena bronkus kanan tersumbat tulang rusuk',
          'Karena diafragma hanya berada di sisi kanan',
        ],
        correctIndex: 1,
        hint: 'Ingat letak organ pemompa darah yang sedikit condong ke sebelah kiri dada.',
        explanation:
          'Paru-paru kiri memiliki lekukan jantung (cardiac notch) dan 2 lobus karena posisi jantung condong ke sisi kiri rongga toraks.',
      },
    ],
  },
  {
    id: 4,
    chapterTitle: 'Misi 4: Kantung Pertukaran Ajaib',
    subtitle: 'Alveolus & Difusi Gas',
    targetOrgan: 'alveoli',
    narrator: 'Dr. Raka · Pemandu Ekspedisi',
    storyText:
      'Akhirnya kita tiba di ujung terdalam paru-paru! Di sini jutaan kantung udara tipis bernama Alveolus mengembang seperti buah anggur. Di sekelilingnya, pembuluh kapiler darah menunggu dengan antusias untuk bertukar gas: oksigen masuk ke darah, karbon dioksida dilepas keluar!',
    missionObjective: 'Klik kelompok Alveolus (kantung udara bercahaya) pada model 3D untuk mengamati difusi O₂ dan CO₂.',
    questions: [
      {
        id: 'm4q1',
        question: 'Proses pertukaran gas O₂ dan CO₂ antara alveolus dan pembuluh kapiler darah berlangsung secara...',
        options: ['Difusi', 'Osmosis', 'Filtrasi', 'Pencernaan'],
        correctIndex: 0,
        hint: 'Gas berpindah alami dari tempat berkonsentrasi tinggi ke tempat berkonsentrasi rendah.',
        explanation:
          'Gas O₂ (tinggi di alveolus) dan CO₂ (tinggi di darah kapiler) bertukar melewati dinding tipis alveolus melalui proses difusi.',
      },
      {
        id: 'm4q2',
        question: 'Zat di dalam sel darah merah yang bertugas mengikat oksigen dari alveolus adalah...',
        options: ['Klorofil', 'Hemoglobin', 'Amilase', 'Trombosit'],
        correctIndex: 1,
        hint: 'Protein mengandung zat besi yang membuat darah berwarna merah cerah.',
        explanation:
          'Hemoglobin (Hb) di dalam eritrosit mengikat oksigen membentuk oksihemoglobin (HbO₂) untuk diedarkan ke seluruh sel tubuh.',
      },
    ],
  },
  {
    id: 5,
    chapterTitle: 'Misi 5: Penggerak Pompa Napas',
    subtitle: 'Diafragma & Mekanika Pernapasan',
    targetOrgan: 'diaphragm',
    narrator: 'Dr. Raka · Pemandu Ekspedisi',
    storyText:
      'Misi terakhir! Lihat ke bagian dasar paru-paru: otot kubah besar bernama Diafragma bekerja tanpa lelah. Saat diafragma berkontraksi turun dan mendatar, rongga dada membesar dan udara tersedot masuk. Saat relaksasi melengkung ke atas, udara terdorong keluar!',
    missionObjective: 'Ubah fase napas di dock kontrol (Inspirasi vs Ekspirasi) dan amati gerakan Diafragma 3D!',
    questions: [
      {
        id: 'm5q1',
        question: 'Apa yang terjadi pada otot diafragma dan volume rongga dada saat kita menarik napas (inspirasi)?',
        options: [
          'Diafragma relaksasi melengkung ke atas dan rongga dada mengecil',
          'Diafragma berkontraksi mendatar ke bawah dan rongga dada membesar',
          'Diafragma berhenti bergerak sementara paru-paru mengempis',
          'Tekanan udara di paru menjadi jauh lebih tinggi dari udara luar',
        ],
        correctIndex: 1,
        hint: 'Agar udara masuk, ruang di dalam dada harus menjadi lebih luas sehingga tekanannya turun.',
        explanation:
          'Saat inspirasi, diafragma berkontraksi (mendatar), volume rongga dada membesar, tekanan intrapulmonal turun di bawah tekanan atmosfer sehingga udara mengalir masuk.',
      },
      {
        id: 'm5q2',
        question: 'Jika seseorang memiliki frekuensi napas normal saat istirahat, berapa kisaran laju napas per menitnya?',
        options: ['2–5 kali/menit', '12–20 kali/menit', '45–60 kali/menit', '80–100 kali/menit'],
        correctIndex: 1,
        hint: 'Sekitar satu kali tarik-buang napas setiap 3 hingga 5 detik.',
        explanation:
          'Frekuensi napas (Respiratory Rate) normal pada remaja dan dewasa saat istirahat adalah sekitar 12–20 kali per menit.',
      },
    ],
  },
];

export type LungSoundId =
  | 'vesicular'
  | 'bronchovesicular'
  | 'tracheal'
  | 'wheezing'
  | 'crackles'
  | 'rhonchi'
  | 'stridor';

export interface LungSoundProfile {
  id: LungSoundId;
  name: string;
  englishName: string;
  category: 'Normal' | 'Abnormal';
  hotspotLabel: string;
  character: string;
  timing: string;
  cause: string;
  clinicalExample: string;
}

export const LUNG_SOUNDS: LungSoundProfile[] = [
  {
    id: 'vesicular',
    name: 'Vesikuler',
    englishName: 'Vesicular Breath Sound',
    category: 'Normal',
    hotspotLabel: 'Sebagian besar lapangan paru (lateral & basal)',
    character: 'Lembut, bernada rendah, terdengar halus seperti desir angin dedaunan.',
    timing: 'Fase inspirasi jauh lebih panjang dan jelas dibanding ekspirasi (3:1).',
    cause: 'Aliran udara normal memasuki bronkiolus terminal dan kantung alveolus sehat.',
    clinicalExample: 'Paru-paru sehat tanpa sumbatan atau cairan.',
  },
  {
    id: 'bronchovesicular',
    name: 'Bronkovesikuler',
    englishName: 'Bronchovesicular Sound',
    category: 'Normal',
    hotspotLabel: 'Sela iga ke-1 & ke-2 di kiri/kanan tulang dada (sternum)',
    character: 'Nada sedang, gabungan antara suara pipa bronkus dan suara lembut alveolus.',
    timing: 'Durasi inspirasi dan ekspirasi hampir sama panjang (1:1).',
    cause: 'Aliran udara di sekitar percabangan bronkus utama.',
    clinicalExample: 'Normal bila terdengar di area dekat tulang dada tengah atau antar-belikat.',
  },
  {
    id: 'tracheal',
    name: 'Trakeal / Bronkial',
    englishName: 'Tracheal / Bronchial Sound',
    category: 'Normal',
    hotspotLabel: 'Tepat di atas trakea (leher depan) & manubrium',
    character: 'Kasar, nyaring, bernada tinggi seperti meniup pipa berongga.',
    timing: 'Ekspirasi terdengar lebih panjang dengan jeda singkat antara inspirasi & ekspirasi.',
    cause: 'Turbulensi aliran udara cepat di saluran napas besar (trakea).',
    clinicalExample: 'Normal jika terdengar di leher/trakea; abnormal jika terdengar di tepi paru.',
  },
  {
    id: 'wheezing',
    name: 'Mengi (Wheezing)',
    englishName: 'Expiratory Wheeze',
    category: 'Abnormal',
    hotspotLabel: 'Menyebar di kedua lapangan paru',
    character: 'Bunyi musikal melengking kontinu seperti siulan tipis.',
    timing: 'Paling menonjol terdengar saat ekspirasi (membuang napas).',
    cause: 'Udara melewati saluran bronkiolus yang menyempit akibat spasme otot polos & radang.',
    clinicalExample: 'Asma Bronkial, Penyakit Paru Obstruktif Kronik (PPOK).',
  },
  {
    id: 'crackles',
    name: 'Ronki Basah Halus (Crackles)',
    englishName: 'Fine Crackles / Rales',
    category: 'Abnormal',
    hotspotLabel: 'Area basal / lobus bawah paru',
    character: 'Suara letupan halus terputus-putus seperti gesekan rambut atau velcro dibuka.',
    timing: 'Paling jelas terdengar di akhir fase inspirasi.',
    cause: 'Terbukanya kembali alveolus yang lengket atau terisi cairan/eksudat.',
    clinicalExample: 'Pneumonia (radang paru), Edema paru.',
  },
  {
    id: 'rhonchi',
    name: 'Ronki Kering (Rhonchi)',
    englishName: 'Coarse Rhonchi',
    category: 'Abnormal',
    hotspotLabel: 'Bronkus besar kanan dan kiri',
    character: 'Nada rendah, kasar, bergemuruh atau bergetar seperti dengkuran.',
    timing: 'Terdengar saat inspirasi maupun ekspirasi, sering berubah setelah pasien batuk.',
    cause: 'Getaran dahak kental (mukus/sekret) di dalam saluran bronkus yang lebar.',
    clinicalExample: 'Bronkitis akut atau kronis.',
  },
  {
    id: 'stridor',
    name: 'Stridor',
    englishName: 'Inspiratory Stridor',
    category: 'Abnormal',
    hotspotLabel: 'Area leher / laring & trakea atas',
    character: 'Bunyi kasar bernada tinggi yang sangat jelas bahkan tanpa stetoskop.',
    timing: 'Terutama terdengar saat inspirasi (menarik napas).',
    cause: 'Penyempitan berat saluran napas bagian atas (laring atau trakea).',
    clinicalExample: 'Sumbatan benda asing di laring, pembengkakan laring (croup).',
  },
];

export interface ThoraxHotspot {
  id: string;
  label: string;
  x: number; // SVG % 0-100
  y: number; // SVG % 0-100
  view: 'anterior' | 'posterior';
  defaultSound: LungSoundId;
  areaNote: string;
}

export const THORAX_HOTSPOTS: ThoraxHotspot[] = [
  {
    id: 'trachea_top',
    label: 'Area Trakea (Leher)',
    x: 50,
    y: 16,
    view: 'anterior',
    defaultSound: 'tracheal',
    areaNote: 'Tepat di atas batang tenggorokan (cincin trakea).',
  },
  {
    id: 'right_apex',
    label: 'Apex Paru Kanan',
    x: 38,
    y: 30,
    view: 'anterior',
    defaultSound: 'vesicular',
    areaNote: 'Puncak lobus atas paru kanan (di bawah tulang selangka).',
  },
  {
    id: 'left_apex',
    label: 'Apex Paru Kiri',
    x: 62,
    y: 30,
    view: 'anterior',
    defaultSound: 'vesicular',
    areaNote: 'Puncak lobus atas paru kiri.',
  },
  {
    id: 'right_broncho',
    label: 'Parasternal Kanan',
    x: 43,
    y: 41,
    view: 'anterior',
    defaultSound: 'bronchovesicular',
    areaNote: 'Sela iga 1–2 dekat percabangan bronkus kanan.',
  },
  {
    id: 'left_broncho',
    label: 'Parasternal Kiri',
    x: 57,
    y: 41,
    view: 'anterior',
    defaultSound: 'bronchovesicular',
    areaNote: 'Sela iga 1–2 dekat percabangan bronkus kiri.',
  },
  {
    id: 'right_base',
    label: 'Basal Paru Kanan',
    x: 34,
    y: 59,
    view: 'anterior',
    defaultSound: 'vesicular',
    areaNote: 'Bagian bawah lobus inferior paru kanan.',
  },
  {
    id: 'left_base',
    label: 'Basal Paru Kiri',
    x: 66,
    y: 59,
    view: 'anterior',
    defaultSound: 'vesicular',
    areaNote: 'Bagian bawah lobus inferior paru kiri.',
  },
  {
    id: 'post_upper_left',
    label: 'Punggung Atas Kiri',
    x: 38,
    y: 34,
    view: 'posterior',
    defaultSound: 'vesicular',
    areaNote: 'Area antar tulang belikat atas sisi kiri.',
  },
  {
    id: 'post_upper_right',
    label: 'Punggung Atas Kanan',
    x: 62,
    y: 34,
    view: 'posterior',
    defaultSound: 'vesicular',
    areaNote: 'Area antar tulang belikat atas sisi kanan.',
  },
  {
    id: 'post_mid_left',
    label: 'Interkostal Belakang Kiri',
    x: 37,
    y: 49,
    view: 'posterior',
    defaultSound: 'bronchovesicular',
    areaNote: 'Sisi kiri tulang belakang setinggi T4–T6.',
  },
  {
    id: 'post_mid_right',
    label: 'Interkostal Belakang Kanan',
    x: 63,
    y: 49,
    view: 'posterior',
    defaultSound: 'bronchovesicular',
    areaNote: 'Sisi kanan tulang belakang setinggi T4–T6.',
  },
  {
    id: 'post_base_left',
    label: 'Basal Posterior Kiri',
    x: 34,
    y: 65,
    view: 'posterior',
    defaultSound: 'vesicular',
    areaNote: 'Bagian dasar paru kiri bagian belakang.',
  },
  {
    id: 'post_base_right',
    label: 'Basal Posterior Kanan',
    x: 66,
    y: 65,
    view: 'posterior',
    defaultSound: 'vesicular',
    areaNote: 'Bagian dasar paru kanan bagian belakang.',
  },
];

export type PercussionTone = 'sonor' | 'hipersonor' | 'redup' | 'pekak';

export interface ClinicalCase {
  id: string;
  patientName: string;
  age: number;
  title: string;
  complaint: string;
  vitals: {
    rr: number; // breaths/min
    spo2: number; // %
    hr: number; // bpm
    temp: string;
  };
  ippa: {
    inspeksi: {
      summary: string;
      symmetry: 'Simetris' | 'Tertinggal Kanan' | 'Tertinggal Kiri';
      breathingPattern: 'Normal' | 'Cepat & Sesak (Takipnea)' | 'Tertinggal & Nyeri';
      signs: string[];
    };
    palpasi: {
      summary: string;
      expansion: 'Simetris kanan & kiri' | 'Sisi kanan tertinggal saat tarik napas' | 'Sisi kiri tertinggal saat tarik napas';
      fremitusLeft: 'Normal' | 'Meningkat' | 'Menurun / Hilang';
      fremitusRight: 'Normal' | 'Meningkat' | 'Menurun / Hilang';
    };
    perkusi: {
      summary: string;
      leftTone: PercussionTone;
      rightTone: PercussionTone;
      detail: string;
    };
    auskultasi: {
      summary: string;
      leftSound: LungSoundId;
      rightSound: LungSoundId;
      soundNote: string;
    };
  };
  diagnosisOptions: string[];
  correctDiagnosis: string;
  explanation: string;
}

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-asma',
    patientName: 'Dina (Siswi Kelas X)',
    age: 16,
    title: 'Kasus 1: Sesak Napas Setelah Membersihkan Gudang',
    complaint: 'Mengeluh dada terasa berat, batuk kering, dan napas berbunyi ngik-ngik setelah terpapar debu.',
    vitals: { rr: 26, spo2: 93, hr: 102, temp: '36.7°C' },
    ippa: {
      inspeksi: {
        summary: 'Napas tampak cepat (26x/menit), fase ekspirasi memanjang, tampak sedikit tarikan otot leher.',
        symmetry: 'Simetris',
        breathingPattern: 'Cepat & Sesak (Takipnea)',
        signs: ['Ekspirasi memanjang', 'Laju napas meningkat (26x/mnt)', 'Gerak dada simetris'],
      },
      palpasi: {
        summary: 'Ekspansi dinding dada kanan dan kiri masih simetris; getaran taktil fremitus normal.',
        expansion: 'Simetris kanan & kiri',
        fremitusLeft: 'Normal',
        fremitusRight: 'Normal',
      },
      perkusi: {
        summary: 'Ketukan di kedua sisi dada menghasilkan bunyi sonor (resonan normal).',
        leftTone: 'sonor',
        rightTone: 'sonor',
        detail: 'Tidak ada penumpukan cairan ataupun udara bebas di rongga pleura.',
      },
      auskultasi: {
        summary: 'Terdengar bunyi mengi (wheezing) nyaring di kedua sisi paru, terutama saat membuang napas.',
        leftSound: 'wheezing',
        rightSound: 'wheezing',
        soundNote: 'Wheezing bilateral akibat penyempitan bronkiolus oleh alergen debu.',
      },
    },
    diagnosisOptions: [
      'Asma Bronkial',
      'Efusi Pleura Kanan',
      'Pneumotoraks Kiri',
      'Pneumonia Lobaris',
    ],
    correctDiagnosis: 'Asma Bronkial',
    explanation:
      'Paparan debu memicu penyempitan otot polos bronkiolus (bronkospasme). Hal ini ditandai dengan takipnea, ekspirasi memanjang, perkusi sonor normal, dan auskultasi wheezing (mengi) di kedua paru.',
  },
  {
    id: 'case-pneumonia',
    patientName: 'Bapak Hendra',
    age: 42,
    title: 'Kasus 2: Demam Tinggi & Batuk Berdahak',
    complaint: 'Demam tinggi sejak 3 hari lalu, batuk berdahak kuning kehijauan, dan napas terasa pendek.',
    vitals: { rr: 28, spo2: 91, hr: 108, temp: '38.9°C' },
    ippa: {
      inspeksi: {
        summary: 'Napas cepat dan dangkal (28x/menit), pasien tampak lemas dan berkeringat akibat demam.',
        symmetry: 'Simetris',
        breathingPattern: 'Cepat & Sesak (Takipnea)',
        signs: ['Demam tinggi 38.9°C', 'Napas cepat 28x/mnt', 'Batuk produktif'],
      },
      palpasi: {
        summary: 'Getaran suara (taktil fremitus) di dada bagian bawah kanan terasa MENINGKAT karena jaringan paru padat berisi cairan radang.',
        expansion: 'Simetris kanan & kiri',
        fremitusLeft: 'Normal',
        fremitusRight: 'Meningkat',
      },
      perkusi: {
        summary: 'Ketukan di paru kanan bawah terdengar REDUP (lebih padat), sedangkan sisi kiri sonor.',
        leftTone: 'sonor',
        rightTone: 'redup',
        detail: 'Jaringan alveolus kanan terisi eksudat radang sehingga suara ketukan lebih redup.',
      },
      auskultasi: {
        summary: 'Terdengar ronki basah halus (fine crackles) di paru kanan bagian bawah saat inspirasi.',
        leftSound: 'vesicular',
        rightSound: 'crackles',
        soundNote: 'Crackles muncul karena alveolus berisi cairan radang terbuka saat inspirasi.',
      },
    },
    diagnosisOptions: [
      'Asma Bronkial',
      'Pneumonia (Infeksi Paru Kanan)',
      'Pneumotoraks Spontan',
      'Stridor Laring',
    ],
    correctDiagnosis: 'Pneumonia (Infeksi Paru Kanan)',
    explanation:
      'Demam tinggi, dahak kental, fremitus meningkat, perkusi redup di basal kanan, dan suara auskultasi ronki basah halus (crackles) merupakan ciri khas Pneumonia (infeksi alveolus).',
  },
  {
    id: 'case-efusi',
    patientName: 'Ibu Sari',
    age: 35,
    title: 'Kasus 3: Nyeri Dada Kanan & Sesak Saat Berbaring',
    complaint: 'Merasa sesak semakin berat saat berbaring dan dada kanan terasa penuh.',
    vitals: { rr: 25, spo2: 92, hr: 96, temp: '37.2°C' },
    ippa: {
      inspeksi: {
        summary: 'Gerakan dada sisi kanan tampak tertinggal dibandingkan dada sisi kiri saat menarik napas.',
        symmetry: 'Tertinggal Kanan',
        breathingPattern: 'Tertinggal & Nyeri',
        signs: ['Gerak dada kanan tertinggal', 'Sela iga kanan tampak agak cembung'],
      },
      palpasi: {
        summary: 'Ekspansi dinding dada kanan tertinggal, getaran fremitus di paru kanan bawah MENURUN/HILANG.',
        expansion: 'Sisi kanan tertinggal saat tarik napas',
        fremitusLeft: 'Normal',
        fremitusRight: 'Menurun / Hilang',
      },
      perkusi: {
        summary: 'Perkusi pada sisi kanan bawah terdengar PEKAK/REDUP sangat jelas (seperti mengetuk benda cair/padat).',
        leftTone: 'sonor',
        rightTone: 'pekak',
        detail: 'Rongga pleura kanan terisi cairan yang meredam getaran ketukan.',
      },
      auskultasi: {
        summary: 'Suara napas vesikuler pada basal paru kanan melemah/tertahan cairan, sisi kiri normal vesikuler.',
        leftSound: 'vesicular',
        rightSound: 'rhonchi',
        soundNote: 'Cairan pleura menghalangi suara napas; bagian atas batas cairan terdengar suara napas melemah.',
      },
    },
    diagnosisOptions: [
      'Efusi Pleura Kanan',
      'Asma Bronkial',
      'Pneumotoraks Kanan',
      'Bronkitis Ringan',
    ],
    correctDiagnosis: 'Efusi Pleura Kanan',
    explanation:
      'Penumpukan cairan di rongga pleura kanan menghalangi pengembangan paru dan meredam suara: dada kanan tertinggal, fremitus menurun/hilang, dan perkusi pekak.',
  },
  {
    id: 'case-pneumo',
    patientName: 'Riko (Siswa Kelas X)',
    age: 17,
    title: 'Kasus 4: Nyeri Dada Kiri Mendadak Setelah Olahraga',
    complaint: 'Tiba-tiba nyeri dada tajam sebelah kiri dan sesak napas mendadak setelah benturan ringan saat basket.',
    vitals: { rr: 29, spo2: 90, hr: 112, temp: '36.6°C' },
    ippa: {
      inspeksi: {
        summary: 'Dada sisi kiri tampak lebih mengembang namun gerakannya tertinggal saat bernapas.',
        symmetry: 'Tertinggal Kiri',
        breathingPattern: 'Tertinggal & Nyeri',
        signs: ['Gerak dada kiri tertinggal', 'Sesak napas mendadak (29x/mnt)'],
      },
      palpasi: {
        summary: 'Ekspansi paru kiri tertinggal; taktil fremitus dada kiri MENURUN/TIDAK TERABA.',
        expansion: 'Sisi kiri tertinggal saat tarik napas',
        fremitusLeft: 'Menurun / Hilang',
        fremitusRight: 'Normal',
      },
      perkusi: {
        summary: 'Ketukan di dada kiri terdengar HIPERSONOR (nyaring bergema seperti mengetuk drum kosong)!',
        leftTone: 'hipersonor',
        rightTone: 'sonor',
        detail: 'Udara bebas terperangkap di rongga pleura kiri menyebabkan resonansi sangat tinggi.',
      },
      auskultasi: {
        summary: 'Suara napas vesikuler di paru kiri sangat lemah/menghilang karena paru kiri mengempis, paru kanan normal.',
        leftSound: 'tracheal',
        rightSound: 'vesicular',
        soundNote: 'Udara di rongga pleura menghambat aliran udara ke alveolus kiri.',
      },
    },
    diagnosisOptions: [
      'Pneumonia Kiri',
      'Pneumotoraks Kiri',
      'Efusi Pleura Kiri',
      'Asma Bronkial',
    ],
    correctDiagnosis: 'Pneumotoraks Kiri',
    explanation:
      'Masuknya udara ke rongga pleura membuat paru kiri kolaps/mengempis. Ciri utamanya adalah dada kiri tertinggal, fremitus hilang, dan perkusi HIPERSONOR (bergema seperti drum).',
  },
];

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const EVALUATION_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Anatomi',
    question: 'Urutan jalannya udara pernapasan dari luar tubuh hingga ke tempat pertukaran gas yang benar adalah...',
    options: [
      'Hidung → Faring → Laring → Trakea → Bronkus → Bronkiolus → Alveolus',
      'Hidung → Laring → Faring → Trakea → Bronkiolus → Bronkus → Alveolus',
      'Hidung → Faring → Trakea → Laring → Bronkus → Alveolus',
      'Mulut → Kerongkongan → Trakea → Bronkus → Alveolus',
    ],
    correctIndex: 0,
    explanation:
      'Udara melewati rongga hidung → faring → laring → trakea → bronkus → bronkiolus → alveolus.',
  },
  {
    id: 'q2',
    topic: 'Anatomi',
    question: 'Fungsi utama selaput lendir (mukus) dan rambut getar (silia) di saluran pernapasan adalah...',
    options: [
      'Mengikat oksigen ke dalam pembuluh darah',
      'Menyaring debu, kotoran, dan kuman agar tidak masuk ke paru-paru',
      'Menghasilkan suara saat berbicara',
      'Mengatur kontraksi otot diafragma',
    ],
    correctIndex: 1,
    explanation:
      'Mukus menjebak partikel debu dan mikroorganisme, lalu silia menyapunya keluar menuju faring.',
  },
  {
    id: 'q3',
    topic: 'Anatomi',
    question: 'Cincin tulang rawan berbentuk huruf C pada trakea bertujuan untuk...',
    options: [
      'Membantu difusi gas karbon dioksida',
      'Membuat trakea tetap terbuka (tidak kempis) saat bernapas',
      'Menghasilkan cairan surfaktan',
      'Memisahkan rongga dada dan rongga perut',
    ],
    correctIndex: 1,
    explanation:
      'Cincin tulang rawan hialin menjaga bentuk pipa trakea agar saluran udara selalu terbuka.',
  },
  {
    id: 'q4',
    topic: 'Fisiologi',
    question: 'Ketika otot diafragma berkontraksi dan posisinya mendatar ke bawah, maka yang terjadi adalah...',
    options: [
      'Volume rongga dada mengecil dan udara keluar (ekspirasi)',
      'Volume rongga dada membesar, tekanan paru turun, udara masuk (inspirasi)',
      'Tulang rusuk turun sehingga udara terdorong keluar',
      'Paru-paru mengempis secara pasif',
    ],
    correctIndex: 1,
    explanation:
      'Kontraksi diafragma memperbesar volume rongga toraks sehingga tekanan intrapulmonal turun di bawah tekanan atmosfer dan udara mengalir masuk.',
  },
  {
    id: 'q5',
    topic: 'Fisiologi',
    question: 'Pertukaran gas oksigen (O₂) dan karbon dioksida (CO₂) di alveolus terjadi karena perbedaan konsentrasi melalui mekanisme...',
    options: ['Difusi', 'Transpor aktif', 'Fagositosis', 'Evaporasi'],
    correctIndex: 0,
    explanation:
      'O₂ berdifusi dari alveolus (tekanan tinggi) ke kapiler darah (rendah), sedangkan CO₂ berdifusi dari darah ke alveolus.',
  },
  {
    id: 'q6',
    topic: 'Fisiologi',
    question: 'Volume udara yang keluar-masuk paru-paru secara normal saat seseorang bernapas santai/istirahat (±500 mL) disebut...',
    options: ['Kapasitas Total Paru', 'Volume Tidal', 'Volume Residu', 'Kapasitas Vital'],
    correctIndex: 1,
    explanation:
      'Volume tidal adalah volume udara pernapasan biasa saat istirahat, sekitar 500 mL pada orang dewasa/remaja.',
  },
  {
    id: 'q7',
    topic: 'Lab Klinis',
    question: 'Suara napas normal yang terdengar lembut dengan fase inspirasi lebih panjang daripada ekspirasi di hampir seluruh lapangan paru adalah...',
    options: ['Wheezing', 'Vesikuler', 'Crackles', 'Stridor'],
    correctIndex: 1,
    explanation:
      'Suara vesikuler adalah suara napas normal paru perifer dengan inspirasi lebih panjang daripada ekspirasi.',
  },
  {
    id: 'q8',
    topic: 'Lab Klinis',
    question: 'Bunyi napas tambahan bernada tinggi seperti siulan saat ekspirasi akibat penyempitan bronkiolus pada pasien asma disebut...',
    options: ['Ronki basah (Crackles)', 'Mengi (Wheezing)', 'Perkusi sonor', 'Suara trakeal'],
    correctIndex: 1,
    explanation:
      'Wheezing (mengi) terdengar seperti siulan musikal saat udara dipaksa melewati bronkiolus yang menyempit.',
  },
  {
    id: 'q9',
    topic: 'Lab Klinis',
    question: 'Pada pemeriksaan fisik paru (IPPA), teknik mengetuk dinding dada untuk menilai apakah di bawahnya berisi udara, cairan, atau jaringan padat disebut...',
    options: ['Inspeksi', 'Palpasi', 'Perkusi', 'Auskultasi'],
    correctIndex: 2,
    explanation:
      'Urutan IPPA: Inspeksi (melihat), Palpasi (meraba), Perkusi (mengetuk), dan Auskultasi (mendengarkan dengan stetoskop).',
  },
  {
    id: 'q10',
    topic: 'Lab Klinis',
    question: 'Jika hasil perkusi dada kiri terdengar HIPERSONOR (bergema seperti drum) disertai gerakan dada kiri tertinggal, kemungkinan kondisinya adalah...',
    options: ['Pneumotoraks kiri', 'Asma ringan', 'Paru-paru normal', 'Bronkitis'],
    correctIndex: 0,
    explanation:
      'Hipersonor menandakan adanya udara berlebih di rongga pleura (Pneumotoraks) yang membuat suara ketukan bergema keras.',
  },
];

export interface ModuleSection {
  id: string;
  chapter: string;
  title: string;
  summary: string;
  points: { heading: string; body: string }[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  quickCheck: {
    question: string;
    answer: string;
  };
}

export const LEARNING_MODULES: ModuleSection[] = [
  {
    id: 'bab1',
    chapter: 'Bab 1',
    title: 'Anatomi Saluran Pernapasan Atas & Bawah',
    summary:
      'Mengenal jalur lengkap udara dari rongga hidung hingga kantung udara mikroskopis (alveolus) di dalam paru-paru.',
    points: [
      {
        heading: 'Saluran Pernapasan Atas',
        body: 'Meliputi Rongga Hidung (menyaring debu dengan silia & mukus, menghangatkan, melembapkan udara), Faring (persimpangan jalur napas & makanan), dan Laring (tempat pita suara & katup epiglotis pencegah tersedak).',
      },
      {
        heading: 'Saluran Pernapasan Bawah',
        body: 'Meliputi Trakea (pipa diperkuat 16–20 cincin tulang rawan huruf C agar tidak kempis), Bronkus Primer/Sekunder/Tersier, Bronkiolus (otot polos tanpa tulang rawan), dan Alveolus (tempat pertukaran gas).',
      },
      {
        heading: 'Paru-Paru & Pleura',
        body: 'Paru kanan memiliki 3 lobus (superior, medius, inferior), sedangkan paru kiri memiliki 2 lobus (superior, inferior) dan lekukan jantung (cardiac notch). Keduanya dibungkus selaput ganda bernama pleura.',
      },
    ],
    quickCheck: {
      question: 'Mengapa bronkiolus bisa menyempit saat serangan asma, sedangkan trakea tetap kaku?',
      answer: 'Karena dinding trakea diperkuat cincin tulang rawan, sedangkan bronkiolus hanya tersusun oleh otot polos yang bisa berkontraksi menyempit.',
    },
  },
  {
    id: 'bab2',
    chapter: 'Bab 2',
    title: 'Mekanisme Pernapasan & Volume Paru',
    summary:
      'Bagaimana perubahan tekanan udara di rongga dada membuat udara mengalir masuk (inspirasi) dan keluar (ekspirasi).',
    points: [
      {
        heading: 'Pernapasan Perut (Diafragma)',
        body: 'Inspirasi: Diafragma berkontraksi dan mendatar ke bawah → volume dada membesar → tekanan paru turun → udara masuk. Ekspirasi: Diafragma relaksasi melengkung ke atas → volume dada mengecil → tekanan naik → udara keluar.',
      },
      {
        heading: 'Pernapasan Dada (Otot Antar Tulang Rusuk)',
        body: 'Inspirasi: Otot interkostalis eksternal berkontraksi mengangkat tulang rusuk. Ekspirasi: Otot relaksasi sehingga tulang rusuk kembali turun.',
      },
    ],
    table: {
      headers: ['Jenis Volume / Kapasitas', 'Nilai Rata-rata', 'Pengertian Singkat'],
      rows: [
        ['Volume Tidal (VT)', '± 500 mL', 'Udara keluar-masuk saat napas santai normal'],
        ['Volume Cadangan Inspirasi', '± 1.500–3.000 mL', 'Udara tambahan yang masih bisa dihirup sekuatnya'],
        ['Volume Cadangan Ekspirasi', '± 1.100–1.500 mL', 'Udara tambahan yang masih bisa diembuskan sekuatnya'],
        ['Volume Residu', '± 1.200 mL', 'Udara sisa yang selalu tertinggal agar paru tidak kolaps'],
        ['Kapasitas Vital (KV)', '± 3.500–4.500 mL', 'Total VT + Cadangan Inspirasi + Cadangan Ekspirasi'],
      ],
    },
    quickCheck: {
      question: 'Apa hukum fisika sederhana yang menyebabkan udara masuk saat rongga dada membesar?',
      answer: 'Hukum Boyle: Saat volume ruang membesar, tekanan di dalamnya turun lebih rendah dari tekanan udara luar sehingga udara mengalir masuk.',
    },
  },
  {
    id: 'bab3',
    chapter: 'Bab 3',
    title: 'Pertukaran Gas O₂ & CO₂ di Alveolus',
    summary:
      'Memahami respirasi eksternal di alveolus, pengikatan oleh hemoglobin, hingga respirasi internal di jaringan tubuh.',
    points: [
      {
        heading: 'Difusi di Membran Respirasi',
        body: 'Dinding alveolus dan kapiler darah sangat tipis (±0,5 mikrometer). Oksigen berdifusi dari alveolus ke darah karena tekanan parsial O₂ di alveolus lebih tinggi. Sebaliknya, CO₂ berdifusi dari darah ke alveolus untuk dihembuskan keluar.',
      },
      {
        heading: 'Transportasi Gas dalam Darah',
        body: 'Sekitar 98% O₂ diikat oleh Hemoglobin membentuk oksihemoglobin (HbO₂). Sementara itu, sebagian besar CO₂ diangkut dalam bentuk ion bikarbonat (HCO₃⁻) di plasma darah.',
      },
    ],
    quickCheck: {
      question: 'Apa nama zat pelapis bagian dalam alveolus yang mencegah kantung udara lengket saat mengempis?',
      answer: 'Surfaktan paru (pulmonary surfactant).',
    },
  },
  {
    id: 'bab4',
    chapter: 'Bab 4',
    title: 'Auskultasi Suara Paru & Pemeriksaan Fisik (IPPA)',
    summary:
      'Panduan praktis memeriksa sistem pernapasan secara langsung menggunakan empat langkah klinis IPPA.',
    points: [
      {
        heading: '1. Inspeksi (Mengamati)',
        body: 'Menghitung laju napas (normal 12–20x/menit), mengamati kesimetrisan gerak dada kanan & kiri, bentuk dada, warna bibir/ujung jari (ada sianosis atau tidak), serta penggunaan otot bantu napas.',
      },
      {
        heading: '2. Palpasi (Meraba)',
        body: 'Menilai ekspansi dada apakah kedua sisi mengembang seimbang, serta merasakan taktil fremitus (getaran suara saat pasien mengucapkan "tujuh puluh tujuh").',
      },
      {
        heading: '3. Perkusi (Mengetuk)',
        body: 'Normalnya paru berbunyi Sonor. Jika banyak udara bebas (pneumotoraks) berbunyi Hipersonor. Jika ada cairan atau jaringan padat (efusi pleura/pneumonia) berbunyi Redup atau Pekak.',
      },
      {
        heading: '4. Auskultasi (Mendengarkan dengan Stetoskop)',
        body: 'Membedakan suara normal (Vesikuler, Bronkovesikuler, Trakeal) dan abnormal (Wheezing pada asma, Crackles/Ronki Basah pada pneumonia, Rhonchi pada bronkitis, Stridor pada sumbatan laring).',
      },
    ],
    table: {
      headers: ['Suara Napas', 'Kategori', 'Ciri Khas & Kondisi Terkait'],
      rows: [
        ['Vesikuler', 'Normal', 'Lembut, inspirasi > ekspirasi; di seluruh paru perifer'],
        ['Wheezing (Mengi)', 'Abnormal', 'Siulan nyaring saat ekspirasi; penyempitan bronkiolus (Asma)'],
        ['Crackles (Ronki Basah)', 'Abnormal', 'Letupan halus akhir inspirasi; cairan di alveolus (Pneumonia)'],
        ['Rhonchi (Ronki Kering)', 'Abnormal', 'Getaran kasar nada rendah; sekret di bronkus (Bronkitis)'],
        ['Stridor', 'Abnormal', 'Bunyi nyaring saat inspirasi; penyempitan laring/trakea'],
      ],
    },
    quickCheck: {
      question: 'Jika taktil fremitus menurun dan hasil perkusi terdengar pekak di kanan bawah, apa kemungkinannya?',
      answer: 'Penumpukan cairan di rongga pleura kanan (Efusi Pleura), karena cairan meredam getaran suara dan ketukan.',
    },
  },
  {
    id: 'bab5',
    chapter: 'Bab 5',
    title: 'Gangguan Umum Sistem Pernapasan & Pencegahannya',
    summary:
      'Mengenal penyakit pernapasan yang sering dijumpai di masyarakat serta cara menjaga kesehatan paru sejak remaja.',
    points: [
      {
        heading: 'Asma Bronkial',
        body: 'Peradangan kronis saluran napas yang membuat bronkiolus sensitif terhadap pemicu (debu, dingin, asap). Ditandai sesak napas, batuk, dan bunyi wheezing.',
      },
      {
        heading: 'Pneumonia & Bronkitis',
        body: 'Pneumonia adalah infeksi pada kantung alveolus oleh bakteri/virus sehingga alveolus terisi cairan radang. Bronkitis adalah peradangan dinding bronkus dengan produksi dahak berlebih.',
      },
      {
        heading: 'Efusi Pleura & Pneumotoraks',
        body: 'Efusi pleura adalah penimbunan cairan di rongga pleura, sedangkan pneumotoraks adalah masuknya udara ke rongga pleura sehingga paru dapat mengempis (kolaps).',
      },
      {
        heading: 'Menjaga Kesehatan Paru Kelas X',
        body: 'Hindari asap rokok dan vape, gunakan masker saat berada di lingkungan berdebu, olahraga aerobik rutin untuk melatih kapasitas vital paru, dan konsumsi makanan bergizi.',
      },
    ],
    quickCheck: {
      question: 'Apa perbedaan utama lokasi gangguan pada Pneumonia dan Efusi Pleura?',
      answer: 'Pneumonia terjadi di dalam kantung alveolus (jaringan paru), sedangkan Efusi Pleura terjadi di ruang antar selaput pembungkus paru (rongga pleura).',
    },
  },
];

export function generateDownloadableModuleHTML(): string {
  const sectionsHtml = LEARNING_MODULES.map((m) => {
    const pointsHtml = m.points
      .map(
        (p) => `
      <div style="margin-bottom: 12px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h3 style="margin: 0 0 6px 0; color: #0369a1; font-size: 16px;">${p.heading}</h3>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${p.body}</p>
      </div>`
      )
      .join('');

    const tableHtml = m.table
      ? `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
        <thead>
          <tr style="background: #0f172a; color: #f8fafc;">
            ${m.table.headers.map((h) => `<th style="padding: 10px; text-align: left; border: 1px solid #cbd5e1;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${m.table.rows
            .map(
              (r, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f1f5f9'};">
              ${r.map((cell) => `<td style="padding: 9px 10px; border: 1px solid #cbd5e1; color: #1e293b;">${cell}</td>`).join('')}
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`
      : '';

    return `
      <section style="margin-bottom: 28px; padding: 24px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px;">
        <div style="font-size: 12px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.06em;">${m.chapter}</div>
        <h2 style="margin: 4px 0 8px 0; color: #0f172a; font-size: 22px;">${m.title}</h2>
        <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px;">${m.summary}</p>
        ${pointsHtml}
        ${tableHtml}
        <details style="margin-top: 14px; padding: 12px 16px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 10px;">
          <summary style="cursor: pointer; font-weight: 600; color: #0e7490; font-size: 14px;">Uji Pemahaman Singkat: ${m.quickCheck.question}</summary>
          <p style="margin: 8px 0 0 0; color: #155e75; font-size: 14px;"><strong>Jawaban:</strong> ${m.quickCheck.answer}</p>
        </details>
      </section>
    `;
  }).join('');

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modul Pembelajaran Interaktif — Sistem Pernapasan Kelas X</title>
</head>
<body style="margin: 0; padding: 32px 16px; background: #f1f5f9; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a;">
  <div style="max-width: 860px; margin: 0 auto;">
    <header style="padding: 28px; background: #0f172a; color: #f8fafc; border-radius: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #38bdf8; font-weight: 600;">RespiQuest · Modul Belajar Offline Kelas X</div>
      <h1 style="margin: 6px 0 8px 0; font-size: 28px;">Anatomi & Fisiologi Sistem Pernapasan Manusia</h1>
      <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">Disusun untuk siswa Kelas X. Mencakup anatomi saluran napas, mekanika inspirasi-ekspirasi, pertukaran gas, suara auskultasi paru, pemeriksaan fisik IPPA, dan gangguan pernapasan.</p>
    </header>
    ${sectionsHtml}
    <footer style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
      Diunduh dari Aplikasi Pembelajaran Interaktif RespiQuest · Selamat Belajar!
    </footer>
  </div>
</body>
</html>`;
}
