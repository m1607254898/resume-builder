/* 动态列表（增删）与栏目标题拖拽排布的共用实现 */
import { card, esc, input, removeAt } from "./ui.js";

export const delBtn = (key, i) =>
  `<button class="icon-btn" data-act="del" data-list="${key}" data-i="${i}" title="删除">&times;</button>`;

export function listCard(title, key, state, itemHtml, addLabel) {
  const items = state[key] || [];
  return card(
    `${esc(title)} <span style="font-weight:400;color:var(--muted)">可增删</span>`,
    `<div class="dyn-list" data-list="${key}">
        ${items.map((it, i) => itemHtml(it, i)).join("")}
     </div>
     <button class="mini-btn" data-act="add" data-list="${key}">${esc(addLabel)}</button>`
  );
}

export function layoutCard(state, MODULES) {
  const used = new Set([...(state.layout?.left || []), ...(state.layout?.right || [])]);
  const pool = Object.keys(MODULES).filter((k) => !used.has(k));

  const col = (side, title) => `
    <div class="lay-col">
      <div class="lay-title">${esc(title)}</div>
      <ul class="lay-list" data-side="${side}">
        ${(state.layout?.[side] || [])
          .map(
            (id) => `<li draggable="true" data-id="${id}">
              <span class="grip"></span>${esc(MODULES[id]?.label || id)}
              <button class="icon-btn" data-act="mod-del" data-id="${id}" title="移除">&times;</button>
            </li>`
          )
          .join("") || `<li class="lay-empty">拖到这里</li>`}
      </ul>
    </div>`;

  return card(
    `栏目标题排布 <span style="font-weight:400;color:var(--muted)">可拖动 / 增删</span>`,
    `<div class="lay-wrap">${col("left", "左栏")}${col("right", "右栏")}</div>
     <div class="lay-pool">
       ${
         pool.length
           ? pool
               .map((k) => `<button class="chip" data-act="mod-add" data-id="${k}">+ ${esc(MODULES[k].label)}</button>`)
               .join("")
           : `<span class="hint">所有栏目都已加入</span>`
       }
     </div>`
  );
}

/** 绑定增删按钮 + 拖拽排序；modules 用于决定新模块默认落在哪一栏 */
export function bindListAndLayout(root, state, api, { blanks = {}, modules = {} } = {}) {
  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === "add") {
      const k = btn.dataset.list;
      const blank = blanks[k];
      (state[k] = state[k] || []).push(typeof blank === "function" ? blank() : blank ?? "");
      api.rerender();
    } else if (act === "del") {
      const k = btn.dataset.list;
      removeAt(state[k], +btn.dataset.i, blanks[k] ?? (() => ""));
      api.rerender();
    } else if (act === "mod-del") {
      const id = btn.dataset.id;
      ["left", "right"].forEach((s) => {
        const i = (state.layout?.[s] || []).indexOf(id);
        if (i >= 0) state.layout[s].splice(i, 1);
      });
      api.rerender();
    } else if (act === "mod-add") {
      const id = btn.dataset.id;
      const side = modules[id]?.side || "left";
      state.layout[side] = state.layout[side] || [];
      state.layout[side].push(id);
      api.rerender();
    }
  });

  drag(root, state, api);
}

function drag(root, state, api) {
  let cur = null;

  root.querySelectorAll(".lay-list").forEach((ul) => {
    ul.addEventListener("dragstart", (e) => {
      const li = e.target.closest("li");
      if (!li || !li.dataset.id) return;
      cur = { id: li.dataset.id, from: ul.dataset.side };
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", li.dataset.id);
    });

    ul.addEventListener("dragend", () => {
      root.querySelectorAll("li.dragging").forEach((x) => x.classList.remove("dragging"));
      root.querySelectorAll(".lay-list.over").forEach((x) => x.classList.remove("over"));
    });

    ul.addEventListener("dragover", (e) => {
      e.preventDefault();
      ul.classList.add("over");
    });

    ul.addEventListener("dragleave", (e) => {
      if (!ul.contains(e.relatedTarget)) ul.classList.remove("over");
    });

    ul.addEventListener("drop", (e) => {
      e.preventDefault();
      ul.classList.remove("over");
      if (!cur) return;
      const side = ul.dataset.side;
      const src = state.layout[cur.from].indexOf(cur.id);
      if (src >= 0) state.layout[cur.from].splice(src, 1);

      const items = [...ul.querySelectorAll("li[data-id]")].filter((x) => x.dataset.id !== cur.id);
      let idx = items.length;
      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();
        if (e.clientY < r.top + r.height / 2) { idx = i; break; }
      }
      state.layout[side].splice(idx, 0, cur.id);
      cur = null;
      api.rerender();
    });
  });
}

/** 两列表单行（时间 + 主标题） */
export const pairRow = (a, b) => `<div class="grid2">${input(a[0], a[1], a[2])}${input(b[0], b[1], b[2])}</div>`;
