/** Shared filters for auspicious / Raja-style yogas from the stored chart engine. */

export type ChartYoga = {
  code?: string;
  name: string;
  category?: string;
  strength?: number;
  description?: string;
};

const RAJA_PATTERN = /raja|gajakesari|dharma.?karma|budhaditya|ruchaka|hamsa|malavya|sasa|bhadra/i;

export function isRajaStyleYoga(yoga: ChartYoga) {
  return RAJA_PATTERN.test(`${yoga.code || ""} ${yoga.name}`);
}

export function partitionYogas(yogas: ChartYoga[]) {
  const rajaYogas = yogas.filter(isRajaStyleYoga);
  const otherYogas = yogas.filter((y) => !isRajaStyleYoga(y));
  return { rajaYogas, otherYogas };
}
