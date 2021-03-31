import firebase from "./firebase";
import "firebase/firestore";
// const admin = require('firebase-admin');
// import admin from "firebase-admin";

import axios from "axios";

const db = firebase.firestore();
// admin.initializeApp();
// console.log("process.env.FIREBASE_CONFIG", process.env.FIREBASE_CONFIG);

// Dev environment
export const CLOUD_FUNCTION_ROOT =
  "http://localhost:5001/manga-b8fb3/europe-west1/";
// // Production environment
// const CLOUD_FUNCTION_ROOT = "https://europe-west1-manga-b8fb3.cloudfunctions.net/";

const URL_MANGA_IMAGES_SET = CLOUD_FUNCTION_ROOT + "mangaImagesSET";
export const LELSCANS_ROOT = "lelscans";

export async function getIdxChapters(mangaPath) {
  const snapshot = await db
    .collection(LELSCANS_ROOT)
    .doc(mangaPath)
    .collection("chapters")
    .get();

  let idxChapters = [];
  snapshot.forEach((doc) => {
    idxChapters.push(doc.id);
  });

  return idxChapters.sort((a, b) => Number(a) - Number(b));
}

export async function getLastIdxChapter(mangaPath) {
  const idxChapters = await getIdxChapters(mangaPath);
  return idxChapters.reverse()[0];
}

export async function getImagesURL(mangaPath, idxChapter) {
  const doc = await db
    .collection(LELSCANS_ROOT)
    .doc(mangaPath)
    .collection("chapters")
    .doc(idxChapter)
    .get();

  let imagesURL = doc.data()["URL"];
  if (imagesURL.length === 0) {
    const request = await axios.get(URL_MANGA_IMAGES_SET, {
      params: {
        path: mangaPath,
        idxChapter: idxChapter,
      },
    });
    imagesURL = request.data;
  }

  return imagesURL;
}

export async function getMangas() {
  const snapshot = await db.collection(LELSCANS_ROOT).get();

  let mangas = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    mangas.push(data);
  });

  return mangas.sort((obj1, obj2) => {
    return obj1.title.localeCompare(obj2.title);
  });
}
