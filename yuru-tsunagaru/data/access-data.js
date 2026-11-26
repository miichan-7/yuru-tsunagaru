/* ==========================================================
   data/access-data.js
   ----------------------------------------------------------
   【このファイルの役割】
   アクセスページの「おすすめのバス」の表のデータです。
   バスのダイヤが変わったら、ここの時刻だけを直してください。

   【調べた元】
   NAVITIME「富田林駅前 ⇒ 寛弘寺」の時刻表（2026年11月25日に確認）
   https://www.navitime.co.jp/bus/diagram/timelist?departure=00365722&arrival=00508000&line=00041061
   富田林市の公式の時刻表でも、千早線は「毎日運行（平日・土日祝共通）」で、
   曜日によるダイヤの違いはありません。
   ========================================================== */

const BUS_INFO = {
  checkedOn: "2026年11月25日",
  daily: "毎日同じ時刻（平日・土日祝共通）",
  line: "千早線（千早赤阪村立中学校前 行き）",
  from: "富田林駅前 2番のりば",
  to: "寛弘寺",
  minutes: 12,
  fare: "240円",
  timetableUrl: "https://www.navitime.co.jp/bus/diagram/timelist?departure=00365722&arrival=00508000&line=00041061",
};

// 企画ごとのおすすめの便
// program … schedule.js の PROGRAMS と同じ名前（色と名前を自動でつけます）
// label   … 表に出す企画名（モーニングとコンポストを分けたいときなど）
const RECOMMENDED_BUSES = [
  { program: "morning", label: "モーニング（8:30〜）",       depart: "7:55",  arrive: "8:07" },
  { program: "sns",     label: "SNS活用講座（10:00〜）",     depart: "8:59",  arrive: "9:11" },
  { program: "morning", label: "コンポスト講座（11:00〜）",  depart: "10:01", arrive: "10:13" },
  { program: "yoga",    label: "くつろぎヨガ教室（14:00〜）", depart: "13:05", arrive: "13:17" },
  { program: "ikoya",   label: "放課後いこーや（16:00〜）",   depart: "15:12", arrive: "15:24" },
];
