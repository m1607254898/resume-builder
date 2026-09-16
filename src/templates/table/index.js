import { renderPage } from "./preview.js";
import { buildDocx } from "./docx.js";
import { card, input, area, esc, removeAt } from "../../core/ui.js";

export const id = "table";
export const name = "经典表格";
export const desc = "黑白网格线 + 右上角证件照，一页装完，最稳妥；适合国企 / 事业单位 / 医疗";
export const supportsTheme = false;
export const defaultTheme = "gray";

export const BASIC_PAIRS = [
  [["name", "姓名"], ["gender", "性别"]],
  [["height", "身高"], ["weight", "体重"]],
  [["birth", "出生年月"], ["nation", "民族"]],
  [["phone", "联系电话"], ["email", "电子邮箱"]],
  [["marriage", "婚姻状况"], ["politics", "政治面貌"]],
  [["hobby", "特长爱好"], ["health", "健康状况"]],
];
export const BASIC_FULL = [["address", "联系地址"]];

export function sample() {
  return {
    basic: {
      name: "张明", gender: "男", height: "178cm", weight: "68kg",
      birth: "2004.03.12", nation: "汉",
      phone: "138 0000 0000", email: "demo@example.com",
      marriage: "未婚", politics: "团员",
      hobby: "篮球、摄影", health: "健康",
      address: "示例省示例市示例区示例路 128 号",
      city: "示例省-示例市",
      intention: "示例市 虚拟现实相关岗位",
    },
    edu: {
      school: "示例职业技术学院", degree: "大专",
      courses: "虚拟现实技术原理、Unity 3D 引擎开发、3ds Max 三维建模、C# 程序设计、三维动画制作、数字图像处理",
      campus: "在校期间系统学习虚拟现实技术原理、Unity 3D 开发、3ds Max 建模、C# 程序设计等专业课程，专业理论基础扎实；能熟练运用 Unity 3D 配合 C# 脚本实现场景漫游、UI 交互、物体拾取等功能；参与小组项目开发，负责三维模型制作与交互逻辑编写，具备良好的团队协作与沟通能力。",
    },
    work: [
      { title: "示例电子科技有限公司｜生产小组长", period: "2024.07-2024.09", company: "示例电子科技有限公司", position: "生产小组长", desc: "负责产线小组人员分工与生产进度跟进，协助开展新人培训与作业规范监督，配合主管完成月度产能目标。" },
      { title: "示例电子商务有限公司｜网络销售", period: "2024.01-2024.03", company: "示例电子商务有限公司", position: "网络销售", desc: "负责线上客户开发与维护，解答客户咨询并跟进订单成交，配合团队完成阶段性销售任务。" },
      { title: "示例环保建材有限公司｜化验员", period: "2023.07-2023.09", company: "示例环保建材有限公司", position: "化验员", desc: "负责原材料及成品的取样化验与数据记录，按规程使用化验仪器并维护实验室台账，发现指标异常及时上报。" },
      { title: "示例数据服务有限公司｜数据标注员", period: "2023.01-2023.03", company: "示例数据服务有限公司", position: "数据标注员", desc: "按标注规范完成图像、文本等数据的标注与质检，保证标注准确率，熟练使用标注工具并按期交付任务。" },
    ],
    self: "本人对虚拟现实技术充满热情，学习能力强，具备扎实的专业理论基础，能够独立完成简单 VR 场景的搭建与交互功能开发；做事踏实、责任心强，遇到技术难题能主动钻研解决；具备良好的团队协作精神和沟通能力，在小组项目中能与成员高效配合完成任务；性格开朗、待人热情，吃苦耐劳，能承受一定的工作压力，拥有良好的心态。",
  };
}

export function formHtml(state) {
  const b = state.basic, e = state.edu;

  const basic = BASIC_PAIRS.map(
    ([p1, p2]) =>
      `<div class="grid2">${input("basic." + p1[0], p1[1], b[p1[0]])}${input("basic." + p2[0], p2[1], b[p2[0]])}</div>`
  ).join("") + `<div class="grid1" style="margin-top:10px">${BASIC_FULL.map(([k, l]) => input("basic." + k, l, b[k])).join("")}</div>`;

  const edu =
    `<div class="grid2">${input("edu.school", "毕业院校", e.school)}${input("edu.degree", "最高学历", e.degree)}</div>` +
    `<div class="grid1" style="margin-top:10px">${area("edu.courses", "主修课程", e.courses, 2)}${area("edu.campus", "校园经历", e.campus, 3)}</div>`;

  const work = `
    <div id="workList">
      ${state.work.map((w, i) => `
        <div class="work-item" data-i="${i}">
          <div class="work-item-head">
            <input class="w-title" data-key="work.${i}.title" placeholder="单位名称｜岗位" value="${esc(w.title || "")}" />
            <button class="icon-btn w-del" data-act="work-del" data-i="${i}" title="删除">&times;</button>
          </div>
          <textarea class="w-desc" data-key="work.${i}.desc" placeholder="工作内容与成果">${esc(w.desc || "")}</textarea>
        </div>`).join("")}
    </div>
    <button class="mini-btn" data-act="work-add">+ 添加一段经历</button>`;

  return (
    card("基本信息", basic) +
    card("教育背景", edu) +
    card("工作经历", work, `<span style="font-weight:400;color:var(--muted)">可增删</span>`) +
    card("自我评价", area("self", "自我评价", state.self, 4))
  );
}

export function bindExtra(root, state, api) {
  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "work-del") {
      removeAt(state.work, +btn.dataset.i, () => ({ title: "", desc: "" }));
      api.rerender();
    } else if (act === "work-add") {
      state.work.push({ title: "", desc: "" });
      api.rerender();
    }
  });
}

export { renderPage, buildDocx };
