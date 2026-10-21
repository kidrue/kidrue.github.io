import styled from "styled-components";

export const EditorRoot = styled.main`
  min-height: 100svh;
  background: var(--paper);
  color: var(--ink);
  input,
  textarea,
  select {
    font-family: inherit;
  }
  button,
  a,
  input,
  select,
  textarea {
    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }
  }
  input,
  select,
  textarea {
    min-width: 0;
    color: var(--ink);
    background: #0c1726;
    border: 1px solid var(--border);
    border-radius: 5px;
  }
  button {
    cursor: pointer;
  }
  button:disabled {
    cursor: wait;
    opacity: 0.55;
  }
`;
export const Header = styled.header`
  min-height: 82px;
  padding: 15px 32px;
  border-bottom: 1px solid var(--border);
  background: #101c2d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  .identity {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .brand-link {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -1px;
  }
  .brand-link span {
    color: var(--accent);
  }
  .breadcrumb {
    color: var(--muted);
    font-size: 12px;
    border-left: 1px solid var(--border);
    padding-left: 20px;
  }
  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  @media (max-width: 760px) {
    padding: 12px 18px;
    flex-wrap: wrap;
    gap: 10px;
    .identity {
      width: 100%;
      justify-content: space-between;
    }
    .breadcrumb {
      border: 0;
    }
    .actions {
      width: 100%;
      gap: 8px;
    }
    .actions button {
      padding-inline: 12px;
    }
  }
`;
export const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid
    ${({ $primary }) => ($primary ? "#b9d9ef" : "var(--border)")};
  border-radius: 4px 4px 12px 4px;
  font-size: 12px;
  background: ${({ $primary }) => ($primary ? "#c0dff1" : "#17283c")};
  color: ${({ $primary, $danger }) => ($danger ? "#f6afb5" : $primary ? "#112d44" : "var(--ink)")};
  &:hover:not(:disabled) {
    filter: brightness(1.13);
  }
  svg {
    flex-shrink: 0;
  }
`;
export const Layout = styled.div`
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-height: calc(100svh - 82px);
  @media (max-width: 1000px) {
    grid-template-columns: 210px minmax(0, 1fr);
  }
  @media (max-width: 760px) {
    display: block;
  }
`;
export const Sidebar = styled.aside<{ $open: boolean }>`
  background: #0f1a2a;
  border-right: 1px solid var(--border);
  padding: 26px 18px;
  .sidebar-title {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 11px;
    margin-bottom: 18px;
    letter-spacing: 2px;
  }
  input {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    font-size: 12px;
    margin: 16px 0;
  }
  .entry-list {
    display: grid;
    gap: 8px;
  }
  .article-option {
    width: 100%;
    padding: 14px;
    text-align: left;
    color: var(--ink);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    min-height: 76px;
  }
  .article-option:hover,
  .article-option[aria-current="true"] {
    background: #1a2d43;
    border-color: #334d68;
  }
  .article-option strong {
    display: block;
    font-size: 13px;
    line-height: 1.6;
  }
  .article-option small {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    color: var(--muted);
    font-size: 10px;
  }
  .empty-list {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.8;
    padding: 14px 6px;
  }
  @media (max-width: 760px) {
    display: ${({ $open }) => ($open ? "block" : "none")};
    border-right: 0;
    border-bottom: 1px solid var(--border);
    padding: 20px;
  }
