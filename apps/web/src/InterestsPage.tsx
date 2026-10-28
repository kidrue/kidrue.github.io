import CollectionSection from "./components/CollectionSection";
import SiteLayout from "./components/SiteLayout";

export default function InterestsPage() {
  return (
    <SiteLayout page="interests">
      <div className="container blog-intro">
        <div className="eyebrow">KIDRUE / INTERESTS</div>
        <h1>
          我的兴趣<span className="brand-dot">。</span>
        </h1>
      </div>
      <CollectionSection />
    </SiteLayout>
  );
}
