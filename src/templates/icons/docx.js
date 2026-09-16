import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  WidthType, BorderStyle, VerticalAlign, AlignmentType, ShadingType, TableLayoutType,
} from "docx";
import { MODULES, modColor } from "./preview.js";

const CM = 567;
const CM2PX = 96 / 2.54;
const SONG = { ascii: "宋体", eastAsia: "宋体", hAnsi: "宋体", cs: "宋体" };
const HEI = { ascii: "黑体", eastAsia: "黑体", hAnsi: "黑体", cs: "黑体" };

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NONE, bottom: NONE, left: NONE, right: NONE,
  insideHorizontal: NONE, insideVertical: NONE,
};
const hex = (c) => String(c).replace("#", "").toUpperCase();

const OUTER = Math.round(19.4 * CM);
const W_L = Math.round(11.2 * CM);
const W_R = Math.round(7.2 * CM);

const T = (text, o = {}) =>
  new Paragraph({
    alignment: o.align,
    spacing: { before: (o.before || 0) * 20, after: (o.after || 0) * 20, line: Math.round((o.size || 9) * 1.6 * 20), lineRule: "exact" },
    children: [
      new TextRun({
        text: String(text ?? " "), font: o.font || SONG, size: (o.size || 9) * 2,
        bold: !!o.bold, color: o.color || "4A4A4A",
      }),
    ],
  });

function cell(children, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: o.valign || VerticalAlign.TOP,
    margins: { top: 0, bottom: 0, left: o.padLeft ?? 0, right: o.padRight ?? 0 },
    shading: o.fill ? { fill: hex(o.fill), type: ShadingType.CLEAR } : undefined,
    children,
  });
}

function secTitle(label, color) {
  return new Paragraph({
    spacing: { before: 8, after: 5, line: 260, lineRule: "exact" },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E3E5E9", space: 1 } },
    children: [
      new TextRun({ text: "\u25CF ", font: HEI, size: 20, bold: true, color: hex(color) }),
      new TextRun({ text: label, font: HEI, size: 21, bold: true, color: "2E3033" }),
    ],
  });
}

/* ---------- 各模块 ---------- */
const abbrOf = (s) =>
  (s.abbr || "").trim() ||
  (s.name || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "·";

function blocks(id, state, color) {
  const b = state.basic || {};
  switch (id) {
    case "info":
      return [
        ["年龄", b.age ? `${b.age} 岁` : ""],
        ["电话", b.phone],
        ["邮箱", b.email],
        ["所在地", b.city],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => T(`${k}：${v}`, { size: 9, after: 1 }));

    case "edu":
      return (state.eduList || []).filter((i) => i.school || i.major).flatMap((i) => [
        T(i.period || "", { size: 8.5, color: "9AA0A6" }),
        T(i.school || "", { size: 10, bold: true, font: HEI, color: hex(color) }),
        T([i.major, i.degree].filter(Boolean).join("　"), { size: 9 }),
        T(" ", { size: 4 }),
      ]);

    case "award":
      return (state.awards || []).filter((a) => a.text).flatMap((a) => [
        new Paragraph({
          spacing: { before: 0, after: 20, line: 260, lineRule: "exact" },
          children: [
            new TextRun({ text: `${a.period || ""}  `, font: SONG, size: 17, color: "9AA0A6" }),
            new TextRun({ text: a.text || "", font: SONG, size: 18, color: "4A4A4A" }),
          ],
        }),
      ]);

    case "hobby": {
      const list = (state.hobbies || []).filter(Boolean);
      if (!list.length) return [];
      return [T(`${list.join("　·　")}`, { size: 9, color: "4A4A4A" })];
    }

    case "work":
      return (state.work || []).filter((w) => w.company || w.desc).flatMap((w) => [
        T(w.period || "", { size: 8.5, color: "9AA0A6" }),
        T(w.company || "", { size: 10, bold: true, font: HEI, color: hex(color) }),
        T(w.desc || "", { size: 9, align: AlignmentType.BOTH }),
        T(" ", { size: 4 }),
      ]);

    case "skill": {
      const list = (state.skills || []).filter((k) => k.name);
      if (!list.length) return [];
      const per = 4;
      const rows = [];
      for (let i = 0; i < list.length; i += per) {
        const chunk = list.slice(i, i + per);
        while (chunk.length < per) chunk.push({ name: "", abbr: "" });
        const w = Math.round((W_L - 200) / per);
        rows.push(
          new TableRow({
            children: chunk.map((k) =>
              cell(
                k.name
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 40, after: 0, line: 240, lineRule: "exact" },
                        children: [new TextRun({ text: abbrOf(k), font: HEI, size: 20, bold: true, color: "5A5E64" })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 40, line: 200, lineRule: "exact" },
                        children: [new TextRun({ text: k.name, font: SONG, size: 15, color: "9AA0A6" })],
                      }),
                    ]
                  : [T(" ", { size: 8 })],
                w,
                { fill: k.name ? "EDEEF1" : "FFFFFF", valign: VerticalAlign.CENTER, padLeft: 20, padRight: 20 }
              )
            ),
          })
        );
      }
      return [
        new Table({
          width: { size: W_L - 200, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          columnWidths: [0, 1, 2, 3].map(() => Math.round((W_L - 200) / per)),
          borders: NO_BORDERS,
          rows,
        }),
        T(" ", { size: 5 }),
      ];
    }
    default:
      return [];
  }
}

