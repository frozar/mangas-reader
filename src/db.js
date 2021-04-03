import firebase from "./firebase";
import "firebase/firestore";

import axios from "axios";

const db = firebase.firestore();
// console.log("process.env.FIREBASE_CONFIG", process.env.FIREBASE_CONFIG);

console.log("window.location.hostname", window.location.hostname);
if (window.location.hostname === "localhost") {
  db.useEmulator("localhost", 8080);
}

// Dev environment
export const CLOUD_FUNCTION_ROOT =
  "http://localhost:5001/manga-b8fb3/europe-west1/";
// // Production environment
// const CLOUD_FUNCTION_ROOT = "https://europe-west1-manga-b8fb3.cloudfunctions.net/";

const URL_MANGA_IMAGES_SET = CLOUD_FUNCTION_ROOT + "mangaImagesSET";
export const LELSCANS_ROOT = "lelscans";

export async function getIdxChapters(mangaPath) {
  // const snapshot = await db
  //   .collection(LELSCANS_ROOT)
  //   .doc(mangaPath)
  //   .collection("chapters")
  //   .get();

  const getOptions = {
    source: "server",
  };

  const snapshot = await db
    .collection(LELSCANS_ROOT)
    .doc(mangaPath)
    .get(getOptions);

  const data = snapshot.data();
  const getChapters = await snapshot.get("chapters");
  console.log("[getIdxChapters] snapshot", snapshot);
  console.log("[getIdxChapters] mangaPath", mangaPath);
  console.log("[getIdxChapters] getChapters", getChapters);
  console.log("[getIdxChapters] data", data);
  const { chapters, title } = data;
  console.log("[getIdxChapters] chapters", chapters);
  console.log("[getIdxChapters] title", title);

  let idxChapters = Object.keys(chapters);
  // snapshot.forEach((doc) => {
  //   idxChapters.push(doc.id);
  // });

  return idxChapters.sort((a, b) => Number(a) - Number(b));
  // return [];
}

export async function getLastIdxChapter(mangaPath) {
  const idxChapters = await getIdxChapters(mangaPath);
  return idxChapters.reverse()[0];
}

export async function getImagesURL(mangaPath, idxChapter) {
  const doc = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

  const { chapters } = doc.data();
  let imagesURL = chapters[idxChapter];
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
    // console.log("[getMangas] data", data);
    mangas.push(data);
  });

  // console.log("[getMangas] db", db);
  // console.log("[getMangas] mangas", mangas);
  return mangas.sort((obj1, obj2) => {
    return obj1.title.localeCompare(obj2.title);
  });
}
