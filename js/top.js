/* ==========================================================
   js/top.js … トップページだけの動き
   ----------------------------------------------------------
   【このファイルの役割】
   1. オープニングの後かたづけ
   2. お知らせを表示（data/site-data.js の NEWS）
   3. 数字で見る活動を表示＋カウントアップ（STATS）
   4. 今後の開催予定を3件表示（data/schedule.js の SCHEDULE）
   5. 参加者の声を表示（VOICES）
   6. Instagramの投稿を表示（data/instagram.js の INSTAGRAM）

   ※ common.js の関数（formatDate など）を使うので、
     HTMLでは common.js → top.js の順に読み込んでいます。
   ========================================================== */


/* ----------------------------------------------------------
   1. オープニング
   消えるアニメーション自体は CSS（top.css）が担当。
   ここでは、終わったあとに要素を取りのぞき、
   「このタブでは見た」という印を保存します。
   ---------------------------------------------------------- */
const opening = document.getElementById("opening");
if (opening) {
  opening.addEventListener("animationend", (e) => {
    if (e.animationName === "openingReveal") opening.remove();
  });
  try { sessionStorage.setItem("openingShown", "1"); } catch (e) { /* 保存できなくても動くように */ }
}


/* ----------------------------------------------------------
   2. お知らせ
   ---------------------------------------------------------- */
const newsList = document.getElementById("news-list");
if (newsList && typeof NEWS !== "undefined") {
  // 配列のひとつひとつを <li> のHTMLにして、つなげて入れる
  newsList.innerHTML = NEWS.map((item) => `
    <li><span class="news-tag" data-tag="${item.tag}">${item.tag}</span><span>${item.text}</span></li>
  `).join("");
}


/* ----------------------------------------------------------
   3. 数字で見る活動（カウントアップ）
   ---------------------------------------------------------- */
const statsList = document.getElementById("stats-list");
if (statsList && typeof STATS !== "undefined") {
  statsList.innerHTML = STATS.map((s) => `
    <li class="stat fade-in">
      <span class="stat-label">${s.label}</span>
      <span class="stat-number" data-target="${s.value}" data-decimals="${s.decimals}">0</span>
      <span class="stat-unit">${s.unit}</span>
    </li>
  `).join("");
  observeFadeIn(statsList); // 新しく作った要素もフェードインの対象にする

  // 数字の下の注意書き（STATS_NOTE）も data から入れる
  const statsNote = document.getElementById("stats-note");
  if (statsNote && typeof STATS_NOTE !== "undefined") statsNote.textContent = STATS_NOTE;

  // 0 から目標の数字まで、少しずつ増やしていく関数
  function countUp(el) {
    const target = Number(el.dataset.target);
    const decimals = Number(el.dataset.decimals);
    const duration = 1600; // 何ミリ秒かけて数えるか（1600 = 1.6秒）
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1); // 0〜1 の進み具合
      const eased = 1 - Math.pow(1 - progress, 3);           // 最後はゆっくりになる動き
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);           // 次の画面更新でもう一度
    }
    requestAnimationFrame(step);
  }

  // 数字が画面に入ったら、カウントアップ開始
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        countObserver.unobserve(entry.target); // 1回だけ
      }
    });
  }, { threshold: 0.6 });

  statsList.querySelectorAll(".stat-number").forEach((el) => countObserver.observe(el));
}


/* ----------------------------------------------------------
   4. 今後の開催予定（チラシの裏面）
   ・左の枠 … 今日以降の予定を、月ごとに短く一覧
   ・右のカード … 直近の3件をくわしく
   ---------------------------------------------------------- */
const upcomingList = document.getElementById("upcoming-list");
const scheduleMini = document.getElementById("schedule-mini");

