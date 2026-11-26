/* ==========================================================
   js/report.js … 活動報告ページの動き
   ----------------------------------------------------------
   【このファイルの役割】
   1. 開催ごとのレポートのカードを作る（REPORTS）
   2. アンケート結果の棒グラフを作る（SURVEY）
      ・グラフはライブラリを使わず、HTMLの <div> の「幅」で描きます
      ・画面に入ったら、棒が左からのびるアニメーション
   3. 参加者の声のまとめを作る（ALL_VOICES）
   ========================================================== */


/* ----------------------------------------------------------
   1. 開催ごとのレポート
   ---------------------------------------------------------- */
const reportList = document.getElementById("report-list");

if (reportList && typeof REPORTS !== "undefined") {
  reportList.innerHTML = REPORTS.map((r) => {
    const program = PROGRAMS[r.program];
    const d = formatDate(r.date, true);
    // 写真は「1枚の文字」か「何枚かの配列 [ ]」のどちらでも書けるようにする。
    // Array.isArray … それが配列かどうかを調べる関数
    const photos = Array.isArray(r.photo) ? r.photo : (r.photo ? [r.photo] : []);
    let photo;
    if (photos.length === 0) {
      photo = `<div class="report-photo photo-placeholder"><span>写真が入ります</span></div>`;
    } else if (photos.length === 1) {
      photo = `<img class="report-photo" src="images/${photos[0]}" alt="${r.title}のようす" loading="lazy" style="object-position: ${r.position || "center"};">`;
    } else {
      // 2枚以上は、横に並べる
      // positions: ["…", "…"] があれば、1枚ずつ見せる位置を変える
      const positions = r.positions || [];
      photo = `<div class="report-photos">${photos.map((file, i) =>
        `<img src="images/${file}" alt="${r.title}のようす" loading="lazy" style="object-position: ${positions[i] || "center"};">`).join("")}</div>`;
    }

    return `
      <article class="report-card card fade-in" style="--dot: ${program.color};">
        ${photo}
        <div class="report-body">
          <p class="report-date">${d.text}（${d.week}）</p>
          <h3 class="report-title"><span class="dot"></span>${r.title}</h3>
          <p class="report-comment">${r.comment}</p>
          <p class="report-meta">アンケート回答 ${r.responses}件 ／ 満足度 ${r.satisfaction.toFixed(2)}</p>
        </div>
      </article>`;
  }).join("");
  observeFadeIn(reportList);
}


/* ----------------------------------------------------------
   2. 棒グラフ
   1本の棒 = 「ラベル」「灰色の道（全体の長さ）」「緑の棒」「数字」
   緑の棒の幅を「値 ÷ 満点 × 100%」にすると、満点までのどこにいるか分かります。
   ---------------------------------------------------------- */

// 棒グラフ1つ分のHTMLを作る関数
// labels: 行の名前の配列 / values: 数字の配列 / max: 満点
function barChartHtml(labels, values, max) {
  return `
    <ul class="bars">
      ${labels.map((label, i) => {
        const value = values[i];
        const percent = (value / max) * 100;
        return `
          <li class="bar-row">
            <span class="bar-label">${label}</span>
            <span class="bar-track" data-tip="${label}：${value.toFixed(2)} / ${max}">
              <!-- --i は「上から何本目か」。CSSで1本ずつ少し遅れてのびるのに使う -->
              <span class="bar-fill" style="--w: ${percent}%; --i: ${i};"></span>
            </span>
            <span class="bar-value" data-value="${value}">0.00</span>
          </li>`;
      }).join("")}
    </ul>`;
}

