type Props = { kind: "code" | "mountain" };

export default function PostArtwork({ kind }: Props) {
  if (kind === "code") {
    return (
      <div className="code-art" aria-hidden="true">
        <div className="code-orbit orbit-one" />
        <div className="code-orbit orbit-two" />
        <div className="code-window">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <b>my-little-corner.tsx</b>
          </div>
          <div className="window-code">
            <div>
              <i>01</i>
              <span className="syntax-muted">// a little space of my own</span>
            </div>
            <div>
              <i>02</i>
              <span className="syntax-purple">const</span>{" "}
              <span className="syntax-blue">life</span> = {"{"}
            </div>
            <div>
              <i>03</i> curiosity: <span className="syntax-green">true</span>,
            </div>
            <div>
              <i>04</i> stories: [<span className="syntax-green">'code'</span>,{" "}
              <span className="syntax-green">'life'</span>],
            </div>
            <div>
              <i>05</i> keep: <span className="syntax-green">'creating'</span>
            </div>
            <div>
              <i>06</i>
              {"}"}
              <span className="code-cursor" />
            </div>
          </div>
        </div>
        <span className="code-art-label">
          BUILT WITH CURIOSITY <span>↗</span>
        </span>
      </div>
    );
  }
  return (
    <div className="mountain-art" aria-hidden="true">
      <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x2="0" y2="1">
            <stop stopColor="#bedee6" />
            <stop offset="1" stopColor="#e7eee2" />
          </linearGradient>
          <linearGradient id="lake" x2="0" y2="1">
            <stop stopColor="#a7c5c0" />
            <stop offset="1" stopColor="#d4dfd1" />
          </linearGradient>
        </defs>
        <path fill="url(#sky)" d="M0 0h600v300H0z" />
        <circle fill="#fff7d5" opacity=".9" cx="430" cy="69" r="28" />
        <path
          fill="#b7cfd0"
          d="m0 165 100-85 73 70 89-108 111 113 60-57 167 90v112H0z"
        />
        <path fill="#e4eae2" d="m223 91 39-49 53 54-39-18-18 17-14-14z" />
        <path
          fill="#8eb1ad"
          d="m0 190 92-64 78 62 100-62 88 65 108-76 134 83v102H0z"
        />
        <path fill="url(#lake)" d="M0 195q150-20 300 4t300-9v110H0z" />
        <path
          fill="#638d80"
          d="m0 202 93-28 67 25-56 9 70 12L0 239zm600-15-80-22-63 32-61 10 78 6 126-9z"
        />
        <path
          stroke="#eff2de"
          opacity=".7"
          fill="none"
          d="M236 228h98m-60 13h126m-200 18h144m-11 14h90"
        />
        <path
          fill="#385e53"
          d="m0 217 49-42 62 33-26 21 94 71H0zm600-6-37-23-44 38-41 16-65 58h187z"
        />
        <g fill="#254c44">
          <path d="m43 120-27 71h17l-25 45h75l-25-45h15z" />
          <path d="m568 113-24 61h14l-23 40h67l-23-40h14z" />
          <path d="m526 167-17 44h10l-16 28h47l-17-28h10z" />
        </g>
        <path
          fill="#d6d4b6"
          d="m153 300-28-34-41-21 24-17-17-7 38 4-20 15 42 17 61 43z"
        />
        <g fill="#f6f7e8" opacity=".6">
          <circle cx="189" cy="99" r="2" />
          <circle cx="396" cy="49" r="1.5" />
        </g>
      </svg>
      <span className="landscape-label">
        INTO THE GREEN <span>35° / WEEKEND</span>
      </span>
    </div>
  );
}
