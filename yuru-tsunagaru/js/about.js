/* ==========================================================
   js/about.js … 運営について／お問い合わせ ページの動き
   ----------------------------------------------------------
   data/site-data.js の LINKS から、関連リンクのカードを作ります。
   リンクを足すときは、site-data.js の LINKS に1行足すだけでOKです。
   ========================================================== */

const linkList = document.getElementById("link-list");

if (linkList && typeof LINKS !== "undefined") {
  linkList.innerHTML = LINKS.map((link) => {
    // URL から「https://」と最後の「/」を取って、短く見せる
    const shortUrl = link.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `
      <li>
        <a class="link-card card fade-in" href="${link.url}" target="_blank" rel="noopener">
          <span class="link-name">${link.name}</span>
          <span class="link-url">${shortUrl}</span>
        </a>
      </li>`;
  }).join("");
  observeFadeIn(linkList);
}
