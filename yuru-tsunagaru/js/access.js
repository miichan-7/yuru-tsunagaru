/* ==========================================================
   js/access.js … アクセスページの動き
   ----------------------------------------------------------
   data/access-data.js の BUS_INFO と RECOMMENDED_BUSES から、
   1. 行き方のステップ（駅 → バス停 → 会場）
   2. おすすめの便の表
   を作ります。時刻を変えるときは、データのファイルだけを直します。
   ========================================================== */

// 1. 行き方のステップ
const route = document.getElementById("route");
if (route && typeof BUS_INFO !== "undefined") {
  route.innerHTML = `
    <li class="route-step">
      <span class="route-label">電車</span>
      <strong>近鉄長野線「富田林駅」</strong>
      <span>バスのりば「${BUS_INFO.from.replace("富田林駅前 ", "")}」へ</span>
    </li>
    <li class="route-step">
      <span class="route-label">バス</span>
      <strong>${BUS_INFO.line}</strong>
      <span>約${BUS_INFO.minutes}分・${BUS_INFO.fare}</span>
    </li>
    <li class="route-step">
      <span class="route-label">到着</span>
      <strong>「${BUS_INFO.to}」バス停で下車</strong>
      <span>くつろぎ自由研究室はすぐです</span>
    </li>`;
}

// 2. おすすめの便の表
const busTableBody = document.getElementById("bus-table-body");
if (busTableBody && typeof RECOMMENDED_BUSES !== "undefined") {
  busTableBody.innerHTML = RECOMMENDED_BUSES.map((bus) => {
    const program = PROGRAMS[bus.program];   // schedule.js の企画の色を使う
    return `
      <tr style="--dot: ${program.color};">
        <th scope="row"><span class="dot"></span>${bus.label}</th>
        <td>${bus.depart}</td>
        <td>${bus.arrive}</td>
      </tr>`;
  }).join("");

  // 表の下の注意書き（確認した日と、時刻表へのリンク）
  document.getElementById("bus-caution").innerHTML = `
    千早線は${BUS_INFO.daily}で運行しています。${BUS_INFO.checkedOn}時点の時刻なので、ダイヤ改正があったときは
    <a href="${BUS_INFO.timetableUrl}" target="_blank" rel="noopener">最新の時刻表</a>でご確認ください。`;
}