// 表（グラフと同じ数字を、表でも読めるように）
function tableHtml(headers, rows) {
  return `
    <table class="data-table">
      <thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

if (typeof SURVEY !== "undefined") {
  // --- まとめの数字 ---
  const summary = document.getElementById("survey-summary");
  if (summary) {
    summary.innerHTML = `
      <div class="summary-item"><dt>開催回数</dt><dd>${SURVEY.totalEvents}<small>回</small></dd></div>
      <div class="summary-item"><dt>アンケート回答</dt><dd>${SURVEY.totalResponses}<small>件</small></dd></div>
      <div class="summary-item"><dt>満足度の平均</dt><dd>${SURVEY.averageSatisfaction.toFixed(2)}<small>/ 5.00</small></dd></div>`;
  }

  // --- 満足度のグラフ（5点満点） ---
  const satChart = document.getElementById("chart-satisfaction");
  if (satChart) {
    satChart.innerHTML = barChartHtml(SURVEY.events, SURVEY.satisfaction, 5);
  }

  // グラフの下の説明（シートから読みこんだときは、回にあわせて作りなおした文にする）
  const itemsNote = document.getElementById("items-note");
  if (itemsNote && SURVEY.note) itemsNote.textContent = SURVEY.note;

  // --- Q7 の4項目：項目ごとに小さなグラフを4つ並べる（4点満点） ---
  const itemCharts = document.getElementById("chart-items");
  if (itemCharts) {
    itemCharts.innerHTML = SURVEY.items.map((item) => `
      <div class="mini-chart fade-in">
        <h4 class="mini-chart-title">${item.label}</h4>
        ${barChartHtml(SURVEY.events.map((e) => e.split(" ")[0]), item.values, 4)}
      </div>
    `).join("");
    observeFadeIn(itemCharts);
  }

  // --- 表で見る ---
  const table = document.getElementById("survey-table");
  if (table) {
    const headers = ["項目", ...SURVEY.events];
    const rows = [
      ["満足度（5点満点）", ...SURVEY.satisfaction.map((v) => v.toFixed(2))],
      ...SURVEY.items.map((item) => [`${item.label}（4点満点）`, ...item.values.map((v) => v.toFixed(2))]),
    ];
    table.innerHTML = tableHtml(headers, rows);
  }

  // --- 画面に入ったら、棒を「ニューっと」のばす ---
  // 最初は幅0。.is-drawn がつくと、CSSで --w の幅まで1本ずつ順番にのびる。
  // 横の数字も、0.00 から本当の値までいっしょにカウントアップする。
  function drawBars(bars) {
    bars.classList.add("is-drawn");
    bars.querySelectorAll(".bar-value").forEach((el, i) => {
      const target = Number(el.dataset.value);
      const delay = 400 + i * 180;   // CSSの transition-delay と同じタイミング
      const duration = 1600;         // CSSの transition の長さと同じ
      setTimeout(() => {
        const start = performance.now();
        function step(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);   // 最後はゆっくり
          el.textContent = (target * eased).toFixed(2);
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, delay);
    });
  }

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        drawBars(entry.target);
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });   // グラフが6割見えてからスタート（見のがさないように）
  document.querySelectorAll(".bars").forEach((el) => barObserver.observe(el));

  // 「動きを減らす」設定の人には、最初から数字を出しておく
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".bar-value").forEach((el) => {
      el.textContent = Number(el.dataset.value).toFixed(2);
    });
  }
}


/* ----------------------------------------------------------
   3. 参加者の声のまとめ
   回ごとに見出しをつけて、声を並べます
   ---------------------------------------------------------- */
const voicesAll = document.getElementById("voices-all");

if (voicesAll && typeof ALL_VOICES !== "undefined") {
  // 新しい回が上に来るように、reverse() で順番を逆にする（slice() で元の配列はそのまま）
  voicesAll.innerHTML = ALL_VOICES.slice().reverse().map((group) => `
    <section class="voice-group fade-in">
      <h3 class="voice-group-title">${group.event}<span>${group.voices.length}件</span></h3>
      <ul class="voice-bubbles">
        ${group.voices.map((v) => `<li>${v}</li>`).join("")}
      </ul>
    </section>
  `).join("");
  observeFadeIn(voicesAll);
}
