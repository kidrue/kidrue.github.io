export type Category = "技术" | "生活";
export type Post = {
  id: string;
  category: Category;
  title: string;
  description: string;
  date: string;
  readTime: number;
  tags: string[];
  artwork: "code" | "mountain" | "none";
  body?: string;
  coverUrl?: string;
  example?: boolean;
  sections: { title: string; paragraphs: string[]; code?: string }[];
};

export const posts: Post[] = [
  {
    id: "my-little-corner",
    category: "技术",
    title: "把个人博客，写成自己的样子",
    description:
      "从一张白纸开始，搭建一个属于自己的小角落。关于设计、代码，以及为什么我们依然需要一个博客。",
    date: "2026-10-18",
    readTime: 5,
    tags: ["博客搭建", "前端", "设计"],
    artwork: "code",
    sections: [
      {
        title: "从一张白纸开始",
        paragraphs: [
          "这是一篇用于展示排版的示例文章。一个个人博客，可以从很小的愿望开始：留下一些想法，整理走过的路，也让偶然路过的人知道屏幕另一边是谁。",
          "与其等待内容足够丰富，不如先搭好一个能让自己愿意回来写字的地方。首页不需要塞满功能，一句介绍、几篇文章和一点自己的喜好，就足够成为起点。",
        ],
      },
      {
        title: "先让内容呼吸",
        paragraphs: [
          "我喜欢浅浅的网格、清楚的文字层级，以及恰到好处的蓝色。把装饰留在首屏，进入文章以后，则让阅读变得安静。",
          "用 CSS 变量管理颜色，也让以后的微调更轻松。先把最常用的几个值统一，再慢慢形成自己的设计语言。",
        ],
        code: ":root {\n  --paper: #f2f7fb;\n  --ink: #17324b;\n  --accent: #087cba;\n}\n\n.blog {\n  background: var(--paper);\n  color: var(--ink);\n}",
      },
      {
        title: "保持更新，慢慢生长",
        paragraphs: [
          "博客的完成并不是上线的那一天，而是某天又写下一段新的记录。代码里的小问题、读书时的片刻共鸣、周末的一段散步，都可以留在这里。",
          "希望这个小角落，能伴随生活一起慢慢生长。",
        ],
      },
    ],
  },
  {
    id: "weekend-in-the-hills",
    category: "生活",
    title: "周末，去山野里充个电",
    description:
      "把消息通知暂时关掉，去听风吹过树梢的声音。日常以外，也有值得慢下来的风景。",
    date: "2026-10-15",
    readTime: 3,
    tags: ["周末出走", "日常"],
    artwork: "mountain",
    sections: [
      {
        title: "把步子放慢一点",
        paragraphs: [
          "这是一篇生活记录示例。想象一个不用赶时间的周末，带一瓶水，选一条不太远的步道，走进城市边缘的绿色里。",
          "山路并不需要很难走，也不必抵达什么著名的目的地。脚下的碎石、路边的苔藓和转弯后的一束光，就能让注意力重新回到眼前。",
        ],
      },
      {
        title: "给日常留一点空白",
        paragraphs: [
          "休息有时并不需要精心安排。找一块能坐下的石头，看云慢慢移动，带来的水也会变得格外好喝。",
          "等回到日常，事情还是那些事情，但心里好像多了一点空间。下次累的时候，再去走走吧。",
        ],
      },
    ],
  },
  {
    id: "css-grid-notes",
    category: "技术",
    title: "CSS Grid：让布局回归秩序",
    description:
      "整理几个常用的 Grid 布局小技巧，让页面在不同尺寸下都能自在舒展。",
    date: "2026-10-12",
    readTime: 6,
    tags: ["CSS", "学习笔记"],
    artwork: "none",
    sections: [
      {
        title: "先想清楚内容的关系",
        paragraphs: [
          "这是一篇技术笔记示例。使用 Grid 之前，先观察内容有哪些分组：哪些需要并排，哪些应该占据更大的空间，以及窄屏时最自然的阅读顺序是什么。",
          "以文章列表为例，可以用三列建立基础秩序，再让精选文章跨两列，形成清晰的主次。",
        ],
      },
      {
        title: "用最少的规则适应屏幕",
        paragraphs: [
          "固定的列数配合明确的断点，往往比复杂的计算更容易维护。内容卡片不设置固定高度，让标题和摘要有足够的空间。",
        ],
        code: ".posts {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 24px;\n}\n\n@media (max-width: 640px) {\n  .posts { grid-template-columns: 1fr; }\n}",
      },
    ],
  },
  {
    id: "small-happy-things",
    category: "生活",
    title: "一些让日子发光的小事",
    description:
      "一杯刚好的咖啡，一首循环的歌，还有傍晚路过窗边的光。记录最近的小确幸。",
    date: "2026-10-09",
    readTime: 4,
    tags: ["生活碎片", "随想"],
    artwork: "none",
    sections: [
      {
        title: "不必很特别",
        paragraphs: [
          "这是一篇日常随笔示例。有些好心情来得非常轻：刚好赶上的绿灯、翻书时掉出来的旧书签，或者在忙碌的一天结束后，终于喝到的一口热茶。",
          "它们不一定值得发一条动态，却值得在自己的小本子里占一行。",
        ],
      },
      {
        title: "把它们记下来",
        paragraphs: [
          "试着每天写下一个小小的发现，不需要漂亮的语言，也不需要完整的故事。今天的天空很蓝，就是足够好的开头。",
          "回头看的时候，这些零碎的记录会让那些普通的日子重新变得具体。",
        ],
      },
    ],
  },
  {
    id: "typescript-small-steps",
    category: "技术",
    title: "和 TypeScript 再熟悉一点",
    description:
      "从日常开发里的小场景出发，聊聊类型如何让代码更清晰，也更让人安心。",
    date: "2026-10-06",
    readTime: 7,
    tags: ["TypeScript", "开发手记"],
    artwork: "none",
    sections: [
      {
        title: "从数据边界开始",
        paragraphs: [
          "这是一篇学习笔记示例。一个好的类型，可以让使用数据的人提前知道它的形状。与其为每个局部变量添加注解，不如先把组件之间传递的数据说明白。",
        ],
        code: "type Category = '技术' | '生活';\n\ntype Post = {\n  id: string;\n  title: string;\n  category: Category;\n};",
      },
      {
        title: "让意图比技巧更清楚",
        paragraphs: [
          "类型不是为了炫耀复杂的泛型技巧，而是为了减少理解代码时的猜测。让不合法的状态更难出现，让编辑器能够给出准确提示，就已经有很大价值。",
          "当一个类型变得难以阅读，先想想数据结构是否可以更直接。清楚的边界，通常也意味着更简单的实现。",
        ],
      },
    ],
  },
  {
    id: "reading-slowly",
    category: "生活",
    title: "在阅读里，找回自己的节奏",
    description:
      "不着急读完一本书，也不急着找到答案。留一点时间，和文字安静地待一会儿。",
    date: "2026-10-02",
    readTime: 4,
    tags: ["阅读", "慢生活"],
    artwork: "none",
    sections: [
      {
        title: "关掉进度条",
        paragraphs: [
          "这是一篇阅读随想示例。读书有时也会不知不觉变成一项任务：这个月要读几本，读完之后要写多少笔记。偶尔，不妨把这些数字先放到一边。",
          "挑一个舒服的位置，读一小段，停下来想一会儿。没有完成整章，也并不影响这段时间的意义。",
        ],
      },
      {
        title: "留下一句自己的话",
        paragraphs: [
          "比起抄下很多句子，我更想试着写一句自己的理解。它可能很朴素，也可能以后还会改变，但那是此刻真实的感受。",
          "慢慢读，慢慢积累。让阅读成为日常里一个可以随时回去的地方。",
        ],
      },
    ],
  },
];
