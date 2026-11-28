export type CelebrityFilterItem = {
  name: string;
  field: string;
  category: string;
  place: string;
};

export function celebrityMatchesQuery(item: CelebrityFilterItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.field, item.category, item.place].some((value) =>
    value.toLowerCase().includes(q),
  );
}

export function countCelebritiesByCategory(items: CelebrityFilterItem[], query: string) {
  const counts: Record<string, number> = { All: 0 };
  for (const item of items) {
    if (!celebrityMatchesQuery(item, query)) continue;
    counts.All = (counts.All ?? 0) + 1;
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}
