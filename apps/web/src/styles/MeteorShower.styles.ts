import styled, { keyframes } from "styled-components";
export const meteorFall = keyframes`0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(-45deg);
  }
3% {
    opacity: 0.85;
  }
17% {
    opacity: 0.65;
  }
24%,
  100% {
    opacity: 0;
    transform: translate3d(
        calc(-1 * var(--meteor-distance)),
        var(--meteor-distance),
        0
      )
      rotate(-45deg);
  }`;
export const MeteorLayer = styled.div`
  & {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    /* 中央减弱光轨，留出头像与名言的阅读区域。 */
    mask-image: radial-gradient(
      ellipse at 50% 52%,
      #0006 0%,
      #000b 36%,
      #000 72%
    );
  }
  .entry-meteor {
    --meteor-distance: 85vmax;
    position: absolute;
    top: var(--meteor-y);
    left: var(--meteor-x);
    width: var(--meteor-length);
    height: 1px;
    opacity: 0;
    transform: rotate(-45deg);
    transform-origin: left center;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      #e8f7ff,
      #9bd6f7b3 12%,
      #83b6ed40 45%,
      transparent
    );
    animation: ${meteorFall} var(--meteor-duration) linear var(--meteor-delay)
      infinite;
  }
  .entry-meteor::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #eefaff;
    box-shadow: 0 0 7px 2px #b0dcff80;
  }
  .entry-meteor:nth-child(3n) {
    height: 1.5px;
    background: linear-gradient(
      90deg,
      #f7efff,
      #c9bbf5a6 12%,
      #a4b3e636 45%,
      transparent
    );
  }
  @media (max-width: 640px) {
    .entry-meteor {
      width: calc(var(--meteor-length) * 0.65);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    & {
      display: none;
    }
    .entry-meteor {
      animation: none;
    }
  }
`;
