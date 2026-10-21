import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
@font-face {
  font-family: "ChillRoundF";
  src: url("/fonts/chill-round-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "ChillRoundF";
  src: url("/fonts/chill-round-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
:root {
  font-family: "ChillRoundF", "Microsoft YaHei", system-ui, sans-serif;
  color: #17324b;
  background: #f2f7fb;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --paper: #f2f7fb;
  --ink: #17324b;
  --accent: #087cba;
  --cyan: #19b6ed;
  --muted: #526e82;
  --border: #dce8f1;
  --ease: cubic-bezier(0.22, 0.8, 0.25, 1);
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
  scroll-padding-top: 110px;
}
body {
  margin: 0;
}
button,
a {
  -webkit-tap-highlight-color: transparent;
}
button {
  font: inherit;
}
button,
a {
  touch-action: manipulation;
}
a {
  color: inherit;
  text-decoration: none;
}
button {
  color: inherit;
}
button:not(:disabled),
a {
  cursor: pointer;
}
button {
  border: 0;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #087cba;
  outline-offset: 5px;
}
::selection {
  background: #c4eaf8;
  color: #17324b;
}
@media (max-width: 640px) {
  html {
    scroll-padding-top: 90px;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *:before,
  *:after {
    animation: none !important;
    transition: none !important;
  }
}
:root {
  color-scheme: dark;
  --paper: #0b1220;
  --ink: #e4edf9;
  --surface: #121e30;
  --surface-raised: #19283d;
  --accent: #8ed1ff;
  --cyan: #7bc9f3;
  --muted: #a5b6cc;
  --border: #2a3b53;
  --green: #a5cdb7;
  --lavender: #cfb4de;
  color: var(--ink);
  background: var(--paper);
}
::selection {
  color: #f4f9ff;
  background: #315c83;
}
:root { --paper: ${({ theme }) => theme.colors.paper}; --surface: ${({ theme }) => theme.colors.surface}; --ink: ${({ theme }) => theme.colors.ink}; --accent: ${({ theme }) => theme.colors.accent}; --border: ${({ theme }) => theme.colors.border}; --muted: ${({ theme }) => theme.colors.muted}; }
`;
