import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  WidthType, BorderStyle, VerticalAlign, AlignmentType, ShadingType, TableLayoutType, HeightRule,
} from "docx";
import { getTheme } from "../../core/themes.js";
import { MODULES } from "./preview.js";

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

const W_LEFT = Math.round(6.4 * CM);
const W_RIGHT = Math.round(13.8 * CM);
const W_TOTAL = W_LEFT + W_RIGHT;

const toBullets = (s) =>
  String(s ?? "").split(/\n+/).map((x) => x.trim()).filter(Boolean);

function cell(children, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: o.valign || VerticalAlign.TOP,
    margins: { top: o.padTop ?? 0, bottom: o.padBottom ?? 0, left: o.padLeft ?? 0, right: o.padRight ?? 0 },
    shading: o.fill ? { fill: hex(o.fill), type: ShadingType.CLEAR } : undefined,
    children,
  });
}

const para = (runs, o = {}) =>
  new Paragraph({
    alignment: o.align,
    indent: o.indent,
    spacing: { before: (o.before || 0) * 20, after: (o.after || 0) * 20, line: Math.round((o.size || 9) * 1.6 * 20), lineRule: "exact" },
    children: runs,
  });

const R = (text, o = {}) =>
  new TextRun({
    text: String(text ?? " "), font: o.font || SONG,
    size: (o.size || 9) * 2, bold: !!o.bold, color: o.color || "444444",
  });

/* ---------- 栏目标题：药丸 + 细线 ---------- */
function pillHeader(label, theme, side) {
  const isBar = side === "left";
  const pillW = isBar ? W_LEFT - Math.round(1.1 * CM) : Math.round(4.6 * CM);
  const restW = isBar ? 0 : Math.round(9.2 * CM) - Math.round(4.6 * CM);

  const pill = cell(
    [
      para([R(`◆  ${label}  ◆`, {
        font: HEI, size: 10, bold: true,
        color: isBar ? hex(theme.main) : "FFFFFF",
      })], { align: AlignmentType.CENTER, before: 2, after: 2, size: 10 }),
    ],
    pillW,
    { fill: isBar ? "FFFFFF" : hex(theme.main), valign: VerticalAlign.CENTER, padLeft: 80, padRight: 80 }
  );

  if (isBar) {
    return new Table({
      width: { size: W_LEFT - Math.round(1.1 * CM), type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      columnWidths: [pillW],
      borders: NO_BORDERS,
      rows: [new TableRow({ children: [pill] })],
    });
  }

  const line = cell(
    [new Paragraph({
      spacing: { before: 0, after: 0, line: 200, lineRule: "exact" },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: hex(theme.rule), space: 3 } },
      children: [R(" ", { size: 4 })],
    })],
    restW,
    { valign: VerticalAlign.CENTER, padLeft: 120 }
  );

  return new Table({
    width: { size: Math.round(9.2 * CM), type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [pillW, restW],
    borders: NO_BORDERS,
    rows: [new TableRow({ children: [pill, line] })],
  });
}

const gap = (size = 6) => para([R(" ", { size })], { size });

/* ---------- 条目行：时间 / 机构 / 专业 / 末列 ---------- */
function entryRow(parts, theme) {
  const widths = parts.length === 4
    ? [1734, 1985, 1734, 1247]
    : [1985, 2835, 1247];
  const total = widths.reduce((a, b) => a + b, 0);

  return new Table({
    width: { size: total, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: parts.map((p, i) =>
          cell(
            [para([R(p, { font: HEI, size: 9.5, bold: true, color: hex(theme.main) })],
              { align: i === parts.length - 1 && parts.length === 3 ? AlignmentType.RIGHT : AlignmentType.LEFT, size: 9.5 })],
            widths[i],
            { padRight: 60 }
          )
        ),
      }),
    ],
  });
}

function bulletLines(list, theme, color = "444444", marker) {
  const mc = marker || hex(theme.main);
  return list.map((t) =>
    para([R("◆  ", { size: 7, color: mc }), R(t, { size: 8.8, color })],
      { size: 8.8, indent: { left: 200, hanging: 200 }, after: 1 })
  );
}