if (upcomingList && typeof SCHEDULE !== "undefined") {
  // 今日以降の予定だけを、日付の近い順に並べる
  const futureEvents = SCHEDULE
    .filter((ev) => parseDate(ev.date) >= today())
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  // --- 右：直近3件のカード ---
  const upcoming = futureEvents.slice(0, 3); // 先頭から3件だけ

  if (upcoming.length === 0) {
    upcomingList.innerHTML = `<p class="event-empty">次回の予定は準備中です。Instagramでお知らせします。</p>`;
  } else {
    upcomingList.innerHTML = upcoming.map((ev) => {
      const program = PROGRAMS[ev.program];
      const d = formatDate(ev.date, true);
      return `
        <article class="event-card card fade-in" style="--dot: ${program.color};">
          <div class="event-head">
            <h3 class="event-title"><span class="dot"></span>${ev.title}</h3>
            <p class="event-en">${program.en} — ${program.short}</p>
          </div>
          <dl class="event-info">
            <div><dt>日時：</dt><dd><span class="date-big">${d.text}（${d.week}）</span> ${ev.time}</dd></div>
            <div><dt>参加費：</dt><dd>${feeHtml(ev.fee)}</dd></div>
            <div><dt>状況：</dt><dd>${statusBadge(getStatus(ev))}</dd></div>
          </dl>
          <div class="event-actions">${applyButtons(ev)}</div>
        </article>
      `;
    }).join("");
    observeFadeIn(upcomingList);
  }

  // --- 左：月ごとの短い一覧 ---
  if (scheduleMini) {
    // 「第2回」→「②」のように、丸数字にする
    const circled = "①②③④⑤⑥⑦⑧⑨⑩";
    const shortLabel = (ev) => {
      const m = ev.title.match(/第(\d+)回/);
      return PROGRAMS[ev.program].short + (m ? ` ${circled[m[1] - 1]}` : "");
    };

    // 月ごとにグループ分けする（例：{ "2026-12": [予定, 予定], ... }）
    const byMonth = {};
    futureEvents.forEach((ev) => {
      const key = ev.date.slice(0, 7); // "2026-12-05" の先頭7文字 → "2026-12"
      (byMonth[key] = byMonth[key] || []).push(ev);
    });

    scheduleMini.innerHTML = Object.values(byMonth).map((events) => `
      <div class="mini-month">
        ${events.map((ev) => {
          const date = parseDate(ev.date);
          const d = formatDate(ev.date);
          const full = getStatus(ev) === "満員" ? " is-full" : "";
          return `<div class="mini-row${full}">
                    <span class="mini-date">${date.getMonth() + 1}/${date.getDate()}（${d.week}）</span>
                    <span>${shortLabel(ev)}${full ? "（満員）" : ""}</span>
                  </div>`;
        }).join("")}
      </div>
    `).join("");
  }
}


/* ----------------------------------------------------------
   5. 参加者の声（3件）
   ---------------------------------------------------------- */
const voiceList = document.getElementById("voice-list");
if (voiceList && typeof VOICES !== "undefined") {
  voiceList.innerHTML = VOICES.slice(0, 3).map((v) => `
    <li class="voice fade-in">
      <p class="voice-text">${v.text}</p>
      <span class="voice-who">${v.who}</span>
    </li>
  `).join("");
  observeFadeIn(voiceList);
}


/* ----------------------------------------------------------
   6. Instagram
   投稿URLがあれば、Instagram公式の埋め込みコードを作って
   公式のスクリプト（embed.js）を読み込みます。
   URLがまだ無いときは、アカウントへの案内タイルを出します。
   ---------------------------------------------------------- */
const instaFeed = document.getElementById("insta-feed");
if (instaFeed && typeof INSTAGRAM !== "undefined") {
  const posts = INSTAGRAM.postUrls.slice(0, INSTAGRAM.maxPosts);

  if (posts.length > 0) {
    // 公式の埋め込みは <blockquote class="instagram-media"> という形
    instaFeed.innerHTML = posts.map((url) => `
      <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14">
        <a href="${url}" target="_blank" rel="noopener">Instagramで投稿を見る</a>
      </blockquote>
    `).join("");

    // 公式スクリプトを読み込むと、blockquote が投稿の表示に変わる
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  } else {
    // 仮のタイルを3つ並べる
    instaFeed.innerHTML = [1, 2, 3].map(() => `
      <a class="insta-tile card fade-in" href="${INSTAGRAM.profileUrl}" target="_blank" rel="noopener">
        <span><strong>@${INSTAGRAM.account}</strong>ここに最新の投稿が<br>表示されます</span>
      </a>
    `).join("");
    observeFadeIn(instaFeed);
  }
}