`;
export const Workspace = styled.div`
  min-width: 0;
  padding: 30px clamp(18px, 3vw, 46px) 42px;
  .topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;
  }
  .eyebrow {
    font-size: 10px;
    color: var(--accent);
    letter-spacing: 2px;
  }
  .save-state {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.7;
  }
  .error {
    padding: 12px 16px;
    border: 1px solid #77484c;
    background: #36252c;
    color: #ffcad0;
    font-size: 12px;
    line-height: 1.8;
    margin-bottom: 20px;
    border-radius: 5px;
  }
  .title {
    width: 100%;
    font-size: clamp(25px, 3vw, 37px);
    font-weight: 700;
    line-height: 1.5;
    border: 0;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    padding: 8px 0 20px;
    background: transparent;
  }
  .description {
    width: 100%;
    display: block;
    resize: vertical;
    min-height: 70px;
    margin-top: 16px;
    padding: 12px;
    font-size: 13px;
    line-height: 1.8;
  }
  .metadata {
    display: grid;
    grid-template-columns: 130px minmax(150px, 1fr) minmax(160px, 1fr);
    gap: 16px;
    margin: 20px 0 24px;
  }
  label {
    display: block;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.8;
  }
  label > input,
  label > select {
    display: block;
    width: 100%;
    min-height: 44px;
    padding: 10px;
    margin-top: 6px;
    font-size: 12px;
  }
  .cover-control {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
  .cover-control input {
    width: 100%;
    min-height: 44px;
    padding: 10px;
    font-size: 12px;
  }
  .cover-preview {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: 5px;
    margin: 0 0 20px;
  }
  .work-tabs {
    display: none;
  }
  .mobile-list-toggle {
    display: none;
  }
  @media (max-width: 1100px) {
    .metadata {
      grid-template-columns: 110px minmax(0, 1fr);
    }
    .cover-field {
      grid-column: 1/-1;
    }
  }
  @media (max-width: 760px) {
    padding: 20px;
    .topline {
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .mobile-list-toggle {
      display: inline-flex;
    }
    .work-tabs {
      display: flex;
      gap: 8px;
      margin: 12px 0;
    }
    .work-tabs button[aria-selected="true"] {
      background: #254461;
      color: #c8eaff;
    }
    .metadata {
      gap: 12px;
    }
  }
`;
export const WritingGrid = styled.div<{ $tab: "edit" | "preview" }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  .write-pane,
  .preview-pane {
    min-width: 0;
  }
  .pane-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    background: #122035;
    min-height: 44px;
  }
  .write-pane {
    border-right: 1px solid var(--border);
  }
  .toolbar {
    display: flex;
    gap: 3px;
    padding: 8px 10px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border);
    background: #101c2d;
  }
  .toolbar button {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: #c1d3e8;
  }
  .toolbar button:hover {
    background: #233c56;
  }
  textarea {
    width: 100%;
    min-height: 520px;
    display: block;
    resize: vertical;
    border: 0;
    border-radius: 0;
    padding: 20px;
    font-family: Consolas, "ChillRoundF", monospace;
    font-size: 13px;
    line-height: 1.9;
    background: #0d1828;
    outline-offset: -3px;
  }
  .preview-body {
    padding: 22px;
    min-height: 520px;
  }
  .preview-placeholder {
    color: var(--muted);
    font-size: 13px;
    line-height: 2;
    padding-top: 24px;
  }
  .upload-progress {
    padding: 12px 16px;
    background: #1a3047;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .upload-progress progress {
    min-width: 80px;
    flex: 1;
    accent-color: var(--accent);
  }
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    .write-pane {
      border-right: 0;
      border-bottom: 1px solid var(--border);
    }
  }
  @media (max-width: 760px) {
    .toolbar {
      display: grid;
      grid-template-columns: repeat(3, minmax(44px, 1fr));
    }
    .write-pane {
      display: ${({ $tab }) => ($tab === "edit" ? "block" : "none")};
      border-bottom: 0;
    }
    .preview-pane {
      display: ${({ $tab }) => ($tab === "preview" ? "block" : "none")};
    }
    textarea,
    .preview-body {
      min-height: 420px;
    }
    .preview-body {
      padding: 18px;
    }
  }
`;
export const MediaBar = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: #101c2d;
  .media-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  p {
    margin: 5px 0 0;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }
  .media-storage {
    color: var(--ink);
  }
  .media-unconfigured {
    color: #e6c798;
  }
  @media (max-width: 760px) {
    padding: 14px;
    .media-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;
export const Login = styled.div`
  width: min(430px, calc(100% - 40px));
  margin: clamp(55px, 12vh, 130px) auto;
  padding: 36px;
  border: 1px solid var(--border);
  border-radius: 5px 5px 28px 5px;
  background: #121f32;
  box-shadow: 8px 8px 0 #060d1833;
  .login-symbol {
    width: 50px;
    height: 50px;
    display: grid;
    place-items: center;
    border: 1px solid #365a78;
    background: #1c364e;
    border-radius: 7px;
    color: var(--accent);
    margin-bottom: 24px;
  }
  h1 {
    margin: 0 0 10px;
    font-size: 27px;
  }
  p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.9;
    margin: 0 0 24px;
  }
  label {
    font-size: 12px;
    color: var(--muted);
  }
  input {
    display: block;
    width: 100%;
    min-height: 48px;
    padding: 12px 14px;
    margin: 8px 0 20px;
  }
  .hint {
    font-size: 11px;
    line-height: 1.9;
    margin-top: 20px;
    color: var(--muted);
  }
  .login-error {
    font-size: 12px;
    color: #ffc3cd;
    line-height: 1.8;
    margin-bottom: 16px;
  }
`;
