import firebase from "./firebase";
import "firebase/firestore";
import "firebase/storage";

import storage from "../utils/storage";
import axios from "axios";

export const db = firebase.firestore();

const useLocalDB = false;
if (useLocalDB) {
  db.useEmulator(LOCAL_ADDRESS, 8080);
}

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

const LOCAL_ADDRESS = "192.168.1.19";
// const LOCAL_ADDRESS = "192.168.30.137";

const CLOUD_FUNCTION_ROOT = process.env.USE_LOCAL_CLOUD_FUNCTION
  ? "http://" + LOCAL_ADDRESS + ":5001/manga-b8fb3/europe-west1/"
  : "https://europe-west1-manga-b8fb3.cloudfunctions.net/";

const URL_MANGA_IMAGES_SET = CLOUD_FUNCTION_ROOT + "mangaImagesSET";
const URL_MANGAS_GET = CLOUD_FUNCTION_ROOT + "mangasGET";
const URL_MANGAS_META_GET = CLOUD_FUNCTION_ROOT + "mangasMetaGET";
const URL_MANGA_CHAPTERS_GET = CLOUD_FUNCTION_ROOT + "mangaChaptersGET";
// TODO: Reuse this cloud function to fix bad thumbnail URL
const URL_COMPUTER_THUMBNAIL = CLOUD_FUNCTION_ROOT + "computeThumbnail";
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

export async function getMangasMeta() {
  try {
    const response = await axios.get(URL_MANGAS_META_GET);
    // console.log("response.status", response.status);
    if (response.status === 400) {
      throw response.statusText;
    }
    const mangas = response.data;
    // console.log("mangas", typeof mangas);
    // console.log("typeof {}", typeof {});

    return mangas;
  } catch (error) {
    // throw new Error("[getMangas] " + error);
    console.error("[getMangasMeta] " + error);
  }
}

export async function getMangaChapters2(mangaPath) {
  console.log("[getMangaChapters2] BEGIN");

  // const response = await axios.get(
  //   "http://localhost:3000/api/mangaChaptersGET",
  //   {
  //     params: {
  //       path: mangaPath,
  //     },
  //   }
  // );
  // const chapters = response.data;
  // // console.log("[getMangaChapters2] chapters", chapters);

  // return chapters;

  // Create the file metadata
  const metadata = {
    cacheControl: "public",
    contentType: "image/jpeg",
  };

  const storageBucket = firebase.storage().ref();
  console.log("storageBucket");

  console.log("Start storage upload");
  // Upload file and metadata to the object 'images/mountains.jpg'
  const uploadTask = storageBucket
    .child("test/toto.txt")
    .put("/tmp/toto.txt", metadata);

  console.log("Storage upload started");
  console.log("storage.TaskEvent", storage.TaskEvent);
  // console.log(
  //   "storage.TaskEvent.STATE_CHANGED",
  //   storage.TaskEvent.STATE_CHANGED
  // );

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    // storage.TaskEvent.STATE_CHANGED
    "state_changed", // or 'state_changed'
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      console.log("snapshot.bytesTransferred", snapshot.bytesTransferred);
      console.log("snapshot.totalBytes", snapshot.totalBytes);
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      // switch (snapshot.state) {
      //   case storage.TaskState.PAUSED: // or 'paused'
      //     console.log("Upload is paused");
      //     break;
      //   case storage.TaskState.RUNNING: // or 'running'
      //     console.log("Upload is running");
      //     break;
      // }
    },
    (error) => {
      console.log("Error", error.code);
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log("File available at", downloadURL);
      });
    }
  );
  return [];

  // const response = await axios({
  //   // url: uri,
  //   url: "https://futurestud.io/images/futurestudio-logo-transparent.png",
  //   // url,
  //   method: "GET",
  //   // responseType: "stream",
  //   responseType: "blob", // Important
  // });
  // console.log("[download] response", response);

  // return {};
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
