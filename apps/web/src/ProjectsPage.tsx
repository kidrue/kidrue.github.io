import ProjectsSection from "./components/ProjectsSection";

export default function ProjectsPage() {
  return (
    <>
      <div className="container blog-intro">
        <div className="eyebrow">KIDRUE / PROJECTS</div>
        <h1>
          我的项目<span className="brand-dot">。</span>
        </h1>
      </div>
      <ProjectsSection />
    </>
  );
}
