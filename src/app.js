import "./style.css";
import { TEMPLATES, getTemplate } from "./core/registry.js";
import { THEME_LIST } from "./core/themes.js";
import { bindInputs, card, esc } from "./core/ui.js";

const KEY = "resume-builder-state-v3";
const $ = (s) => document.querySelector(s);

let state = load();

/* ---------------- 持久化 ---------------- */

function fillMissing(target, src) {
  for (const k of Object.keys(src || {})) {
    const v = src[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      target[k] = target[k] || {};
      fillMissing(target[k], v);
    } else if (
      target[k] === undefined || target[k] === null ||
      (Array.isArray(target[k]) && !target[k].length)
    ) {
      target[k] = v;
    }
  }
  return target;
}

function newState(templateId) {
  const tpl = getTemplate(templateId);
  const s = { template: templateId, theme: tpl.defaultTheme || "rose", photo: null };
  fillMissing(s, tpl.sample());
  return s;
}

function load() {
  let s = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) s = JSON.parse(raw);
  } catch (e) { /* ignore */ }
  if (!s || typeof s !== "object") s = {};

  // 支持 ?tpl=graphic&theme=blue 快速定位到某个模板（也方便分享/自测）
  const q = new URLSearchParams(location.search);
  const tpl = q.get("tpl");
  if (tpl && TEMPLATES.some((t) => t.id === tpl)) s.template = tpl;
  if (!TEMPLATES.some((t) => t.id === s.template)) s.template = "table";

  // 关键：先确定模板，再补齐该模板需要的字段与示例数据
  fillMissing(s, newState(s.template));

  const th = q.get("theme");
  if (th && THEME_LIST.some((t) => t.id === th)) {
    s.theme = th;
    s.themeExplicit = true;
  }
  if (!s.theme) s.theme = getTemplate(s.template).defaultTheme || "rose";
  s.photo = s.photo || null;
  return s;
}

function save() {
  const { photo, ...rest } = state;
  localStorage.setItem(KEY, JSON.stringify(rest));
}

/* ---------------- 渲染 ---------------- */

const api = { rerender: renderAll, refresh };

function renderAll() {
  const tpl = getTemplate(state.template);

  $("#tplBar").innerHTML = TEMPLATES.map(
    (t) => `<button class="chip tpl ${t.id === state.template ? "on" : ""}" data-tpl="${t.id}">${esc(t.name)}</button>`
  ).join("");

  $("#themeRow").style.display = tpl.supportsTheme ? "" : "none";
  $("#themeRow").innerHTML = THEME_LIST.map(
    (t) => `<button class="theme ${t.id === state.theme ? "on" : ""}" data-theme="${t.id}">
              <i style="background:${t.main}"></i>${esc(t.label)}</button>`
  ).join("");

  $("#tplDesc").textContent = tpl.desc;
  $("#docxNote").style.display = tpl.docxNote ? "" : "none";
  $("#docxNote").textContent = tpl.docxNote || "";

  buildForm();
  refresh();
}

function buildForm() {
  const tpl = getTemplate(state.template);
  const pane = $("#formPane");
  pane.innerHTML = photoCard() + tpl.formHtml(state);
  bindInputs(pane, state, refresh);
  tpl.bindExtra?.(pane, state, api);
}

function photoCard() {
  return card(
    "照片",
    `<div class="photo-row">
      <div class="photo-box" id="photoBox">
        ${state.photo ? `<img src="${state.photo.dataUrl}" alt="照片" />` : `<span>未上传</span>`}
      </div>
      <div class="photo-actions">
        <input type="file" id="photoInput" accept="image/*" style="display:none" />
        <button class="btn" id="btnPhoto">选择照片</button>
        <button class="btn" id="btnPhotoDel">移除</button>
        <p class="hint">建议竖版 3:4，JPG / PNG</p>
      </div>
    </div>`
  );
}

function refresh() {
  const tpl = getTemplate(state.template);
  const page = $("#page");
  page.className = "page tpl-" + tpl.id;
  page.innerHTML = tpl.renderPage(state);
  syncPrintRoot();
  fitScale();
  checkOverflow();
  save();
}

function syncPrintRoot() {
  const out = $("#printRoot");
  const src = $("#page");
  if (out && src) out.innerHTML = `<div class="page ${src.className.replace("page", "").trim()}">${src.innerHTML}</div>`;
}

let pageScale = 1;

