/**
 * Curated portrait URLs for Wisdom Council guides.
 * Sources: Wikimedia Commons / Wikipedia (public historical art & photographs).
 * Artistic depictions — not claimed historical photographs of ancient figures.
 * Guides without an entry here must not appear in the product catalog.
 */

export const SAGE_PORTRAIT_URLS: Record<string, string> = {
  vasistha:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Vasi%E1%B9%A3%E1%B9%ADha_Greets_Shiva_and_Parvati.jpg?width=640",
  vishwamitra:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Varma_-_Vishvamitra_Meditation.jpg?width=640",
  vyasa: "/images/sages/vyasa.png",
  valmiki: "https://commons.wikimedia.org/wiki/Special:FilePath/Valmiki_Ramayana.jpg?width=640",
  yajnavalkya:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Yajnavalkya_and_Janaka.jpg?width=640",
  atri: "https://commons.wikimedia.org/wiki/Special:FilePath/Rama_visits_Atri.jpg?width=640",
  kashyapa:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Kashyapa_muni_statue_in_Andhra_Pradesh.JPG?width=640",
  gautama: "/images/sages/gautama.png",
  bhrigu: "https://commons.wikimedia.org/wiki/Special:FilePath/Maharishi_Bhrighuji.jpg?width=640",
  parashara: "https://upload.wikimedia.org/wikipedia/commons/8/89/Parasara-kl.jpg",
  agastya: "https://upload.wikimedia.org/wikipedia/commons/0/0b/AgasthiyarG.jpg",
  narada: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Narad_-_Vintage_Print.jpg",
  kapila: "https://upload.wikimedia.org/wikipedia/commons/0/09/Kapila_muni.jpg",
  ashtavakra: "https://commons.wikimedia.org/wiki/Special:FilePath/Ashtavakra.jpg?width=640",
  brihaspati: "https://upload.wikimedia.org/wikipedia/commons/8/84/Sculpture_of_Brihaspati.jpg",
  tulsidas:
    "https://upload.wikimedia.org/wikipedia/commons/a/a4/Tulsidas_composing_his_famous_Avadhi_Ramcharitmanas.jpg",
  kabir: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Kabir004.jpg",
  mirabai:
    "https://upload.wikimedia.org/wikipedia/commons/a/a8/Kangra_painting_of_Mirabai%2C_the_female_Bhakti_saint.jpg",
  thiruvalluvar:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Thiruvalluvar_Statue.jpg?width=640",
  "sri-aurobindo": "https://upload.wikimedia.org/wikipedia/commons/7/71/Sri_aurobindo.jpg",
  "paramahansa-yogananda":
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Paramahansa_Yogananda_Standard_Pose.jpg",
  chanakya: "/images/sages/chanakya.png",
  vidura: "/images/sages/vidura.png",
  krishna:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Krishna_holding_flute.jpg?width=640",
  bhishma: "/images/sages/bhishma.png",
  dronacharya: "/images/sages/dronacharya.png",
  patanjali: "https://commons.wikimedia.org/wiki/Special:FilePath/Patanjali.jpg?width=640",
  "adi-shankaracharya":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Shankaracharya.jpg?width=640",
  "swami-vivekananda":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Swami_Vivekananda-1893-09-signed.jpg?width=640",
  "ramana-maharshi":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Ramana_Maharshi.jpg?width=640",
};

export function sagePortraitUrl(guideId: string): string | null {
  return SAGE_PORTRAIT_URLS[guideId] ?? null;
}

export function hasSagePortrait(guideId: string): boolean {
  return Boolean(SAGE_PORTRAIT_URLS[guideId]);
}
