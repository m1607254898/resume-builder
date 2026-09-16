import { renderPage, MODULES } from "./preview.js";
import { buildDocx } from "./docx.js";
import { card, input, area } from "../../core/ui.js";
import { listCard, delBtn, layoutCard, bindListAndLayout } from "../../core/form.js";

export const id = "sidebar";
export const name = "色块侧栏";
export const desc = "左侧整条实色侧栏放证书荣誉，右侧白底正文，条理清晰；适合应届生 / 校招";
export const supportsTheme = true;
export const defaultTheme = "blue";
export const docxNote = "Word 版为结构还原，药丸式标题会简化为色块；完整效果请导出 PDF";

const NEWLINE_HINT = `<p class="hint">一行一条，换行即分条项目符号</p>`;

const BLANKS = {
  eduList: () => ({ period: "", school: "", major: "", degree: "", courses: "" }),
  work: () => ({ period: "", company: "", position: "", desc: "" }),
  projects: () => ({ period: "", name: "", desc: "", duty: "" }),
  certs: () => "",
  honors: () => "",
  hobbies: () => "",
};

export const defaultLayout = () => ({
  left: ["cert", "honor", "hobby"],
  right: ["edu", "work", "self"],
});

export function sample() {
  return {
    basic: {
      name: "张明", intention: "示例市 虚拟现实相关岗位",
      politics: "团员", nativePlace: "示例省示例市", phone: "138 0000 0000",
      city: "示例省-示例市", email: "demo@example.com", birth: "2004.03.12",
    },
    eduList: [
      {
        period: "2022.09—2025.06", school: "示例职业技术学院",
        major: "虚拟现实技术应用", degree: "大专",
        courses: "虚拟现实技术原理、Unity 3D 引擎开发、3ds Max 三维建模、C# 程序设计、三维动画制作、数字图像处理",
      },
    ],
    work: [
      {
        period: "2024.07—2024.09", company: "示例电子科技有限公司", position: "生产小组长",
        desc: "负责产线小组人员分工与生产进度跟进，协助开展新人培训与作业规范监督；\n配合主管完成月度产能目标，所在小组连续两个月达成产能指标；\n熟悉产线作业标准与品质管控流程，能独立处理常见异常。",
      },
      {
        period: "2024.01—2024.03", company: "示例电子商务有限公司", position: "网络销售",
        desc: "负责线上客户开发与维护，解答客户咨询并跟进订单成交；\n整理客户需求并沉淀销售话术，客户复购率有所提升。",
      },
      {
        period: "2023.07—2023.09", company: "示例数据服务有限公司", position: "数据标注员",
        desc: "按标注规范完成图像、文本等数据的标注与质检，保证标注准确率；\n熟练使用标注工具并按期交付任务。",
      },
    ],
    projects: [],
    certs: ["大学英语四级证书", "计算机等级二级证书", "熟练使用 Office 办公软件", "普通话二级甲等"],
    honors: ["校级优秀学生称号", "院级技能竞赛二等奖", "校级一等奖学金", "优秀学生干部称号"],
    hobbies: ["篮球", "摄影", "游泳", "户外运动", "音乐"],
    self:
      "具备扎实的虚拟现实技术基础，能独立完成 VR 场景搭建与交互功能开发；\n做事有条理，责任心强，具备较强的抗压能力；\n具备良好的团队协作精神和沟通能力，能快速融入新团队。",
    layout: defaultLayout(),
  };
}

/* ---------- 表单 ---------- */
export function formHtml(state) {
  const b = state.basic || {};

  const basic =
    `<div class="grid2">${input("basic.name", "姓名", b.name)}${input("basic.intention", "求职意向", b.intention)}</div>
     <div class="grid2" style="margin-top:10px">${input("basic.politics", "政治面貌", b.politics)}${input("basic.nativePlace", "籍贯", b.nativePlace)}</div>
     <div class="grid2" style="margin-top:10px">${input("basic.phone", "联系方式", b.phone)}${input("basic.city", "现居地", b.city)}</div>
     <div class="grid2" style="margin-top:10px">${input("basic.email", "邮箱", b.email)}${input("basic.birth", "出生年月", b.birth)}</div>`;

  const edu = listCard("教育背景", "eduList", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`eduList.${i}.period`, "时间段", it.period)}${delBtn("eduList", i)}</div>
      <div class="grid2" style="margin-top:8px">
        ${input(`eduList.${i}.school`, "院校", it.school)}
        ${input(`eduList.${i}.major`, "专业", it.major)}
      </div>
      <div class="grid1" style="margin-top:8px">
        ${input(`eduList.${i}.degree`, "学历", it.degree)}
        ${area(`eduList.${i}.courses`, "主修课程", it.courses, 2)}
      </div>
    </div>`, "+ 添加教育经历");

  const work = listCard("工作经历", "work", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`work.${i}.period`, "时间段", it.period)}${delBtn("work", i)}</div>
      <div class="grid2" style="margin-top:8px">
        ${input(`work.${i}.company`, "单位", it.company)}
        ${input(`work.${i}.position`, "职位", it.position)}
      </div>
      ${area(`work.${i}.desc`, "工作内容", it.desc, 3)}
      ${NEWLINE_HINT}
    </div>`, "+ 添加工作经历");

  const project = listCard("项目经历", "projects", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`projects.${i}.period`, "时间段", it.period)}${delBtn("projects", i)}</div>
      <div style="margin-top:8px">${input(`projects.${i}.name`, "项目名称", it.name)}</div>
      ${area(`projects.${i}.desc`, "项目描述", it.desc, 2)}
      ${area(`projects.${i}.duty`, "职责描述", it.duty, 2)}
      ${NEWLINE_HINT}
    </div>`, "+ 添加项目经历");

  const cert = listCard("技能证书", "certs", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`certs.${i}`, `证书 ${i + 1}`, it)}${delBtn("certs", i)}</div>
    </div>`, "+ 添加证书");

  const honor = listCard("获得荣誉", "honors", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`honors.${i}`, `荣誉 ${i + 1}`, it)}${delBtn("honors", i)}</div>
    </div>`, "+ 添加荣誉");

  const hobby = listCard("兴趣爱好", "hobbies", state, (it, i) => `
    <div class="work-item">
      <div class="work-item-head">${input(`hobbies.${i}`, `词条 ${i + 1}`, it)}${delBtn("hobbies", i)}</div>
    </div>`, "+ 添加词条");

  return (
    card("基本信息", basic) +
    card("自我评价 <span style=\"font-weight:400;color:var(--muted)\">一行一条</span>", area("self", "自我评价", state.self, 5) + NEWLINE_HINT) +
    edu + work + project + cert + honor + hobby +
    layoutCard(state, MODULES)
  );
}

export function bindExtra(root, state, api) {
  bindListAndLayout(root, state, api, { blanks: BLANKS, modules: MODULES });
}

export { renderPage, buildDocx };
