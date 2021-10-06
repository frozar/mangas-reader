const fs = require("fs");

import { db, storage, functions } from "../../../utils/serverSide/firebase";
import { setCORSHeader } from "../../../utils/serverSide/request";
import {
  thumbnailURLtoStoragePath,
  createThumbnail,
} from "../../../utils/serverSide/thumbnail";

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

    // ***** 2 - Delete thumbnail in bucket
    const storageBucket = storage.bucket();
    const toWait0 = [];
    for (const idx of chapterIndexes) {
      const process = async (idx) => {
        if (chapters[idx].thumbnail !== "") {
          const thumbnailPath = thumbnailURLtoStoragePath(
            chapters[idx].thumbnail
          );
          try {
            await storageBucket.file(thumbnailPath).delete();
          } catch (error) {
            functions.logger.error("Cannot delete ", thumbnailPath);
          }
        }
      };
      toWait0.push(process(idx));
    }
    await Promise.all(toWait0);
    // 2.0 - If chapter has a thumbnail in DB, delete it
    chapterIndexes.forEach((idx) => {
      if (chapters[idx].thumbnail !== "") {
        chapters[idx].thumbnail = "";
      }
    });

    // ***** 3 - Compute thumbnail
    const indexNThumbnail = [];
    const process = async (idx) => {
      const uri = chapters[idx].content[0];
      const [thumbnailFileName, thumbnailPath] = await createThumbnail(uri);

      const uploadFile = async (filePath, destFileName) => {
        const storageBucket = storage.bucket();
        const [resUpload] = await storageBucket.upload(filePath, {
          destination: destFileName,
          public: true,
        });

        const [metadata] = await resUpload.getMetadata();
        const url = metadata.mediaLink;
        functions.logger.log("[create] new thumbnail", url);
        indexNThumbnail.push([idx, url]);
      };

      const destFileName = "thumbnails/" + thumbnailFileName;
      await uploadFile(thumbnailPath, destFileName);
      fs.unlinkSync(thumbnailPath);
    };

    // 3.0 - Trigger the creation of all thumbnails
    const toWait1 = [];
    chapterIndexes.forEach((idx) => {
      toWait1.push(process(idx));
    });
    await Promise.all(toWait1);

    // ***** 4 - Update the chapter field in DB to write
    for (const [idx, url] of indexNThumbnail) {
      chapters[idx].thumbnail = url;
    }

    // ***** 5 - Write updated chapter field in DB
    docRef.set(chapters, { merge: true });

    return res.status(200).end("OK");
  } catch (error) {
    functions.logger.error("Error", error);
    console.error("[thumbnails-recreate]", error);
    return res.status(400).send(error);
  }
};
