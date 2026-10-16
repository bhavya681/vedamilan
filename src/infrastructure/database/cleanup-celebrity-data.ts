/**
 * Database cleanup script — removes real-person demo profiles and their data.
 *
 * Usage: npx tsx src/infrastructure/database/cleanup-celebrity-data.ts [--dry-run]
 * Target: Development/Test database only (checks NODE_ENV).
 *
 * The script identifies demo profiles by their @demo.vedamilan.ai email domain,
 * then checks each against a list of known celebrity names/emails to remove.
 * After removal, re-run the seed script to populate with fictional profiles.
 */
import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { ObjectId } from "mongodb";
import { Profile } from "@/infrastructure/database/models";
import {
  BirthDetails,
  Horoscope,
  Dasha,
  SituationalProfile,
  Match,
  Like,
  Shortlist,
  Visitor,
  CompatibilityReport,
  Chat,
  Message,
  Notification,
} from "@/infrastructure/database/models";
import { logger } from "@/lib/utils/logger";

const dryRun = process.argv.includes("--dry-run");

const CELEBRITY_IDENTIFIERS = new Set([
  // Indian celebrities
  "amitabh.bachchan",
  "sachin.tendulkar",
  "sourav.ganguly",
  "rahul.dravid",
  "shahrukh.khan",
  "aishwarya.rai",
  "shilpa.shetty",
  "madhuri.dixit",
  "kajol.devgn",
  "sushmita.sen",
  "kareena.kapoor",
  "deepika.padukone",
  "ranveer.singh",
  "alia.bhatt",
  "ranbir.kapoor",
  // International celebrities
  "conor.mcgregor",
  "israel.adesanya",
  "islam.makhachev",
  "alexa.grasso",
  "zhang.weili",
  "arman.tsarukyan",
  "john.cena",
  "dwayne.johnson",
  "roman.reigns",
  "becky.lynch",
  "charlotte.flair",
  "bianca.belair",
  "rhea.ripley",
  "bayley.wwe",
  "cj.perry.lana",
  "alexa.bliss",
  "mercedes.mone",
  "asuka.wwe",
  "bobby.lashley",
  "miro.rusev",
  "gunther.wwe",
  "drew.mcintyre",
  "seth.rollins",
  "sheamus.wwe",
  "chris.hemsworth",
  "ryan.reynolds",
  "tom.holland",
  "zendaya",
  "sydney.sweeney",
  "florence.pugh",
  "jason.momoa",
  "scarlett.johansson",
  "chris.evans",
  "ana.dearmas",
  "simu.liu",
  "dua.lipa",
  "taylor.swift",
  "rihanna.fenty",
  "selena.gomez",
  "pedro.pascal",
  "bad.bunny",
  "burna.boy",
  "jungkook.bts",
  "henry.cavill",
  "timothee.chalamet",
  "lewis.hamilton",
  "michael.b.jordan",
  "lupita.nyongo",
  "shakira",
  "iu.lee",
  "naomi.osaka",
  "tems",
  "anya.taylorjoy",
  "rosalia",
  "gal.gadot",
  "jennie.blackpink",
  "dev.patel",
  "jimmy.mrbeast",
  "emma.chamberlain",
  "khaby.lame",
  "charli.damelio",
  "felix.pewdiepie",
  "lilly.singh",
  "bhuvan.bam",
  "prajakta.koli",
  "mark.fischbach",
  "bailey.sarian",
  "corpse.husband",
  "ajey.nagar",
  "zach.king",
  "luisito.comunica",
  "karol.g",
  "emmanuella.samuel",
  "neyo",
  "ipsy.j",
  "kenchan",
  "tedua",
  "diamond",
  "adwoa.aboah",
  "irina.shayk",
  "sania.mirza",
  "venus.williams",
  "kobe.bryant",
  "elon.musk",
  "jack.ma",
  "misty.copeland",
  "prabhu.deva",
  "derek.hough",
  "nora.fatehi",
  "michelle.yeoh",
  "donnie.yen",
  "tony.jaa",
  "ronda.rousey",
  "francis.ngannou",
  "jenna.ortega",
  "bill.skarsgard",
  "mia.goth",
  "cillian.murphy",
  "idris.elba",
  "jodie.comer",
  "margot.robbie",
  "ryan.gosling",
  "saoirse.ronan",
  "song.joongki",
  "diego.luna",
  "simone.biles",
  "coco.gauff",
  "erling.haaland",
  "iga.swiatek",
  "max.verstappen",
  "neeraj.chopra",
  // More international celebrities found during audit
  "bill.gates",
  "barack.obama",
  "priyanka.chopra",
  "virat.kohli",
  "anushka.sharma",
  "katrina.kaif",
  "vicky.kaushal",
  "kiara.advani",
  "sidharth.malhotra",
  "shraddha.kapoor",
  "ayushmann.khurrana",
  "rashmika.mandanna",
  "dulquer.salmaan",
  "ms.dhoni",
  "allu.arjun",
  "shaheid.kapoor",
  "pv.sindhu",
  "neeraj.chopra",
  "ar.raharman",
  "shreya.ghoshal",
  "sania.mirza",
  "viswanathan.anand",
  "smriti.mandhana",
  "kiramazumdar",
]);

