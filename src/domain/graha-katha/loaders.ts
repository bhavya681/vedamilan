import { isGrahaId } from "@/domain/graha-katha/ids";
import type { GrahaEntity, GrahaId } from "@/domain/graha-katha/types";

type Loader = () => Promise<{ default?: GrahaEntity } & Record<string, GrahaEntity>>;

const LOADERS: Record<GrahaId, Loader> = {
  surya: () => import("@/domain/graha-katha/catalog/surya"),
  chandra: () => import("@/domain/graha-katha/catalog/chandra"),
  mangal: () => import("@/domain/graha-katha/catalog/mangal"),
  budha: () => import("@/domain/graha-katha/catalog/budha"),
  guru: () => import("@/domain/graha-katha/catalog/guru"),
  shukra: () => import("@/domain/graha-katha/catalog/shukra"),
  shani: () => import("@/domain/graha-katha/catalog/shani"),
  rahu: () => import("@/domain/graha-katha/catalog/rahu"),
  ketu: () => import("@/domain/graha-katha/catalog/ketu"),
};

const EXPORT_KEY: Record<GrahaId, string> = {
  surya: "SURYA",
  chandra: "CHANDRA",
  mangal: "MANGAL",
  budha: "BUDHA",
  guru: "GURU",
  shukra: "SHUKRA",
  shani: "SHANI",
  rahu: "RAHU",
  ketu: "KETU",
};

const cache = new Map<GrahaId, GrahaEntity>();
const inflight = new Map<GrahaId, Promise<GrahaEntity>>();

function pickEntity(mod: Awaited<ReturnType<Loader>>, id: GrahaId): GrahaEntity {
  const key = EXPORT_KEY[id];
  const entity = mod[key] ?? mod.default;
  if (!entity) throw new Error(`Graha module missing export for ${id}`);
  return entity;
}

/** Load one planet’s full content (chapters + 12 houses). Cached after first fetch. */
export async function loadGraha(id: string): Promise<GrahaEntity | null> {
  if (!isGrahaId(id)) return null;
  const hit = cache.get(id);
  if (hit) return hit;

  const pending = inflight.get(id);
  if (pending) return pending;

  const promise = LOADERS[id]()
    .then((mod) => {
      const entity = pickEntity(mod, id);
      cache.set(id, entity);
      inflight.delete(id);
      return entity;
    })
    .catch((err) => {
      inflight.delete(id);
      throw err;
    });

  inflight.set(id, promise);
  return promise;
}

/** Warm the chunk on hover/focus so detail navigation feels instant. */
export function prefetchGraha(id: string): void {
  if (!isGrahaId(id) || cache.has(id) || inflight.has(id)) return;
  void loadGraha(id);
}