function columnBlocks(state, ids, theme) {
  const out = [];
  (ids || []).forEach((id) => {
    if (!MODULES[id]) return;
    const c = modColor(theme, id);
    out.push(secTitle(MODULES[id].label, c));
    out.push(...blocks(id, state, c));
    out.push(T(" ", { size: 4 }));
  });
  return out;
}

export function buildDocx(state) {
  const b = state.basic || {};
  const layout = state.layout || { left: [], right: [] };

  /* 头部：照片 + 姓名 + 拼音 + 求职意向 + 自我评价 */
  const head = [];
  if (state.photo?.buffer) {
    const boxW = 3.6 * CM2PX;
    const ratio = (state.photo.width || 3) / (state.photo.height || 4);
    let w = boxW, h = boxW / ratio;
    if (h > 4.4 * CM2PX) { h = 4.4 * CM2PX; w = h * ratio; }
    head.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 60 },
        children: [
          new ImageRun({
            type: state.photo.type || "jpg",
            data: new Uint8Array(state.photo.buffer),
            transformation: { width: Math.round(w), height: Math.round(h) },
          }),
        ],
      })
    );
  }
  head.push(T(b.name || "", { size: 22, bold: true, font: HEI, color: "2E3033", after: 2 }));
  if (b.pinyin) head.push(T(b.pinyin.toUpperCase(), { size: 8, color: "9AA0A6", after: 3 }));
  head.push(
    new Paragraph({
      spacing: { before: 0, after: 20, line: 260, lineRule: "exact" },
      children: [
        new TextRun({ text: "求职意向：", font: HEI, size: 20, bold: true, color: "2E3033" }),
        new TextRun({ text: b.intention || "", font: SONG, size: 20, color: "2E3033" }),
      ],
    })
  );
  if (state.self) head.push(T(state.self, { size: 9, align: AlignmentType.BOTH, after: 4 }));

  const leftKids = [...head, ...columnBlocks(state, layout.left, state.theme)];
  const rightKids = columnBlocks(state, layout.right, state.theme);

  const grid = new Table({
    width: { size: W_L + W_R, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [W_L, W_R],
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          cell(leftKids, W_L, { padRight: Math.round(0.5 * CM) }),
          cell(rightKids, W_R, { padLeft: Math.round(0.5 * CM) }),
        ],
      }),
    ],
  });

  const frame = new Table({
    width: { size: OUTER, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [OUTER],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: "2E3033" },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "2E3033" },
      left: { style: BorderStyle.SINGLE, size: 12, color: "2E3033" },
      right: { style: BorderStyle.SINGLE, size: 12, color: "2E3033" },
      insideHorizontal: NONE, insideVertical: NONE,
    },
    rows: [new TableRow({ children: [cell([grid], OUTER, { padLeft: 240, padRight: 240, valign: VerticalAlign.TOP })] })],
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: {
            top: Math.round(0.8 * CM), bottom: Math.round(0.8 * CM),
            left: Math.round(0.8 * CM), right: Math.round(0.8 * CM),
          },
        },
      },
      children: [frame],
    }],
  });

  return Packer.toBlob(doc);
}
