import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, VerticalAlign, HeightRule, TableLayoutType,
  AlignmentType, ImageRun,
} from "docx";
import { padLabel } from "../../core/ui.js";

const CM = 567;
const PT = 20;
/** docx.js 的 ImageRun.transformation 单位是 96dpi 像素，不是磅 */
const CM2PX = 96 / 2.54;

const SONG = { ascii: "宋体", eastAsia: "宋体", hAnsi: "宋体", cs: "宋体" };
const HEI = { ascii: "黑体", eastAsia: "黑体", hAnsi: "黑体", cs: "黑体" };

const COLS = [2.8, 4.2, 2.3, 4.5, 3.6].map((c) => Math.round(c * CM));
const ROWS_H = [
  0.98, 0.98, 0.98, 0.98, 0.98, 0.98, 0.98,
  0.85, 1.0, 1.25, 2.1,
  0.85, 5.0, 2.1,
].map((c) => Math.round(c * CM));

const BORDER = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const CELL_MARGIN = {
  top: Math.round(0.05 * CM), bottom: Math.round(0.05 * CM),
  left: Math.round(0.1 * CM), right: Math.round(0.1 * CM),
};

function para(runs, { size = 12, bold = false, font = SONG, align = AlignmentType.CENTER, line, before = 0 } = {}) {
  return new Paragraph({
    alignment: align,
    spacing: { before: before * PT, after: 0, line: line ?? Math.round(size * 1.35 * PT), lineRule: "exact" },
    children: runs.map((r) =>
      typeof r === "string"
        ? new TextRun({ text: r, font, size: size * 2, bold })
        : new TextRun({ text: r.t, font: r.font ?? font, size: (r.size ?? size) * 2, bold: r.bold ?? bold })
    ),
  });
}

const label = (t) =>
  new TableCell({
    verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGIN,
    children: [para([padLabel(t)], { bold: true })],
  });

const value = (t, align = AlignmentType.CENTER) =>
  new TableCell({
    verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGIN,
    children: [para([t ? String(t) : " "], { align })],
  });

const spanCell = (children, span) =>
  new TableCell({ verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGIN, columnSpan: span, children });

function sectionRow(text, height) {
  return new TableRow({
    height: { value: height, rule: HeightRule.ATLEAST },
    children: [
      new TableCell({
        verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGIN, columnSpan: 5,
        children: [para([text], { size: 14, bold: true, font: HEI, line: 20 * PT })],
      }),
    ],
  });
}

function photoCell(photo) {
  const kids = [];
  if (photo?.buffer) {
    const maxH = 3.5 * CM2PX;
    const maxW = 3.4 * CM2PX;
    const ratio = (photo.width || 3) / (photo.height || 4);
    let h = maxH, w = maxH * ratio;
    if (w > maxW) { w = maxW; h = maxW / ratio; }
    kids.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            type: photo.type || "jpg",
            data: new Uint8Array(photo.buffer),
            transformation: { width: Math.round(w), height: Math.round(h) },
          }),
        ],
      })
    );
  } else {
    kids.push(para([" "], {}));
  }
  return new TableCell({ verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGIN, rowSpan: 4, children: kids });
}

export function buildDocx(state) {
  const b = state.basic;
  const e = state.edu;
  const pairs = [
    ["姓名", b.name, "性别", b.gender],
    ["身高", b.height, "体重", b.weight],
    ["出生年月", b.birth, "民族", b.nation],
    ["联系电话", b.phone, "电子邮箱", b.email],
    ["婚姻状况", b.marriage, "政治面貌", b.politics],
    ["特长爱好", b.hobby, "健康状况", b.health],
  ];

  const rows = [];
  for (let i = 0; i < pairs.length; i++) {
    const [l1, v1, l2, v2] = pairs[i];
    const kids = [label(l1), value(v1), label(l2)];
    if (i >= 4) kids.push(spanCell([para([v2 || " "], {})], 2));
    else kids.push(value(v2));
    if (i === 0) kids.push(photoCell(state.photo));
    rows.push(new TableRow({ height: { value: ROWS_H[i], rule: HeightRule.ATLEAST }, children: kids }));
  }

  rows.push(new TableRow({
    height: { value: ROWS_H[6], rule: HeightRule.ATLEAST },
    children: [label("联系地址"), spanCell([para([b.address || " "], {})], 4)],
  }));

  rows.push(sectionRow("教育背景", ROWS_H[7]));
  rows.push(new TableRow({
    height: { value: ROWS_H[8], rule: HeightRule.ATLEAST },
    children: [label("毕业院校"), value(e.school), label("最高学历"), spanCell([para([e.degree || " "], {})], 2)],
  }));
  rows.push(new TableRow({
    height: { value: ROWS_H[9], rule: HeightRule.ATLEAST },
    children: [label("主修课程"), spanCell([para([e.courses || " "], { align: AlignmentType.LEFT })], 4)],
  }));
  rows.push(new TableRow({
    height: { value: ROWS_H[10], rule: HeightRule.ATLEAST },
    children: [label("校园经历"), spanCell([para([e.campus || " "], { align: AlignmentType.BOTH })], 4)],
  }));

  rows.push(sectionRow("工作经历", ROWS_H[11]));
  const entries = state.work.filter((w) => w.title || w.desc);
  const workParas = entries.length
    ? entries.map((w, i) =>
        para([{ t: `${w.title}：`, bold: true }, { t: w.desc, bold: false }],
          { align: AlignmentType.BOTH, before: i === 0 ? 0 : 2 })
      )
    : [para([" "], {})];
  rows.push(new TableRow({
    height: { value: ROWS_H[12], rule: HeightRule.ATLEAST },
    children: [label("实践经历"), spanCell(workParas, 4)],
  }));

  rows.push(new TableRow({
    height: { value: ROWS_H[13], rule: HeightRule.ATLEAST },
    children: [label("自我评价"), spanCell([para([state.self || " "], { align: AlignmentType.BOTH })], 4)],
  }));

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: COLS,
    borders: {
      top: BORDER, bottom: BORDER, left: BORDER, right: BORDER,
      insideHorizontal: BORDER, insideVertical: BORDER,
    },
    rows,
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: {
            top: Math.round(1.4 * CM), bottom: Math.round(1.4 * CM),
            left: Math.round(1.8 * CM), right: Math.round(1.8 * CM),
          },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 8 * PT, line: 24 * PT, lineRule: "exact" },
          children: [new TextRun({ text: "个\u3000人\u3000简\u3000历", font: HEI, size: 22 * 2, bold: true })],
        }),
        table,
      ],
    }],
  });

  return Packer.toBlob(doc);
}
