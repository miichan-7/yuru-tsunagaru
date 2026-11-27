/* ==========================================================
   js/schedule.js … 開催スケジュールページの動き
   ----------------------------------------------------------
   【このファイルの役割】
   1. data/schedule.js の予定を、月ごとに分けて一覧にする
   2. 企画ボタンで「しぼりこみ」をする
   3. 「開催済みの回も表示する」の切りかえ
   4. カレンダー（開催日を企画の色の丸で表示）

   ※ 日付の計算や申込ボタンを作る関数（parseDate, formatDate,
     getStatus, applyButtons など）は common.js にあります。
   ========================================================== */

const scheduleList = document.getElementById("schedule-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const showPastCheckbox = document.getElementById("show-past");

// いまの表示条件を覚えておく箱
let currentFilter = "all";   // どの企画を表示するか
let showPast = false;        // 開催済みも表示するか


/* ----------------------------------------------------------
   予定1件分のカードのHTMLを作る関数
   ---------------------------------------------------------- */
function eventCardHtml(ev) {
  const program = PROGRAMS[ev.program];
  const d = formatDate(ev.date);
  const status = getStatus(ev);
  // 開催済みの回には、うすく表示するためのクラスをつける
  const pastClass = status === "開催済み" ? " is-past" : "";

  return `
    <article class="schedule-card card${pastClass}" id="ev-${ev.date}" style="--dot: ${program.color};">
      <!-- 左：日付 -->
      <div class="schedule-date">
        <span class="schedule-day">${d.text}</span>
        <span class="schedule-week">（${d.week}）</span>
      </div>

      <!-- まん中：企画名と、くわしい情報 -->
      <div class="schedule-body">
        <p class="schedule-en">${program.en}</p>
        <h3 class="schedule-title"><span class="dot"></span>${ev.title}</h3>
        <dl class="schedule-info">
          <div><dt>時間：</dt><dd>${ev.time}</dd></div>
          <div><dt>場所：</dt><dd>くつろぎ自由研究室</dd></div>
        </dl>
        <a class="schedule-more" href="${program.page}">この企画について →</a>
      </div>

      <!-- 右：申込状況とボタン -->
      <div class="schedule-apply">
        ${statusBadge(status)}
        <div class="schedule-actions">${applyButtons(ev)}</div>
      </div>
    </article>
  `;
}


/* ----------------------------------------------------------
   一覧を作り直す関数
   しぼりこみやチェックを変えるたびに、この関数を呼びます
   ---------------------------------------------------------- */
function renderSchedule() {
  // ① 表示する予定だけを残す
  const events = SCHEDULE
    .filter((ev) => currentFilter === "all" || ev.program === currentFilter)
    .filter((ev) => showPast || getStatus(ev) !== "開催済み")
    .sort((a, b) => parseDate(a.date) - parseDate(b.date)); // 日付の早い順

  // ② 1件もなかったとき
  if (events.length === 0) {
    scheduleList.innerHTML = `
      <p class="schedule-empty">
        いま受付中の予定はありません。<br>
        「開催済みの回も表示する」にチェックを入れると、これまでの回を見られます。
      </p>`;
    return;
  }

  // ③ 月ごとにグループ分けする（例：{ "2026-12": [予定, 予定], ... }）
  const byMonth = {};
  events.forEach((ev) => {
    const key = ev.date.slice(0, 7); // "2026-12-05" → "2026-12"
    (byMonth[key] = byMonth[key] || []).push(ev);
  });

  // ④ 「2026年12月」の見出し＋その月のカード、をつなげて入れる
  scheduleList.innerHTML = Object.entries(byMonth).map(([key, monthEvents]) => {
    const [year, month] = key.split("-").map(Number);
    return `
      <section class="month-block">
        <h2 class="month-title">${year}年<span>${month}</span>月</h2>
        <div class="month-cards">
          ${monthEvents.map(eventCardHtml).join("")}
        </div>
      </section>
    `;
  }).join("");
}


/* ----------------------------------------------------------
   しぼりこみボタン
   押したボタンだけ aria-pressed="true" にして、見た目も切りかえる
   ---------------------------------------------------------- */
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter; // data-filter の値を読む
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    renderSchedule();
  });
});

// 「開催済みの回も表示する」のチェック
showPastCheckbox.addEventListener("change", () => {
  showPast = showPastCheckbox.checked;
  renderSchedule();
});


/* ----------------------------------------------------------
   カレンダー
   ---------------------------------------------------------- */
const calTitle = document.getElementById("cal-title");
const calDays = document.getElementById("cal-days");
const calPrev = document.getElementById("cal-prev");
const calNext = document.getElementById("cal-next");

