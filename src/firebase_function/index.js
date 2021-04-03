/* eslint-disable no-await-in-loop */
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

const LELSCANS_ROOT = "lelscans";

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
      console.error("getIdxChapters: Cannot get info from lelscans", error);
      return;
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
      console.error("getImageURL: Cannot get info from lelscans", error);
      return;
    });

  if (data) {
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
  } else {
    return "";
  }
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
      console.error(
        "getChapterImagesURL: Cannot get info from lelscans",
        error
      );
      return;
    });

  if (data) {
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
  } else {
    return [];
  }
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

async function updateChaptersCollection(docRef, URL, path, chapters) {
  // console.info("[updateChaptersCollection] URL", URL);
  const idxAvailable = await getIdxChapters(URL);
  // console.info("[updateChaptersCollection] idxAvailable", idxAvailable);

  // const docRef = db.collection(LELSCANS_ROOT).doc(path);
  // const snapshot = await db.collection(LELSCANS_ROOT).doc(path).get();
  // const snapshot = await docRef.get();
  // console.log("[updateChaptersCollection] snapshot", snapshot);
  // console.log("[updateChaptersCollection] snapshot.data()", snapshot.data());
  // let { chapters } = snapshot.data();

  // If the 'chapters' field is not defined, initialise the chapters var
  if (!chapters) {
    chapters = {};
  }

  let idxInDB = [];
  if (chapters) {
    idxInDB = Object.keys(chapters);
  }
  // console.log("[updateChaptersCollection] idxInDB", idxInDB);

  const idxStillAvailable = _.intersection(idxAvailable, idxInDB);
  const idxToRemove = _.xor(idxInDB, idxStillAvailable);
  const idxToAdd = _.xor(idxAvailable, idxStillAvailable);

  // console.info("[updateChaptersCollection] idxToRemove", idxToRemove);
  // console.info("[updateChaptersCollection] idxToAdd", idxToAdd);
  // Remove the unavailable chapters
  for (const idx of idxToRemove) {
    delete chapters[idx];
  }

  // Add the unavailable chapters
  for (const idx of idxToAdd) {
    chapters[idx] = [];
  }

  // console.log("[updateChaptersCollection] chapters", chapters);

  // Write the 'chapters' field in the database
  // const doc = db.collection(LELSCANS_ROOT).doc(path);
  //TODO: to remove (just a test)
  // chapters = ["toto"];
  // doc.set({ chapters }, { merge: true });
  // const dbg = ["toto"];
  // const simple = 42;
  // const resSet = await doc.set({ chapters, dbg, simple }, { merge: true });
  // console.log("[updateChaptersCollection] resSet", resSet);

  // const snapshot2 = await db.collection(LELSCANS_ROOT).doc(path).get();
  // console.log("[updateChaptersCollection] snapshot2", snapshot2.data());
  // return docRef.set({ chapters }, { merge: true });
  return { chapters };
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
        console.error("mangaTitleSET: Cannot get info from lelscans", error);
        return;
      });

    if (!data) {
      res.status(400).send("mangaTitleSET: FAILURE");
      return "mangaTitleSET: FAILURE";
    }

    const root = parse(data);
    const selectMangas = root
      .querySelector("#header-image")
      .querySelectorAll("select")[1]
      .querySelectorAll("option");

    // console.info("[mangaTitleSET] selectMangas", selectMangas);

    const snapshot = await db.collection(LELSCANS_ROOT).get();

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
      deletePathDB(LELSCANS_ROOT + mangaPath);
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

      const docRef = db.collection(LELSCANS_ROOT).doc(path);

      // docRef
      //   .get()
      //   .then((doc) => {
      //     if (doc.exists) {
      //       console.log("[mangaAvailable] Document data:", doc.data());
      //     } else {
      //       // doc.data() will be undefined in this case
      //       console.log("[mangaAvailable] No such document!");
      //     }
      //     return true;
      //   })
      //   .catch((error) => {
      //     console.log("[mangaAvailable] Error getting document:", error);
      //     return false;
      //   });

      try {
        const doc = await docRef.get();
        if (doc.exists) {
          // console.log("[mangaAvailable] doc Document data:", doc.data());
          const { chapters } = doc.data();
          if (!chapters) {
            await docRef.set({ chapters: {} });
          }
        } else {
          // doc.data() will be undefined in this case
          // console.log("[mangaAvailable] doc No such document!");
          await docRef.set({ chapters: {} });
        }
      } catch {
        console.error("[mangaAvailable] Error getting document:", error);
        res.status(400).send("mangaTitleSET: FAILED", error);
      }

      let objToWrite = {};
      if (mangaToAdd.includes(path)) {
        // docRef.set({ title, URL, path, thumb }, { merge: true });
        objToWrite = { title, URL, path, thumb };
      }
      // console.log(
      //   "mangaAvailable.includes(path)",
      //   mangaAvailable.includes(path)
      // );
      if (mangaAvailable.includes(path)) {
        // console.log("[mangaTitleSET] path", path);

        const snapshot = await docRef.get();
        // console.log("[mangaTitleSET] snapshot", snapshot);
        // console.log("[mangaTitleSET] snapshot.data()", snapshot.data());
        let { chapters } = snapshot.data();
        // console.log("[mangaTitleSET] chapters", chapters);
        const res = await updateChaptersCollection(docRef, URL, path, chapters);
        // console.log("[mangaTitleSET] res", res);

        // console.log("[mangaTitleSET] objToWrite 0", objToWrite);
        objToWrite = { ...objToWrite, ...res };
        // console.log("[mangaTitleSET] objToWrite 1", objToWrite);
      }
      toWait.push(docRef.set(objToWrite, { merge: true }));
    }
    await Promise.all(toWait);

    // const snapshot2 = await db.collection(LELSCANS_ROOT).doc("gantz").get();
    // console.log("[updateChaptersCollection] snapshot2", snapshot2.data());

    res.status(200).send("mangaTitleSET: SUCCESS");
    // return mangaToAdd;
    return true;
  });

async function getQueryURL(queryPath) {
  const doc = db.collection(LELSCANS_ROOT).doc(queryPath);
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

    const queryPath = req.query.path;
    const queryIdxChapter = req.query.idxChapter;
    // console.log("[mangaImagesSET] queryPath", queryPath);
    // console.log("[mangaImagesSET] queryIdxChapter", queryIdxChapter);

    const errors = [];
    if (!queryPath) {
      errors.push("[mangaImagesSET]: queryPath undefined.");
    }
    if (!queryIdxChapter) {
      errors.push("[mangaImagesSET]: queryIdxChapter undefined.");
    }

    if (errors.length > 0) {
      res.send(errors.join("</br>"));
      return;
    }

    const queryURL = await getQueryURL(queryPath);
    if (queryURL) {
      const chapterImagesURL = await getChapterImagesURL(
        queryPath,
        queryIdxChapter
      );

      // console.log("[mangaImagesSET] chapterImagesURL", chapterImagesURL);

      const snapshot = await db.collection(LELSCANS_ROOT).doc(queryPath).get();
      let { chapters } = snapshot.data();

      // Update image URL
      chapters[queryIdxChapter] = chapterImagesURL;

      const doc = await db.collection(LELSCANS_ROOT).doc(queryPath);
      doc.set({ chapters }, { merge: true });

      res.status(200).send(chapters);
    } else {
      res.status(400).send("mangaImagesSET: URL not found.");
    }
  });
