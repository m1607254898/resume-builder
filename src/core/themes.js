/* 可切换的主题色（供图形型模板使用） */

export const THEMES = {
  rose: {
    id: "rose", label: "玫粉",
    main: "#D98F97", light: "#F5D5D8", rule: "#E9C4C8",
    accent: "#A8D545", accentLight: "#E8F2C4", deep: "#993556",
  },
  blue: {
    id: "blue", label: "蓝",
    main: "#4A7FB5", light: "#D8E6F2", rule: "#B9D0E4",
    accent: "#4FB5A8", accentLight: "#D6F0EC", deep: "#1F4E7C",
  },
  green: {
    id: "green", label: "绿",
    main: "#5E9E6E", light: "#D9EBDD", rule: "#B4D8BF",
    accent: "#C9A227", accentLight: "#F3E9C8", deep: "#2F5C3B",
  },
  gray: {
    id: "gray", label: "灰",
    main: "#6E7278", light: "#E3E5E8", rule: "#C6C9CD",
    accent: "#9AA0A6", accentLight: "#EDEEF0", deep: "#3A3D42",
  },
};

export const THEME_LIST = Object.values(THEMES);
export const getTheme = (id) => THEMES[id] || THEMES.rose;
