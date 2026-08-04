function aggregateByKey(posts, key) {
  const map = /* @__PURE__ */ new Map();
  for (const post of posts) {
    if (key === "category") {
      if (post.category) map.set(post.category, (map.get(post.category) ?? 0) + 1);
    } else {
      for (const tag of post.tags ?? []) map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export { aggregateByKey as a };
