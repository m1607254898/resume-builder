import { renderPage, MODULES } from "./preview.js";
import { buildDocx } from "./docx.js";
import { card, input, area, esc } from "../../core/ui.js";
import { listCard, delBtn, layoutCard, bindListAndLayout } from "../../core/form.js";

export const id = "icons";
export const name = "缤纷图标";
export const desc = "彩色圆形图标标题 + 时间轴 + 技能徽章，活泼，适合设计/新媒体/技术岗";
export const supportsTheme = true;
export const defaultTheme = "rose";
export const docxNote = "Word 版为结构还原，不含彩色图标；完整效果请导出 PDF";

const BLANKS = {
  work: () => ({ period: "", company: "", position: "", desc: "" }),
  skills: () => ({ abbr: "", name: "", level: 60 }),
  eduList: () => ({ period: "", school: "", major: "", degree: "" }),
  awards: () => ({ period: "", text: "" }),
  hobbies: () => "",
};

export const defaultLayout = () => ({
  left: ["work", "skill"],
  right: ["info", "edu", "award", "hobby"],
});

export function sample() {
  return {
    basic: {
      name: "张明", pinyin: "ZHANG MING", age: "21",
      intention: "示例市 虚拟现实相关岗位",
      phone: "138 0000 0000", email: "demo@example.com",
      city: "示例省-示例市",
    },
    self: "本人对虚拟现实技术充满热情，学习能力强，具备扎实的专业理论基础，能够独立完成简单 VR 场景的搭建与交互功能开发；做事踏实、责任心强，遇到技术难题能主动钻研解决，具备良好的团队协作精神和沟通能力。",
    work: [
      { period: "2024.07-2024.09", company: "示例电子科技有限公司", position: "生产小组长", desc: "负责产线小组人员分工与生产进度跟进，协助开展新人培训与作业规范监督，配合主管完成月度产能目标。熟悉产线作业标准与品质管控流程，所在小组连续两个月达成产能指标。" },
      { period: "2024.01-2024.03", company: "示例电子商务有限公司", position: "网络销售", desc: "负责线上客户开发与维护，解答客户咨询并跟进订单成交，配合团队完成阶段性销售任务。整理客户需求并形成话术沉淀，客户复购率有所提升。" },
      { period: "2023.07-2023.09", company: "示例数据服务有限公司", position: "数据标注员", desc: "按标注规范完成图像、文本等数据的标注与质检，保证标注准确率，熟练使用标注工具并按期交付任务。" },
    ],
    skills: [
      { abbr: "U3", name: "Unity 3D", level: 85 },
      { abbr: "C#", name: "C# 程序设计", level: 72 },
      { abbr: "3D", name: "3ds Max", level: 64 },
      { abbr: "PS", name: "Photoshop", level: 70 },
      { abbr: "BL", name: "Blender", level: 55 },
      { abbr: "PR", name: "Premiere", level: 60 },
      { abbr: "AE", name: "After Effects", level: 50 },
      { abbr: "HC", name: "HTML / CSS", level: 58 },
    ],
    eduList: [
      { period: "2022-2025", school: "示例职业技术学院", major: "虚拟现实技术应用", degree: "大专" },
      { period: "2019-2022", school: "示例市第一中学", major: "理科", degree: "高中" },
    ],
    awards: [
      { period: "2024/06", text: "荣获校级虚拟现实应用设计大赛三等奖" },
      { period: "2024/03", text: "荣获院级三维建模技能竞赛二等奖" },
      { period: "2023/11", text: "荣获校级优秀学生干部称号" },
    ],
    hobbies: ["篮球", "摄影", "电影", "跑步", "音乐", "写作"],
    layout: defaultLayout(),
  };
}

/* ---------- 表单 ---------- */
export function formHtml(state) {
  const b = state.basic || {};

  const basic =
    `<div class="grid2">${input("basic.name", "姓名", b.name)}${input("basic.pinyin", "拼音 / 英文名", b.pinyin)}</div>
     <div class="grid2" style="margin-top:10px">${input("basic.age", "年龄", b.age)}${input("basic.city", "所在地", b.city)}</div>
     <div class="grid1" style="margin-top:10px">
       ${input("basic.intention", "求职意向", b.intention)}
       ${input("basic.phone", "电话", b.phone)}
       ${input("basic.email", "邮箱", b.email)}
     </div>`;

  const work = listCard("工作经验", "work", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`work.${i}.period`, "时间段", it.period)}${delBtn("work", i)}</div>
      <div class="grid2" style="margin-top:8px">
        ${input(`work.${i}.company`, "公司", it.company)}
        ${input(`work.${i}.position`, "职位", it.position)}
      </div>
      ${area(`work.${i}.desc`, "工作内容", it.desc, 3)}
    </div>`, "+ 添加工作经历");

  const skill = listCard("掌握技能", "skills", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">
        ${input(`skills.${i}.abbr`, "徽章缩写", it.abbr)}
        ${input(`skills.${i}.name`, "技能全称", it.name)}
        ${delBtn("skills", i)}
      </div>
    </div>`, "+ 添加技能");

  const edu = listCard("教育背景", "eduList", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`eduList.${i}.period`, "时间段", it.period)}${delBtn("eduList", i)}</div>
      <div class="grid2" style="margin-top:8px">
        ${input(`eduList.${i}.school`, "院校", it.school)}
        ${input(`eduList.${i}.major`, "专业", it.major)}
      </div>
      <div class="grid1" style="margin-top:8px">${input(`eduList.${i}.degree`, "学历", it.degree)}</div>
    </div>`, "+ 添加教育经历");

  const award = listCard("奖项荣誉", "awards", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`awards.${i}.period`, "时间", it.period)}${delBtn("awards", i)}</div>
      <div style="margin-top:8px">${input(`awards.${i}.text`, "奖项内容", it.text)}</div>
    </div>`, "+ 添加奖项");

  const hobby = listCard("兴趣爱好", "hobbies", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`hobbies.${i}`, `词条 ${i + 1}`, it)}${delBtn("hobbies", i)}</div>
    </div>`, "+ 添加词条");

  const info = card(
    "个人信息栏目 <span style=\"font-weight:400;color:var(--muted)\">取自上方姓名/年龄/电话/邮箱/所在地</span>",
    `<p class="hint">这一栏由右栏的「个人信息」标题控制，若被删掉则不显示。</p>`
  );

  return (
    card("基本信息", basic) +
    card("自我评价 <span style=\"font-weight:400;color:var(--muted)\">显示在姓名下方</span>", area("self", "自我评价", state.self, 3)) +
    work + skill + edu + award + hobby + info +
    layoutCard(state, MODULES)
  );
}

export function bindExtra(root, state, api) {
  bindListAndLayout(root, state, api, { blanks: BLANKS, modules: MODULES });
}

export { renderPage, buildDocx };
