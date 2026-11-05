import { Code2, Coffee, Feather } from "lucide-react";
import avatar from "../avatar.jpg";

export default function AboutPage() {
  return (
    <>
      <div className="container blog-intro">
        <div className="eyebrow">KIDRUE / ABOUT</div>
        <h1>
          关于我<span className="brand-dot">。</span>
        </h1>
      </div>
      <section id="about-intro" className="about-section container">
        <div className="about-card">
          <div className="about-avatar">
            <img src={avatar} alt="kidrue 的头像" loading="lazy" />
            <span className="avatar-status" />
          </div>
          <div className="about-copy">
            <div className="eyebrow">A LITTLE MORE ABOUT ME</div>
            <h2>
              我是 kidrue<span className="brand-dot">。</span>
            </h2>
            <p>
              喜欢写代码，也喜欢动漫。平时做些感兴趣的小项目，把学到的东西和生活里的片刻记录在这里。
              <br className="desktop-break" />
              这个博客里有技术笔记、日常随想，也有看过的番剧和喜欢的句子。希望保持好奇，慢慢积累。
            </p>
          </div>
          <div className="about-side">
            <span>
              <Code2 size={15} />
              技术探索
            </span>
            <span>
              <Coffee size={15} />
              生活观察
            </span>
            <span>
              <Feather size={15} />
              自由记录
            </span>
          </div>
          <span className="about-decoration" aria-hidden="true">
            *
          </span>
        </div>
      </section>
    </>
  );
}
