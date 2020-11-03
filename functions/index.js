// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const axios = require("axios");
const { parse } = require("node-html-parser");
const _ = require("lodash");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

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
      console.error("getIdxChapters: Cannot get info from lelscan");
      return error;
    });

  const root = parse(data);
  const selectChapters = root
    .querySelector("#header-image")
    .querySelectorAll("select")[0];
  const chapters = selectChapters.querySelectorAll("option");
  const idxChapters = chapters.map((opt) => opt.childNodes[0].rawText);
  return idxChapters;
}

/**
 * For a given manga and chapter, returns the number of scan in this chapter.
 *
 * @param {String} path URL path for a given manga.
 * @param {Integer} idxChapter index of the chapter to retrieve the number of scan
 */
async function getNbImage(path, idxChapter) {
  const URL = "https://lelscan.net/scan-" + path + "/" + idxChapter;
  const data = await axios
    .get(URL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("getNbImage: Cannot get info from lelscan");
      return error;
    });

  const root = parse(data);
  const imagesLink = root.querySelector("#navigation").querySelectorAll("a");
  const nbImage = imagesLink.length - 3;

  return nbImage;
}

async function getDictChaptersNbImage(path, idxChapters) {
  return idxChapters.reduce(async (acc, idx) => {
    let accContent = await acc;
    const nbImage = await getNbImage(path, idx);
    accContent[idx] = nbImage;
    return accContent;
  }, Promise.resolve({}));
}

async function writeDB(dict) {
  const doc = db.collection("manga").doc("lelscan");
  const readResult = await doc.get();
  if (!readResult) {
    console.log("Write document");
    doc.set(dict);
  } else {
    const data = readResult.data();
    if (data === undefined) {
      doc.set(dict);
    } else if (!_.isEqual(data, dict)) {
      console.log("Update document");
      doc.update(_.merge(data, dict));
    } else {
      console.log("Same data, no update");
    }
  }
}

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "256MB",
};

/**
 * Write the title and URL in DB for each manga available on lelscan.
 */
exports.mangaTitleSET = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    const data = await axios
      .get("https://lelscan.net/lecture-en-ligne.php")
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error("getMangas: Cannot get info from lelscan");
        return error;
      });

    const root = parse(data);
    const selectMangas = root
      .querySelector("#header-image")
      .querySelectorAll("select")[1];

    const mangas = selectMangas.querySelectorAll("option");
    const objMangas = mangas.reduce((acc, opt) => {
      const title = opt.childNodes[0].rawText;
      const URL = opt.rawAttrs.split("=")[1].split("'")[1];
      const path = URL.replace(
        "https://lelscan.net/lecture-en-ligne-",
        ""
      ).split(".")[0];
      acc[path] = { title, URL, path };
      return acc;
    }, {});

    writeDB(objMangas);

    res.json(objMangas);
  });

/**
 * For a given manga, write the number of image available for each chapter on lelscan.
 */
exports.mangaChapterSET = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    const doc = db.collection("manga").doc("lelscan");
    const readResult = await doc.get();
    let dataManga;
    if (readResult) {
      dataManga = readResult.data();
    }

    const queryPath = req.query.path;
    let queryURL;
    if (dataManga) {
      for (const [key, objManga] of Object.entries(dataManga)) {
        const { URL, path } = objManga;
        if (queryPath === path) {
          queryURL = URL;
          break;
        }
      }
    }

    let resDict;
    if (queryURL) {
      let idxChapters = await getIdxChapters(queryURL);
      idxChapters.reverse();
      const dict = await getDictChaptersNbImage(queryPath, idxChapters);
      resDict = { [queryPath]: { chapters: dict } };
      res.send(resDict);
    } else {
      res.send({});
    }

    if (resDict) {
      writeDB(resDict);
    }
  });

/**
 * Read the DB to get all information currently known about lelscan.
 */
exports.mangaGET = functions
  .region("europe-west1")
  .https.onRequest(async (req, res) => {
    const refReadResult = db.collection("manga").doc("lelscan");
    const readResult = await refReadResult.get();
    let data = {};
    if (readResult) {
      if (data) {
        data = readResult.data();
        return res.send(data);
      } else {
        return res.send({});
      }
    } else {
      return res.send({});
    }
  });
