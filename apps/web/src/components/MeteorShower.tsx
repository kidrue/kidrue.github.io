import type { CSSProperties } from "react";
import { MeteorLayer } from "../styles/MeteorShower.styles";

const meteors = [
  { x: 95, y: -10, length: 240, duration: 12, delay: -0.8 },
  { x: 65, y: -18, length: 170, duration: 13.5, delay: -3.2 },
  { x: 110, y: 12, length: 210, duration: 11, delay: -5.1 },
  { x: 40, y: -12, length: 140, duration: 14, delay: -7.4 },
  { x: 125, y: 32, length: 180, duration: 12.5, delay: -9.5 },
  { x: 80, y: -22, length: 260, duration: 15, delay: -11.8 },
  { x: 22, y: -8, length: 120, duration: 11.5, delay: -4.6 },
  { x: 104, y: -5, length: 190, duration: 13, delay: -1.9 },
  { x: 118, y: -16, length: 210, duration: 9.6, delay: -1.2 },
  { x: 84, y: 8, length: 150, duration: 8.4, delay: -2.8 },
  { x: 55, y: -20, length: 190, duration: 10.2, delay: -4.3 },
  { x: 102, y: 28, length: 230, duration: 9.2, delay: -6.7 },
  { x: 120, y: 52, length: 170, duration: 11, delay: -8.8 },
  { x: 34, y: -6, length: 130, duration: 8.8, delay: -0.3 },
  { x: 72, y: -15, length: 220, duration: 10.8, delay: -2.1 },
  { x: 112, y: 4, length: 160, duration: 9.8, delay: -4.9 },
  { x: 98, y: 46, length: 200, duration: 8.6, delay: -6.4 },
  { x: 48, y: -16, length: 145, duration: 11.2, delay: -9.9 },
  { x: 128, y: 18, length: 250, duration: 10.4, delay: -1.6 },
  { x: 89, y: -12, length: 180, duration: 9, delay: -3.6 },
];

export default function MeteorShower() {
  return (
    <MeteorLayer className="entry-meteors" aria-hidden="true">
      {meteors.map((meteor, index) => (
        <span
          key={index}
          className="entry-meteor"
          style={
            {
              "--meteor-x": `${meteor.x}%`,
              "--meteor-y": `${meteor.y}%`,
              "--meteor-length": `${meteor.length}px`,
              "--meteor-duration": `${meteor.duration}s`,
              "--meteor-delay": `${meteor.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </MeteorLayer>
  );
}
