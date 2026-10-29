import {
  ArrowDownRight,
  ArrowUpRight,
  Blocks,
  Code2,
  Lightbulb,
  PanelsTopLeft,
} from "lucide-react";
import { projects } from "../data/projects";

const projectIcons = { blog: PanelsTopLeft, ideas: Lightbulb, tasks: Blocks };

export default function ProjectsSection() {
  return (
    <section
      id="project-list"
      className="projects-section container"
      aria-labelledby="projects-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow section-eyebrow">
            <span className="little-diamond" />
            MADE WITH CURIOSITY
          </div>
          <h2 id="projects-title">
            把想法，做成作品<span className="brand-dot">。</span>
          </h2>
        </div>
        <span className="section-heading-note">
          <Code2 size={15} />
          一些折腾，一些成果
        </span>
      </div>
      <p className="projects-intro">
        记录亲手开发的项目，也记录从「要不试试」到「终于做出来了」的过程。
      </p>
      <ul className="projects-grid" aria-label="开发项目">
        {projects.map((project, index) => {
          const Icon = projectIcons[project.icon];
          return (
            <li
              key={project.id}
              className={`project-card project-${project.icon}`}
            >
              <div className="project-card-top">
                <div className="project-icon">
                  <Icon size={25} strokeWidth={1.5} />
                </div>
                <span className={`project-status status-${project.icon}`}>
                  <span />
                  {project.status}
                </span>
              </div>
              <div className="project-label">
                PROJECT / {String(index + 1).padStart(2, "0")}
                <span>{project.example ? "示例项目" : "本站项目"}</span>
              </div>
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-stack" aria-label="技术栈">
                {project.stack.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
              <div className="project-actions">
                <details className="project-details">
                  <summary>
                    开发记录
                    <ArrowDownRight size={15} aria-hidden="true" />
                  </summary>
                  <p>{project.note}</p>
                </details>
                {project.link && (
                  <a href={project.link.href}>
                    {project.link.label}
                    <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="section-note">
        <Code2 size={13} aria-hidden="true" />
        本站为实际项目，其余卡片为可替换示例。
      </p>
    </section>
  );
}
