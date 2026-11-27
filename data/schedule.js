/* ==========================================================
   data/schedule.js
   ----------------------------------------------------------
   【このファイルの役割】
   開催予定のデータだけをまとめたファイルです。
   トップページの「今後の開催予定」と、スケジュールページの
   一覧は、どちらもこのファイルを読み込んで自動で表示します。
   → 予定を追加・変更したいときは、HTMLではなくここだけを
     書きかえればOKです。

   【予定を追加するときの手順】
   1. SCHEDULE の中の { ... }, をひとかたまりコピーする
   2. 一番下（ ]; の手前）に貼りつける
   3. date・title・status などを書きかえる
   ※ 各かたまりの最後の「,（カンマ）」を忘れないように！

   【status（申込状況）に書ける言葉】
   "受付中" … 申込ボタンが表示されます
   "満員"   … ボタンが押せない「満員」表示になります
   "開催済み" … 実績として表示されます
   "申込不要" … ボタンの代わりに「申込不要・直接お越しください」と表示されます
   ※ 日付が過ぎた予定は、ここが "受付中" のままでも
     自動的に「開催済み」として扱われます。
   ========================================================== */

// ---------- 会場（全企画共通） ----------
const PLACE = "くつろぎ自由研究室（大阪府南河内郡河南町寛弘寺422-7）";

// ---------- 申込フォームのURL ----------
// フォームが変わったら、ここを書きかえるだけで全ページに反映されます
const FORMS = {
  morning: "https://docs.google.com/forms/d/e/1FAIpQLScBiwz9DTjgRgHzYaJJ3ZMDoYRdVtZuFJLztIKojGNvnLPB0A/viewform",
  compost: "https://docs.google.com/forms/d/e/1FAIpQLSen_S1MKgmEEiVY87XPvUfOqtwpQfwxq8AO-zxnWZjOMkKRBQ/viewform",
  sns:     "https://docs.google.com/forms/d/e/1FAIpQLSdhcQm7iXuMJ03rTwqu8o8GE9NXSLwJf_NSZ1oVUq9uSJTIJQ/viewform",
  yoga:    "https://docs.google.com/forms/d/e/1FAIpQLSc5CWaXV277tuTsSyu91IzXPetnbN3gmovbftfWPNc7kgJPBw/viewform",
};

// ---------- 4つの企画の基本情報 ----------
// program: の欄には、下の morning / sns / yoga / ikoya のどれかを書きます
// color … チラシで企画名の前についている「丸」の色
// en    … チラシの右はしにある英字ラベル
const PROGRAMS = {
  morning: { name: "生わさびご飯モーニング＆はじめてのコンポスト講座", short: "モーニング＆コンポスト", en: "MORNING & COMPOST", page: "program-morning.html", color: "#503535" },
  sns:     { name: "地域コミュニティ×SNS活用講座", short: "SNS活用講座", en: "SNS", page: "program-sns.html", color: "#B27F4F" },
  yoga:    { name: "くつろぎヨガ教室", short: "くつろぎヨガ教室", en: "YOGA", page: "program-yoga.html", color: "#609F85" },
  ikoya:   { name: "放課後いこーや", short: "放課後いこーや", en: "AFTER SCHOOL", page: "program-ikoya.html", color: "#C28F31" },
};

