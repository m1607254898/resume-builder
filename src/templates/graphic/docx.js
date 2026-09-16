import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  WidthType, BorderStyle, VerticalAlign, AlignmentType, ShadingType, TableLayoutType,
} from "docx";
import { getTheme } from "../../core/themes.js";
import { MODULES } from "./preview.js";

const CM = 567;
const PT = 20;
/** docx.js 的 ImageRun.transformation 单位是 96dpi 像素，不是磅 */
const CM2PX = 96 / 2.54;

const SONG = { ascii: "宋体", eastAsia: "宋体", hAnsi: "宋体", cs: "宋体" };
const HEI = { ascii: "黑体", eastAsia: "黑体", hAnsi: "黑体", cs: "黑体" };

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NONE, bottom: NONE, left: NONE, right: NONE,
  insideHorizontal: NONE, insideVertical: NONE,
};

const W_TOTAL = Math.round(17.4 * CM);
const W_COL = Math.round(8.7 * CM);

const hex = (c) => c.replace("#", "").toUpperCase();
const T = (text, { size = 9, bold = false, font = SONG, color = "4A4A4A", align } = {}) =>
  new Paragraph({
    alignment: align,
    spacing: { before: 0, after: 0, line: Math.round(size * 1.55 * PT), lineRule: "exact" },
    children: [new TextRun({ text: String(text ?? ""), font, size: size * 2, bold, color })],
  });

function cell(children, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: opts.valign || VerticalAlign.TOP,
    margins: { top: 0, bottom: 0, left: opts.padLeft ?? 0, right: opts.padRight ?? 0 },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    children,
  });
}

function secTitle(label, theme) {
  return new Paragraph({
    spacing: { before: 8, after: 5, line: 260, lineRule: "exact" },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: hex(theme.rule), space: 1 } },
    children: [
      new TextRun({ text: "\u25A0  ", font: HEI, size: 22, bold: true, color: hex(theme.main) }),
      new TextRun({ text: label, font: HEI, size: 22, bold: true, color: "3A3A3A" }),
    ],
  });
}

/* ---------- 各模块内容 ---------- */

function eduBlocks(s) {
  return (s.eduList || []).filter((i) => i.school || i.major || i.degree).flatMap((i) => [
    new Paragraph({
      spacing: { before: 2, after: 0, line: 260, lineRule: "exact" },
      children: [
        new TextRun({ text: `${i.period || ""}\u3000`, font: SONG, size: 18, color: "8A8A8A" }),
        new TextRun({ text: i.school || "", font: HEI, size: 19, bold: true, color: "3A3A3A" }),
      ],
    }),
    T(`专业：${i.major || ""}`, { size: 9 }),
    T(`学历：${i.degree || ""}`, { size: 9 }),
    T(" ", { size: 5 }),
  ]);
}

function workBlocks(s) {
  return (s.work || []).filter((w) => w.company || w.position || w.desc).flatMap((w) => [
    T(w.period || "", { size: 9, color: "8A8A8A" }),
    new Paragraph({
      spacing: { before: 0, after: 0, line: 280, lineRule: "exact" },
      tabStops: [{ type: "right", position: W_COL - 60 }],
      children: [
        new TextRun({ text: w.company || "", font: HEI, size: 19, bold: true, color: "3A3A3A" }),
        new TextRun({ text: `\t${w.position || ""}`, font: SONG, size: 18, color: "8A8A8A" }),
      ],
    }),
    T(w.desc || "", { size: 9, align: AlignmentType.BOTH }),
    T(" ", { size: 5 }),
  ]);
}

function projectBlocks(s) {
  return (s.projects || []).filter((p) => p.name || p.desc || p.duty).flatMap((p) => [
    new Paragraph({
      spacing: { before: 2, after: 0, line: 260, lineRule: "exact" },
      children: [
        new TextRun({ text: `${p.period || ""}\u3000`, font: SONG, size: 18, color: "8A8A8A" }),
        new TextRun({ text: p.name || "", font: HEI, size: 19, bold: true, color: "3A3A3A" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 0, after: 0, line: 280, lineRule: "exact" },
      children: [
        new TextRun({ text: "项目描述：", font: HEI, size: 18, bold: true, color: "3A3A3A" }),
        new TextRun({ text: p.desc || "", font: SONG, size: 18, color: "4A4A4A" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 0, after: 0, line: 280, lineRule: "exact" },
      children: [
        new TextRun({ text: "职责描述：", font: HEI, size: 18, bold: true, color: "3A3A3A" }),
        new TextRun({ text: p.duty || "", font: SONG, size: 18, color: "4A4A4A" }),
      ],
    }),
    T(" ", { size: 5 }),
  ]);
}

function skillBlocks(s, theme) {
  const BAR = Math.round(5.6 * CM);
  return (s.skills || []).filter((k) => k.name).map((k) => {
    const lv = Math.max(0, Math.min(100, Number(k.level) || 0));
    const w1 = Math.max(20, Math.round((BAR * lv) / 100));
    const w2 = Math.max(20, BAR - w1);
    return new Table({
      width: { size: W_COL, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      columnWidths: [Math.round(2.2 * CM), w1, w2],
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          children: [
            cell([T(k.name, { size: 9 })], Math.round(2.2 * CM), { valign: VerticalAlign.CENTER }),
            cell([T(" ", { size: 6 })], w1, { fill: hex(theme.main) }),
            cell([T(" ", { size: 6 })], w2, { fill: "E8EAED" }),
          ],
        }),
      ],
    });
  });
}

function strengthBlocks(s, theme) {
  const items = (s.strengths || []).filter(Boolean);
  if (!items.length) return [];
  const w = Math.round(W_COL / Math.max(1, items.length));
  return [
    new Table({
      width: { size: W_COL, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      columnWidths: items.map(() => w),
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          children: items.map((t) =>
            cell(
              [new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40, line: 260, lineRule: "exact" },
                children: [new TextRun({ text: t, font: HEI, size: 20, color: hex(theme.deep) })],
              })],
              w,
              { fill: hex(theme.light), valign: VerticalAlign.CENTER, padLeft: 20, padRight: 20 }
            )
          ),
        }),
      ],
    }),
  ];
}

