import CabinetTree from "@/components/site/CabinetTree";

// The governing body sits above the day-to-day cabinet, so it gets its own
// section and its own chart. Rendered only when members are published.
export default function GoverningBodySection({ members = [] }) {
  return (
    <section className="section on-paper" id="governing-body">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">03 — GOVERNING BODY</span>
          <span className="rule"></span>
        </div>
        <div className="section-head center">
          <span className="section-eyebrow">Governing Body</span>
          <h2>Who holds us to account.</h2>
        </div>
        <CabinetTree
          members={members}
          emptyText="The governing body roster isn't published yet — check back soon."
        />
      </div>
    </section>
  );
}
