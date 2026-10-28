import styled from "styled-components";

export type ListView = "timeline" | "cards";

const Switcher = styled.div`
  display: flex;
  gap: 4px;
  width: fit-content;
  margin: 0 0 22px;
  padding: 3px;
  border: 1px solid #8cd3f533;
  border-radius: 7px;
  button {
    min-height: 38px;
    padding: 6px 16px;
    border-radius: 4px;
    color: var(--muted);
    background: transparent;
    font-size: 12px;
  }
  button[aria-pressed="true"] {
    color: var(--ink);
    background: #8cd3f51a;
  }
  button:focus-visible {
    outline: 2px solid #8cd3f5;
    outline-offset: 2px;
  }
`;

export default function ViewSwitcher({
  value,
  onChange,
  label,
}: {
  value: ListView;
  onChange: (value: ListView) => void;
  label: string;
}) {
  return (
    <Switcher role="group" aria-label={label}>
      <button
        type="button"
        aria-pressed={value === "timeline"}
        onClick={() => onChange("timeline")}
      >
        时间轴
      </button>
      <button
        type="button"
        aria-pressed={value === "cards"}
        onClick={() => onChange("cards")}
      >
        卡片
      </button>
    </Switcher>
  );
}
