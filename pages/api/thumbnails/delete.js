import { db, storage, functions } from "../../../utils/serverSide/firebase";
import { setCORSHeader } from "../../../utils/serverSide/request";
import { thumbnailURLtoStoragePath } from "../../../utils/serverSide/thumbnail";

const LELSCANS_ROOT = "lelscans";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end("Bad method");
  }

  setCORSHeader(res);

  try {
    // ***** 0 - Check input parameters
    const { mangaPath, chapterIndexes, token } = req.body;

    if (!mangaPath) {
      return res.status(400).send("mangaPath undefined.");
    }
    if (!chapterIndexes) {
      return res.status(400).send("chapterIndexes undefined.");
    }
    if (!token) {
      return res.status(400).send("token undefined.");
    }
    if (token !== process.env.DEV_TOKEN) {
      return res.status(401).send("Unauthorized: wrong token.");
    }

    // ***** 1 - Read chapter in DB
    const docRef = db
      .collection(LELSCANS_ROOT)
      .doc(mangaPath)
      .collection("chapters")
      .doc("data");
    const snapshot = await docRef.get();
    const chapters = snapshot.data();

    // 1.0 - If one chapter doesn't have a thumbnail in DB, exit
    if (chapterIndexes.some((idx) => chapters[idx].thumbnail === "")) {
      functions.logger.error("At least one chapter doesn't have a thumbnail");
      functions.logger.error("mangaPath", mangaPath);
      functions.logger.error("chapterIndexes", chapterIndexes);
      return res.status(400).send("Doesn't have a thumbnail");
    }

    // ***** 2 - Delete thumbnail in bucket
    const storageBucket = storage.bucket();
    try {
      const toWait = [];
      chapterIndexes.forEach((idx) => {
        const process = async (idx) => {
          const thumbnailPath = thumbnailURLtoStoragePath(
            chapters[idx].thumbnail
          );
          await storageBucket.file(thumbnailPath).delete();
        };
        toWait.push(process(idx));
      });
      await Promise.all(toWait);
    } catch (error) {
      functions.logger.error("Deletion of thumbnails failed");
      functions.logger.error("Error", error);
    }

    // ***** 3 - Update the chapter field in DB to write
    chapterIndexes.forEach((idx) => {
      chapters[idx].thumbnail = "";
    });

    // ***** 4 - Write updated chapter field in DB
    docRef.set(chapters, { merge: true });

    return res.status(200).end("OK");
  } catch (error) {
    functions.logger.error("Error", error);
    return res.status(400).send(error);
  }
};
