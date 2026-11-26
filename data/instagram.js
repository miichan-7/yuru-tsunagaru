/* ==========================================================
   data/instagram.js
   ----------------------------------------------------------
   【このファイルの役割】
   トップページに並べるInstagram投稿のURLをまとめたファイルです。
   Instagram公式の「埋め込み」機能を使って表示します。

   【投稿を追加する手順】
   1. Instagramで載せたい投稿を開く
   2. 「…」メニュー →「リンクをコピー」
   3. 下の postUrls の [ ] の中に、" " でかこんで貼りつける
      例）"https://www.instagram.com/p/ABCdef123/",
   4. 新しい投稿を上に書くと、上から順に表示されます（最大3件）

   ※ postUrls が空っぽのあいだは、アカウントへのリンクを
     表示するようにしてあります。
   ========================================================== */

const INSTAGRAM = {
  account: "mogumzk",
  profileUrl: "https://www.instagram.com/mogumzk/",
  maxPosts: 3, // トップページに表示する件数
  postUrls: [
    "https://www.instagram.com/p/DezMbTGGTMq/",
    "https://www.instagram.com/p/Ded8kxAmVcR/",
    "https://www.instagram.com/p/DeidIbsmQ1m/",
  ],
};
