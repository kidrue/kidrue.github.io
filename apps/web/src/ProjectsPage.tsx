import ProjectsSection from "./components/ProjectsSection";
import SiteLayout from "./components/SiteLayout";

export default function ProjectsPage() {
  return (
    <SiteLayout page="projects">
      <div className="container blog-intro">
        <div className="eyebrow">KIDRUE / PROJECTS</div>
        <h1>
          我的项目<span className="brand-dot">。</span>
        </h1>
      </div>
      <ProjectsSection />
    </SiteLayout>
  );
}