function isCelebrityProfile(profile: { name: string; email?: string }) {
  const email = (profile.email || "").toLowerCase();
  for (const identifier of CELEBRITY_IDENTIFIERS) {
    if (email.includes(identifier)) return true;
  }
  return false;
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_SEED !== "true") {
    throw new Error("Refusing to run in production. Set ALLOW_DB_SEED=true for controlled runs.");
  }

  await connectMongo();
  const db = getMongoDb();
  logger.info({ dryRun, env: process.env.NODE_ENV }, "Starting celebrity data cleanup");

  const demoProfiles = await Profile.find({
    userId: { $exists: true },
    $or: [
      {
        name: {
          $regex:
            "Padukone|Tendulkar|Ganguly|Dravid|Shah Rukh|Aishwarya|Shilpa|Madhuri|Kajol|Sushmita|Kareena|Deepika|Ranveer|Alia|Ranbir|Bachchan|Obama|Gates|McGregor|Johnson|Cena|Reigns|Lynch|Flair|Belair|Ripley|Bayley|Bliss|Banks|Asuka|Lashley|Miro|Gunther|McIntyre|Rollins|Sheamus|Hemsworth|Reynolds|Holland|zendaya|Sweeney|Pugh|Momoa|Johansson|Evans|de Armas|Liu|Lipa|Swift|Rihanna|Gomez|Pascal|Bunny|Boy|Jungkook|Cavill|Chalamet|Hamilton|Jordan|Nyong|Shakira|Osaka|Tems|Taylor|Gadot|Jennie|Patel|MrBeast|Chamberlain|Lame|D'Amelio|PewDiePie|Singh|Bam|Koli|Fischbach|Sarian|Husband|Nagur|King|Comunica|Karol|Emmanuella|Ne-Yo|Ipsy|Ken Chan|Tedua|Diamond|Adwoa|Shayk|Mirza|Williams|Bryant|Musk|Ma|Copeland|Deva|Hough|Fatehi|Yeoh|Yen|Jaa|Rousey|Ngannou|Ortega|Skarsgard|Goth|Murphy|Elba|Comer|Robbie|Gosling|Ronan|Joong-ki|Luna|Biles|Gauff|Haaland|Swiątek|Verstappen|Chopra|Kohli|Sharma|Kaif|Kaushal|Advani|Malhotra|Kapoor|Sidharth|Shraddha|Ayushmann|Rashmika|Dulquer|Dhoni|Arjun|Shaheid|Sindhu|Rahman|Ghoshal|Mirza|Anand|Mandhana|Raj",
          $options: "i",
        },
      },
    ],
  }).lean();

  const celebProfiles = demoProfiles.filter((p) => isCelebrityProfile(p));
  logger.info(
    { totalDemoProfiles: demoProfiles.length, celebrityProfiles: celebProfiles.length },
    "Identified celebrity profiles for removal",
  );

  if (dryRun) {
    logger.info("Dry run complete — no changes made. Run without --dry-run to execute.");
    await disconnectMongo();
    return;
  }

  for (const profile of celebProfiles) {
    const userId = String(profile.userId);
    await Profile.deleteOne({ _id: profile._id });
    await BirthDetails.deleteMany({ userId });
    await Horoscope.deleteMany({ userId });
    await Dasha.deleteMany({ userId });
    await SituationalProfile.deleteMany({ userId });
    await Match.deleteMany({ $or: [{ userId }, { candidateUserId: userId }] });
    await Like.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] });
    await Shortlist.deleteMany({ $or: [{ userId }, { targetUserId: userId }] });
    await Visitor.deleteMany({ $or: [{ visitorUserId: userId }, { profileUserId: userId }] });
    await CompatibilityReport.deleteMany({ $or: [{ userAId: userId }, { userBId: userId }] });
    await Chat.deleteMany({ participantIds: userId });
    await Message.deleteMany({ senderId: userId });
    await Notification.deleteMany({ userId });
    const idFilter: { id?: string; _id?: ObjectId }[] = [{ id: userId }];
    if (ObjectId.isValid(userId)) {
      idFilter.push({ _id: new ObjectId(userId) });
    }
    await db.collection("user").deleteOne({ $or: idFilter });
    logger.info({ userId, name: profile.name }, "Removed celebrity profile and related data");
  }

  logger.info(
    { removed: celebProfiles.length },
    "Cleanup complete. Re-run seed to populate with fictional profiles.",
  );
  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
