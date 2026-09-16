/* 表单与渲染的通用小工具 */

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);

export function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

export function setPath(obj, path, value) {
  const ks = path.split(".");
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) {
    if (o[ks[i]] == null) o[ks[i]] = {};
    o = o[ks[i]];
  }
  o[ks[ks.length - 1]] = value;
}

/** 把 [data-key] 元素按路径自动写回 state */
export function bindInputs(root, state, onChange) {
  root.querySelectorAll("[data-key]").forEach((el) => {
    if (el.type === "file") return;
    const ev = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(ev, () => {
      setPath(state, el.dataset.key, el.value);
      if (el.type === "range") {
        const out = el.closest(".field")?.querySelector(".rng-val");
        if (out) out.textContent = el.value;
      }
      onChange();
    });
  });
}

/** 删除数组元素并保持至少一条空记录 */
export function removeAt(arr, i, blank) {
  arr.splice(i, 1);
  if (!arr.length) arr.push(typeof blank === "function" ? blank() : blank);
}

export const card = (title, body, extra = "") =>
  `<div class="card"><div class="card-head">${title}${extra}</div><div class="card-body">${body}</div></div>`;

export const input = (key, label, value, type = "text") =>
  `<div class="field"><label>${esc(label)}</label><input type="${type}" data-key="${key}" value="${esc(value ?? "")}" /></div>`;

export const area = (key, label, value, rows = 3) =>
  `<div class="field"><label>${esc(label)}</label><textarea data-key="${key}" rows="${rows}">${esc(value ?? "")}</textarea></div>`;

export const range = (key, label, value) =>
  `<div class="field"><label>${esc(label)} <b class="rng-val">${Number(value) || 0}</b>%</label>
     <input type="range" min="0" max="100" class="rng" data-key="${key}" value="${Number(value) || 0}" /></div>`;

/** 两字标签补成四字宽（对标表格型 Word 版式） */
export const padLabel = (s) =>
  String(s).length === 2 ? s[0] + "\u3000\u3000" + s[1] : s;
