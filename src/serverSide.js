// import firebase from "./firebase";
// import "firebase/firestore";
// import "firebase/storage";

// const admin = require("firebase-admin");
// admin.initializeApp();

// import "firebase/storage";

// // Cloud Storage
// const storage = admin.storage();

// import storage from "../utils/storage";
// import db from "../utils/db";
// import fs from "fs";
// const fs = require("fs");

// export async function getMangaChapters2(mangaPath) {
//   if (typeof windows === "undefined") {
//     // import admin from "./firebaseServerSide";
//     const admin = require("../utils/serverSide/firebase");
//   }
//   // console.log("isServer", isServer);
//   // // const fs = require("fs");
//   // console.log("[getMangaChapters2] BEGIN");
//   // // Create the file metadata
//   // const metadata = {
//   //   cacheControl: "public",
//   //   contentType: "image/jpeg",
//   // };
//   // const metadataText = {
//   //   cacheControl: "public",
//   //   contentType: "text/plain",
//   // };
//   // // const storageBucket = firebase.storage().ref();
//   // // console.log("storageBucket");
//   // console.log("Start storage upload");
//   // let fs;
//   // if (typeof window === "undefined") {
//   //   fs = require("fs");
//   //   const bufferToUpload = fs.readFileSync("tmp/toto.txt");
//   //   console.log("bufferToUpload", bufferToUpload);
//   //   console.log("typeof bufferToUpload", typeof bufferToUpload);
//   //   // Upload file and metadata to the object 'images/mountains.jpg'
//   //   // const fileToUpload = new File(["foo"], "tmp/toto.txt", {
//   //   //   type: "text/plain",
//   //   // });
//   //   // const uploadTask = storageBucket
//   //   //   .child("test/toto.txt")
//   //   //   .put(fileToUpload, metadata);
//   //   // const uploadTask = storageBucket
//   //   //   .child("test/toto.txt")
//   //   //   .put(bufferToUpload, metadataText);
//   //   // const success = await storageBucket
//   //   //   .child("test/toto.txt")
//   //   //   .put(bufferToUpload, metadataText);
//   //   const storage = admin.storage();
//   //   const storageBucket = storage.bucket();
//   //   const filePath = "tmp/toto.txt";
//   //   const destFileName = "test/toto.txt";
//   //   const uploadFile = async (filePath, destFileName) => {
//   //     const [resUpload] = await storageBucket.upload(filePath, {
//   //       destination: destFileName,
//   //       public: true,
//   //     });
//   //     const [metadata] = await resUpload.getMetadata();
//   //     console.log("metadata: ", metadata);
//   //     const url = metadata.mediaLink;
//   //     console.log("url: ", url);
//   //   };
//   //   await uploadFile(filePath, destFileName);
//   //   // console.log("Storage upload started");
//   //   // console.log("storage.TaskEvent", storage.TaskEvent);
//   //   // console.log("uploadTask", uploadTask);
//   //   // // Listen for state changes, errors, and completion of the upload.
//   //   // uploadTask.on(
//   //   //   // storage.TaskEvent.STATE_CHANGED
//   //   //   "state_changed", // or 'state_changed'
//   //   //   (snapshot) => {
//   //   //     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//   //   //     console.log("snapshot.bytesTransferred", snapshot.bytesTransferred);
//   //   //     console.log("snapshot.totalBytes", snapshot.totalBytes);
//   //   //     const progress =
//   //   //       (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//   //   //     console.log("Upload is " + progress + "% done");
//   //   //   },
//   //   //   (error) => {
//   //   //     console.log("Error", error.code);
//   //   //   },
//   //   //   () => {
//   //   //     // Upload completed successfully, now we can get the download URL
//   //   //     uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
//   //   //       console.log("File available at", downloadURL);
//   //   //     });
//   //   //   }
//   //   // );
//   //   return [];
//   // } else {
//   //   return [];
//   // }
// }
