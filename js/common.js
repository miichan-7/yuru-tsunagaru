/* ==========================================================
   js/common.js … 全ページ共通の動き
   ----------------------------------------------------------
   【このファイルの役割】
   1. スマホのハンバーガーメニューの開け閉め
   2. スクロールで要素をふわっと表示（フェードイン）
   3. フッターの © の年を自動で今年にする
   4. どのページでも使う便利な関数（日付の表示など）

   ※ メニューからのスムーズスクロールは、
     CSSの「scroll-behavior: smooth」で実現しています（common.css）。
   ========================================================== */


/* ----------------------------------------------------------
   1. ハンバーガーメニュー
   ボタンを押すたびに <body> に「menu-open」クラスを
   つけたり外したりします。見た目の変化は CSS 側の担当です。
   ---------------------------------------------------------- */
const menuButton = document.querySelector(".menu-toggle");
const backdrop = document.querySelector(".nav-backdrop");
const navLinks = document.querySelectorAll(".global-nav a");

// メニューを開く／閉じる関数
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
}

if (menuButton) {
  // ボタンを押したら、今と反対の状態にする
  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("menu-open");
    setMenu(!isOpen);
  });

  // 暗い幕や、メニューのリンクを押したら閉じる
  backdrop.addEventListener("click", () => setMenu(false));
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

  // Escキーでも閉じられるように
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
}


/* ----------------------------------------------------------
   2. スクロールでふわっと表示
   IntersectionObserver … 「要素が画面に入ったか」を
   見張ってくれる、ブラウザに備わった機能です。
   ---------------------------------------------------------- */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add("is-visible");   // CSSでふわっと表示される
        fadeObserver.unobserve(el);       // 1回表示したら見張りをやめる

        // 表示が終わったら fade-in のクラスを外す。
        // （外さないと、カードのホバーで浮く動きとぶつかってしまうため）
        el.addEventListener("transitionend", () => {
          el.classList.remove("fade-in", "is-visible");
        }, { once: true });
      }
    });
  },
  { threshold: 0.15 } // 要素が15%見えたら表示
);

// ページ内の .fade-in をすべて見張る関数。
// JSであとから作った要素にも使えるよう、関数にしておきます。
function observeFadeIn(root = document) {
  root.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));
}
observeFadeIn();


/* ----------------------------------------------------------
   2.5 スクロールで文字が1文字ずつ出てくる
   ・class="text-reveal" をつけた文章
   ・全ページのセクションの見出し（英字ラベルと日本語の見出し）
   に使います。文字を1つずつ <span> で包んで、画面に入ったら
   .is-shown をつけるだけ。出てくる動きは CSS（common.css の 7）の担当です。
   ---------------------------------------------------------- */
function splitChars(el) {
  let index = 0;
  // 長い文章ほど1文字あたりを速くして、全体が長くなりすぎないようにする
  const length = el.textContent.trim().length;
  el.style.setProperty("--speed", length > 60 ? "14ms" : length > 25 ? "28ms" : "45ms");

  // TreeWalker … 要素の中の「文字の部分」だけを順番に取り出す道具。
  // <br> や <span> などのタグはそのまま残して、文字だけを分けられます。
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const text = node.textContent.replace(/\s*\n\s*/g, ""); // HTMLの中の改行とインデントは消す
    if (!text) { node.remove(); return; }
    const frag = document.createDocumentFragment();
    let prev = null;      // 1つ前に作った文字の <span>
    let opening = "";     // 「 や （ など、次の文字とくっつけたい記号
    [...text].forEach((ch) => {
      // 、。」などは前の文字とくっつける（行のはじめに「。」だけが来ないように）
      if (/[、。，．」』）】！？…]/.test(ch) && prev) {
        prev.textContent += ch;
        return;
      }
      // 「（などは次の文字とくっつける（行のおわりに「「」だけが残らないように）
      if (/[「『（【]/.test(ch)) {
        opening += ch;
        return;
      }
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = opening + ch;
      opening = "";
      span.style.setProperty("--i", index++);
      frag.appendChild(span);
      prev = span;
    });
    node.replaceWith(frag);
  });
}

// セクションの見出しも、1文字ずつ出す（見出し全体のフェードインは外す）
document.querySelectorAll(".section-title").forEach((title) => {
  title.classList.remove("fade-in");
  title.querySelectorAll(".section-en, .title-deco").forEach((el) => el.classList.add("text-reveal"));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-shown");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll(".text-reveal").forEach((el) => {
  splitChars(el);
  revealObserver.observe(el);
});


/* ----------------------------------------------------------
   2.6 スクロールしたら、ヘッダーに .is-scrolled をつける
   （トップページで、写真の上では透明・下では色つき、を切りかえるため）
   ---------------------------------------------------------- */
const siteHeader = document.querySelector(".site-header");
function updateHeader() {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 40);
}
if (siteHeader) {
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}


/* ----------------------------------------------------------
   3. © の年を自動で今年にする
   ---------------------------------------------------------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ----------------------------------------------------------
   4. 便利な関数（ほかのJSファイルからも使います）
   ---------------------------------------------------------- */

// "2026-12-05" のような文字を、日付として読み取る
function parseDate(dateText) {
  const [y, m, d] = dateText.split("-").map(Number);
  return new Date(y, m - 1, d); // 月は0から数えるので -1 する
}

// 今日の日付（時刻は0時0分にそろえる）
function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// 日付を「12月5日（土）」の形にする
function formatDate(dateText, withYear = false) {
  const date = parseDate(dateText);
  const week = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  const md = `${date.getMonth() + 1}月${date.getDate()}日`;
  return {
    year: date.getFullYear(),
    text: (withYear ? `${date.getFullYear()}年` : "") + md,
    week: week,
  };
}

// 申込状況を決める。日付が過ぎていたら自動で「開催済み」
function getStatus(event) {
  if (parseDate(event.date) < today()) return "開催済み";
  return event.status;
}

// 申込状況に合わせた、バッジのHTMLを作る
function statusBadge(status) {
  const cls = { "受付中": "status-open", "満員": "status-full", "開催済み": "status-done", "申込不要": "status-free" }[status] || "status-open";
  return `<span class="status ${cls}">${status}</span>`;
}

// 申込ボタンのHTMLを作る（受付中ならリンク、満員なら押せないボタン）
function applyButtons(event) {
  const status = getStatus(event);
  if (status === "満員") {
    return `<span class="btn btn-small btn-disabled" aria-disabled="true">満員のため受付終了</span>`;
  }
  if (status === "開催済み") {
    return `<span class="btn btn-small btn-disabled" aria-disabled="true">開催済み</span>`;
  }
  if (status === "申込不要") {
    return `<p class="event-actions-note">当日、直接お越しください</p>`;
  }
  if (!event.forms || event.forms.length === 0) {
    return `<p class="event-actions-note">申込方法は準備中です</p>`;
  }
  // フォームが2つある日（モーニング＆コンポスト）は、ボタンも2つ
  return event.forms
    .map((f) => `<a href="${f.url}" class="btn btn-small btn-gold" target="_blank" rel="noopener">${f.label}</a>`)
    .join("");
}

// 参加費の表示。「無料」の文字だけ、チラシと同じからし色にする
function feeHtml(fee) {
  // 「無料」の部分だけを緑の文字にする（「受講料無料・ランチ代3,000円」なら「受講料無料」だけが緑）
  return fee.replace(/(受講料)?無料/, (m) => `<span class="fee-free">${m}</span>`);
}
