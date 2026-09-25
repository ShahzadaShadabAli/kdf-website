import Image from "next/image";

function buildTree(items) {
  const ids = new Set(items.map((i) => i._id));
  const byParent = new Map();
  items.forEach((item) => {
    // A member whose parent sits in another chart (or was archived) becomes a
    // root of this chart rather than disappearing from it.
    const key = item.parentId && ids.has(item.parentId) ? item.parentId : "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  });
  byParent.forEach((list) => list.sort((a, b) => a.order - b.order));
  return byParent;
}

function Node({ item, byParent, isRoot }) {
  const children = byParent.get(item._id) || [];
  const initial = (item.name || item.role || "?")[0].toUpperCase();

  return (
    <li>
      <div className={`cabinet-card${isRoot ? " is-lead" : ""}`}>
        <div className="cabinet-photo">
          {item.photo?.url ? (
            <Image src={item.photo.url} alt={item.photo.alt || item.name} width={72} height={72} />
          ) : (
            <span className="cabinet-photo-fallback">{initial}</span>
          )}
        </div>
        <div className="cabinet-card-text">
          <strong>{item.name || item.role}</strong>
          {item.name && <span>{item.role}</span>}
        </div>
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

export default function CabinetTree({ members, emptyText = "This roster isn't published yet — check back soon." }) {
  if (!members?.length) {
    return <p className="cabinet-empty">{emptyText}</p>;
  }

  const byParent = buildTree(members);
  const roots = byParent.get("root") || [];

  return (
    <div className="cabinet-tree">
      <ul>
        {roots.map((root) => (
          <Node item={root} byParent={byParent} key={root._id} isRoot />
        ))}
      </ul>
    </div>
  );
}
