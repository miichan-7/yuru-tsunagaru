/* ==========================================================
   js/sheet-data.js … スプレッドシートから数字と声を読みこむ
   ----------------------------------------------------------
   【このファイルの役割】
   1. data/sheet-config.js のURLから、2つのシートをCSVで取ってくる
      ・「集計」シート      … 回ごとの回答数・満足度・Q7の平均
      ・「サイト用_声」シート … チェックを入れた参加者の声
   2. 取ってきた中身で、もともとの data の中身（STATS / SURVEY / VOICES など）を
      上書きする
   3. そのあとで、ページ用のJS（top.js や report.js）を読みこむ

   ・HTMLでは <script src="js/sheet-data.js" data-then="js/top.js"> のように書き、
     data-then に「読みこみが終わったら動かすJS」を指定します。
   ・シートが読めなかったときは、何も上書きせずに data の中身のまま表示します。
     （だから、ネットの調子が悪くても表示が空っぽになりません）
   ========================================================== */

(function () {
  // この <script> タグ自身。data-then の値（次に読むJS）を取り出すのに使う
  const me = document.currentScript;
  const nextScript = me ? me.dataset.then : null;

  // ---------- 次のJSを読みこむ ----------
  function loadNext() {
    if (!nextScript) return;
    const s = document.createElement("script");
    s.src = nextScript;
    document.body.appendChild(s);
  }

  // ---------- CSVの文字を、2次元の配列にする ----------
  // "…" でかこまれた中のカンマや改行も、正しく1つのマスとして読みます
  function parseCsv(text) {
    const rows = [];
    let row = [], cell = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else cell += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (c !== "\r") cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // ---------- URLからCSVを取ってくる（4秒で待つのをやめる） ----------
  function fetchCsv(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    return fetch(url, { signal: ctrl.signal })
      .then((res) => { if (!res.ok) throw new Error(res.status); return res.text(); })
      .then(parseCsv)
      .finally(() => clearTimeout(timer));
  }

  // ---------- シートの「WS」の書き方 → サイトの企画の名前 ----------
  const WS_TO_PROGRAM = {
    "モーニング＆コンポスト": "morning",
    "SNS講座": "sns",
    "ヨガ": "yoga",
    "いこーや": "ikoya",
    "放課後いこーや": "ikoya",
  };
  // グラフや声の見出しで使う、企画の呼び方
  const PROGRAM_LABEL = {
    morning: "モーニング＆コンポスト",
    sns: "SNS活用講座",
    yoga: "くつろぎヨガ",
    ikoya: "放課後いこーや",
  };

  // 「2026/11/26」も「2026-11-26」も、"2026-11-26" の形にそろえる
  function normalizeDate(s) {
    const m = String(s).trim().match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    if (!m) return null;
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }
  // "2026-11-26" → "11/26"
  function shortDate(iso) {
    const [, mo, d] = iso.split("-");
    return `${Number(mo)}/${Number(d)}`;
  }
  // 開催スケジュール（SCHEDULE）のタイトルから「第◯回」を探す。なければ ""
  function roundOf(iso, program) {
    if (typeof SCHEDULE === "undefined") return "";
    const ev = SCHEDULE.find((e) => e.date === iso && e.program === program);
    const m = ev && ev.title.match(/第\d+回/);
    return m ? m[0] : "";
  }
  // 「11/26 くつろぎヨガ 第1回」のような、回の呼び名
  function eventLabel(iso, program) {
    const round = roundOf(iso, program);
    return `${shortDate(iso)} ${PROGRAM_LABEL[program]}${round ? " " + round : ""}`;
  }

  // ---------- 1. 「集計」シートを反映 ----------
  function applySummary(rows) {
    // 見出しの行（「開催日」で始まる行）を探して、その下を読む
    const head = rows.findIndex((r) => r[0] === "開催日");
    if (head < 0) return;
    const events = [];
    rows.slice(head + 1).forEach((r) => {
      const iso = normalizeDate(r[0]);
      const program = WS_TO_PROGRAM[(r[1] || "").trim()];
      const count = Number(r[2]);
      // 日付が読めない行・回答が0件の回（まだ開催していない回）はとばす
      if (!iso || !program || !count) return;
      events.push({
        iso, program, count,
        sat: r[3] === "" ? NaN : Number(r[3]),
        q7: [Number(r[4]), Number(r[5]), Number(r[6]), Number(r[7])],
      });
    });
    if (events.length === 0) return;
    events.sort((a, b) => a.iso.localeCompare(b.iso)); // 古い順

    // 合計と、満足度の平均（回答数で重みをつけた平均）
    const total = events.reduce((sum, e) => sum + e.count, 0);
    const satEvents = events.filter((e) => !isNaN(e.sat));
    const satCount = satEvents.reduce((sum, e) => sum + e.count, 0);
    const avg = satCount ? satEvents.reduce((sum, e) => sum + e.sat * e.count, 0) / satCount : 0;
    const avg2 = Math.round(avg * 100) / 100;
    const last = events[events.length - 1].iso.split("-");

    // トップページの「数字で見る活動」
    if (typeof STATS !== "undefined") {
      STATS.forEach((s) => {
        if (s.label === "開催回数") s.value = events.length;
        if (s.label === "延べ参加人数") s.value = total;
        if (s.label === "満足度の平均") s.value = avg2;
      });
      if (typeof STATS_NOTE !== "undefined") {
        STATS_NOTE = `アンケート集計より（${last[0]}年${Number(last[1])}月${Number(last[2])}日開催分まで）`;
      }
    }

    // 活動報告ページの「アンケート結果」
    if (typeof SURVEY !== "undefined") {
      SURVEY.totalEvents = events.length;
      SURVEY.totalResponses = total;
      SURVEY.averageSatisfaction = avg2;
      SURVEY.events = events.map((e) => eventLabel(e.iso, e.program));
      SURVEY.satisfaction = events.map((e) => e.sat || 0);
      SURVEY.items.forEach((item, i) => { item.values = events.map((e) => e.q7[i] || 0); });
      // グラフの下の「10/25・11/15 は〜」の説明
      SURVEY.note = "4点満点・回ごとの平均（" +
        Object.keys(PROGRAM_LABEL)
          .map((p) => {
            const days = events.filter((e) => e.program === p).map((e) => shortDate(e.iso));
            return days.length ? `${days.join("・")} は${PROGRAM_LABEL[p]}` : null;
          })
          .filter(Boolean).join("、") + "）";
    }

    // 活動報告のカードの「アンケート回答 ◯件 ／ 満足度 ◯」
    if (typeof REPORTS !== "undefined") {
      REPORTS.forEach((r) => {
        const e = events.find((ev) => ev.iso === r.date && ev.program === r.program);
        if (e) { r.responses = e.count; if (!isNaN(e.sat)) r.satisfaction = e.sat; }
      });
    }
  }

  // ---------- 2. 「サイト用_声」シートを反映 ----------
  function applyVoices(rows) {
    const head = rows.findIndex((r) => r[0] === "開催日");
    if (head < 0) return;
    const list = [];
    rows.slice(head + 1).forEach((r) => {
      const iso = normalizeDate(r[0]);
      const program = WS_TO_PROGRAM[(r[1] || "").trim()];
      const text = (r[2] || "").replace(/\s*\n\s*/g, "").trim(); // セルの中の改行はつなげる
      if (!iso || !program || !text) return;
      const yes = (v) => String(v).toUpperCase() === "TRUE";
      list.push({ iso, program, text, report: yes(r[3]), page: yes(r[4]), top: yes(r[5]) });
    });
    if (list.length === 0) return;

    // トップページ … 「トップに載せる」にチェックした声を、新しい順に3件
    if (typeof VOICES !== "undefined") {
      const tops = list.filter((v) => v.top).sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 3);
      if (tops.length) {
        VOICES.length = 0;
        tops.forEach((v) => {
          const round = roundOf(v.iso, v.program);
          VOICES.push({ text: v.text, who: `${PROGRAM_LABEL[v.program]}${round ? " " + round : ""}（${shortDate(v.iso)}）` });
        });
      }
    }

    // 企画ページ … 「企画ページに載せる」にチェックした声を、企画ごとに
    if (typeof PROGRAM_VOICES !== "undefined") {
      Object.keys(PROGRAM_LABEL).forEach((p) => {
        const mine = list.filter((v) => v.page && v.program === p);
        if (mine.length === 0) return;
        PROGRAM_VOICES[p] = mine.map((v) => {
          const round = roundOf(v.iso, v.program);
          return { text: v.text, who: round ? `${round}（${shortDate(v.iso)}）` : `${shortDate(v.iso)} 開催回` };
        });
      });
    }

    // 活動報告ページ … 「活動報告に載せる」にチェックした声を、回ごとにまとめる
    if (typeof ALL_VOICES !== "undefined") {
      const groups = [];
      list.filter((v) => v.report)
        .sort((a, b) => a.iso.localeCompare(b.iso))
        .forEach((v) => {
          const label = eventLabel(v.iso, v.program);
          let g = groups.find((x) => x.event === label);
          if (!g) { g = { event: label, voices: [] }; groups.push(g); }
          g.voices.push(v.text);
        });
      if (groups.length) { ALL_VOICES.length = 0; groups.forEach((g) => ALL_VOICES.push(g)); }
    }
  }

  // ---------- 実行 ----------
  const conf = typeof SHEET_CSV !== "undefined" ? SHEET_CSV : {};
  const jobs = [];
  // 1つのシートが読めなくても、もう1つは反映できるように、別々に受けとる
  if (conf.summary) jobs.push(fetchCsv(conf.summary).then(applySummary).catch((e) => console.warn("集計シートを読めませんでした", e)));
  if (conf.voices)  jobs.push(fetchCsv(conf.voices).then(applyVoices).catch((e) => console.warn("声のシートを読めませんでした", e)));

  Promise.all(jobs).finally(loadNext);
})();
