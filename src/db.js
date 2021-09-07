// import firebase from "./firebase";
// import "firebase/firestore";
// import "firebase/storage";

// import storage from "../utils/storage";
// import db from "../utils/db";
import { db, LOCAL_ADDRESS } from "../utils/db";
import axios from "axios";

// console.log("GLOBAL SRC/DB.JS: db", db);

// export const db = firebase.firestore();

// const LOCAL_ADDRESS = "192.168.1.19";
// // const LOCAL_ADDRESS = "192.168.30.137";

// const useLocalDB = false;
// if (useLocalDB) {
//   db.useEmulator(LOCAL_ADDRESS, 8080);
// }

// if (process.browser) {
//   // Client-side-only code
// }
// const useLocalCloudFunction =
//   window.location.hostname === "localhost" ||
//   /192\.168\..*/.test(window.location.hostname);
// // const useLocalCloudFunction = true;

// const useLocalCloudFunction = process.browser
//   ? window.location.hostname === "localhost" ||
//     /192\.168\..*/.test(window.location.hostname)
//   : false;

// console.log("process.browser", process.browser);
// console.log("useLocalCloudFunction", useLocalCloudFunction);

// useLocalCloudFunction

const CLOUD_FUNCTION_ROOT = process.env.USE_LOCAL_CLOUD_FUNCTION
  ? "http://" + LOCAL_ADDRESS + ":5001/manga-b8fb3/europe-west1/"
  : "https://europe-west1-manga-b8fb3.cloudfunctions.net/";

// const URL_MANGA_IMAGES_SET = CLOUD_FUNCTION_ROOT + "mangaImagesSET";
// const URL_MANGAS_GET = CLOUD_FUNCTION_ROOT + "mangasGET";
// const URL_MANGAS_META_GET = CLOUD_FUNCTION_ROOT + "mangasMetaGET";
// const URL_MANGA_CHAPTERS_GET = CLOUD_FUNCTION_ROOT + "mangaChaptersGET";
// TODO: Reuse this cloud function to fix bad thumbnail URL
// const URL_COMPUTER_THUMBNAIL = CLOUD_FUNCTION_ROOT + "computeThumbnail";
export const LELSCANS_ROOT = "lelscans";

// const URL_MANGA_IMAGES_SET = 0;
// const URL_MANGAS_GET = 1;
// const URL_MANGAS_META_GET = 2;
// const URL_MANGA_CHAPTERS_GET = 3;
// // TODO: Reuse this cloud function to fix bad thumbnail URL
// const URL_COMPUTER_THUMBNAIL = 4;

// function getCloudFuncURL(cloudFuncId) {
//   let CLOUD_FUNCTION_ROOT =
//     "https://europe-west1-manga-b8fb3.cloudfunctions.net/";
//   console.log("typeof window", typeof window);
//   if (typeof window !== undefined) {
//     const useLocalCloudFunction = process.browser
//       ? window.location.hostname === "localhost" ||
//         /192\.168\..*/.test(window.location.hostname)
//       : false;
//     if (useLocalCloudFunction) {
//       CLOUD_FUNCTION_ROOT =
//         "http://" + LOCAL_ADDRESS + ":5001/manga-b8fb3/europe-west1/";
//     }
//   }
//   console.log("CLOUD_FUNCTION_ROOT", CLOUD_FUNCTION_ROOT);

//   switch (cloudFuncId) {
//     case URL_MANGA_IMAGES_SET:
//       return CLOUD_FUNCTION_ROOT + "mangaImagesSET";
//     case URL_MANGAS_GET:
//       return CLOUD_FUNCTION_ROOT + "mangasGET";
//     case URL_MANGAS_META_GET:
//       return CLOUD_FUNCTION_ROOT + "mangasMetaGET";
//     case URL_MANGA_CHAPTERS_GET:
//       return CLOUD_FUNCTION_ROOT + "mangaChaptersGET";
//     case URL_COMPUTER_THUMBNAIL:
//       return CLOUD_FUNCTION_ROOT + "computeThumbnail";
//   }
// }

// console.log("CLOUD_FUNCTION_ROOT", CLOUD_FUNCTION_ROOT);

export async function getMangas() {
  try {
    // ***** 0 - Read mangas in DB and returns the result the client
    const collRef = db.collection(LELSCANS_ROOT);
    const snapshot = await collRef.get();

    const mangas = {};
    snapshot.forEach((doc) => {
      mangas[doc.id] = doc.data();
    });

    return mangas;
  } catch (error) {
    console.error("[getMangas] " + error);
  }
  // console.log("[getMangas] END");
}

// export async function getMangasMeta() {
//   try {
//     const response = await axios.get(URL_MANGAS_META_GET);
//     // console.log("response.status", response.status);
//     if (response.status === 400) {
//       throw response.statusText;
//     }
//     const mangas = response.data;
//     // console.log("mangas", typeof mangas);
//     // console.log("typeof {}", typeof {});

//     return mangas;
//   } catch (error) {
//     // throw new Error("[getMangas] " + error);
//     console.error("[getMangasMeta] " + error);
//   }
// }

export async function getMangaChapters(mangaPath) {
  // ***** 1 - Read chapter in DB and returns the result the client
  const docRef = db
    .collection(LELSCANS_ROOT)
    .doc(mangaPath)
    .collection("chapters")
    .doc("data");
  const snapshot = await docRef.get();
  // const dataDoc = snapshot.data();
  // const { chapters: chaptersInDB } = dataDoc;
  const chapters = snapshot.data();
  // console.log("chapters", chapters);
  return chapters;

  //   const response = await axios.get(URL_MANGA_CHAPTERS_GET, {
  //     params: {
  //       path: mangaPath,
  //     },
  //   });
  //   const chapters = response.data;

  //   return chapters;
}

// export async function getIdxChapters(mangaPath) {
//   const snapshot = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

//   const data = snapshot.data();
//   // const getChapters = await snapshot.get("chapters");
//   // console.log("[getIdxChapters] snapshot", snapshot);
//   // console.log("[getIdxChapters] mangaPath", mangaPath);
//   // console.log("[getIdxChapters] getChapters", getChapters);
//   // console.log("[getIdxChapters] data", data);
//   const { chapters } = data;
//   // console.log("[getIdxChapters] chapters", chapters);
//   // console.log("[getIdxChapters] title", title);

//   let idxChapters = Object.keys(chapters);
//   // snapshot.forEach((doc) => {
//   //   idxChapters.push(doc.id);
//   // });

//   return idxChapters.sort((a, b) => Number(a) - Number(b));
// }

// export async function getImagesURL(mangaPath, idxChapter) {
//   try {
//     const snapshot = await db.collection(LELSCANS_ROOT).doc(mangaPath).get();

//     const { chapters } = snapshot.data();
//     if (
//       chapters[idxChapter] !== undefined &&
//       chapters[idxChapter].content !== undefined
//     ) {
//       let imagesURL = chapters[idxChapter].content;
//       if (imagesURL.length === 0) {
//         const response = await axios.get(URL_MANGA_IMAGES_SET, {
//           params: {
//             path: mangaPath,
//             idxChapter: idxChapter,
//           },
//         });
//         if (response.status === 400) {
//           throw new Error("[getImagesURL]: " + response.statusText);
//         }
//         imagesURL = response.data.content;
//       }
//       return imagesURL;
//     } else {
//       console.error("[getImagesURL] DB read failed.");
//       return [];
//     }
//   } catch (error) {
//     console.error("[getImagesURL] Error: " + error);
//     return [];
//   }
// }
