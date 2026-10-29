import QuotesSection from "./components/QuotesSection";

export default function QuotesPage() {
  return (
    <>
      <div className="container blog-intro">
        <div className="eyebrow">KIDRUE / QUOTES</div>
        <h1>
          喜欢的一句话<span className="brand-dot">。</span>
        </h1>
      </div>
      <QuotesSection />
    </>
  );
}
