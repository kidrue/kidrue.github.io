import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bold,
  Code2,
  FilePlus2,
  Heading2,
  ImagePlus,
  Italic,
  List,
  LogOut,
  Menu,
  Quote,
  Save,
  Send,
  Video,
  X,
  PenLine,
  Trash2,
} from "lucide-react";
import {
  articleInputSchema,
  type Article,
  type ArticleInput,
  type EditorSession,
} from "@kidrue/shared";
import MarkdownContent from "../components/MarkdownContent";
import {
  api,
  ApiError,
  getArticles,
  getSession,
  saveArticle,
  uploadFile,
} from "../lib/editor-api";
import {
  Button,
  EditorRoot,
  Header,
  Layout,
  Login,
  MediaBar,
  Sidebar,
  Workspace,
  WritingGrid,
} from "./styles";

const backupKey = "kidrue:editor-backup:v1";
const empty = (): ArticleInput => ({
  title: "",
  description: "",
  category: "技术",
  tags: [],
  body: "",
  coverUrl: "",
  status: "draft",
});
const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "操作失败，请重试";

export default function EditorPage() {
  const [session, setSession] = useState<EditorSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [input, setInput] = useState<ArticleInput>(empty);
  const [tags, setTags] = useState("");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("每个想法，都值得被认真写下。");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const uploadController = useRef<AbortController | null>(null);
  const uploadTarget = useRef<"body" | "cover">("body");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const bodyRef = useRef(input.body);
  const inputRef = useRef(input);
  const loadVersion = useRef(0);
  bodyRef.current = input.body;
  inputRef.current = input;

  function applyInput(value: ArticleInput, article: Article | null) {
    setInput(value);
    setTags(value.tags.join("，"));
    setSelected(article);
    setError("");
    setListOpen(false);
  }
  async function load() {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    try {
      const current = await getSession();
      if (version !== loadVersion.current) return;
      setSession(current);
      if (current.authenticated) {
        const { articles: list } = await getArticles();
        if (version !== loadVersion.current) return;
        setArticles(list);
        try {
          const backup = JSON.parse(localStorage.getItem(backupKey) ?? "null");
          const result = articleInputSchema.safeParse({
            ...backup?.input,
            title: backup?.input?.title || "未命名文章",
          });
          if (
            backup &&
            result.success &&
            typeof backup.input.title === "string"
          ) {
            const original =
              list.find((article) => article.id === backup.id) ?? null;
            applyInput(
              { ...result.data, title: backup.input.title },
              original
                ? {
                    ...original,
                    revision:
                      typeof backup.revision === "number"
                        ? backup.revision
                        : original.revision,
                  }
                : null,
            );
            setDirty(true);
            setStatus("本机已恢复未保存的文字，请保存到服务器。");
          }
        } catch {
          /* 不可用或损坏的本机备份不影响编辑。 */
        }
      }
    } catch (failure) {
      if (version === loadVersion.current) setError(messageOf(failure));
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    return () => {
      ++loadVersion.current;
      uploadController.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    try {
      localStorage.setItem(
        backupKey,
        JSON.stringify({
          id: selected?.id ?? null,
          revision: selected?.revision,
          input,
        }),
      );
    } catch {
      setStatus("本机备份不可用，请及时保存到服务器。");
    }
  }, [input, selected, dirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change<K extends keyof ArticleInput>(
    key: K,
    value: ArticleInput[K],
  ) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setDirty(true);
    setStatus("尚未保存到服务器 · 本机备份中");
  }
  function canSwitch() {
    return (
      !dirty ||
      window.confirm(
        "当前文字尚未保存到服务器，切换后将放弃这份编辑，是否继续？",
      )
    );
  }
  function choose(article: Article | null) {
    if (!canSwitch()) return;
    applyInput(article ?? empty(), article);
    setDirty(false);
    setStatus(
      article
        ? `服务器版本 ${article.revision} · ${article.status === "published" ? "已发布" : "草稿"}`
        : "新的故事，从这里开始。",
    );
    try {
      localStorage.removeItem(backupKey);
    } catch {
      /* 无存储权限。 */
    }
  }
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setPassword("");
      await load();
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  }
  async function save(statusValue: ArticleInput["status"]) {
    setError("");
    const parsed = articleInputSchema.safeParse({
      ...input,
      status: statusValue,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "请检查文章信息");
      return;
    }
    if (statusValue === "published" && !parsed.data.body.trim()) {
      setError("发布前请填写正文。");
      return;
    }
    setBusy(true);
    try {
      const { article } = await saveArticle(parsed.data, selected);
      setArticles((previous) => [
        article,
        ...previous.filter((item) => item.id !== article.id),
      ]);
      if (inputRef.current !== input) {
        setSelected(article);
        setInput((previous) => ({ ...previous, status: article.status }));
        setStatus("提交时的版本已保存 · 后续编辑尚未保存，请再次保存。");
        return;
      }
      applyInput(article, article);
      setDirty(false);
      try {
        localStorage.removeItem(backupKey);
      } catch {
        /* 服务端已保存。 */
      }
      setStatus(
        statusValue === "published"
          ? "已发布，博客中的文章已更新。"
          : "已保存到服务器 · 草稿仅自己可见。",
      );
    } catch (failure) {
      setError(messageOf(failure));
      if (failure instanceof ApiError && failure.status === 401)
        setStatus("登录已过期，当前文字已备份在本机，请刷新后重新登录。");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !selected ||
      !window.confirm(`确定删除《${selected.title}》？这会移除服务器上的文章。`)
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/articles/${selected.id}`, { method: "DELETE" });
      setArticles((previous) =>
        previous.filter((article) => article.id !== selected.id),
      );
      applyInput(empty(), null);
      setDirty(false);
      localStorage.removeItem(backupKey);
      setStatus("文章已删除。");
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  }
  function insert(before: string, after = "") {
    const start = textarea.current?.selectionStart ?? bodyRef.current.length;
    const end = textarea.current?.selectionEnd ?? start;
    const text = bodyRef.current;
    change(
      "body",
      `${text.slice(0, start)}${before}${text.slice(start, end)}${after}${text.slice(end)}`,
    );
    setTab("edit");
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(
        start + before.length,
        end + before.length,
      );
    });
  }
  function openUpload(
    kind: "image" | "video",
    target: "body" | "cover" = "body",
  ) {
    if (!session?.uploads.configured) {
      setError(
        "Imgur 上传尚未配置。请在项目根目录 .env 中设置 IMGUR_CLIENT_ID 后重启服务。",
      );
      return;
    }
    uploadTarget.current = target;
    if (fileInput.current) {
      fileInput.current.accept =
        kind === "image"
          ? "image/jpeg,image/png,image/gif"
          : "video/mp4,video/webm";
      fileInput.current.click();
    }
  }
  async function upload(file: File) {
    const kind = file.type.startsWith("video/") ? "video" : "image";
    if (!session?.uploads.configured) {
      setError("请先在项目根目录 .env 配置 IMGUR_CLIENT_ID 后重启服务。");
      return;
    }
    const limit =
      kind === "image"
        ? session!.uploads.maxImageBytes
        : session!.uploads.maxVideoBytes;
    if (file.size > limit || !file.size) {
      setError(`请选择小于 ${Math.floor(limit / 1024 / 1024)}MB 的有效文件。`);
      return;
    }
    setError("");
    setProgress(0);
    const controller = new AbortController();
    uploadController.current = controller;
    try {
      const result = await uploadFile(file, setProgress, controller.signal);
      if (uploadTarget.current === "cover") change("coverUrl", result.url);
      else {
        const label = result.name.replace(/[\[\]\\\r\n]/g, "_");
        const url = result.url.replaceAll("(", "%28").replaceAll(")", "%29");
        const point =
          textarea.current?.selectionStart ?? bodyRef.current.length;
        const text = bodyRef.current;
        change(
          "body",
          `${text.slice(0, point)}\n\n![${label}](${url}${result.type === "video" ? ' "video"' : ""})\n\n${text.slice(point)}`,
        );
      }
      setStatus("上传完成并已插入，请保存文章。");
    } catch (failure) {
      if (failure instanceof DOMException && failure.name === "AbortError")
        setStatus("上传已取消，文章内容已保留。");
      else setError(messageOf(failure));
    } finally {
      setProgress(null);
      uploadController.current = null;
    }
  }
  const blocked = busy || progress !== null;
  return (
    <EditorRoot>
      <Header>
        <div className="identity">
          <a className="brand-link" href="/blog">
            kidrue<span>.</span>
          </a>
          <h1 className="breadcrumb" style={{ margin: 0, fontWeight: 400 }}>
            写作工作台
          </h1>
        </div>
        <div className="actions">
          <a
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              minHeight: 44,
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            <ArrowLeft size={14} />
            返回博客
          </a>
          {session?.authenticated && (
            <>
              <Button disabled={blocked} onClick={() => void save("draft")}>
                <Save size={15} />
                保存草稿
              </Button>
              <Button
                $primary
                disabled={blocked}
                onClick={() => void save("published")}
              >
                <Send size={15} />
                {busy ? "保存中…" : "发布文章"}
              </Button>
              <Button
                aria-label="退出登录"
                disabled={blocked}
                onClick={async () => {
                  if (!canSwitch()) return;
                  try {
                    await api("/api/admin/logout", { method: "POST" });
                    setSession((previous) =>
                      previous ? { ...previous, authenticated: false } : null,
                    );
                    setDirty(false);
                  } catch (failure) {
                    setError(messageOf(failure));
                  }
                }}
              >
                <LogOut size={15} />
              </Button>
            </>
          )}
        </div>
      </Header>
      {loading ? (
        <Login>
          <h1>正在打开工作台…</h1>
          <p>让每个想法有一个落脚的地方。</p>
        </Login>
      ) : !session?.authenticated ? (
        <Login>
          <div className="login-symbol">
            <PenLine size={24} />
          </div>
          <h1>写下新的故事。</h1>
          <p>登录 kidrue 的写作空间，整理想法，记录日常。</p>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          {!session ? (
            <Button onClick={() => void load()}>重新连接服务</Button>
          ) : (
            <form onSubmit={login}>
              <label htmlFor="editor-password">管理密码</label>
              <input
                id="editor-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Button $primary disabled={busy} type="submit">
                {busy ? "正在登录…" : "进入工作台"}
                <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} />
              </Button>
              {session.development && (
                <div className="hint">
                  本地开发默认密码：<code>kidrue-local</code>
                  <br />
                  如果已配置 ADMIN_PASSWORD，请使用自己的密码。
                </div>
              )}
            </form>
          )}
        </Login>
      ) : (
        <Layout>
          <Sidebar $open={listOpen} aria-label="我的文章">
            <div className="sidebar-title">
              <span>我的文章</span>
              <span>{articles.length.toString().padStart(2, "0")}</span>
            </div>
            <Button
              onClick={() => choose(null)}
              disabled={blocked}
              style={{ width: "100%" }}
            >
              <FilePlus2 size={16} />
              新建文章
            </Button>
            <input
              aria-label="搜索我的文章"
              placeholder="搜索文章…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="entry-list">
              {articles
                .filter((article) =>
                  article.title
                    .toLowerCase()
                    .includes(search.trim().toLowerCase()),
                )
                .map((article) => (
                  <button
                    className="article-option"
                    key={article.id}
                    aria-current={
                      selected?.id === article.id ? "true" : undefined
                    }
                    disabled={blocked}
                    onClick={() => choose(article)}
                  >
                    <strong>{article.title}</strong>
                    <small>
                      <span>
                        {article.status === "published" ? "已发布" : "草稿"}
                      </span>
                      <time>{article.date.replaceAll("-", ".")}</time>
                    </small>
                  </button>
                ))}
              {!articles.length && (
                <p className="empty-list">
                  还没有文章。
                  <br />
                  从一句想说的话开始吧。
                </p>
              )}
            </div>
          </Sidebar>
          <Workspace>
            <div className="topline">
              <div className="eyebrow">WORDS / IDEAS / EVERYDAY</div>
              <div className="save-state" role="status" aria-live="polite">
                {status}
              </div>
              <Button
                className="mobile-list-toggle"
                onClick={() => setListOpen(!listOpen)}
                aria-expanded={listOpen}
              >
                <Menu size={14} />
                我的文章
              </Button>
            </div>
            {error && (
              <div className="error" role="alert">
                {error}{" "}
                <button
                  onClick={() => setError("")}
                  aria-label="关闭提示"
                  style={{
                    background: "transparent",
                    color: "inherit",
                    minHeight: 44,
                    minWidth: 44,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              className="title"
              aria-label="文章标题"
              placeholder="给今天的想法，起个名字…"
              value={input.title}
              maxLength={160}
              onChange={(event) => change("title", event.target.value)}
            />
            <textarea
              className="description"
              aria-label="文章摘要"
              rows={2}
              maxLength={400}
              placeholder="写一小段摘要，让读者知道这篇文章聊些什么。"
              value={input.description}
              onChange={(event) => change("description", event.target.value)}
            />
            <div className="metadata">
              <label>
                分类
                <select
                  aria-label="文章分类"
                  value={input.category}
                  onChange={(event) =>
                    change(
                      "category",
                      event.target.value as ArticleInput["category"],
                    )
                  }
                >
                  <option>技术</option>
                  <option>生活</option>
                </select>
              </label>
              <label>
                标签
                <input
                  aria-label="文章标签"
                  placeholder="前端，日常，随想"
                  value={tags}
                  onChange={(event) => {
                    setTags(event.target.value);
                    change(
                      "tags",
                      event.target.value
                        .split(/[,，]/)
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    );
                  }}
                />
              </label>
              <label className="cover-field">
                封面
                <div className="cover-control">
                  <input
                    aria-label="封面地址"
                    placeholder="图片地址（可选）"
                    value={input.coverUrl}
                    onChange={(event) => change("coverUrl", event.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={blocked}
                    aria-label="上传封面"
                    onClick={() => openUpload("image", "cover")}
                  >
                    <ImagePlus size={16} />
                  </Button>
                </div>
              </label>
            </div>
            {input.coverUrl &&
              /^https?:\/\/|^\/uploads\//i.test(input.coverUrl) && (
                <img
                  className="cover-preview"
                  src={input.coverUrl}
                  alt="文章封面预览"
                />
              )}
            <div className="work-tabs" role="tablist" aria-label="写作视图">
              <Button
                role="tab"
                aria-selected={tab === "edit"}
                onClick={() => setTab("edit")}
              >
                编辑
              </Button>
              <Button
                role="tab"
                aria-selected={tab === "preview"}
                onClick={() => setTab("preview")}
              >
                预览
              </Button>
            </div>
            <WritingGrid $tab={tab}>
              <div className="write-pane">
                <div className="pane-label">MARKDOWN / 正文</div>
                <div className="toolbar" role="toolbar" aria-label="文章格式">
                  <button aria-label="加粗" onClick={() => insert("**", "**")}>
                    <Bold size={16} />
                  </button>
                  <button aria-label="斜体" onClick={() => insert("*", "*")}>
                    <Italic size={16} />
                  </button>
                  <button aria-label="二级标题" onClick={() => insert("\n## ")}>
                    <Heading2 size={18} />
                  </button>
                  <button aria-label="列表" onClick={() => insert("\n- ")}>
                    <List size={17} />
                  </button>
                  <button aria-label="引用" onClick={() => insert("\n> ")}>
                    <Quote size={16} />
                  </button>
                  <button
                    aria-label="代码块"
                    onClick={() => insert("\n```\n", "\n```\n")}
                  >
                    <Code2 size={18} />
                  </button>
                </div>
                <MediaBar>
                  <div className="media-actions">
                    <Button
                      disabled={blocked}
                      aria-describedby="media-upload-hint"
                      onClick={() => openUpload("image")}
                    >
                      <ImagePlus size={17} />
                      上传图片
                    </Button>
                    <Button
                      disabled={blocked}
                      aria-describedby="media-upload-hint"
                      onClick={() => openUpload("video")}
                    >
                      <Video size={17} />
                      上传视频
                    </Button>
                  </div>
                  <p className="media-storage">图片与视频均存储于 Imgur</p>
                  <p id="media-upload-hint">
                    图片 JPEG / PNG / GIF，最大{" "}
                    {Math.floor(session.uploads.maxImageBytes / 1024 / 1024)}
                    MiB； 视频 MP4 / WebM，最大{" "}
                    {Math.floor(session.uploads.maxVideoBytes / 1024 / 1024)}
                    MiB。 可拖放文件或粘贴图片，上传后自动插入正文。
                  </p>
                  {!session.uploads.configured && (
                    <p className="media-unconfigured">
                      Imgur 上传待配置，图片与视频均需配置后使用。
                    </p>
                  )}
                </MediaBar>
                {progress !== null && (
                  <div className="upload-progress">
                    <span>正在上传 {progress}%</span>
                    <progress
                      aria-label="媒体上传进度"
                      max={100}
                      value={progress}
                    />
                    <Button onClick={() => uploadController.current?.abort()}>
                      取消
                    </Button>
                  </div>
                )}
                <textarea
                  ref={textarea}
                  aria-label="Markdown 正文"
                  placeholder={
                    "从一句话开始。\n\n支持 Markdown、粘贴图片、拖入图片或视频。"
                  }
                  value={input.body}
                  onChange={(event) => change("body", event.target.value)}
                  onPaste={(event) => {
                    const file = event.clipboardData.files[0];
                    if (
                      file &&
                      file.type.startsWith("image/") &&
                      progress === null
                    ) {
                      event.preventDefault();
                      uploadTarget.current = "body";
                      void upload(file);
                    }
                  }}
                  onDragOver={(event) => {
                    if (event.dataTransfer.types.includes("Files"))
                      event.preventDefault();
                  }}
                  onDrop={(event) => {
                    const file = event.dataTransfer.files[0];
                    if (file) {
                      event.preventDefault();
                      if (progress === null) {
                        uploadTarget.current = "body";
                        void upload(file);
                      }
                    }
                  }}
                />
              </div>
              <div className="preview-pane">
                <div className="pane-label">PREVIEW / 实时预览</div>
                <div className="preview-body">
                  {input.body ? (
                    <MarkdownContent body={input.body} />
                  ) : (
                    <div className="preview-placeholder">
                      文字写下来的时候，
                      <br />
                      想法就有了形状。
                      <br />
                      <br />
                      你的文章会在这里实时呈现。
                    </div>
                  )}
                </div>
              </div>
            </WritingGrid>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 18,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {input.body.length} 字符 · 约{" "}
                {Math.max(1, Math.ceil(input.body.length / 500))} 分钟阅读
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {selected?.status === "published" && (
                  <Button disabled={blocked} onClick={() => void save("draft")}>
                    转为草稿
                  </Button>
                )}
                {selected && (
                  <Button
                    $danger
                    disabled={blocked}
                    onClick={() => void remove()}
                  >
                    <Trash2 size={14} />
                    删除文章
                  </Button>
                )}
              </div>
            </div>
          </Workspace>
        </Layout>
      )}
      <input
        ref={fileInput}
        type="file"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
    </EditorRoot>
  );
}
