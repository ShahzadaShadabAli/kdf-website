"use client";
import { useState } from "react";
import CabinetTree from "@/components/site/CabinetTree";
import { CABINET_GROUP_LABELS } from "@/lib/validation/cabinetMember";

// The cabinet is kept as two charts — the male and female wings. When only one
// of them has published members the tabs are pointless, so the single chart is
// shown on its own.
export default function CabinetSection({ male = [], female = [] }) {
  const wings = [
    { key: "male", members: male },
    { key: "female", members: female },
  ].filter((w) => w.members.length > 0);
  const [active, setActive] = useState(wings[0]?.key || "male");
  const shown = wings.find((w) => w.key === active) || wings[0];

  return (
    <section className="section on-card" id="cabinet">
      <div className="wrap">
        <div className="kicker">
          <span className="num mono">02 — LEADERSHIP</span>
          <span className="rule"></span>
        </div>
        <div className="section-head center">
          <span className="section-eyebrow">The Cabinet</span>
          <h2>Who runs the Forum.</h2>
        </div>

        {wings.length > 1 && (
          <div className="group-tabs" role="tablist" aria-label="Choose a cabinet">
            {wings.map((w) => (
              <button
                key={w.key}
                type="button"
                role="tab"
                aria-selected={w.key === active}
                className={`group-tab${w.key === active ? " active" : ""}`}
                onClick={() => setActive(w.key)}
              >
                {CABINET_GROUP_LABELS[w.key]}
                <span className="group-tab-count">{w.members.length}</span>
              </button>
            ))}
          </div>
        )}

        {wings.length === 1 && <p className="group-single">{CABINET_GROUP_LABELS[wings[0].key]}</p>}

        <CabinetTree
          members={shown?.members || []}
          emptyText="The cabinet roster isn't published yet — check back soon."
        />
      </div>
    </section>
  );
}
