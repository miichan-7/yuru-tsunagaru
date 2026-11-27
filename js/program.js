/* ==========================================================
   js/program.js … 企画の詳細ページ（4ページ共通）の動き
   ----------------------------------------------------------
   【このファイルの役割】
   1. <body data-program="〇〇"> を読んで、どの企画のページか知る
   2. data/schedule.js から、その企画の日程だけを表示する
      ・#program-schedule … 日付の一覧（1行ずつ）
      ・#program-rounds   … 「第〇回」ごとのテーマのカード（SNS・ヨガ用）
   3. data/site-data.js の PROGRAM_VOICES から、参加者の声を表示する

   ※ 循環図の矢印が光る動きは、CSS（program.css）だけで作っています。
   ========================================================== */

// どの企画のページか（"morning" / "sns" / "yoga" / "ikoya"）
const programKey = document.body.dataset.program;


/* ----------------------------------------------------------
   1. この企画の日程
   ---------------------------------------------------------- */
const programSchedule = document.getElementById("program-schedule");

if (programSchedule && typeof SCHEDULE !== "undefined") {
  const events = SCHEDULE
    .filter((ev) => ev.program === programKey)             // この企画だけ
    .sort((a, b) => parseDate(a.date) - parseDate(b.date)); // 日付の早い順

  // 1行ずつ「日付｜内容｜状況とボタン」を並べる
  programSchedule.innerHTML = `
    <ul class="date-list">
      ${events.map((ev) => {
        const d = formatDate(ev.date, true);
        const status = getStatus(ev);
        const past = isPast(ev) ? " is-past" : "";
        return `
          <li class="date-row card fade-in${past}">
            <p class="date-row-date">${d.text}<small>（${d.week}）</small></p>
            <div class="date-row-body">
              <p class="date-row-title">${ev.title}</p>
              <p class="date-row-time">${ev.time}</p>
            </div>
            <div class="date-row-apply">
              ${statusBadge(status)}
              <div class="date-row-actions">${status === "受付中" || status === "申込不要" ? applyButtons(ev) : ""}</div>
            </div>
          </li>`;
      }).join("")}
    </ul>
    <p class="date-list-more"><a href="schedule.html#${programKey}">ほかの企画もふくめた日程は、開催スケジュールへ →</a></p>
  `;
  observeFadeIn(programSchedule); // あとから作った要素もフェードインさせる
}


/* ----------------------------------------------------------
   1.5 「第〇回」ごとのテーマのカード
   予定の title が「〇〇 第2回「テーマ」」の形になっているので、
   正規表現（文字のパターン）で「回の数字」と「テーマ」を取り出します。
   ---------------------------------------------------------- */
const programRounds = document.getElementById("program-rounds");

if (programRounds && typeof SCHEDULE !== "undefined") {
  const events = SCHEDULE
    .filter((ev) => ev.program === programKey)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  programRounds.innerHTML = events.map((ev) => {
    // 第(数字)回「(テーマ)」 … ( ) でかこんだ部分が match[1], match[2] に入る
    const match = ev.title.match(/第(\d+)回「(.+)」/);
    const round = match ? match[1] : "";
    const theme = match ? match[2] : ev.title;
    const d = formatDate(ev.date);
    const status = getStatus(ev);
    const past = isPast(ev) ? " is-past" : "";

    return `
      <li class="round-card card fade-in${past}">
        <p class="round-num"><span>第</span>${round}<span>回</span></p>
        <h3 class="round-theme">${theme}</h3>
        <p class="round-date">${d.text}（${d.week}）</p>
        <div class="round-apply">
          ${statusBadge(status)}
          ${status === "受付中" ? applyButtons(ev) : ""}
        </div>
      </li>`;
  }).join("");
  observeFadeIn(programRounds);
}


/* ----------------------------------------------------------
   2. 参加者の声
   ---------------------------------------------------------- */
const programVoices = document.getElementById("program-voices");

if (programVoices && typeof PROGRAM_VOICES !== "undefined") {
  const voices = PROGRAM_VOICES[programKey] || [];

  if (voices.length === 0) {
    // 声がまだ無い企画は、このセクションごと隠す
    programVoices.closest("section").hidden = true;
  } else {
    programVoices.innerHTML = voices.map((v) => `
      <li class="program-voice fade-in">
        <p>${v.text}</p>
        <span>${v.who}</span>
      </li>
    `).join("");
    observeFadeIn(programVoices);
  }
}
