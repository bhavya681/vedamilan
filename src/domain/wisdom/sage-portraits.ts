/**
 * Curated portrait assets for Wisdom Council guides.
 * Sources: Wikimedia Commons / Wikipedia lead images (public historical art).
 * Each asset is localized, square-cropped, and optimized so every sage keeps a
 * stable, relevant portrait instead of relying on remote image availability.
 * Artistic depictions — not claimed historical photographs of ancient figures.
 * Guides without an entry here must not appear in the product catalog.
 */

export const SAGE_PORTRAIT_URLS: Record<string, string> = {
  vasistha: "/images/sages/vasistha.webp",
  vishwamitra: "/images/sages/vishwamitra.webp",
  vyasa: "/images/sages/vyasa.webp",
  valmiki: "/images/sages/valmiki.webp",
  yajnavalkya: "/images/sages/yajnavalkya.webp",
  atri: "/images/sages/atri.webp",
  kashyapa: "/images/sages/kashyapa.webp",
  gautama: "/images/sages/gautama.webp",
  bhrigu: "/images/sages/bhrigu.webp",
  parashara: "/images/sages/parashara.webp",
  agastya: "/images/sages/agastya.webp",
  narada: "/images/sages/narada.webp",
  kapila: "/images/sages/kapila.webp",
  ashtavakra: "/images/sages/ashtavakra.webp",
  brihaspati: "/images/sages/brihaspati.webp",
  tulsidas: "/images/sages/tulsidas.webp",
  kabir: "/images/sages/kabir.webp",
  mirabai: "/images/sages/mirabai.webp",
  thiruvalluvar: "/images/sages/thiruvalluvar.webp",
  "sri-aurobindo": "/images/sages/sri-aurobindo.webp",
  "paramahansa-yogananda": "/images/sages/paramahansa-yogananda.webp",
  chanakya: "/images/sages/chanakya.webp",
  vidura: "/images/sages/vidura.webp",
  krishna: "/images/sages/krishna.webp",
  bhishma: "/images/sages/bhishma.webp",
  dronacharya: "/images/sages/dronacharya.webp",
  patanjali: "/images/sages/patanjali.webp",
  "adi-shankaracharya": "/images/sages/adi-shankaracharya.webp",
  "swami-vivekananda": "/images/sages/swami-vivekananda.webp",
  "ramana-maharshi": "/images/sages/ramana-maharshi.webp",
};

export function sagePortraitUrl(guideId: string): string | null {
  return SAGE_PORTRAIT_URLS[guideId] ?? null;
}

export function hasSagePortrait(guideId: string): boolean {
  return Boolean(SAGE_PORTRAIT_URLS[guideId]);
}
