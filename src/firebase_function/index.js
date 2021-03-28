const _ = require("lodash");
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const axios = require("axios");
const { parse } = require("node-html-parser");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// The Firebase Admin SDK to access Cloud Firestore.
const firebase_tools = require("firebase-tools");

const LELSCAN_ROOT = "lelscans";

/**
 * For a given manga, returns the number of chapter in this manga.
 *
 * @param {String} mangaURL URL of a manga
 */
async function getIdxChapters(mangaURL) {
  const data = await axios
    .get(mangaURL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("getIdxChapters: Cannot get info from lelscans");
      return error;
    });

  if (!data) {
    return null;
  } else {
    const root = parse(data);
    const selectChapters = root
      .querySelector("#header-image")
      .querySelectorAll("select")[0];
    const chapters = selectChapters.querySelectorAll("option");
    const idxChapters = chapters.map((opt) => opt.childNodes[0].rawText);
    return idxChapters;
  }
}

async function getImageURL(URL) {
  const data = await axios
    .get(URL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("getImageURL: Cannot get info from lelscans");
      return error;
    });

  const root = parse(data);
  const imageURL =
    "https://lelscans.net" +
    root
      .querySelector("#image")
      .querySelector("img")
      .rawAttrs.split(" ")[0]
      .split("=")[1]
      .split("?")[0]
      .replace(/['"]+/g, "");

  return imageURL;
}

/**
 * For a given manga and chapter, returns the number of scan in this chapter.
 *
 * @param {String} path URL path for a given manga.
 * @param {Integer} idxChapter index of the chapter to retrieve the number of scan
 */
async function getChapterImagesURL(path, idxChapter) {
  const URL = "https://lelscans.net/scan-" + path + "/" + idxChapter;
  const data = await axios
    .get(URL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("getChapterImagesURL: Cannot get info from lelscans");
      return error;
    });

  const root = parse(data);
  // Every link which is not a number is filter out
  const chapterURLs = await Promise.all(
    root
      .querySelector("#navigation")
      .querySelectorAll("a")
      .filter((link) => {
        const reg = /^\d+$/;
        return reg.test(link.childNodes[0].rawText);
      })
      // Retrieve the URL link of each image of the chapter
      .map((link) =>
        link.rawAttrs.split(" ")[0].split("=")[1].replace(/['"]+/g, "")
      )
      .map((link) => getImageURL(link))
  );

  return chapterURLs;
}

async function deletePathDB(path) {
  await firebase_tools.firestore.delete(path, {
    project: process.env.GCLOUD_PROJECT,
    recursive: true,
    yes: true,
  });
}

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "256MB",
};

async function updateChaptersCollection(URL, path) {
  console.info("[updateChaptersCollection] URL", URL);
  const idxAvailable = await getIdxChapters(URL);

  const snapshot = await db
    .collection(LELSCAN_ROOT)
    .doc(path)
    .collection("chapters")
    .get();

  let idxInDB = [];
  snapshot.forEach((doc) => {
    idxInDB.push(doc.id);
  });

  const idxStillAvailable = _.intersection(idxAvailable, idxInDB);
  const idxToRemove = _.xor(idxInDB, idxStillAvailable);
  const idxToAdd = _.xor(idxAvailable, idxStillAvailable);

  console.info("[updateChaptersCollection] idxToAdd", idxToAdd);
  // Remove the unavailable chapters
  for (const idx of idxToRemove) {
    db.collection(LELSCAN_ROOT)
      .doc(path)
      .collection("chapters")
      .doc(idx)
      .delete();
  }

  // Add the unavailable chapters
  for (const idx of idxToAdd) {
    const doc = db
      .collection(LELSCAN_ROOT)
      .doc(path)
      .collection("chapters")
      .doc(idx);
    doc.set({ URL: [] }, { merge: true });
  }
}

/**
 * Write the title and URL in DB for each manga available on lelscans.
 */
exports.mangaTitleSET = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);

    const data = await axios
      .get("https://lelscans.net")
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error("mangaTitleSET: Cannot get info from lelscans");
        return error;
      });

    if (!data) {
      res.send("mangaTitleSET: FAILURE");
      return "mangaTitleSET: FAILURE";
    }

    const root = parse(data);
    const selectMangas = root
      .querySelector("#header-image")
      .querySelectorAll("select")[1]
      .querySelectorAll("option");

    console.info("[mangaTitleSET] selectMangas", selectMangas);

    const snapshot = await db.collection(LELSCAN_ROOT).get();

    let mangaInDB = [];
    snapshot.forEach((doc) => {
      mangaInDB.push(doc.id);
    });

    const mangaAvailable = selectMangas.map((opt) => {
      const URL = opt.rawAttrs.split("=")[1].split("'")[1];
      const path = URL.replace(
        "https://lelscans.net/lecture-en-ligne-",
        ""
      ).split(".")[0];
      return path;
    });

    const mangaStillAvailable = _.intersection(mangaAvailable, mangaInDB);
    const mangaToRemove = _.xor(mangaInDB, mangaStillAvailable);
    const mangaToAdd = _.xor(mangaAvailable, mangaStillAvailable);

    if (mangaToRemove.length !== 0) {
      console.info("[mangaTitleSET] mangaToRemove", mangaToRemove);
    }
    // Delete manga to remove
    for (const mangaPath in mangaToRemove) {
      deletePathDB("lelscans" + mangaPath);
    }

    if (mangaToAdd.length !== 0) {
      console.info("[mangaTitleSET] mangaToAdd", mangaToAdd);
    }
    // Add manga to add
    let toWait = [];
    for (const opt of selectMangas) {
      const title = opt.childNodes[0].rawText;
      const URL = opt.rawAttrs.split("=")[1].split("'")[1];
      const path = URL.replace(
        "https://lelscans.net/lecture-en-ligne-",
        ""
      ).split(".")[0];
      const thumb = "https://lelscans.net/mangas/" + path + "/thumb_cover.jpg";

      if (mangaToAdd.includes(path)) {
        const doc = db.collection(LELSCAN_ROOT).doc(path);
        doc.set({ title, URL, path, thumb }, { merge: true });
      }
      if (mangaAvailable.includes(path)) {
        toWait.push(updateChaptersCollection(URL, path));
      }
    }
    await Promise.all(toWait);

    res.send("mangaTitleSET: SUCCESS");
    return "mangaTitleSET";
  });

async function getQueryURL(queryPath) {
  const doc = db.collection(LELSCAN_ROOT).doc(queryPath);
  const readResult = await doc.get();
  let dataManga;
  if (readResult) {
    dataManga = readResult.data();
  }

  let queryURL;
  if (dataManga) {
    queryURL = dataManga.URL;
  }
  return queryURL;
}

exports.mangaImagesSET = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    const queryPath = req.query.path;
    const queryIdxChapter = req.query.idxChapter;

    const queryURL = await getQueryURL(queryPath);

    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    if (queryURL) {
      const chapterImagesURL = await getChapterImagesURL(
        queryPath,
        queryIdxChapter
      );

      const doc = await db
        .collection(LELSCAN_ROOT)
        .doc(queryPath)
        .collection("chapters")
        .doc(queryIdxChapter);
      doc.set({ URL: chapterImagesURL }, { merge: true });

      res.send(chapterImagesURL);
    } else {
      res.send("mangaImagesSET: URL not found.");
    }
  });
