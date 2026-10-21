import { css, keyframes } from "styled-components";
export const entryLabelAway = keyframes`to {
    opacity: 0;
    transform: translateY(-4px);
  }`;
export const entryStatusIn = keyframes`0%,
  65% {
    opacity: 0;
    transform: translateY(5px);
  }
85%,
  100% {
    opacity: 1;
    transform: translateY(0);
  }`;
export const entryFoldLeft = keyframes`40% {
    clip-path: polygon(50% 100%, 50% 0, 0 100%);
    border-radius: 0;
  }
100% {
    clip-path: polygon(50% 0, 40% 100%, 0 100%);
    border-radius: 0;
  }`;
export const entryFoldBodyLeft = keyframes`40% {
    background: var(--plane-fold);
    border-radius: 0;
  }
100% {
    clip-path: polygon(50% 0, 50% 88%, 40% 100%);
    background: var(--plane-fold);
    border-radius: 0;
  }`;
export const entryFoldBodyRight = keyframes`40% {
    background: var(--plane-spine);
    border-radius: 0;
  }
100% {
    clip-path: polygon(50% 0, 50% 88%, 60% 100%);
    background: var(--plane-spine);
    border-radius: 0;
  }`;
export const entryFoldRight = keyframes`40% {
    clip-path: polygon(50% 0, 50% 100%, 100% 100%);
    border-radius: 0;
  }
100% {
    clip-path: polygon(50% 0, 60% 100%, 100% 100%);
    border-radius: 0;
  }`;
export const entryPlaneLaunch = keyframes`0%,
  15% {
    transform: translate(0, 0) rotate(0) scale(1);
    opacity: 1;
  }
42% {
    transform: translate(0, 3px) rotate(18deg) scale(0.82);
  }
58% {
    transform: translate(-8px, 14px) rotate(25deg) scale(0.76);
    opacity: 1;
  }
100% {
    transform: translate(155px, -190px) rotate(34deg) scale(0.55);
    opacity: 0;
  }`;
export const entryTrailDraw = keyframes`0%,
  55% {
    stroke-dashoffset: 175;
    opacity: 0;
  }
65% {
    opacity: 0.7;
  }
86% {
    stroke-dashoffset: 0;
    opacity: 0.4;
  }
100% {
    stroke-dashoffset: -175;
    opacity: 0;
  }`;
export const entryButtonStyles = css`
  /* 交互参考 Aaron Iker 的 Paper plane button：
   https://codepen.io/aaroniker/pen/BajabVN
   使用独立的 CSS 折面动画实现，并适配本站配色及页面导航。 */
  .entry-primary {
    --plane-paper: #c0dff1;
    --plane-fold: #8fb9d6;
    --plane-spine: #527d9f;
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 160px;
    height: 48px;
    padding: 0;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #112d44;
    font-size: 13px;
    -webkit-tap-highlight-color: transparent;
  }
  .entry-primary:not(.is-launching):hover {
    --plane-paper: #dfedf8;
  }
  .entry-primary:not(.is-launching):active {
    transform: translateY(1px);
  }
  .entry-button-label {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 25px;
  }
  .entry-button-label > svg {
    transition: transform 180ms ease;
  }
  .entry-primary:not(.is-launching):hover .entry-button-label > svg {
    transform: translate(2px, -2px);
  }
  .entry-launch-status {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: #d9eaff;
    opacity: 0;
    pointer-events: none;
  }
  .entry-plane {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transform-origin: 50% 50%;
    border-radius: 7px;
    background: var(--plane-paper);
    filter: drop-shadow(0 3px 8px #030d2140);
  }
  .entry-fold {
    position: absolute;
    inset: 0;
    border-radius: 7px;
    background: var(--plane-paper);
    opacity: 0;
  }
  .entry-wing-left {
    clip-path: polygon(0 0, 51% 0, 0 100%);
  }
  .entry-body-left {
    clip-path: polygon(50% 0, 51% 100%, 0 100%);
  }
  .entry-body-right {
    clip-path: polygon(49% 0, 49% 100%, 100% 100%);
  }
  .entry-wing-right {
    clip-path: polygon(49% 0, 100% 0, 100% 100%);
  }
  .entry-flight-trail {
    position: absolute;
    width: 200px;
    height: 120px;
    left: 35px;
    bottom: 8px;
    stroke: #b1d9f2;
    stroke-width: 1.25;
    stroke-linecap: round;
    stroke-dasharray: 175;
    stroke-dashoffset: 175;
    opacity: 0;
    pointer-events: none;
  }
  .is-launching .entry-button-label {
    animation: ${entryLabelAway} 150ms ease forwards;
  }
  .is-launching .entry-launch-status {
    animation: ${entryStatusIn} 1200ms ease forwards;
  }
  .is-launching .entry-plane {
    background: transparent;
    animation: ${entryPlaneLaunch} 1200ms ease-in-out forwards;
  }
  .is-launching .entry-fold {
    opacity: 1;
    animation-duration: 500ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-fill-mode: forwards;
  }
  .is-launching .entry-wing-left {
    animation-name: ${entryFoldLeft};
  }
  .is-launching .entry-body-left {
    animation-name: ${entryFoldBodyLeft};
  }
  .is-launching .entry-body-right {
    animation-name: ${entryFoldBodyRight};
  }
  .is-launching .entry-wing-right {
    animation-name: ${entryFoldRight};
  }
  .is-launching .entry-flight-trail {
    animation: ${entryTrailDraw} 1200ms ease forwards;
  }
  @media (max-width: 640px) {
    .entry-primary {
      width: 148px;
      font-size: 12px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .entry-primary .entry-plane,
    .entry-primary .entry-fold,
    .entry-primary .entry-button-label,
    .entry-primary .entry-launch-status,
    .entry-primary .entry-flight-trail {
      animation: none;
    }
  }
`;
