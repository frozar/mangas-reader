import { db, functions } from "../../../utils/serverSide/firebase";
import { setCORSHeader } from "../../../utils/serverSide/request";
import { createAndUploadThumbnail } from "../../../utils/serverSide/thumbnail";

const LELSCANS_ROOT = "lelscans";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end("Bad method");
  }

  setCORSHeader(res);

  try {
    // ***** 0 - Check input parameters
    const { mangaPath, chapterIndexes } = req.body;

    if (!mangaPath) {
      res.status(400).send("mangaPath undefined.");
      return;
    }
    if (!chapterIndexes) {
      res.status(400).send("chapterIndexes undefined.");
      return;
    }

    // ***** 1 - Read chapter in DB
    const docRef = db
      .collection(LELSCANS_ROOT)
      .doc(mangaPath)
      .collection("chapters")
      .doc("data");
    const snapshot = await docRef.get();
    const chapters = snapshot.data();

    // 1.0 - If one chapter has alreay a thumbnail in DB, exit
    if (chapterIndexes.some((idx) => chapters[idx].thumbnail !== "")) {
      functions.logger.error("At least one chapter has already a thumbnail");
      functions.logger.error("mangaPath", mangaPath);
      functions.logger.error("chapterIndexes", chapterIndexes);
      return res.status(400).send("Has already a thumbnail");
    }

    // ***** 2 - Compute thumbnail
    // 2.0 - Trigger the creation of all thumbnails
    const indexNThumbnail = [];
    const toWait1 = [];
    chapterIndexes.forEach((idx) => {
      toWait1.push(createAndUploadThumbnail(chapters, idx, indexNThumbnail));
    });
    await Promise.all(toWait1);

    // ***** 3 - Update the chapter field in DB to write
    for (const [idx, url] of indexNThumbnail) {
      functions.logger.log(`[thumbnails - create] write ${mangaPath} ${idx}`);
      chapters[idx].thumbnail = url;
    }

    // ***** 4 - Write updated chapter field in DB
    docRef.set(chapters, { merge: true });

    return res.status(200).end("OK");
  } catch (error) {
    functions.logger.error("Error", error);
    console.error("[create]", error);
    return res.status(400).send(error);
  }
};
