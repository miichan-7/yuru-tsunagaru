/* ==========================================================
   js/faq.js … よくある質問ページの動き
   ----------------------------------------------------------
   1. data/faq-data.js の FAQ から、質問の一覧を作る
   2. 質問を押すと、答えが開いたり閉じたりする（アコーディオン）

   【アコーディオンのしくみ】
   ボタンに aria-expanded="true / false" をつけて、開いているかを記録します。
   見た目（なめらかに開く動き）は CSS の担当です（faq.css）。
   ========================================================== */

const faqList = document.getElementById("faq-list");

if (faqList && typeof FAQ !== "undefined") {
  let count = 0; // 質問に通し番号をつけて、ボタンと答えを id で結びつける

  faqList.innerHTML = FAQ.map((group) => `
    <section class="faq-group fade-in">
      <h2 class="faq-category">${group.category}</h2>
      <div class="faq-items">
        ${group.items.map((item) => {
          count++;
          const draft = item.draft ? `<span class="faq-draft">仮</span>` : "";
          return `
            <div class="faq-item">
              <h3 class="faq-q">
                <button type="button" class="faq-button" aria-expanded="false" aria-controls="faq-a-${count}" id="faq-q-${count}">
                  <span class="faq-mark">Q</span>
                  <span class="faq-q-text">${item.q}</span>
                  <span class="faq-icon" aria-hidden="true"></span>
                </button>
              </h3>
              <div class="faq-a" id="faq-a-${count}" role="region" aria-labelledby="faq-q-${count}">
                <div class="faq-a-inner">
                  <span class="faq-mark faq-mark-a">A</span>
                  <p>${draft}${item.a}</p>
                </div>
              </div>
            </div>`;
        }).join("")}
      </div>
    </section>
  `).join("");
  observeFadeIn(faqList);

  // 質問ボタンを押したら、開く／閉じるを切りかえる
  // （1つずつ addEventListener をつけず、親の faqList でまとめて受け取る方法）
  faqList.addEventListener("click", (e) => {
    const button = e.target.closest(".faq-button");
    if (!button) return;
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
  });

  // URLの最後が #faq-q-3 のようになっていたら、その質問を開いておく
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1)); // 先頭の「#」を取る
    if (target && target.classList.contains("faq-button")) target.setAttribute("aria-expanded", "true");
  }
}