/* ---------- 各栏内容 ---------- */
function blocks(id, state, theme, side) {
  const onBar = side === "left";
  const c = onBar ? "FFFFFF" : "444444";
  const mk = onBar ? "FFFFFF" : undefined; // 侧栏上菱形标记也要白色，否则与底色同色看不见
  switch (id) {
    case "cert":
      return bulletLines((state.certs || []).filter(Boolean), theme, c, mk);
    case "honor":
      return bulletLines((state.honors || []).filter(Boolean), theme, c, mk);
    case "hobby":
      return bulletLines((state.hobbies || []).filter(Boolean), theme, c, mk);

    case "edu":
      return (state.eduList || []).filter((i) => i.school || i.major).flatMap((i) => [
        entryRow([i.period || "", i.school || "", i.major || "", i.degree || ""], theme),
        ...bulletLines(i.courses ? [`主修课程：${i.courses}`] : [], theme),
        gap(),
      ]);

    case "work":
      return (state.work || []).filter((w) => w.company || w.desc).flatMap((w) => [
        entryRow([w.period || "", w.company || "", w.position || ""], theme),
        ...bulletLines(toBullets(w.desc), theme),
        gap(),
      ]);

    case "project":
      return (state.projects || []).filter((p) => p.name || p.desc).flatMap((p) => [
        entryRow([p.period || "", p.name || "", ""], theme),
        ...bulletLines([...toBullets(p.desc), ...toBullets(p.duty)], theme),
        gap(),
      ]);

    case "self":
      return bulletLines(toBullets(state.self), theme);

    default:
      return [];
  }
}

function columnKids(state, ids, theme, side) {
  const out = [];
  (ids || []).forEach((id) => {
    if (!MODULES[id]) return;
    out.push(pillHeader(MODULES[id].label, theme, side));
    out.push(gap(4));
    out.push(...blocks(id, state, theme, side));
    out.push(gap(6));
  });
  return out;
}

export function buildDocx(state) {
  const theme = getTheme(state.theme);
  const b = state.basic || {};
  const layout = state.layout || { left: [], right: [] };

  /* ---- 侧栏 ---- */
  const bar = [];
  if (state.photo?.buffer) {
    const ratio = (state.photo.width || 3) / (state.photo.height || 4);
    let w = 4.2 * CM2PX, h = w / ratio;
    if (h > 5.2 * CM2PX) { h = 5.2 * CM2PX; w = h * ratio; }
    bar.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new ImageRun({
        type: state.photo.type || "jpg",
        data: new Uint8Array(state.photo.buffer),
        transformation: { width: Math.round(w), height: Math.round(h) },
      })],
    }));
  }
  bar.push(para([R(b.name || "", { font: HEI, size: 20, bold: true, color: "FFFFFF" })], { align: AlignmentType.CENTER, after: 2, size: 20 }));
  bar.push(para([R(`求职意向：${b.intention || ""}`, { size: 9, color: "FFFFFF" })], { align: AlignmentType.CENTER, after: 6 }));
  bar.push(...columnKids(state, layout.left, theme, "left"));

  /* ---- 正文 ---- */
  const main = [];
  const infoRows = [
    [["政治面貌", b.politics], ["籍　　贯", b.nativePlace]],
    [["联系方式", b.phone], ["现 居 地", b.city]],
    [["邮　　箱", b.email], ["出生年月", b.birth]],
  ];
  const iw = Math.round(6.6 * CM);
  main.push(new Table({
    width: { size: iw * 2, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [iw, iw],
    borders: NO_BORDERS,
    rows: infoRows.map((pair) =>
      new TableRow({
        children: pair.map(([k, v]) =>
          cell([para([
            R("◆ ", { size: 6, color: hex(theme.main) }),
            R(`${k}：`, { size: 8.8, color: "666666" }),
            R(v || "", { size: 8.8, color: "333333" }),
          ], { size: 8.8, after: 1 })], iw, { padRight: 120 })
        ),
      })
    ),
  }));
  main.push(gap(6));
  main.push(...columnKids(state, layout.right, theme, "right"));

  const layoutTable = new Table({
    width: { size: W_TOTAL, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [W_LEFT, W_RIGHT],
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        height: { value: Math.round(28.7 * CM), rule: HeightRule.ATLEAST },
        children: [
          cell(bar, W_LEFT, { fill: hex(theme.main), padLeft: 220, padRight: 200, padTop: 200 }),
          cell(main, W_RIGHT, { padLeft: 240, padRight: 160, padTop: 200 }),
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
            top: Math.round(0.4 * CM), bottom: Math.round(0.4 * CM),
            left: Math.round(0.4 * CM), right: Math.round(0.4 * CM),
          },
        },
      },
      children: [layoutTable],
    }],
  });

  return Packer.toBlob(doc);
}