// 予定を「日付 → 予定の配列」の形にしておくと、カレンダーのマスから探しやすい
// 例：{ "2026-12-05": [予定], ... }
const eventsByDate = {};
SCHEDULE.forEach((ev) => {
  (eventsByDate[ev.date] = eventsByDate[ev.date] || []).push(ev);
});

// カレンダーで動ける範囲：いちばん最初の予定の月 〜 いちばん最後の予定の月
const sortedDates = SCHEDULE.map((ev) => ev.date).sort();
const firstMonth = parseDate(sortedDates[0].slice(0, 7) + "-01");
const lastMonth = parseDate(sortedDates[sortedDates.length - 1].slice(0, 7) + "-01");

// 最初に表示する月：今月（範囲の外なら、いちばん近いはしの月）
let calMonth = new Date(today().getFullYear(), today().getMonth(), 1);
if (calMonth < firstMonth) calMonth = firstMonth;
if (calMonth > lastMonth) calMonth = lastMonth;

// 数字を2けたにする（5 → "05"）。日付の文字 "2026-12-05" を作るのに使う
const pad = (n) => String(n).padStart(2, "0");

function renderCalendar() {
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth(); // 0〜11
  calTitle.textContent = `${year}年 ${month + 1}月`;

  const firstWeekday = new Date(year, month, 1).getDay();   // 1日が何曜日か（0=日曜）
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // その月が何日まであるか

  let html = "";
  // 1日より前の空きマス
  for (let i = 0; i < firstWeekday; i++) html += `<span class="cal-day is-empty"></span>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateText = `${year}-${pad(month + 1)}-${pad(day)}`;
    const weekday = (firstWeekday + day - 1) % 7;
    const weekClass = weekday === 0 ? " sun" : weekday === 6 ? " sat" : "";
    const isToday = parseDate(dateText).getTime() === today().getTime() ? " is-today" : "";
    const events = eventsByDate[dateText];

    if (events) {
      // 開催日：企画の色の丸。押せるように <button> にする
      const ev = events[0];
      const program = PROGRAMS[ev.program];
      const past = getStatus(ev) === "開催済み" ? " is-past" : "";
      const label = `${month + 1}月${day}日 ${events.map((e) => PROGRAMS[e.program].short).join("、")}（${getStatus(ev)}）`;
      html += `<button type="button" class="cal-day has-event${past}${isToday}" data-date="${dateText}"
                 style="--dot: ${program.color};" aria-label="${label}" title="${label}">${day}</button>`;
    } else {
      html += `<span class="cal-day${weekClass}${isToday}">${day}</span>`;
    }
  }
  calDays.innerHTML = html;

  // 範囲のはしでは、前／次の月ボタンを押せなくする
  calPrev.disabled = calMonth <= firstMonth;
  calNext.disabled = calMonth >= lastMonth;
}

calPrev.addEventListener("click", () => {
  calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1);
  renderCalendar();
});
calNext.addEventListener("click", () => {
  calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1);
  renderCalendar();
});

// 色のついた日を押したら、一覧のその予定まで移動する
calDays.addEventListener("click", (e) => {
  const dayButton = e.target.closest(".has-event"); // 押された場所に一番近い .has-event
  if (!dayButton) return;
  const dateText = dayButton.dataset.date;
  const ev = eventsByDate[dateText][0];

  // しぼりこみや「開催済みを隠す」で、その予定が見えていないときは表示させる
  if (currentFilter !== "all" && currentFilter !== ev.program) {
    document.querySelector('.filter-btn[data-filter="all"]').click();
  }
  if (getStatus(ev) === "開催済み" && !showPast) {
    showPastCheckbox.checked = true;
    showPast = true;
    renderSchedule();
  }

  const card = document.getElementById(`ev-${dateText}`);
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  // 一瞬だけ光らせて、どのカードか分かるようにする
  card.classList.remove("is-highlight");
  void card.offsetWidth; // アニメーションをもう一度最初から動かすためのおまじない
  card.classList.add("is-highlight");
});

renderCalendar();


/* ----------------------------------------------------------
   トップページなどから「schedule.html#yoga」のように来たときは、
   最初からその企画でしぼりこんでおく（詳細ページからのリンク用）
   ---------------------------------------------------------- */
const hash = location.hash.replace("#", "");
if (PROGRAMS[hash]) {
  const target = document.querySelector(`.filter-btn[data-filter="${hash}"]`);
  if (target) target.click(); // ボタンを押したのと同じ動きをさせる
} else {
  renderSchedule(); // 最初の表示
}
