export type Project = {
  id: string;
  title: string;
  description: string;
  status: "持续完善" | "开发中" | "已完成";
  stack: string[];
  note: string;
  example: boolean;
  icon: "blog" | "ideas" | "tasks";
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    id: "kidrue-blog",
    title: "kidrue 个人博客",
    description:
      "一个属于自己的数字角落。记录技术与生活，也为喜欢的动漫、手办和开发作品留个位置。",
    status: "持续完善",
    stack: ["React", "TypeScript", "Vite"],
    note: "从首页原型开始，逐步加入文章阅读、动漫与手办收藏，以及项目展示。",
    example: false,
    icon: "blog",
    link: { label: "浏览本站", href: "/" },
  },
  {
    id: "idea-pocket",
    title: "日常灵感收集器",
    description:
      "随手收集一闪而过的想法，把零散的笔记、链接和小发现，整理成自己的灵感口袋。",
    status: "开发中",
    stack: ["React", "TypeScript", "CSS"],
    note: "这是一个项目展示示例，可以替换为你开发过的工具，记录它解决的问题、实现过程与下一步计划。",
    example: true,
    icon: "ideas",
  },
  {
    id: "little-task-board",
    title: "轻量任务看板",
    description:
      "让待办回到简单清晰的状态。用一个小看板，整理计划、跟进进展，再划掉已经完成的事情。",
    status: "已完成",
    stack: ["TypeScript", "CSS", "LocalStorage"],
    note: "这是一个项目展示示例。这里适合记录开发心得、遇到的问题，以及完成后最满意的一处细节。",
    example: true,
    icon: "tasks",
  },
];
