import * as table from "../templates/table/index.js";
import * as graphic from "../templates/graphic/index.js";
import * as icons from "../templates/icons/index.js";
import * as sidebar from "../templates/sidebar/index.js";

/** 数组顺序即前端选择器的展示顺序 */
export const TEMPLATES = [table, graphic, icons, sidebar];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