function fitScale() {
  const pane = $("#previewPane");
  const scaler = $("#pageScaler");
  const pageW = (210 / 25.4) * 96;
  const pageH = (297 / 25.4) * 96;
  const s = Math.min(1, (pane.clientWidth - 40) / pageW);
  pageScale = s;
  scaler.style.transform = `scale(${s})`;
  scaler.style.width = pageW + "px";
  scaler.style.height = pageH * s + "px";
}

/** 内容超过一页时给出提示（导出会变成 2 页） */
function checkOverflow() {
  const el = $("#page");
  const warn = $("#overflowWarn");
  if (!el || !warn) return;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const limit = rect.bottom - parseFloat(cs.paddingBottom) * pageScale;
  let bottom = rect.top + parseFloat(cs.paddingTop) * pageScale;
  for (const child of el.children) {
    const b = child.getBoundingClientRect().bottom;
    if (b > bottom) bottom = b;
  }
  warn.classList.toggle("show", bottom > limit + 1);
}

/* ---------------- 照片 ---------------- */

async function setPhoto(file) {
  const buf = await file.arrayBuffer();
  const dims = await imageSize(buf, file.type);
  state.photo = {
    dataUrl: URL.createObjectURL(file),
    buffer: buf,
    width: dims.w,
    height: dims.h,
    type: file.type.includes("png") ? "png" : "jpg",
  };
  buildForm();
  refresh();
}

function imageSize(buf, mime) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([buf], { type: mime }));
    const img = new Image();
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ w: 600, h: 800 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/* ---------------- 下载 ---------------- */

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

const safeName = () => (state.basic?.name || "简历").replace(/[\\/:*?"<>|]/g, "");

$("#btnDocx").addEventListener("click", async () => {
  const btn = $("#btnDocx");
  btn.disabled = true;
  btn.textContent = "生成中…";
  try {
    const blob = await getTemplate(state.template).buildDocx(state);
    download(blob, `${safeName()}-${getTemplate(state.template).name}简历.docx`);
    toast("Word 简历已生成");
  } catch (err) {
    console.error(err);
    toast("生成失败：" + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "下载 Word";
  }
});

$("#btnPdf").addEventListener("click", () => {
  syncPrintRoot();
  toast("打印面板里选「存储为 PDF」；若颜色缺失，请勾选「更多设置 → 背景图形」");
  setTimeout(() => window.print(), 350);
});

$("#btnSample").addEventListener("click", () => {
  const keepPhoto = state.photo;
  const keepTpl = state.template;
  const keepTheme = state.theme;
  state = newState(keepTpl);
  state.theme = keepTheme;
  state.photo = keepPhoto;
  renderAll();
  toast("已载入示例数据");
});

$("#btnClear").addEventListener("click", () => {
  const keep = { photo: state.photo, template: state.template, theme: state.theme };
  const tpl = getTemplate(state.template);
  state = {
    template: keep.template, theme: keep.theme, photo: keep.photo,
    basic: { name: "" }, edu: {}, eduList: [tpl.id === "graphic" ? { period: "", school: "", major: "", degree: "" } : {}].flat(),
    work: [{}], projects: [{}], skills: [{}], strengths: ["", "", ""], hobbies: [""],
    self: "", layout: tpl.id === "graphic" ? { left: ["edu"], right: ["work"] } : null,
  };
  renderAll();
  toast("已清空");
});

/* 顶栏：模板 / 主题 */
$("#tplBar").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-tpl]");
  if (!b || b.dataset.tpl === state.template) return;
  const keepPhoto = state.photo;
  fillMissing(state, newState(b.dataset.tpl));
  state.template = b.dataset.tpl;
  state.photo = keepPhoto;
  // 用户没主动选过主题时，跟随新模板的推荐色
  if (!state.themeExplicit) state.theme = getTemplate(b.dataset.tpl).defaultTheme || "rose";
  renderAll();
});

$("#themeRow").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-theme]");
  if (!b) return;
  state.theme = b.dataset.theme;
  state.themeExplicit = true;
  renderAll();
});

/* 表单区：照片按钮 */
$("#formPane").addEventListener("click", (ev) => {
  if (ev.target.id === "btnPhoto") $("#photoInput").click();
  else if (ev.target.id === "btnPhotoDel") {
    state.photo = null;
    buildForm();
    refresh();
  }
});
$("#formPane").addEventListener("change", (ev) => {
  if (ev.target.id === "photoInput" && ev.target.files?.[0]) setPhoto(ev.target.files[0]);
});

window.addEventListener("beforeprint", syncPrintRoot);
window.addEventListener("resize", fitScale);

/* ---------------- 启动 ---------------- */
renderAll();