// ---------- 開催予定の一覧 ----------
// date は「年-月-日」を半角で、"2026-12-05" のように2けたで書きます。
// 曜日はプログラムが日付から自動で計算するので、書かなくて大丈夫です。
const SCHEDULE = [
  // ===== ① 生わさびご飯モーニング＆はじめてのコンポスト講座 =====
  {
    date: "2026-10-25",
    program: "morning",
    title: "生わさびご飯モーニング＆はじめてのコンポスト講座",
    time: "モーニング 8:30〜10:30／コンポスト講座 11:00〜",
    fee: "無料",
    status: "開催済み",
    forms: [
      { label: "モーニングに申し込む", url: FORMS.morning },
      { label: "コンポスト講座に申し込む", url: FORMS.compost },
    ],
  },
  {
    date: "2026-11-15",
    program: "morning",
    title: "生わさびご飯モーニング＆はじめてのコンポスト講座",
    time: "モーニング 8:30〜10:30／コンポスト講座 11:00〜",
    fee: "無料",
    status: "開催済み",
    forms: [
      { label: "モーニングに申し込む", url: FORMS.morning },
      { label: "コンポスト講座に申し込む", url: FORMS.compost },
    ],
  },
  {
    date: "2026-12-05",
    program: "morning",
    title: "生わさびご飯モーニング＆はじめてのコンポスト講座",
    time: "モーニング 8:30〜10:30／コンポスト講座 11:00〜",
    fee: "無料",
    status: "受付中",
    forms: [
      { label: "モーニングに申し込む", url: FORMS.morning },
      { label: "コンポスト講座に申し込む", url: FORMS.compost },
    ],
  },

  // ===== ② 地域コミュニティ×SNS活用講座（全5回） =====
  {
    date: "2026-11-20",
    program: "sns",
    title: "SNS活用講座 第1回「投稿のコツ」",
    time: "10:00〜12:00 講座／12:00〜14:00 ランチ＆フリータイム",
    fee: "受講料無料・ランチ代3,000円",
    status: "開催済み",
    forms: [{ label: "申し込む", url: FORMS.sns }],
  },
  {
    date: "2026-12-04",
    program: "sns",
    title: "SNS活用講座 第2回「SNSのコツ（プロフィール編）」",
    time: "10:00〜12:00 講座／12:00〜14:00 ランチ＆フリータイム",
    fee: "受講料無料・ランチ代3,000円",
    status: "満員",
    forms: [{ label: "申し込む", url: FORMS.sns }],
  },
  {
    date: "2027-01-15",
    program: "sns",
    title: "SNS活用講座 第3回「リール動画作成のコツ」",
    time: "10:00〜12:00 講座／12:00〜14:00 ランチ＆フリータイム",
    fee: "受講料無料・ランチ代3,000円",
    status: "受付中",
    forms: [{ label: "申し込む", url: FORMS.sns }],
  },
  {
    date: "2027-01-22",
    program: "sns",
    title: "SNS活用講座 第4回「コミュニティづくり」",
    time: "10:00〜12:00 講座／12:00〜14:00 ランチ＆フリータイム",
    fee: "受講料無料・ランチ代3,000円",
    status: "満員",
    forms: [{ label: "申し込む", url: FORMS.sns }],
  },
  {
    date: "2027-02-05",
    program: "sns",
    title: "SNS活用講座 第5回「イベント開催に向けた作戦会議」",
    time: "10:00〜12:00 講座／12:00〜14:00 ランチ＆フリータイム",
    fee: "受講料無料・ランチ代3,000円",
    status: "受付中",
    forms: [{ label: "申し込む", url: FORMS.sns }],
  },

  // ===== ③ くつろぎヨガ教室 =====
  {
    date: "2026-11-26",
    program: "yoga",
    title: "くつろぎヨガ 第1回「ポカポカ肩こり解消ヨガ」",
    time: "14:00〜14:40",
    fee: "無料",
    status: "満員",
    forms: [{ label: "申し込む", url: FORMS.yoga }],
  },
  {
    date: "2026-12-17",
    program: "yoga",
    title: "くつろぎヨガ 第2回「ご褒美リラックスヨガ」",
    time: "14:00〜14:40",
    fee: "無料",
    status: "受付中",
    forms: [{ label: "申し込む", url: FORMS.yoga }],
  },
  {
    date: "2027-01-28",
    program: "yoga",
    title: "くつろぎヨガ 第3回「代謝アップ＆むくみスッキリヨガ」",
    time: "14:00〜14:40",
    fee: "無料",
    status: "受付中",
    forms: [{ label: "申し込む", url: FORMS.yoga }],
  },
  {
    date: "2027-02-25",
    program: "yoga",
    title: "くつろぎヨガ 第4回「自律神経ケア＆デトックスヨガ」",
    time: "14:00〜14:40",
    fee: "無料",
    status: "受付中",
    forms: [{ label: "申し込む", url: FORMS.yoga }],
  },

  // ===== ④ 放課後いこーや =====
  // 申込は不要なので、status を "申込不要"、forms を空っぽ [] にしています。
  {
    date: "2026-12-08",
    program: "ikoya",
    title: "放課後いこーや",
    time: "16:00〜18:00",
    fee: "無料",
    status: "申込不要",
    forms: [],
  },
  {
    date: "2027-01-18",
    program: "ikoya",
    title: "放課後いこーや",
    time: "16:00〜18:00",
    fee: "無料",
    status: "申込不要",
    forms: [],
  },
];
