const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const spawn = require("child-process-promise").spawn;

import { db, storage, functions } from "../../utils/serverSide/firebase";

const LELSCANS_ROOT = "lelscans";

async function download(uri, filename) {
  const writer = fs.createWriteStream(filename);

  const response = await axios({
    url: uri,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function getFileName(uri) {
  const splittedUri = uri.split("/");
  const fileName = splittedUri
    .slice(splittedUri.length - 3, splittedUri.length)
    .join("_");

  return fileName;
}

async function createThumbnail(uri) {
  try {
    console.log("[createThumbnail] uri", uri);
    const fileName = getFileName(uri);
    console.log("[createThumbnail] fileName", fileName);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    console.log("[createThumbnail] tempFilePath", tempFilePath);
    await download(uri, tempFilePath);

    const subDimensions = "200x200>";
    const thumbFileName = `thumbnail_${fileName}`;
    const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
    console.log("[createThumbnail] thumbFilePath", thumbFilePath);
    await spawn("convert", [
      tempFilePath,
      "-thumbnail",
      subDimensions,
      thumbFilePath,
    ]);
    fs.unlinkSync(tempFilePath);

    return [thumbFileName, thumbFilePath];
  } catch (error) {
    console.log("[createThumbnail] error", error);
    return [null, null];
  }
}

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).end("Bad method");
  }

  console.log("computeThumbnail");
  // console.log("req", req);
  // console.log("req.method", req.method);
  console.log("req.query", req.query);
  // Cloud Storage
  // const storage = admin.storage();
  // console.log("storage: ", storage);

  // const storage = admin.storage();

  // console.log("process.cwd()", process.cwd());

  // ***** 0 - Check input parameters
  const { mangaPath, chapterIdx, thumbnailFilename } = req.query;

  if (!mangaPath) {
    res.status(400).send("[computeThumbnail] mangaPath undefined.");
    return;
  }
  if (!chapterIdx) {
    res.status(400).send("[computeThumbnail] chapterIdx undefined.");
    return;
  }
  if (!thumbnailFilename) {
    res.status(400).send("[computeThumbnail] thumbnailFilename undefined.");
    return;
  }

  const mangaPathChapters = mangaPath + "_chapters";

  // ***** 1 - Read chapter in DB and returns the result the client
  const docRef = db.collection(LELSCANS_ROOT).doc(mangaPathChapters);
  const snapshot = await docRef.get();
  const dataDoc = snapshot.data();
  const { chapters: chaptersInDB } = dataDoc;

  // 1.0 - If chapter has a thumbnail in DB, delete it
  if (chaptersInDB[chapterIdx].thumbnail !== "") {
    chaptersInDB[chapterIdx].thumbnail = "";
  }

  // ***** 2 - Delete thumbnail in bucket
  const storageBucket = storage.bucket();
  try {
    await storageBucket.file(thumbnailFilename).delete();
  } catch (error) {
    functions.logger.log("Cannot delete ", thumbnailFilename);
    functions.logger.log("Error", error);
  }

  // ***** 3 - Compute thumbnail
  const idxNThumbnail = [];
  const process = async (idx) => {
    const uri = chaptersInDB[idx].content[0];
    const [thumbFileName, thumbFilePath] = await createThumbnail(uri);

    const storageBucket = storage.bucket();

    const uploadFile = async (filePath, destFileName) => {
      const [resUpload] = await storageBucket.upload(filePath, {
        destination: destFileName,
        public: true,
      });

      const [metadata] = await resUpload.getMetadata();
      const url = metadata.mediaLink;
      console.log("New URL: " + url);
      idxNThumbnail.push([idx, url]);
    };

    const destFileName = "thumbnails/" + thumbFileName;
    await uploadFile(thumbFilePath, destFileName);
    fs.unlinkSync(thumbFilePath);
  };

  await process(chapterIdx);

  // ***** 4 - Update the chapter field in DB to write
  for (const [idx, url] of idxNThumbnail) {
    chaptersInDB[idx].thumbnail = url;
  }

  // ***** 5 - Write updated chapter field in DB
  docRef.set({ chapters: chaptersInDB }, { merge: true });

  res.status(200).send("Success");
  return;
  // res.status(200).end("OK");
  // res.status(400).end(error);
};

// // const filePath = "tmp/toto.txt";
// const filePath = "toto.txt";
// const destFileName = "test/toto.txt";
// const uploadFile = async (filePath, destFileName) => {
//   const [resUpload] = await storageBucket.upload(filePath, {
//     destination: destFileName,
//     public: true,
//   });
//   const [metadata] = await resUpload.getMetadata();
//   console.log("metadata: ", metadata);
//   const url = metadata.mediaLink;
//   console.log("url: ", url);
// };
// // await uploadFile(filePath, destFileName);
