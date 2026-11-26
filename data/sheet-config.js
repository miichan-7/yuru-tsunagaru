/* ==========================================================
   data/sheet-config.js
   ----------------------------------------------------------
   【このファイルの役割】
   アンケート集計のスプレッドシートから、数字と参加者の声を
   サイトに読みこむための「住所（URL）」を書いておくファイルです。

   スプレッドシートの「ファイル → 共有 → ウェブに公開」で
   シートごとに「カンマ区切り形式（.csv）」で公開したときに出るURLを、
   下の " " の中に貼りつけます。

   ・summary … 「集計」シートのURL
   ・voices  … 「サイト用_声」シートのURL

   URLが空っぽ（""）のときや、読みこめなかったときは、
   data/site-data.js と data/report-data.js に書いてある数字がそのまま表示されます。
   ========================================================== */

const SHEET_CSV = {
  summary: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2OSXaSW_ZpR18eIMgcFqKD48i4f1m7Ff3rDJ0OkdeXOv6X3BHrxyZFwgU4jCInT2dZpJ9bFe8dHJE/pub?gid=363617197&single=true&output=csv",
  voices: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2OSXaSW_ZpR18eIMgcFqKD48i4f1m7Ff3rDJ0OkdeXOv6X3BHrxyZFwgU4jCInT2dZpJ9bFe8dHJE/pub?gid=777000001&single=true&output=csv",
};
