# ゆるくつながるプロジェクト 公式サイト

HTML / CSS / JavaScript だけで作った静的サイトです。

## フォルダ構成

```
yuru-tsunagaru/
├─ index.html            トップページ                    ← 今回つくったページ
├─ schedule.html         開催スケジュール                （次に作成）
├─ program-morning.html  企画① モーニング＆コンポスト      （予定）
├─ program-sns.html      企画② SNS活用講座               （予定）
├─ program-yoga.html     企画③ ヨガ教室                  （予定）
├─ program-ikoya.html    企画④ 放課後いこーや             （予定）
├─ instructors.html      講師紹介                        （予定）
├─ report.html           活動報告                        （予定）
├─ first-time.html       初めての方へ                    （予定）
├─ access.html           アクセス                        （予定）
├─ faq.html              よくある質問                    （予定）
├─ about.html            運営について／お問い合わせ        （予定）
│
├─ css/                  見た目
│  ├─ common.css         全ページ共通（色・ボタン・カード・ヘッダー・フッター）
│  └─ top.css            トップページ専用
│
├─ js/                   動き
│  ├─ common.js          全ページ共通（メニュー・フェードイン・日付の関数）
│  └─ top.js             トップページ専用（オープニング・カウントアップなど）
│
├─ data/                 ★ 自分で書きかえるのはここ
│  ├─ schedule.js        開催予定・申込フォームのURL
│  ├─ site-data.js       お知らせ・数字・参加者の声
│  └─ instagram.js       Instagramに表示する投稿のURL
│
└─ images/               写真を入れるフォルダ
```

## 見るときのコツ
- `index.html` をダブルクリックすれば、ブラウザで表示できます。
- Instagramの埋め込みは、ファイルを直接開くと表示されないことがあります。
  VS Code の拡張機能「Live Server」で開くか、公開後のサイトで確認してください。