const BLOCKS = {
  edu: (s) => eduBlocks(s),
  self: (s) => [T(s.self || "", { size: 9, align: AlignmentType.BOTH })],
  hobby: (s) => [T((s.hobbies || []).filter(Boolean).join("  /  "), { size: 9 })],
  strength: (s, t) => strengthBlocks(s, t),
  work: (s) => workBlocks(s),
  project: (s) => projectBlocks(s),
  skill: (s, t) => skillBlocks(s, t),
};

function columnBlocks(state, ids, theme) {
  const out = [];
  (ids || []).forEach((id) => {
    if (!MODULES[id]) return;
    out.push(secTitle(MODULES[id].label, theme));
    out.push(...(BLOCKS[id] ? BLOCKS[id](state, theme) : []));
    out.push(T(" ", { size: 4 }));
  });
  return out;
}

export function buildDocx(state) {
  const theme = getTheme(state.theme);
  const b = state.basic || {};
  const layout = state.layout || { left: [], right: [] };

  /* --- 页头：头像 | 姓名 | 联系方式 --- */
  const avatarKids = [];
  if (state.photo?.buffer) {
    // 等比缩放进 3.4 × 4.2 cm 的画框
    const boxW = 3.4 * CM2PX;
    const boxH = 4.2 * CM2PX;
    const ratio = (state.photo.width || 3) / (state.photo.height || 4);
    let w = boxW, h = boxW / ratio;
    if (h > boxH) { h = boxH; w = boxH * ratio; }
    avatarKids.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            type: state.photo.type || "jpg",
            data: new Uint8Array(state.photo.buffer),
            transformation: { width: Math.round(w), height: Math.round(h) },
          }),
        ],
      })
    );
  } else {
    avatarKids.push(T(" ", { size: 9 }));
  }

  const contacts = [["生日", b.birth], ["所在地", b.city], ["电话", b.phone], ["邮箱", b.email]]
    .filter(([, v]) => v);

  const header = new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [Math.round(3.6 * CM), Math.round(6.4 * CM), Math.round(7.4 * CM)],
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          cell(avatarKids, Math.round(3.6 * CM), { valign: VerticalAlign.CENTER }),
          cell(
            [new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 0, after: 0, line: 620, lineRule: "exact" },
              children: [new TextRun({ text: b.name || "", font: SONG, size: 52, bold: true, color: "2E2E2E" })],
            })],
            Math.round(6.4 * CM),
            { valign: VerticalAlign.BOTTOM }
          ),
          cell(
            contacts.map(([k, v]) =>
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0, line: 280, lineRule: "exact" },
                children: [new TextRun({ text: `${k}：${v}`, font: SONG, size: 18, color: "8A8A8A" })],
              })
            ),
            Math.round(7.4 * CM),
            { valign: VerticalAlign.BOTTOM }
          ),
        ],
      }),
    ],
  });

  const band = new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [W_TOTAL],
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        height: { value: Math.round(0.85 * CM), rule: "atLeast" },
        children: [
          cell(
            [new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 20, after: 20, line: 280, lineRule: "exact" },
              children: [new TextRun({ text: `求职意向：${b.intention || ""}`, font: HEI, size: 20, color: "FFFFFF" })],
            })],
            W_TOTAL,
            { fill: hex(theme.main), valign: VerticalAlign.CENTER, padLeft: 200 }
          ),
        ],
      }),
    ],
  });

  const body = new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [W_COL, W_COL],
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          cell(columnBlocks(state, layout.left, theme), W_COL, { padRight: Math.round(0.4 * CM) }),
          cell(columnBlocks(state, layout.right, theme), W_COL, { padLeft: Math.round(0.4 * CM) }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: {
            top: Math.round(1.2 * CM), bottom: Math.round(1.2 * CM),
            left: Math.round(1.4 * CM), right: Math.round(1.4 * CM),
          },
        },
      },
      children: [
        header,
        T(" ", { size: 5 }),
        band,
        T(" ", { size: 5 }),
        body,
      ],
    }],
  });

  return Packer.toBlob(doc);
}
