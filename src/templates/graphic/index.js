import { renderPage, MODULES } from "./preview.js";
import { buildDocx } from "./docx.js";
import { card, input, area, range } from "../../core/ui.js";
import { listCard, delBtn, layoutCard, bindListAndLayout } from "../../core/form.js";

export const id = "graphic";
export const name = "双栏彩带";
export const desc = "通栏色带 + 左右分栏 + 技能进度条，简洁现代，通用性最强";
export const supportsTheme = true;
export const defaultTheme = "rose";
export const docxNote = "Word 版为结构还原，不含装饰圆形；完整效果请导出 PDF";

const BLANKS = {
  eduList: () => ({ period: "", school: "", major: "", degree: "" }),
  work: () => ({ period: "", company: "", position: "", desc: "" }),
  projects: () => ({ period: "", name: "", desc: "", duty: "" }),
  skills: () => ({ name: "", level: 60, abbr: "" }),
  hobbies: () => "",
};

export const defaultLayout = () => ({
  left: ["edu", "self", "hobby", "strength"],
  right: ["work", "project", "skill"],
});

export function sample() {
  return {
    basic: {
      name: "张明", birth: "2004.03.12", city: "示例省-示例市",
      phone: "138 0000 0000", email: "demo@example.com",
      intention: "示例市 虚拟现实相关岗位",
    },
    eduList: [
      { period: "2022-2025", school: "示例职业技术学院", major: "虚拟现实技术应用", degree: "大专" },
    ],
    work: [
      { period: "2024.07-2024.09", company: "示例电子科技有限公司", position: "生产小组长", desc: "负责产线小组人员分工与生产进度跟进，协助开展新人培训与作业规范监督，配合主管完成月度产能目标。" },
      { period: "2024.01-2024.03", company: "示例电子商务有限公司", position: "网络销售", desc: "负责线上客户开发与维护，解答客户咨询并跟进订单成交，配合团队完成阶段性销售任务。" },
    ],
    projects: [
      { period: "2024.03-2024.05", name: "虚拟仿真实训系统", desc: "面向校内实训的 VR 教学系统，包含场景漫游、设备拆解与交互考核三个模块。", duty: "负责场景搭建与交互脚本编写，独立完成漫游模块与 UI 交互逻辑。" },
      { period: "2023.10-2023.12", name: "校园导览小程序", desc: "基于三维模型的校园导览应用，支持路线规划与建筑信息展示。", duty: "负责三维模型制作与优化，配合完成前端页面联调。" },
    ],
    skills: [
      { name: "Unity 3D", abbr: "U3", level: 85 },
      { name: "C#", abbr: "C#", level: 72 },
      { name: "3ds Max", abbr: "3D", level: 64 },
      { name: "Blender", abbr: "BL", level: 55 },
    ],
    strengths: ["学习力强", "团队协作", "抗压能力"],
    hobbies: ["篮球", "登山", "摄影", "电影", "音乐"],
    self: "本人对虚拟现实技术充满热情，学习能力强，具备扎实的专业理论基础，能够独立完成简单 VR 场景的搭建与交互功能开发；做事踏实、责任心强，遇到技术难题能主动钻研解决；具备良好的团队协作精神和沟通能力，在小组项目中能与成员高效配合完成任务。",
    layout: defaultLayout(),
  };
}

/* ---------- 表单 ---------- */
export function formHtml(state) {
  const b = state.basic || {};

  const basic =
    `<div class="grid2">${input("basic.name", "姓名", b.name)}${input("basic.birth", "生日", b.birth)}</div>
     <div class="grid2" style="margin-top:10px">${input("basic.city", "所在地", b.city)}${input("basic.phone", "电话", b.phone)}</div>
     <div class="grid1" style="margin-top:10px">
       ${input("basic.email", "邮箱", b.email)}
       ${input("basic.intention", "求职意向", b.intention)}
     </div>`;

  const edu = listCard("教育背景", "eduList", state, (it, i) => `
    <div class="work-item">
      <div class="grid2">
        ${input(`eduList.${i}.period`, "时间段", it.period)}
        ${input(`eduList.${i}.school`, "院校", it.school)}
      </div>
      <div class="grid2" style="margin-top:8px">
        ${input(`eduList.${i}.major`, "专业", it.major)}
        ${input(`eduList.${i}.degree`, "学历", it.degree)}
      </div>
      <div style="position:absolute;right:8px;top:8px">${delBtn("eduList", i)}</div>
    </div>`, "+ 添加教育经历");

  const work = listCard("工作经历", "work", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`work.${i}.period`, "时间段", it.period)}${delBtn("work", i)}</div>
      <div class="grid2" style="margin-top:8px">
        ${input(`work.${i}.company`, "单位", it.company)}
        ${input(`work.${i}.position`, "职位", it.position)}
      </div>
      ${area(`work.${i}.desc`, "工作内容", it.desc, 2)}
    </div>`, "+ 添加工作经历");

  const project = listCard("项目经历", "projects", state, (it, i) => `
    <div class="work-item">
      <div class="grid2">
        ${input(`projects.${i}.period`, "时间段", it.period)}
        ${input(`projects.${i}.name`, "项目名称", it.name)}
      </div>
      <div style="position:absolute;right:8px;top:8px">${delBtn("projects", i)}</div>
      ${area(`projects.${i}.desc`, "项目描述", it.desc, 2)}
      ${area(`projects.${i}.duty`, "职责描述", it.duty, 2)}
    </div>`, "+ 添加项目经历");

  const skill = listCard("技能水平", "skills", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">
        ${input(`skills.${i}.name`, "技能名称", it.name)}
        ${delBtn("skills", i)}
      </div>
      ${range(`skills.${i}.level`, "熟练度", it.level)}
    </div>`, "+ 添加技能");

  const strength = card("优势特长", `<div class="grid1">
      ${[0, 1, 2].map((i) => input(`strengths.${i}`, `第 ${i + 1} 个词`, (state.strengths || [])[i])).join("")}
    </div>`);

  const hobby = listCard("兴趣爱好", "hobbies", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`hobbies.${i}`, `词条 ${i + 1}`, it)}${delBtn("hobbies", i)}</div>
    </div>`, "+ 添加词条");

  return (
    card("基本信息", basic) +
    edu + work + project + skill + strength + hobby +
    card("自我评价", area("self", "自我评价", state.self, 4)) +
    layoutCard(state, MODULES)
  );
}

export function bindExtra(root, state, api) {
  bindListAndLayout(root, state, api, { blanks: BLANKS, modules: MODULES });
}

export { renderPage, buildDocx };
