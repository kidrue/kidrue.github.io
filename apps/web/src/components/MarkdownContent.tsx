import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import styled from "styled-components";

const Content = styled.div`
  color: var(--ink);
  font-size: 15px;
  line-height: 1.95;
  overflow-wrap: anywhere;
  > :first-child {
    margin-top: 0;
  }
  h1,
  h2,
  h3,
  h4 {
    color: var(--ink);
    line-height: 1.5;
    margin: 1.8em 0 0.7em;
  }
  h1 {
    font-size: 30px;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 19px;
  }
  p {
    margin: 0 0 1.1em;
  }
  a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  img,
  video {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 540px;
    margin: 20px auto;
    border-radius: 6px;
  }
  video {
    width: 100%;
    background: #050b14;
  }
  pre {
    white-space: pre;
    overflow-x: auto;
    max-width: 100%;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: #091321;
    line-height: 1.7;
  }
  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 0.88em;
    padding: 2px 5px;
    background: #1c3046;
    border-radius: 3px;
  }
  pre code {
    padding: 0;
    background: transparent;
  }
  blockquote {
    margin: 20px 0;
    padding: 8px 18px;
    border-left: 3px solid var(--accent);
    color: var(--muted);
    background: #182b40;
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }
  ul,
  ol {
    padding-left: 25px;
  }
  hr {
    border: 0;
    border-top: 1px solid var(--border);
    margin: 30px 0;
  }
  table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
  th,
  td {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: #182b40;
  }
`;
export default function MarkdownContent({ body }: { body: string }) {
  return (
    <Content className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={(url) => {
          if (/^(?:javascript|data|blob|vbscript):/i.test(url.trim()))
            return "";
          return defaultUrlTransform(url);
        }}
        components={{
          img: ({ src, alt, title }) =>
            !src ? null : title === "video" ? (
              <video
                src={src}
                controls
                preload="metadata"
                aria-label={alt || "文章视频"}
              >
                你的浏览器无法播放视频。<a href={src}>下载视频</a>
              </video>
            ) : (
              <img src={src} alt={alt ?? ""} title={title} loading="lazy" />
            ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </Content>
  );
}
