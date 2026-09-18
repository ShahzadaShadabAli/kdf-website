import Image from "next/image";

function buildTree(items) {
  const byParent = new Map();
  items.forEach((item) => {
    const key = item.parentId || "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  });
  byParent.forEach((list) => list.sort((a, b) => a.order - b.order));
  return byParent;
}

function Node({ item, byParent }) {
  const children = byParent.get(item._id) || [];
  const initial = (item.name || "?")[0].toUpperCase();

  return (
    <li>
      <div className="cabinet-card">
        <div className="cabinet-photo">
          {item.photo?.url ? (
            <Image src={item.photo.url} alt={item.photo.alt || item.name} width={64} height={64} />
          ) : (
            <span className="cabinet-photo-fallback">{initial}</span>
          )}
        </div>
        <strong>{item.name}</strong>
        <span>{item.role}</span>
      </div>
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <Node item={child} byParent={byParent} key={child._id} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CabinetTree({ members }) {
  if (!members?.length) {
    return (
      <p style={{ color: "var(--ink-soft)", textAlign: "center" }}>
        The cabinet roster isn&apos;t published yet — check back soon.
      </p>
    );
  }

  const byParent = buildTree(members);
  const roots = byParent.get("root") || [];

  return (
    <div className="cabinet-tree">
      <ul>
        {roots.map((root) => (
          <Node item={root} byParent={byParent} key={root._id} />
        ))}
      </ul>
    </div>
  );
}
