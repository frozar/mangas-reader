import firebase from "./firebase";
import "firebase/firestore";

import axios from "axios";

const db = firebase.firestore();

const URL_MANGA_IMAGES_SET =
  "https://europe-west1-manga-b8fb3.cloudfunctions.net/mangaImagesSET";

export async function getIdxChapters(mangaPath) {
  const snapshot = await db
    .collection("lelscan")
    .doc(mangaPath)
    .collection("chapters")
    .get();

  let idxChapters = [];
  snapshot.forEach((doc) => {
    idxChapters.push(doc.id);
  });

  return idxChapters.sort();
}

export async function getLastIdxChapter(mangaPath) {
  const idxChapters = await getIdxChapters(mangaPath);

  return idxChapters.reverse()[0];
}

export async function getImagesURL(mangaPath, idxChapter) {
  const doc = await db
    .collection("lelscan")
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
  const snapshot = await db.collection("lelscan").get();

  let mangas = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    mangas.push(data);
  });

  return mangas.sort((obj1, obj2) => {
    return obj1.title.localeCompare(obj2.title);
  });
}
