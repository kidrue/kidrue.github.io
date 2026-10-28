import { css } from "styled-components";

export const layoutStyles = css`
  .container {
    width: min(1200px, calc(100% - 96px));
    margin-inline: auto;
  }
  .brand-dot {
    color: var(--accent);
  }
  svg {
    flex-shrink: 0;
  }
  .skip-link {
    position: fixed;
    top: 10px;
    left: 20px;
    transform: translateY(-150%);
    padding: 12px 20px;
    background: white;
    z-index: 100;
  }
  .skip-link:focus {
    transform: translateY(0);
  }
  .site-header {
    height: 86px;
    background: rgba(249, 252, 254, 0.94);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 30;
    backdrop-filter: blur(14px);
  }
  .header-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 27px;
    font-weight: 800;
    letter-spacing: -1px;
  }
  .brand > .brand-dot {
    margin-left: 1px;
  }
  .brand-symbol {
    display: grid;
    grid-template-columns: repeat(2, 7px);
    gap: 3px;
    margin-right: 13px;
    transform: rotate(-12deg);
  }
  .brand-symbol i {
    width: 7px;
    height: 7px;
    background: var(--accent);
  }
  .brand-symbol i:nth-child(2) {
    opacity: 0.45;
  }
  .brand-symbol i:nth-child(3) {
    opacity: 0.7;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 43px;
  }
  .main-nav {
    display: flex;
    gap: 14px;
  }
  .main-nav a {
    position: relative;
    isolation: isolate;
    min-height: 44px;
    min-width: 82px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-size: 13px;
    font-weight: 550;
    transition: color 0.2s;
  }
  .nav-number {
    font-size: 9px;
    font-weight: 400;
    color: var(--muted);
    align-self: center;
  }
  .main-nav a:before {
    content: "";
    position: absolute;
    inset: 3px 0;
    background: #e5f1f9;
    transform: skew(-12deg);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .main-nav a.active,
  .main-nav a:hover {
    color: var(--accent);
  }
  .main-nav a.active:before,
  .main-nav a:hover:before {
    opacity: 1;
  }
  .header-note {
    border-left: 1px solid var(--border);
    padding-left: 29px;
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .status-dot {
    height: 5px;
    width: 5px;
    border-radius: 50%;
    background: #6c9d89;
    box-shadow: 0 0 0 4px #e8f2ec;
  }
  .menu-toggle {
    display: none;
  }
  .hero {
    position: relative;
    overflow: hidden;
    background-color: #f3f8fc;
    background-image:
      linear-gradient(#7294ac09 1px, transparent 1px),
      linear-gradient(90deg, #7294ac09 1px, transparent 1px);
    background-size: 44px 44px;
    border-bottom: 1px solid var(--border);
  }
  .hero-plane {
    position: absolute;
    inset: 0;
    background: #e6f2fa;
    opacity: 0.6;
    clip-path: polygon(77% 0, 100% 0, 100% 100%, 43% 100%);
    pointer-events: none;
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    align-items: center;
    min-height: 610px;
    position: relative;
    padding-block: 62px 49px;
    gap: 42px;
  }
  .hero-copy {
    padding-bottom: 11px;
  }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--muted);
    font-size: 10px;
    letter-spacing: 2px;
    font-weight: 550;
  }
  .little-diamond {
    width: 6px;
    height: 6px;
    display: inline-block;
    background: var(--cyan);
    transform: rotate(45deg);
    flex-shrink: 0;
  }
  .eyebrow-rule {
    width: 42px;
    height: 1px;
    background: #b7d3e1;
    margin-left: 5px;
  }
  .hero h1 {
    font-size: clamp(44px, 5.05vw, 73px);
    font-weight: 850;
    letter-spacing: -3px;
    line-height: 1.37;
    margin: 26px 0 23px;
  }
  .accent-title {
    color: var(--accent);
    position: relative;
    white-space: nowrap;
  }
  .accent-title:after {
    content: "";
    position: absolute;
    bottom: 3px;
    left: 0;
    width: 100%;
    height: 9px;
    background: #bae8f4;
    opacity: 0.65;
    z-index: -1;
  }
  .title-spark {
    position: absolute;
    top: -13px;
    right: -24px;
    color: #e5bc55;
    font-size: 33px;
    font-weight: 400;
    transform: rotate(13deg);
  }
  .hero-description {
    font-size: 14px;
    line-height: 2.05;
    color: var(--muted);
    margin: 0;
  }
  .hero-description strong {
    font-weight: 650;
    color: #36546b;
  }
  .hello-line {
    display: inline-block;
    width: 22px;
    height: 1px;
    background: #9bbccc;
    vertical-align: middle;
    margin-left: 9px;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 29px;
    margin-top: 29px;
  }
  .primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 39px;
    min-height: 48px;
    padding: 0 23px;
    background: var(--accent);
    border: 1px solid #087cba;
    color: white;
    font-size: 13px;
    border-radius: 3px 3px 16px 3px;
    box-shadow: 4px 4px 0 #cae6f3;
    transition:
      background 0.2s,
      transform 0.2s;
  }
  .primary-button svg {
    transition: transform 0.2s;
  }
  .primary-button:hover {
    background: #096b9e;
    transform: translateY(-2px);
  }
  .primary-button:hover svg {
    transform: translate(2px, -2px);
  }
  .text-button {
    display: flex;
    align-items: center;
    gap: 15px;
    min-height: 48px;
    font-size: 12px;
    color: #47697e;
  }
  .text-button:hover {
    color: var(--accent);
  }
  .hero-bottom-note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    letter-spacing: 0.5px;
    color: var(--muted);
    margin-top: 35px;
  }
  .hero-bottom-note > span {
    height: 3px;
    width: 13px;
    background: #91bfd3;
  }
  .hero-art {
    height: 420px;
    position: relative;
    width: 100%;
    max-width: 500px;
    margin-left: auto;
  }
  .art-coordinate {
    position: absolute;
    right: 33px;
    top: 0;
    font-size: 8px;
    letter-spacing: 1.6px;
    color: var(--muted);
  }
  .avatar-backplane {
    position: absolute;
    width: 327px;
    height: 332px;
    top: 52px;
    left: 79px;
    background: #d0eafa;
    transform: rotate(8deg);
    border: 1px solid #b8d8e9;
    border-radius: 3px 3px 36px 3px;
  }
  .avatar-frame {
    position: absolute;
    width: 326px;
    height: 332px;
    top: 39px;
    left: 61px;
    border: 8px solid #fff;
    border-radius: 4px 4px 38px 4px;
    box-shadow: 0 14px 40px #356e8d10;
    transform: rotate(-5deg);
    overflow: hidden;
  }
  .avatar-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 40%;
  }
  .frame-corner {
    position: absolute;
    bottom: -1px;
    right: -1px;
    border-left: 21px solid transparent;
    border-bottom: 21px solid white;
  }
  .art-cross {
    position: absolute;
    color: #7aa8c0;
    font-size: 23px;
    font-weight: 300;
  }
  .cross-top {
    top: 32px;
    left: 15px;
  }
  .cross-bottom {
    right: 31px;
    bottom: 40px;
  }
  .floating-label {
    position: absolute;
    background: #fff;
    box-shadow: 0 8px 20px #37617d0b;
    border: 1px solid #dce8f1;
    border-radius: 4px 4px 14px 4px;
    display: flex;
    align-items: center;
  }
  .label-hello {
    right: -1px;
    top: 86px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    padding: 14px 17px;
    transform: rotate(4deg);
    gap: 7px;
  }
  .tiny-square {
    width: 6px;
    height: 6px;
    background: #f2d06d;
    margin-right: 3px;
  }
  .label-cursor {
    height: 15px;
    width: 1px;
    background: #97c2d6;
    margin-left: 5px;
  }
  .label-life {
    left: 22px;
    bottom: 31px;
    padding: 17px 19px;
    gap: 13px;
    transform: rotate(-2deg);
  }
  .label-icon {
    width: 34px;
    height: 34px;
    background: #eaf5fc;
    color: var(--accent);
    display: grid;
    place-items: center;
    border-radius: 3px 3px 10px 3px;
  }
  .label-life > div {
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.3px;
  }
  .label-life > div > span {
    display: block;
    font-size: 7px;
    font-weight: 450;
    letter-spacing: 1.7px;
    color: var(--muted);
    margin-top: 6px;
  }
  .label-spark {
    color: #d3b65f;
    margin-left: 7px;
  }
  .art-caption {
    font-size: 7px;
    letter-spacing: 1.6px;
    color: var(--muted);
    position: absolute;
    right: 38px;
    bottom: 7px;
  }
  .hero-foot {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 49px;
    border-top: 1px solid #dce8f1a3;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 1px;
  }
  .hero-foot > a {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    font-size: 8px;
    letter-spacing: 1.5px;
  }
  .hero-foot > a:hover {
    color: var(--accent);
  }
  .articles-section {
    padding-top: 69px;
    padding-bottom: 40px;
    scroll-margin-top: 5px;
  }
  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-bottom: 22px;
    border-bottom: 2px solid #244b63;
    margin-bottom: 28px;
  }
  .section-eyebrow {
    font-size: 9px;
    letter-spacing: 1.8px;
  }
  .section-heading h2 {
    font-size: 29px;
    font-weight: 750;
    letter-spacing: -0.9px;
    margin: 10px 0 0;
  }
  .filters {
    display: flex;
    gap: 7px;
    padding-bottom: 2px;
  }
  .filters button {
    font-size: 12px;
    min-height: 44px;
    min-width: 62px;
    padding: 0 16px;
    background: transparent;
    border-radius: 3px;
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition:
      background 0.2s,
      color 0.2s;
  }
  .filters button.selected {
    background: #e3f0fa;
    color: var(--accent);
    font-weight: 600;
  }
  .filters button:hover {
    background: #e7f0f7;
  }
  .filters button > span {
    font-size: 9px;
  }
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
  .post-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 5px 5px 23px 5px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 3px 4px 0 #dfeaf33b;
    transition:
      transform 0.25s var(--ease),
      border-color 0.25s,
      box-shadow 0.25s;
  }
  .post-card:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: var(--cyan);
    z-index: 1;
  }
  .post-card:hover {
    transform: translateY(-4px);
    border-color: #afd4e7;
    box-shadow: 4px 8px 0 #dfeaf35c;
  }
  .post-card.featured {
    grid-column: span 2;
  }
  .post-content {
    padding: 24px 25px 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .post-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .category-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: var(--accent);
    font-weight: 500;
  }
  .category-label.life {
    color: var(--green);
  }
  .post-marker {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    color: var(--muted);
    white-space: nowrap;
  }
  .post-card h3 {
    font-size: 19px;
    line-height: 1.65;
    letter-spacing: -0.4px;
    margin: 13px 0 9px;
    font-weight: 700;
  }
  .post-title-button {
    padding: 0;
    min-height: 44px;
    text-align: left;
    background: none;
    font: inherit;
    color: inherit;
  }
  .post-title-button:after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
  }
  .post-title-button:focus-visible {
    outline: none;
  }
  .post-card:has(.post-title-button:focus-visible) {
    outline: 3px solid #087cba;
    outline-offset: 4px;
  }
  .post-title-button:hover {
    color: var(--accent);
  }
  .post-description {
    font-size: 12px;
    line-height: 1.95;
    color: var(--muted);
    margin: 0 0 18px;
    flex: 1;
  }
  .post-tags {
    display: flex;
    gap: 13px;
    flex-wrap: wrap;
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
    margin-bottom: 19px;
  }
  .post-footer {
    border-top: 1px solid #eaf0f5;
    padding-top: 13px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 9px;
    color: var(--muted);
    min-height: 38px;
  }
  .post-footer > span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .card-arrow {
    margin-left: auto;
    color: #789bb2;
    transition: transform 0.2s;
  }
  .post-card:hover .card-arrow {
    transform: translate(2px, -2px);
    color: var(--accent);
  }
  .featured h3 {
    font-size: 23px;
    margin-top: 12px;
  }
  .featured .post-description {
    max-width: 95%;
  }
  .code-art {
    height: 223px;
    position: relative;
    overflow: hidden;
    background: #e7f2fa;
    background-image:
      linear-gradient(#9bbfd514 1px, transparent 1px),
      linear-gradient(90deg, #9bbfd514 1px, transparent 1px);
    background-size: 23px 23px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .code-window {
    background: #f9fcff;
    border: 1px solid #ccdfed;
    border-radius: 5px;
    box-shadow: 10px 11px 0 #bddbec4d;
    width: 65%;
    max-width: 440px;
    transform: rotate(-3deg);
    margin-top: -3px;
  }
  .window-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 28px;
    padding: 0 12px;
    border-bottom: 1px solid #e3edf5;
    background: #f0f7fc;
    border-radius: 5px 5px 0 0;
  }
  .window-bar > span {
    width: 5px;
    height: 5px;
    background: #df9e93;
    border-radius: 50%;
  }
  .window-bar > span:nth-child(2) {
    background: #e0c781;
  }
  .window-bar > span:nth-child(3) {
    background: #9bbfa8;
  }
  .window-bar b {
    font-family: ui-monospace, Consolas, monospace;
    font-size: 8px;
    font-weight: 400;
    color: var(--muted);
    margin-left: 24px;
  }
  .window-code {
    font-family: ui-monospace, Consolas, monospace;
    line-height: 1.9;
    padding: 10px 13px 13px;
    font-size: 11px;
    white-space: pre;
    color: #54728a;
  }
  .window-code i {
    font-style: normal;
    display: inline-block;
    width: 26px;
    color: var(--muted);
    font-size: 9px;
  }
  .syntax-muted {
    color: var(--muted);
  }
  .syntax-purple {
    color: #9577b7;
  }
  .syntax-blue {
    color: #418caf;
  }
  .syntax-green {
    color: #477d70;
  }
  .code-cursor {
    display: inline-block;
    height: 11px;
    width: 5px;
    background: #58aacd;
    vertical-align: middle;
    margin-left: 3px;
  }
  .code-orbit {
    position: absolute;
    border: 1px solid #bfd9e9;
    transform: rotate(32deg);
    height: 260px;
    width: 260px;
  }
  .orbit-one {
    right: -95px;
    top: 66px;
  }
  .orbit-two {
    left: -85px;
    top: -155px;
  }
  .code-art-label {
    position: absolute;
    bottom: 14px;
    right: 21px;
    font-size: 7px;
    letter-spacing: 1.7px;
    color: var(--muted);
  }
  .code-art-label > span {
    margin-left: 13px;
  }
  .mountain-art {
    height: 223px;
    position: relative;
    overflow: hidden;
    background: #d5e8e7;
  }
  .mountain-art > svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s var(--ease);
  }
  .post-card:hover .mountain-art > svg {
    transform: scale(1.025);
  }
  .landscape-label {
    position: absolute;
    left: 17px;
    right: 17px;
    bottom: 12px;
    display: flex;
    justify-content: space-between;
    color: #eef6ef;
    font-size: 7px;
    letter-spacing: 1.8px;
    text-shadow: 0 1px 3px #173b34;
  }
  .landscape-label > span {
    font-size: 6px;
    letter-spacing: 1px;
  }
  .articles-end {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding-top: 35px;
    font-size: 10px;
    color: var(--muted);
    line-height: 1.8;
  }
  .end-line {
    height: 1px;
    background: var(--border);
    width: 50px;
    margin: 0 6px;
  }
  .articles-end > svg {
    color: #8daabb;
  }
  .end-dot {
    margin-inline: 9px;
  }
  .about-section {
    padding-top: 13px;
    padding-bottom: 55px;
  }
  .about-card {
    position: relative;
    overflow: hidden;
    border: 1px solid #d5e5f0;
    background: #eaf3fa;
    padding: 35px 38px;
    display: flex;
    align-items: center;
    gap: 26px;
    border-radius: 5px 5px 25px 5px;
  }
  .about-avatar {
    position: relative;
    flex-shrink: 0;
  }
  .about-avatar img {
    width: 74px;
    height: 74px;
    object-fit: cover;
    border: 4px solid white;
    border-radius: 50%;
    display: block;
  }
  .avatar-status {
    width: 13px;
    height: 13px;
    background: #8eac8c;
    border: 3px solid #eaf3fa;
    position: absolute;
    right: 2px;
    bottom: 2px;
    border-radius: 50%;
  }
  .about-copy {
    z-index: 1;
  }
  .about-copy .eyebrow {
    font-size: 8px;
    letter-spacing: 1.7px;
  }
  .about-copy h2 {
    font-size: 23px;
    letter-spacing: -0.6px;
    font-weight: 700;
    margin: 8px 0 10px;
  }
  .about-copy p {
    font-size: 11px;
    color: var(--muted);
    line-height: 2;
    margin: 0;
  }
  .about-side {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    z-index: 1;
    min-width: 120px;
    padding-left: 27px;
    border-left: 1px solid #d4e3ee;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 1px;
  }
  .about-side > span {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .about-decoration {
    font-size: 250px;
    line-height: 1;
    position: absolute;
    right: 63px;
    top: -30px;
    color: #daebf5;
    transform: rotate(13deg);
    font-family: Georgia, serif;
    pointer-events: none;
  }
  .site-footer {
    padding-block: 28px 34px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .site-footer > div {
    display: flex;
    align-items: center;
    gap: 21px;
  }
  .site-footer .brand {
    font-size: 21px;
  }
  .site-footer .brand-symbol {
    grid-template-columns: repeat(2, 5px);
    gap: 2px;
    margin-right: 9px;
  }
  .site-footer .brand-symbol i {
    width: 5px;
    height: 5px;
  }
  .footer-motto {
    font-size: 10px;
    color: var(--muted);
  }
  .footer-right {
    font-size: 9px;
    color: var(--muted);
    gap: 23px !important;
  }
  .footer-plus {
    color: var(--accent);
    margin-inline: 5px;
  }
  .back-to-top {
    position: fixed;
    right: 22px;
    bottom: 25px;
    z-index: 20;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    background: #fff;
    border: 1px solid #d3e5ef;
    border-radius: 3px 3px 13px;
    color: var(--accent);
    box-shadow: 3px 3px 0 #dfeaf3;
  }
  .reading-dialog {
    padding: 0;
    width: min(760px, calc(100% - 36px));
    max-height: 86dvh;
    border: 1px solid #d3e3ef;
    border-radius: 5px 5px 24px 5px;
    box-shadow: 0 25px 100px #17324b26;
    color: var(--ink);
    background: #fff;
    overscroll-behavior: contain;
  }
  .reading-dialog::backdrop {
    background: #17324b66;
    backdrop-filter: blur(5px);
  }
  .reading-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px 10px 28px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: #f6fafd;
    z-index: 1;
  }
  .reading-toolbar > span {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 11px;
    color: var(--muted);
  }
  .reading-toolbar > span .brand-dot {
    margin-left: -9px;
  }
  .reading-toolbar button {
    display: grid;
    place-items: center;
    min-height: 44px;
    min-width: 44px;
    background: transparent;
    border-radius: 4px;
    color: #577a90;
  }
  .reading-toolbar button:hover {
    background: #e4f1f9;
  }
  .reading-body {
    padding: 38px 48px 42px;
  }
  .reading-eyebrow {
    font-size: 11px;
    color: var(--accent);
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .reading-eyebrow span {
    font-size: 9px;
    color: var(--muted);
    border-left: 1px solid var(--border);
    padding-left: 12px;
  }
  .reading-body > h2 {
    font-size: 32px;
    line-height: 1.6;
    letter-spacing: -1px;
    margin: 13px 0;
  }
  .reading-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 17px;
    color: var(--muted);
    font-size: 11px;
  }
  .reading-meta > span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .reading-source a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .reading-intro {
    margin: 27px 0 32px !important;
    padding: 15px 20px;
    border-left: 3px solid #59b4db;
    background: #f0f7fc;
    color: var(--muted) !important;
    font-size: 13px !important;
  }
  .reading-body section h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 29px 0 12px;
  }
  .reading-body p {
    font-size: 14px;
    line-height: 2;
    color: var(--muted);
    margin: 12px 0;
  }
  .reading-body pre {
    overflow: auto;
    background: #eff5f9;
    border: 1px solid #dce8f1;
    border-radius: 4px;
    padding: 20px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--muted);
    tab-size: 2;
  }
  .reading-end {
    margin-top: 35px;
    border-top: 1px solid var(--border);
    padding-top: 23px;
    font-size: 12px;
    color: var(--muted);
  }
  .reading-end > span {
    display: block;
    margin-top: 9px;
    color: var(--accent);
  }
  @media (min-width: 1450px) {
    .hero-inner {
      min-height: 660px;
    }
    .hero h1 {
      font-size: 78px;
    }
    .hero-art {
      transform: scale(1.05);
      transform-origin: center;
    }
    .hero-copy {
      padding-bottom: 17px;
    }
  }
  @media (max-width: 1100px) {
    .container {
      width: calc(100% - 64px);
    }
    .header-right {
      gap: 22px;
    }
    .header-note {
      padding-left: 18px;
      letter-spacing: 0;
    }
    .hero-inner {
      gap: 12px;
      min-height: 570px;
    }
    .hero h1 {
      font-size: 58px;
      letter-spacing: -2px;
    }
    .hero-art {
      height: 385px;
    }
    .avatar-frame {
      width: 278px;
      height: 286px;
      left: 40px;
      top: 48px;
    }
    .avatar-backplane {
      width: 278px;
      height: 286px;
      left: 56px;
      top: 59px;
    }
    .label-hello {
      font-size: 11px;
      padding: 12px;
      top: 77px;
      right: -2px;
    }
    .label-life {
      left: 12px;
      bottom: 26px;
      padding: 13px;
    }
    .art-coordinate {
      right: 12px;
      font-size: 7px;
    }
    .art-caption {
      right: 18px;
      bottom: 0;
      font-size: 6px;
    }
    .cross-top {
      left: 9px;
    }
    .cross-bottom {
      right: 8px;
      bottom: 35px;
    }
    .hero-description {
      font-size: 13px;
    }
    .posts-grid {
      gap: 20px;
    }
    .post-content {
      padding: 20px 20px 16px;
    }
    .post-card h3 {
      font-size: 18px;
    }
    .featured h3 {
      font-size: 22px;
    }
    .about-card {
      padding: 29px;
      gap: 21px;
    }
    .about-side {
      min-width: 110px;
      padding-left: 20px;
    }
    .about-copy h2 {
      font-size: 21px;
    }
    .footer-right {
      gap: 12px !important;
    }
  }
  @media (max-width: 900px) {
    .header-note {
      display: none;
    }
    .hero-inner {
      grid-template-columns: 1.05fr 1fr;
      min-height: 545px;
    }
    .hero h1 {
      font-size: 49px;
    }
    .hero-art {
      height: 350px;
    }
    .avatar-frame {
      width: 239px;
      height: 252px;
      left: 22px;
      top: 43px;
      border-width: 7px;
    }
    .avatar-backplane {
      width: 239px;
      height: 252px;
      left: 38px;
      top: 55px;
    }
    .label-life {
      padding: 12px;
      gap: 9px;
      left: 3px;
      bottom: 14px;
    }
    .label-life > div {
      font-size: 10px;
    }
    .label-life > div > span {
      font-size: 6px;
      letter-spacing: 1.3px;
    }
    .label-icon {
      width: 28px;
      height: 28px;
    }
    .label-spark {
      margin-left: 0;
    }
    .label-hello {
      font-size: 10px;
      right: -4px;
      top: 75px;
    }
    .art-caption {
      font-size: 5px;
      letter-spacing: 1.3px;
      bottom: -10px;
    }
    .art-coordinate {
      font-size: 6px;
      letter-spacing: 1.3px;
      top: 7px;
      right: 5px;
    }
    .cross-top {
      font-size: 18px;
      left: 2px;
      top: 23px;
    }
    .cross-bottom {
      font-size: 18px;
      bottom: 23px;
    }
    .hero-actions {
      gap: 22px;
    }
    .primary-button {
      padding-inline: 18px;
      gap: 26px;
    }
    .hero-bottom-note {
      font-size: 9px;
    }
    .hero-foot {
      font-size: 8px;
    }
    .posts-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .post-card.featured {
      grid-column: span 1;
    }
    .featured h3 {
      font-size: 20px;
    }
    .post-card h3 {
      font-size: 19px;
    }
    .code-art,
    .mountain-art {
      height: 196px;
    }
    .code-window {
      width: 84%;
    }
    .window-code {
      font-size: 9px;
    }
    .window-code i {
      width: 21px;
    }
    .about-side {
      display: none;
    }
    .about-copy p {
      font-size: 11px;
    }
    .footer-motto {
      display: none;
    }
    .articles-section {
      padding-top: 51px;
    }
    .about-section {
      padding-bottom: 36px;
    }
  }
  @media (max-width: 640px) {
    .container {
      width: calc(100% - 40px);
    }
    .site-header {
      height: 70px;
    }
    .brand {
      font-size: 25px;
    }
    .header-right {
      gap: 0;
    }
    .menu-toggle {
      display: grid;
      place-items: center;
      background: none;
      width: 44px;
      height: 44px;
      color: #30566e;
    }
    .main-nav {
      display: none;
      position: absolute;
      top: 69px;
      left: 0;
      right: 0;
      background: #f8fcff;
      border-bottom: 1px solid var(--border);
      padding: 12px 20px;
      box-shadow: 0 9px 16px #17324b0a;
      gap: 10px;
    }
    .main-nav.is-open {
      display: flex;
    }
    .main-nav a {
      flex: 1;
      min-height: 48px;
    }
    .main-nav a:before {
      inset: 0;
    }
    .hero-plane {
      clip-path: polygon(100% 31%, 100% 100%, 0 100%);
    }
    .hero-inner {
      grid-template-columns: 1fr;
      padding-top: 44px;
      padding-bottom: 24px;
      gap: 9px;
    }
    .hero-copy {
      padding: 0 5px;
    }
    .eyebrow {
      font-size: 8px;
      letter-spacing: 1.7px;
      gap: 8px;
    }
    .eyebrow-rule {
      width: 31px;
    }
    .hero h1 {
      font-size: clamp(40px, 11.8vw, 65px);
      letter-spacing: -1.8px;
      line-height: 1.4;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .title-spark {
      font-size: 24px;
      top: -10px;
      right: -19px;
    }
    .hero-description {
      font-size: 12px;
      line-height: 2;
    }
    .hero-actions {
      margin-top: 23px;
      gap: 26px;
    }
    .primary-button {
      min-height: 47px;
      padding-inline: 20px;
      gap: 32px;
      font-size: 12px;
    }
    .text-button {
      font-size: 11px;
    }
    .hero-bottom-note {
      margin-top: 25px;
      font-size: 9px;
    }
    .hero-art {
      width: 330px;
      max-width: 100%;
      height: 324px;
      margin: 17px auto 10px;
    }
    .avatar-frame {
      width: 236px;
      height: 242px;
      left: 34px;
      top: 34px;
    }
    .avatar-backplane {
      width: 236px;
      height: 242px;
      left: 49px;
      top: 44px;
    }
    .label-hello {
      right: 0;
      top: 65px;
      font-size: 10px;
      padding: 12px;
    }
    .label-life {
      bottom: 13px;
      left: 6px;
      padding: 13px 15px;
      gap: 12px;
    }
    .label-life > div {
      font-size: 11px;
    }
    .label-life > div > span {
      font-size: 6px;
    }
    .label-icon {
      width: 30px;
      height: 30px;
    }
    .art-coordinate {
      top: 3px;
      right: 14px;
      font-size: 6px;
    }
    .art-caption {
      bottom: -6px;
      right: 11px;
      font-size: 5px;
    }
    .cross-top {
      left: 0;
      top: 25px;
    }
    .cross-bottom {
      bottom: 24px;
      right: 0;
    }
    .hero-foot {
      min-height: 48px;
      font-size: 7px;
      letter-spacing: 0.4px;
    }
    .hero-foot > a {
      font-size: 6px;
      letter-spacing: 1px;
      gap: 6px;
    }
    .hero-foot > a svg {
      width: 11px;
    }
    .articles-section {
      padding-top: 39px;
      padding-bottom: 29px;
    }
    .section-heading {
      display: block;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .section-heading h2 {
      font-size: 26px;
      margin-top: 10px;
    }
    .section-eyebrow {
      font-size: 8px;
    }
    .filters {
      margin-top: 17px;
      gap: 5px;
    }
    .filters button {
      padding-inline: 16px;
      min-height: 44px;
      font-size: 11px;
    }
    .posts-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .post-card.featured {
      grid-column: auto;
    }
    .post-content {
      padding: 22px 23px 16px;
    }
    .code-art,
    .mountain-art {
      height: 200px;
    }
    .code-window {
      width: 80%;
      max-width: 360px;
    }
    .window-code {
      font-size: 10px;
    }
    .featured h3,
    .post-card h3 {
      font-size: 20px;
      line-height: 1.7;
    }
    .post-description {
      font-size: 12px;
      line-height: 2;
    }
    .post-footer {
      font-size: 9px;
    }
    .post-tags {
      margin-bottom: 17px;
    }
    .post-marker {
      font-size: 9px;
    }
    .articles-end {
      font-size: 8px;
      gap: 6px;
      padding-top: 26px;
    }
    .end-line {
      width: 18px;
      margin: 0 2px;
    }
    .end-dot {
      margin-inline: 5px;
    }
    .articles-end > svg {
      width: 12px;
    }
    .about-section {
      padding-top: 9px;
      padding-bottom: 30px;
    }
    .about-card {
      padding: 25px 23px;
      align-items: flex-start;
      gap: 17px;
      flex-wrap: wrap;
    }
    .about-avatar img {
      width: 55px;
      height: 55px;
      border-width: 3px;
    }
    .about-copy {
      flex-basis: 100%;
    }
    .about-copy h2 {
      font-size: 21px;
      margin-top: 10px;
    }
    .about-copy .eyebrow {
      font-size: 7px;
    }
    .about-copy p {
      font-size: 11px;
      line-height: 2;
    }
    .desktop-break {
      display: none;
    }
    .about-decoration {
      font-size: 190px;
      right: 8px;
      top: -20px;
    }
    .site-footer {
      padding-top: 20px;
      padding-bottom: 25px;
      align-items: flex-start;
    }
    .site-footer .brand {
      font-size: 20px;
    }
    .footer-right {
      flex-direction: column;
      align-items: flex-end !important;
      gap: 6px !important;
      font-size: 8px;
      padding-top: 6px;
    }
    .site-footer > div {
      gap: 0;
    }
    .back-to-top {
      right: 13px;
      bottom: 17px;
    }
    .reading-body {
      padding: 28px 23px 30px;
    }
    .reading-body > h2 {
      font-size: 25px;
    }
    .reading-toolbar {
      padding-left: 23px;
      padding-right: 10px;
    }
    .reading-body p {
      font-size: 13px;
    }
    .reading-body section h3 {
      font-size: 18px;
    }
    .reading-body pre {
      font-size: 11px;
      padding: 15px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
  }
`;
