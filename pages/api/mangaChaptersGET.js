import { db } from "../../src/db";
import storage from "../../utils/storage";
import axios from "axios";

import firebase from "firebase/app";
import "firebase/storage";

const fs = require("fs");
const path = require("path");
const os = require("os");
const spawn = require("child-process-promise").spawn;

// const admin = require("firebase-admin");
// admin.initializeApp();

// // Cloud Firestore
// // const db = admin.firestore();

// // Cloud Storage
// const storage = admin.storage();

const LELSCANS_ROOT = "lelscans";

async function download(uri, fileName) {
  console.log("[download] uri", uri);
  console.log("[download] fileName", fileName);
  console.log("[download] typeof uri", typeof uri);
  console.log("[download] typeof fileName", typeof fileName);
  const writer = fs.createWriteStream(fileName);
  // console.log("[download] writer", writer);

  const response = await axios({
    url: uri,
    // url,
    method: "GET",
    responseType: "stream",
    // responseType: "blob", // Important
  });
  // console.log("[download] response", response);

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

    // const subDimensions = "200x200>";
    // const thumbFileName = `thumbnail_${fileName}`;
    // const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
    // console.log("[createThumbnail] thumbFilePath", thumbFilePath);
    // await spawn("convert", [
    //   tempFilePath,
    //   "-thumbnail",
    //   subDimensions,
    //   thumbFilePath,
    // ]);
    // fs.unlinkSync(tempFilePath);

    return [thumbFileName, thumbFilePath];
  } catch (error) {
    console.log("[createThumbnail] error", error);
    return [null, null];
  }
}

// function isUndefinedOrEmpty(variable) {
//   return variable === "" || variable === undefined;
// }

export default async (req, res) => {
  // const storageBucket_ = storage.ref();

  // console.log("storage", storage);
  // res.status(200).send("[mangaChaptersGET] vercel !!!");
  if (req.method !== "GET") {
    return res.status(405).end("Bad method");
  }
  try {
    // ***** 0 - Check input parameters
    const queryPath = req.query.path;
    console.log("queryPath", queryPath);

    if (!queryPath) {
      res.status(400).send("[mangaChaptersGET] queryPath undefined.");
      return;
    }

    // ***** 1 - Read chapter in DB and returns the result the client
    const docRef = db.collection(LELSCANS_ROOT).doc(queryPath);
    const snapshot = await docRef.get();
    const dataDoc = snapshot.data();
    const { chapters: chaptersInDB } = dataDoc;

    res.status(200).send(chaptersInDB);

    // ***** 2 - Create thumbnail for chapters
    // 2.0 - Collect every chapter where the thumbnail is missing
    const missingThumbnails = Object.entries(chaptersInDB)
      .filter(([_, { thumbnail }]) => {
        return thumbnail.length === 0;
      })
      .map(([idx, _]) => idx)
      .reverse()
      .slice(0, 1);
    console.log("missingThumbnails", missingThumbnails);

    if (missingThumbnails.length === 0) {
      return;
    }

    // 2.1 - Create the thumbnails with imageMagick and
    //       upload to default bucket at 'thumbnails/'
    let toWait = [];
    const idxNThumbnail = [];
    console.log("toWait", toWait);

    // const storageBucket = storage.bucket();
    // console.log("storage", storage);
    // const storageInstance = storage();
    // console.log("storageInstance", storageInstance);
    // const storageRef = storage.ref();
    // console.log("storageRef", storageRef);
    // const storageBucket = storage.ref();
    const storageBucket = firebase.storage().ref();
    console.log("storageBucket");

    // Create the file metadata
    const metadata = {
      cacheControl: "public",
      contentType: "image/jpeg",
    };

    console.log("Start storage upload");
    // Upload file and metadata to the object 'images/mountains.jpg'
    const uploadTask = storageBucket
      .child("test/toto.txt")
      .put("/tmp/toto.txt", metadata);
    console.log("Storage upload started");
    console.log("storage.TaskEvent", storage.TaskEvent);
    console.log(
      "storage.TaskEvent.STATE_CHANGED",
      storage.TaskEvent.STATE_CHANGED
    );

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        console.log("Error", error.code);
        // // A full list of error codes is available at
        // // https://firebase.google.com/docs/storage/web/handle-errors
        // switch (error.code) {
        //   case 'storage/unauthorized':
        //     // User doesn't have permission to access the object
        //     break;
        //   case 'storage/canceled':
        //     // User canceled the upload
        //     break;

        //   // ...

        //   case 'storage/unknown':
        //     // Unknown error occurred, inspect error.serverResponse
        //     break;
        // }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("File available at", downloadURL);
        });
      }
    );

    // const uploadFile = async (idx, filePath, destFileName) => {
    //   console.log("[uploadFile] idx", idx);
    //   console.log("[uploadFile] filePath", filePath);
    //   console.log("[uploadFile] destFileName", destFileName);
    //   const [resUpload] = await storageBucket.upload(filePath, {
    //     destination: destFileName,
    //     public: true,
    //   });

    //   const [metadata] = await resUpload.getMetadata();
    //   console.log("[uploadFile] metadata", metadata);
    //   const url = metadata.mediaLink;
    //   console.log("[uploadFile] url", url);
    //   idxNThumbnail.push([idx, url]);
    // };

    // const process = async (idx) => {
    //   const uri = chaptersInDB[idx].content[0];
    //   console.log("[process] idx", idx);
    //   console.log("[process] uri", uri);
    //   const [thumbFileName, thumbFilePath] = await createThumbnail(uri);
    //   console.log("[process] thumbFileName", thumbFileName);

    //   // const destFileName = "thumbnails/" + thumbFileName;
    //   // console.log("[process] destFileName", destFileName);
    //   // await uploadFile(idx, thumbFilePath, destFileName);
    //   // fs.unlinkSync(thumbFilePath);
    // };

    // missingThumbnails.forEach((idx) => {
    //   toWait.push(process(idx));
    // });

    // await Promise.all(toWait);

    // // 2.3 - Update the chapter field in DB to write
    // functions.logger.log("idxNThumbnail", idxNThumbnail);
    // for (const [idx, url] of idxNThumbnail) {
    //   chaptersInDB[idx].thumbnail = url;
    // }

    // // 2.4 - Write updated chapter field in DB
    // docRef.set({ chapters: chaptersInDB }, { merge: true });
  } catch (error) {
    res.status(400).end(error);
  }
};
