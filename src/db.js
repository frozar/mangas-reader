import firebase from "./firebase";
import "firebase/firestore";

import axios from "axios";

const db = firebase.firestore();

const isLocalDev =
  window.location.hostname === "localhost" ||
  /192\.168\.{1}.*/.test(window.location.hostname);

const LOCAL_ADDRESS = "192.168.8.100";

if (isLocalDev) {
  // db.useEmulator("localhost", 8080);
  db.useEmulator(LOCAL_ADDRESS, 8080);
}

export const CLOUD_FUNCTION_ROOT = isLocalDev
  ? // "http://localhost:5001/manga-b8fb3/europe-west1/"
    "http://" + LOCAL_ADDRESS + ":5001/manga-b8fb3/europe-west1/"
  : // "http://" + window.location.hostname + ":5001/manga-b8fb3/europe-west1/"
    "https://europe-west1-manga-b8fb3.cloudfunctions.net/";
// export const CLOUD_FUNCTION_ROOT =
// window.location.hostname === "localhost" ||
// /192\.168\.{1}.*/.test(window.location.hostname)
//   ? "http://localhost:5001/manga-b8fb3/europe-west1/"
//   : "https://europe-west1-manga-b8fb3.cloudfunctions.net/";

const URL_MANGA_IMAGES_SET = CLOUD_FUNCTION_ROOT + "mangaImagesSET";
const URL_MANGAS_GET = CLOUD_FUNCTION_ROOT + "mangasGET";
const URL_MANGA_CHAPTERS_GET = CLOUD_FUNCTION_ROOT + "mangaChaptersGET";
export const LELSCANS_ROOT = "lelscans";

export async function getMangas() {
  const request = await axios.get(URL_MANGAS_GET);
  // console.log("[getMangas] request", request);
  const mangas = request.data;

  return mangas;
}

export async function getMangaChapters(mangaPath) {
  const request = await axios.get(URL_MANGA_CHAPTERS_GET, {
    params: {
      path: mangaPath,
    },
  });
  const chapters = request.data;
  // console.log("[getMangaChapters] request", request);
  // console.log("[getMangaChapters] chapters", chapters);

  return chapters;
}

// export async function getChapters(mangaPath) {
//   const snapshot = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

//   const data = snapshot.data();
//   const { chapters } = data;
//   // console.log("[getChapters] chapters", chapters);

//   return chapters;
// }

export async function getIdxChapters(mangaPath) {
  const snapshot = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

  const data = snapshot.data();
  // const getChapters = await snapshot.get("chapters");
  // console.log("[getIdxChapters] snapshot", snapshot);
  // console.log("[getIdxChapters] mangaPath", mangaPath);
  // console.log("[getIdxChapters] getChapters", getChapters);
  // console.log("[getIdxChapters] data", data);
  const { chapters } = data;
  // console.log("[getIdxChapters] chapters", chapters);
  // console.log("[getIdxChapters] title", title);

  let idxChapters = Object.keys(chapters);
  // snapshot.forEach((doc) => {
  //   idxChapters.push(doc.id);
  // });

  return idxChapters.sort((a, b) => Number(a) - Number(b));
}

export async function getImagesURL(mangaPath, idxChapter) {
  const snapshot = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

  const { chapters } = snapshot.data();
  let imagesURL = chapters[idxChapter].content;
  if (imagesURL.length === 0) {
    const request = await axios.get(URL_MANGA_IMAGES_SET, {
      params: {
        path: mangaPath,
        idxChapter: idxChapter,
      },
    });
    // console.log("[getImagesURL] request.data", request.data);
    imagesURL = request.data.content;
  }
  // console.log("[getImagesURL] imagesURL", imagesURL);

  return imagesURL;
}
