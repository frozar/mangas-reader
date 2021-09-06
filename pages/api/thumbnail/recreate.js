const fs = require("fs");

import { db, storage, functions } from "../../../utils/serverSide/firebase";
import {
  thumbnailURLtoStoragePath,
  createThumbnail,
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

    // ***** 2 - Delete thumbnail in bucket
    const storageBucket = storage.bucket();
    if (chapters[chapterIndex].thumbnail !== "") {
      const thumbnailPath = thumbnailURLtoStoragePath(
        chapters[chapterIndex].thumbnail
      );
      try {
        await storageBucket.file(thumbnailPath).delete();
      } catch (error) {
        functions.logger.error("Cannot delete ", thumbnailPath);
      }
    }

    // 2.0 - If chapter has a thumbnail in DB, delete it
    if (chapters[chapterIndex].thumbnail !== "") {
      chapters[chapterIndex].thumbnail = "";
    }

    // ***** 3 - Compute thumbnail
    const uri = chapters[chapterIndex].content[0];
    const [thumbnailFileName, thumbnailPath] = await createThumbnail(uri);

    const uploadFile = async (filePath, destFileName) => {
      const [resUpload] = await storageBucket.upload(filePath, {
        destination: destFileName,
        public: true,
      });

      const [metadata] = await resUpload.getMetadata();
      const url = metadata.mediaLink;
      functions.logger.log("[recreate] new thumbnail", url);

      return url;
    };

    const destFileName = "thumbnails/" + thumbnailFileName;
    const thumbnailURL = await uploadFile(thumbnailPath, destFileName);
    fs.unlinkSync(thumbnailPath);

    // ***** 4 - Update the chapter field in DB to write
    chapters[chapterIndex].thumbnail = thumbnailURL;

    // ***** 5 - Write updated chapter field in DB
    docRef.set(chapters, { merge: true });

    return res.status(200).send("OK");
  } catch (error) {
    functions.error.log("Error", error);
    return res.status(400).send(error);
  }
};
