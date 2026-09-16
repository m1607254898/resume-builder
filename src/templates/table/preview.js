import { esc, padLabel } from "../../core/ui.js";

const photoHtml = (state) =>
  state.photo?.dataUrl
    ? `<img src="${state.photo.dataUrl}" alt="证件照" />`
    : `<span>证件照</span>`;

export function renderPage(state) {
  const b = state.basic;
  const e = state.edu;
  const rows = [];

  const pairs = [
    ["姓名", b.name, "性别", b.gender],
    ["身高", b.height, "体重", b.weight],
    ["出生年月", b.birth, "民族", b.nation],
    ["联系电话", b.phone, "电子邮箱", b.email],
    ["婚姻状况", b.marriage, "政治面貌", b.politics],
    ["特长爱好", b.hobby, "健康状况", b.health],
  ];

  pairs.forEach(([l1, v1, l2, v2], i) => {
    const photo = i === 0 ? `<td class="photo-cell" rowspan="4">${photoHtml(state)}</td>` : "";
    const span = i >= 4 ? ' colspan="2"' : "";
    rows.push(
      `<tr class="h-basic"><td class="lb">${esc(padLabel(l1))}</td><td>${esc(v1)}</td>` +
        `<td class="lb">${esc(padLabel(l2))}</td><td${span}>${esc(v2)}</td>${photo}</tr>`
    );
  });

  rows.push(
    `<tr class="h-basic"><td class="lb">${esc(padLabel("联系地址"))}</td>` +
      `<td colspan="4">${esc(b.address)}</td></tr>`
  );

  rows.push(`<tr><td class="sec" colspan="5">教育背景</td></tr>`);
  rows.push(
    `<tr class="h-edu"><td class="lb">毕业院校</td><td>${esc(e.school)}</td>` +
      `<td class="lb">最高学历</td><td colspan="2">${esc(e.degree)}</td></tr>`
  );
  rows.push(
    `<tr class="h-course"><td class="lb">主修课程</td>` +
      `<td class="ta-l" colspan="4">${esc(e.courses)}</td></tr>`
  );
  rows.push(
    `<tr class="h-campus"><td class="lb">校园经历</td>` +
      `<td class="ta-j" colspan="4">${esc(e.campus)}</td></tr>`
  );

  rows.push(`<tr><td class="sec" colspan="5">工作经历</td></tr>`);
  const workHtml = state.work
    .filter((w) => w.title || w.desc)
    .map((w) => `<p class="entry"><b>${esc(w.title)}：</b>${esc(w.desc)}</p>`)
    .join("");
  rows.push(
    `<tr class="h-work"><td class="lb">实践经历</td>` +
      `<td class="ta-j" colspan="4">${workHtml || "&nbsp;"}</td></tr>`
  );

  rows.push(
    `<tr class="h-self"><td class="lb">自我评价</td>` +
      `<td class="ta-j" colspan="4">${esc(state.self)}</td></tr>`
  );

  return `
    <div class="tbl-root">
      <h1 class="resume-title">个\u3000人\u3000简\u3000历</h1>
      <table class="rt">
        <colgroup>
          <col style="width:16.09%" /><col style="width:24.14%" /><col style="width:13.22%" />
          <col style="width:25.86%" /><col style="width:20.69%" />
        </colgroup>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>`;
}
