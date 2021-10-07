import { db, functions } from "../../../utils/serverSide/firebase";
import {
  createAndUploadThumbnail,
  deleteThumbnailFromStorage,
} from "../../../utils/serverSide/thumbnail";

const LELSCANS_ROOT = "lelscans";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end("Bad method");
  }

  try {
    // ***** 0 - Check input parameters
    const { mangaPath, chapterIndex } = req.body;
    // console.log("mangaPath, chapterIndex", mangaPath, chapterIndex);

    if (!mangaPath) {
      return res.status(400).send("mangaPath undefined.");
    }
    if (!chapterIndex) {
      return res.status(400).send("chapterIdx undefined.");
    }

    // ***** 1 - Read chapter in DB and returns the result the client
    const docRef = db
      .collection(LELSCANS_ROOT)
      .doc(mangaPath)
      .collection("chapters")
      .doc("data");
    const snapshot = await docRef.get();
    const chapters = snapshot.data();

    const chapterIndexes = [chapterIndex];

    // ***** 2 - Delete thumbnail in bucket
    const toWait0 = [];
    for (const idx of chapterIndexes) {
      toWait0.push(deleteThumbnailFromStorage(chapters, idx));
    }
    await Promise.all(toWait0);
    // 2.0 - If chapter has a thumbnail in DB, delete it
    chapterIndexes.forEach((idx) => {
      if (chapters[idx].thumbnail !== "") {
        chapters[idx].thumbnail = "";
      }
    });

    // ***** 3 - Compute thumbnail
    // 3.0 - Trigger the creation of all thumbnails
    const indexNThumbnail = [];
    const toWait1 = [];
    chapterIndexes.forEach((idx) => {
      toWait1.push(createAndUploadThumbnail(chapters, idx, indexNThumbnail));
    });
    await Promise.all(toWait1);

    // ***** 4 - Update the chapter field in DB to write
    for (const [idx, url] of indexNThumbnail) {
      functions.logger.log(`[thumbnail - recreate] write ${mangaPath} ${idx}`);
      chapters[idx].thumbnail = url;
    }

    // ***** 5 - Write updated chapter field in DB
    docRef.set(chapters, { merge: true });

    return res.status(200).send("OK");
  } catch (error) {
    functions.logger.error("Error", error);
    console.error("[thumbnail-recreate]", error);
    return res.status(400).send(error);
  }
};
