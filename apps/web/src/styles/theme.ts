import "styled-components";

export const theme = {
  colors: {
    paper: "#0b1220",
    surface: "#121e30",
    ink: "#e4edf9",
    accent: "#8ed1ff",
    border: "#2a3b53",
    muted: "#a5b6cc",
  },
  fontFamily: '"ChillRoundF", "Microsoft YaHei", system-ui, sans-serif',
  contentWidth: "1200px",
};
type AppTheme = typeof theme;
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
