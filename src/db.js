import firebase from "./firebase";
import "firebase/firestore";

import axios from "axios";

const db = firebase.firestore();

const LOCAL_ADDRESS = "192.168.30.137";

const useLocalDB = false;
if (useLocalDB) {
  db.useEmulator(LOCAL_ADDRESS, 8080);
}

// const useLocalCloudFunction =
//   window.location.hostname === "localhost" ||
//   /192\.168\.{1}.*/.test(window.location.hostname);
const useLocalCloudFunction = false;

export const CLOUD_FUNCTION_ROOT = useLocalCloudFunction
  ? "http://" + LOCAL_ADDRESS + ":5001/manga-b8fb3/europe-west1/"
  : "https://europe-west1-manga-b8fb3.cloudfunctions.net/";

const URL_MANGA_IMAGES_SET = CLOUD_FUNCTION_ROOT + "mangaImagesSET";
const URL_MANGAS_GET = CLOUD_FUNCTION_ROOT + "mangasGET";
const URL_MANGA_CHAPTERS_GET = CLOUD_FUNCTION_ROOT + "mangaChaptersGET";
export const URL_COMPUTER_THUMBNAIL = CLOUD_FUNCTION_ROOT + "computeThumbnail";
export const LELSCANS_ROOT = "lelscans";

export async function getMangas() {
  try {
    const response = await axios.get(URL_MANGAS_GET);
    if (response.status === 400) {
      throw response.statusText;
    }
    const mangas = response.data;

    return mangas;
  } catch (error) {
    // throw new Error("[getMangas] " + error);
    console.error("[getMangas] " + error);
  }
}

export async function getMangaChapters(mangaPath) {
  const response = await axios.get(URL_MANGA_CHAPTERS_GET, {
    params: {
      path: mangaPath,
    },
  });
  const chapters = response.data;

  return chapters;
}

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
  try {
    const snapshot = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

    const { chapters } = snapshot.data();
    if (
      chapters[idxChapter] !== undefined &&
      chapters[idxChapter].content !== undefined
    ) {
      let imagesURL = chapters[idxChapter].content;
      if (imagesURL.length === 0) {
        const response = await axios.get(URL_MANGA_IMAGES_SET, {
          params: {
            path: mangaPath,
            idxChapter: idxChapter,
          },
        });
        if (response.status === 400) {
          throw new Error("[getImagesURL]: " + response.statusText);
        }
        imagesURL = response.data.content;
      }
      return imagesURL;
    } else {
      console.error("[getImagesURL] DB read failed.");
      return [];
    }
  } catch (error) {
    console.error("[getImagesURL] Error: " + error);
    return [];
  }
}
