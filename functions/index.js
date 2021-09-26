"use strict";

const _ = require("lodash");
const axios = require("axios");
const { parse } = require("node-html-parser");

const fs = require("fs");
const path = require("path");
const os = require("os");
const spawn = require("child-process-promise").spawn;

const admin = require("firebase-admin");
// The Firebase Admin SDK to access Cloud Firestore.
const firebase_tools = require("firebase-tools");
// Cloud Functions
const functions = require("firebase-functions");

admin.initializeApp();

// Cloud Firestore
const db = admin.firestore();

// Cloud Storage
const storage = admin.storage();

const LELSCANS_ROOT = "lelscans";
const FAILED = 42;
const SUCCEED = 666;
const SAME = 0;
const CHANGED = 1;
const LIMIT_MAX_CHAPTER = 8;

/**
 * For a given manga, returns the number of chapter in this manga.
 *
 * @param {String} mangaURL URL of a manga
 */
async function scrapIdxChapters(mangaURL) {
  try {
    const response = await axios.get(mangaURL);

    const data = response.data;
    if (data) {
      const root = parse(data);
      const selectChapters = root
        .querySelector("#header-image")
        .querySelectorAll("select")[0];
      const chapters = selectChapters.querySelectorAll("option");
      const idxChapters = chapters.map((opt) => opt.childNodes[0].rawText);
      return idxChapters;
    } else {
      functions.logger.error("[scrapIdxChapters] data: " + data);
      return FAILED;
    }
  } catch (error) {
    functions.logger.error("[scrapIdxChapters] " + error);
    return FAILED;
  }
}

async function getImageURL(URL) {
  try {
    const response = await axios.get(URL);

    const data = response.data;
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
      functions.logger.error("[getImageURL] data:", data);
      return FAILED;
    }
  } catch (error) {
    functions.logger.error(`[getImageURL] Fail to scrap ${URL}`);
    return FAILED;
  }
}

/**
 * For a given manga and chapter, returns the number of scan in this chapter.
 *
 * @param {String} path URL path for a given manga.
 * @param {Integer} idxChapter index of the chapter to retrieve the number of scan
 */
async function scrapChapterImagesURL(path, idxChapter) {
  try {
    const URL = "https://lelscans.net/scan-" + path + "/" + idxChapter;
    const response = await axios.get(URL);

    const data = response.data;
    if (data) {
      const root = parse(data);

      const chapterURLsPromise = root
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
        .map(async (link) => await getImageURL(link));

      const chapterURLs = await Promise.all(chapterURLsPromise);

      if (chapterURLs.some((res) => res === FAILED)) {
        return FAILED;
      } else {
        return chapterURLs;
      }
    } else {
      functions.logger.error("[scrapChapterImagesURL] Data:", data);
      return FAILED;
    }
  } catch (error) {
    functions.logger.error("[scrapChapterImagesURL] ", error);
    return FAILED;
  }
}

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "256MB",
};

function diffScrapedVsDB(scrapedData, DBData) {
  const dataStillAvailable = _.intersection(scrapedData, DBData);
  const mangaToRemoveFromDB = _.xor(DBData, dataStillAvailable);
  const mangaToAddToDB = _.xor(scrapedData, dataStillAvailable);

  return [mangaToRemoveFromDB, mangaToAddToDB];
}

// // TODO: if there is a thumbnail associated to a chapter,
// // delete the thumbnail as well
// async function updateChaptersCollection(docRef, URL) {
//   try {
//     const scrapedIdx = await scrapIdxChapters(URL);
//     if (scrapedIdx === FAILED) {
//       return FAILED;
//     }

//     const snapshot = await docRef.get();
//     const docData = snapshot.data();

//     // Initialise the 'chapters' var depending if the document is found
//     // in the DB are not
//     let chapters;
//     if (!docData) {
//       chapters = {};
//     } else {
//       chapters = docData.chapters;
//     }

//     const idxInDB = Object.keys(chapters);
//     const [idxToRemove, idxToAdd] = diffScrapedVsDB(scrapedIdx, idxInDB);

//     if (idxToRemove.length === 0 && idxToAdd.length === 0) {
//       return FAILED;
//     } else {
//       // Remove the unavailable chapters
//       for (const idx of idxToRemove) {
//         delete chapters[idx];
//       }

//       // Add the unavailable chapters
//       for (const idx of idxToAdd) {
//         chapters[idx] = { content: [], thumbnail: "" };
//       }

//       return { chapters };
//     }
//   } catch (error) {
//     functions.logger.error("[updateChaptersCollection] " + error);
//     return FAILED;
//   }
// }

async function scrapMangas() {
  try {
    const response = await axios.get("https://lelscans.net");

    const data = response.data;

    const root = parse(data);
    const selectMangas = root
      .querySelector("#header-image")
      .querySelectorAll("select")[1]
      .querySelectorAll("option");

    const scrapedMangas = {};
    for (const opt of selectMangas) {
      const title = opt.childNodes[0].rawText;
      const URL = opt.rawAttrs.split("=")[1].split("'")[1];
      const path = URL.replace(
        "https://lelscans.net/lecture-en-ligne-",
        ""
      ).split(".")[0];
      const thumbnail =
        "https://lelscans.net/mangas/" + path + "/thumb_cover.jpg";
      scrapedMangas[path] = { title, URL, path, thumbnail };
    }

    return scrapedMangas;
  } catch (error) {
    functions.logger.log("[scrapMangas] Cannot get info from lelscans");
    return FAILED;
  }
}

// async function getMangasPathInDB(collRef) {
//   const snapshot = await collRef.get();

//   const mangasPathInDB = [];
//   snapshot.forEach((doc) => {
//     mangasPathInDB.push(doc.id);
//   });

//   return mangasPathInDB;
// }

// /**
//  * Write the title and URL in DB for each manga available on lelscans.
//  */
// exports.mangaTitleSET = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     const scrapedMangas = await scrapMangas();
//     if (scrapedMangas === FAILED) {
//       const errorMsg = "[mangaTitleSET] scrapedMangas() failed.";
//       functions.logger.error(errorMsg);
//       res.status(400).send(errorMsg);
//       return;
//     }

//     const collRef = db.collection(LELSCANS_ROOT);
//     const mangasPathInDB = await getMangasPathInDB(collRef);

//     const scrapedMangasPath = Object.keys(scrapedMangas);
//     const [mangaToRemove, mangaToAdd] = diffScrapedVsDB(
//       scrapedMangasPath,
//       mangasPathInDB
//     );

//     if (mangaToAdd.length !== 0) {
//       functions.logger.info("[mangaTitleSET] mangaToAdd", mangaToAdd);
//     }
//     if (mangaToRemove.length !== 0) {
//       functions.logger.info("[mangaTitleSET] mangaToRemove", mangaToRemove);
//     }

//     // TODO: rewrite from mangasGET example
//     // // Delete manga to remove
//     // for (const mangaPath in mangaToRemove) {
//     //   deletePathDB(LELSCANS_ROOT + "/" + mangaPath);
//     // }

//     // // Add manga to add
//     // let toWait = [];
//     // for (const [path, manga] of Object.entries(scrapedMangas)) {
//     //   const { title, URL, thumbnail } = manga;

//     //   const docRef = collRef.doc(path);

//     //   let objToWrite = {};
//     //   if (mangaToAdd.includes(path)) {
//     //     objToWrite = { title, URL, path, thumbnail };
//     //   }

//     //   if (scrapedMangasPath.includes(path)) {
//     //     const chapters = await updateChaptersCollection(docRef, URL);
//     //     if (chapters !== FAILED) {
//     //       objToWrite = { ...objToWrite, ...chapters };
//     //     }
//     //   }
//     //   toWait.push(docRef.set(objToWrite, { merge: true }));
//     // }
//     // await Promise.all(toWait);

//     res.status(200).send("mangaTitleSET: SUCCESS");
//     return;
//   });

// /**
//  * Write the title and URL in DB for each manga available on lelscans.
//  */
// exports.mangasChaptersGET = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     try {
//       // ***** 0 - Read mangas in DB and returns the result the client
//       console.log("0");
//       const collRef = db.collection(LELSCANS_ROOT);
//       console.log("1");
//       // const snapshot = await collRef.get();
//       console.log("2");
//       const snapshot = await collRef.where("meta", "==", false).get();

//       const mangas = {};
//       console.log("3");
//       snapshot.forEach((doc) => {
//         // if (!/.*_chapters|.*_meta/.test(doc.id)) {
//         console.log("doc.id", doc.id);
//         mangas[doc.id] = doc.data();
//         // }
//       });
//       console.log("4");

//       // // functions.logger.log("[mangasGET] mangas", mangas);

//       // // Add manga to add
//       // let toWait = [];
//       // for (const [path, manga] of Object.entries(mangas)) {
//       //   console.log("path:", path);
//       //   const { chapters } = manga;

//       //   const docRef = collRef.doc(path + "_chapters");
//       //   const meta = false;

//       //   let objToWrite = { chapters, meta };

//       //   toWait.push(docRef.set(objToWrite, { merge: true }));
//       // }
//       // await Promise.all(toWait);
//       // console.log("5");

//       res.status(200).send(mangas);
//       console.log("6");
//     } catch (error) {
//       res.status(400).send(error);
//     }
//   });

// /**
//  * Write the title and URL in DB for each manga available on lelscans.
//  */
// exports.mangasMetaGET = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     try {
//       // ***** 0 - Read mangas in DB and returns the result the client
//       // console.log("0");
//       const collRef = db.collection(LELSCANS_ROOT);

//       // console.log("1");
//       // const snapshot = await collRef.get();
//       // // console.log("2");

//       // // Create a query against the collection.
//       const snapshot = await collRef.where("meta", "==", true).get();
//       // const snapshot = await collRef.where("title", "==", "Beelzebub").get();

//       const mangas = {};
//       // console.log("3");
//       snapshot.forEach((doc) => {
//         // if (!/.*_meta|.*_chapters/.test(doc.id)) {
//         console.log("doc.id", doc.id);
//         mangas[doc.id] = doc.data();
//         // }
//       });

//       res.status(200).send(mangas);
//     } catch (error) {
//       functions.logger.error("Error", error);
//       return res.status(400).send(error);
//     }
//   });

// /**
//  *
//  */
// exports.modifyDB = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     // ***** 0 - Read mangas in DB and returns the result the client
//     const collRef = db.collection(LELSCANS_ROOT);
//     // console.log("functions.config():", functions.config());

//     // const snapshotChapters = await collRef.get();
//     // // const mangas = {};
//     // snapshotChapters.forEach(async (doc) => {
//     //   const newDocId = doc.id.replace("_meta", "");
//     //   // if (!/.*_meta$/.test(doc.id)) {
//     //   //   console.log("[Cloud modifyDB] doc.id:", doc.id);
//     //   //   // //   mangas[docIdChapters] = doc.data();
//     //   //   // // }
//     //   //   // await deletePathDB("/" + doc.id);
//     //   //   // console.log("[Cloud modifyDB] ", doc.id, ": deleted");

//     //   //   collRef
//     //   //     .doc(doc.id)
//     //   //     .delete()
//     //   //     .then(() => {
//     //   //       console.log("[Cloud modifyDB]", doc.id, ": deleted");
//     //   //     })
//     //   //     .catch((error) => {
//     //   //       console.error("Error:", doc.id, " :", error);
//     //   //     });
//     //   // }
//     // });

//     // const snapshotMeta = await collRef.where("meta", "==", true).get();
//     // snapshotMeta.forEach((doc) => {
//     //   const docIdMeta = doc.id;
//     //   // if (docIdMeta !== "gantz_meta") {
//     //   console.log("[Cloud modifyDB] docIdMeta: ", docIdMeta);
//     //   collRef.doc(doc.id).update({
//     //     meta: admin.firestore.FieldValue.delete(),
//     //   });
//     //   // const docIdChapters = docIdMeta.replace("_meta", "_chapters");
//     //   // // console.log("mangas[docIdChapters].chapters: ", {
//     //   // //   ...mangas[docIdChapters].chapters,
//     //   // // });
//     //   // // mangas[docIdMeta] = doc.data();
//     //   // // const docRef = doc.collection("chapters").doc("data");
//     //   // const docRef = collRef.doc(doc.id).collection("chapters").doc("data");
//     //   // docRef.set({
//     //   //   ...mangas[docIdChapters].chapters,
//     //   // });
//     //   // }
//     // });

//     return res.status(200).send("OK");
//   });

// Documentation link:
// https://github.com/firebase/snippets-node/tree/f8236ac5cc5da66842f18cd127ba107ec5d38519/firestore/solution-deletes
// https://stackoverflow.com/questions/64121168/how-to-use-firebase-tools-from-nodejs-script
async function deleteAtPath(path) {
  const cred = admin.app().options.credential;
  if (!cred) {
    throw new Error("Admin credential was undefined");
  }
  const access_token = (await cred.getAccessToken()).access_token;

  functions.logger.log(`[deleteAtPath] Request to delete path ${path}`);

  // Run a recursive delete on the given document or collection path.
  // The 'token' must be set in the functions config, and can be generated
  // at the command line by running 'firebase login:ci'.
  await firebase_tools.firestore.delete(path, {
    project: process.env.GCLOUD_PROJECT,
    recursive: true,
    yes: true,
    token: access_token,
  });

  return {
    path,
  };
}

function setCORSHeader(res) {
  // Set header field to pass CORS security
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
}

async function scrapMangaChaptersFunction(queryPath) {
  // ***** 1 - Read DB to retrieve manga URL and chapters already scraped
  const docRef = db.collection(LELSCANS_ROOT).doc(queryPath);
  const docChapterRef = docRef.collection("chapters").doc("data");

  const docManga = await docRef.get();
  const docChapters = await docChapterRef.get();
  const manga = docManga.data();
  const chapters = docChapters.data();

  // ***** 2 - Scrap chapters indexes
  const { URL } = manga;
  // Attempt to scrap from lelscan multiple time in a row
  let scrapedIdx;
  for (const i in [...Array(5).keys()]) {
    scrapedIdx = await scrapIdxChapters(URL);
    if (scrapedIdx !== FAILED) {
      functions.logger.log(
        `[scrapMangaChaptersFunction] scrapIdxChapters(${URL}) SUCCESS.`
      );
      break;
    }
  }

  if (scrapedIdx === FAILED) {
    functions.logger.error(
      `[scrapMangaChaptersFunction] scrapIdxChapters(${URL}) FAILURE.`
    );
    return [FAILED, "[scrapMangaChaptersFunction] FAILURE"];
  }

  const idxInDB = Object.keys(chapters);
  const [idxToRemove, idxToAdd] = diffScrapedVsDB(scrapedIdx, idxInDB);
  // console.log("idxToRemove", idxToRemove);
  // console.log("idxToAdd", idxToAdd);
  if (idxToRemove.length === 0 && idxToAdd.length === 0) {
    return [SUCCEED, SAME];
  }

  // ***** 3 - Remove the unavailable chapters
  for (const idx of idxToRemove) {
    delete chapters[idx];
  }
  // Delete chapters: without "merge"
  await docChapterRef.set(chapters);

  // ***** 4 - Add the unavailable chapters
  // Limit the number of chapters to add to 8 because of time out limit
  // on Google Cloud function
  console.info(`Number of chapter to scrap: ${idxToAdd.length}`);
  for (const idx of idxToAdd.slice(0, LIMIT_MAX_CHAPTER)) {
    // Scrap images
    let scrapedChapterImagesURL;
    for (const i in [...Array(5).keys()]) {
      scrapedChapterImagesURL = await scrapChapterImagesURL(queryPath, idx);
      if (scrapedChapterImagesURL !== FAILED) {
        functions.logger.log(
          `[scrapMangaChaptersFunction] ${i} scrapChapterImagesURL(${queryPath}, ${idx}) SUCCESS.`
        );
        break;
      }
    }

    if (scrapedChapterImagesURL === FAILED) {
      functions.logger.error(
        `[scrapMangaChaptersFunction] scrapChapterImagesURL(${queryPath}, ${idx}) FAILURE.`
      );
      continue;
    }

    chapters[idx] = { content: scrapedChapterImagesURL, thumbnail: "" };
  }
  // Add chapters: with "merge"
  await docChapterRef.set(chapters, { merge: true });

  return [SUCCEED, CHANGED];
}

/**
 * For a given manga scrap LIMIT_MAX_CHAPTER chapters
 */
exports.scrapMangaChapters = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    // Check the type of request
    if (req.method !== "GET") {
      return res.status("401").send("Unauthorized method");
    }

    setCORSHeader(res);

    try {
      // ***** 0 - Check input parameters of the query
      const queryPath = req.query.path;

      const errors = [];
      if (!queryPath) {
        errors.push("[scrapMangaChapters] queryPath undefined.");
      }

      if (errors.length > 0) {
        functions.logger.error("[scrapMangaChapters] Error", errors);
        return res.status(400).send(errors.join("\n"));
      }

      const [status, message] = await scrapMangaChaptersFunction(queryPath);
      if (status === FAILED) {
        return res.status(400).send(message);
      }

      return res.status(200).send("Chapters scraped.");
    } catch (error) {
      functions.logger.error("Error", error);
      return res.status(400).send(error);
    }
  });

/**
 *
 */
exports.scrapAllMangaChapters = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    // Check the type of request
    if (req.method !== "GET") {
      return res.status("401").send("Unauthorized method");
    }

    setCORSHeader(res);

    try {
      // ***** 0 - Read mangas in DB and returns the result the client
      const collRef = db.collection(LELSCANS_ROOT);
      const snapshot = await collRef.get();

      const mangas = [];
      snapshot.forEach((doc) => {
        mangas.push(doc.id);
      });

      // ***** 1 - Scrap chapters for every manga available in DB
      const toWait = [];
      for (const mangaId of mangas.slice(0, 1)) {
        console.log("mangaId ", mangaId);
        toWait.push(scrapMangaChaptersFunction(mangaId));
      }
      await Promise.all(toWait);

      // Unwrap promises in results
      const results = [];
      for (const item of toWait) {
        results.push(await item);
      }

      const DBhasUpdates = results.some(([status, state]) => {
        return status === SUCCEED && state === CHANGED;
      });

      functions.logger.log(`DBhasUpdates ${DBhasUpdates}`);

      // ***** 2 - If a changed has been made in the DB, redeploy
      if (DBhasUpdates) {
        axios.get(
          "https://api.vercel.com/v1/integrations/deploy/prj_hP1Xmi066dAYkWNKlHVXSMTfCIP0/ltGqfbCEaU"
        );
      }

      return res.status(200).send("All manga chapters scraped.");
    } catch (error) {
      functions.logger.error("Error", error);
      return res.status(400).send(error);
    }
  });

/**
 *
 */
exports.scrapMangas = functions
  .region("europe-west1")
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    // Check the type of request
    if (req.method !== "GET") {
      return res.status("401").send("Unauthorized method");
    }

    setCORSHeader(res);

    try {
      // ***** 0 - Read mangas in DB and returns the result the client
      const collRef = db.collection(LELSCANS_ROOT);
      const snapshot = await collRef.get();

      const mangas = [];
      snapshot.forEach((doc) => {
        mangas.push(doc.id);
      });

      // ***** 1 - Scrapping of manga available
      // Attempt to scrap from lelscan multiple time in a row
      let scrapedMangas;
      for (const i in [...Array(5).keys()]) {
        scrapedMangas = await scrapMangas();
        if (scrapedMangas !== FAILED) {
          functions.logger.log("[mangasGET] scrapedMangas() SUCCESS.");
          break;
        }
      }

      if (scrapedMangas === FAILED) {
        functions.logger.error("[mangasGET] scrapedMangas() FAILURE.");
        res.status(400).send("[mangasGET] FAILURE");
        return;
      }

      const scrapedMangasPath = Object.keys(scrapedMangas);
      const mangasPathInDB = mangas;

      // console.log("[mangasGET] scrapedMangasPath", scrapedMangasPath);
      // console.log("[mangasGET] mangasPathInDB", mangasPathInDB);

      // ***** 2 - Compare scrapped data with the DB. If different, update DB.
      const [mangaToRemove, mangaToAdd] = diffScrapedVsDB(
        scrapedMangasPath,
        mangasPathInDB
      );
      // console.log("[mangasGET] mangaToRemove", mangaToRemove);
      // console.log("[mangasGET] mangaToAdd", mangaToAdd);

      // Delete available manga
      for (const mangaPath of mangaToRemove) {
        try {
          // console.log("Should delete", mangaPath);
          await deleteAtPath("/" + LELSCANS_ROOT + "/" + mangaPath);
        } catch (error) {
          functions.logger.error(`[mangasGET] Delete path ${path} FAILURE`);
          functions.logger.error(error);
          return;
        }
      }

      // Add new manga
      let toWait = [];
      for (const path of mangaToAdd) {
        const mangaDetails = scrapedMangas[path];
        const { title, URL, thumbnail } = mangaDetails;
        const objToWrite = { title, URL, path, thumbnail };
        const docRef = collRef.doc(path);
        toWait.push(docRef.set(objToWrite, { merge: true }));
        const docChapterRef = collRef
          .doc(path)
          .collection("chapters")
          .doc("data");
        toWait.push(docChapterRef.set({}, { merge: true }));
      }
      await Promise.all(toWait);
      return res.status(200).send("Manga scraped.");
    } catch (error) {
      functions.logger.error("Error", error);
      return res.status(400).send(error);
    }
  });

// /**
//  * Write the title and URL in DB for each manga available on lelscans.
//  */
// exports.mangasGET = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     // Check the type of request
//     if (req.method !== "GET") {
//       res.status("401").send("Unauthorized method");
//       return;
//     }

//     setCORSHeader(res);

//     try {
//       // ***** 0 - Read mangas in DB and returns the result the client
//       const collRef = db.collection(LELSCANS_ROOT);
//       const snapshot = await collRef.get();

//       const mangas = {};
//       snapshot.forEach((doc) => {
//         mangas[doc.id] = doc.data();
//       });

//       res.status(200).send(mangas);
//       return;
//     } catch (error) {
//       functions.logger.error("Error", error);
//       return res.status(400).send(error);
//     }
//   });

// async function download(uri, filename) {
//   const writer = fs.createWriteStream(filename);

//   const response = await axios({
//     url: uri,
//     method: "GET",
//     responseType: "stream",
//   });

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on("finish", resolve);
//     writer.on("error", reject);
//   });
// }

// function getFileName(uri) {
//   const splittedUri = uri.split("/");
//   const fileName = splittedUri
//     .slice(splittedUri.length - 3, splittedUri.length)
//     .join("_");

//   return fileName;
// }

// async function createThumbnail(uri) {
//   const fileName = getFileName(uri);
//   const tempFilePath = path.join(os.tmpdir(), fileName);
//   await download(uri, tempFilePath);

//   const subDimensions = "200x200>";

//   const thumbFileName = `thumbnail_${fileName}`;
//   const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
//   await spawn("convert", [
//     tempFilePath,
//     "-thumbnail",
//     subDimensions,
//     thumbFilePath,
//   ]);
//   fs.unlinkSync(tempFilePath);

//   return [thumbFileName, thumbFilePath];
// }

// function isUndefinedOrEmpty(variable) {
//   return variable === "" || variable === undefined;
// }

// exports.computeThumbnail = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Access-Control-Max-Age"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     if (req.method === "OPTIONS") {
//       res.status(200).send("Option OK");
//       return;
//     }

//     try {
//       const params = req.body;

//       // ***** 0 - Check input parameters
//       const { mangaPath, chapterIdx, thumbnailFilename } = params;

//       if (isUndefinedOrEmpty(mangaPath)) {
//         res.status(400).send("mangaPath undefined.");
//         return;
//       }

//       if (isUndefinedOrEmpty(chapterIdx)) {
//         res.status(400).send("chapterIdx undefined.");
//         return;
//       }

//       if (isUndefinedOrEmpty(thumbnailFilename)) {
//         res.status(400).send("thumbnailFilename undefined.");
//         return;
//       }

//       // ***** 1 - Read chapter in DB and returns the result the client
//       const docRef = db.collection(LELSCANS_ROOT).doc(mangaPath);
//       const snapshot = await docRef.get();
//       const dataDoc = snapshot.data();
//       const { chapters: chaptersInDB } = dataDoc;

//       // 1.0 - If chapter has a thumbnail in DB, delete it
//       if (chaptersInDB[chapterIdx].thumbnail !== "") {
//         chaptersInDB[chapterIdx].thumbnail = "";
//       }

//       // ***** 2 - Delete thumbnail in bucket
//       const storageBucket = storage.bucket();
//       try {
//         await storageBucket.file(thumbnailFilename).delete();
//       } catch (error) {
//         functions.logger.log("Cannot delete ", thumbnailFilename);
//         functions.logger.error("Error", error);
//       }

//       // ***** 3 - Compute thumbnail
//       const idxNThumbnail = [];
//       const process = async (idx) => {
//         const uri = chaptersInDB[idx].content[0];
//         const [thumbFileName, thumbFilePath] = await createThumbnail(uri);

//         const storageBucket = storage.bucket();

//         const uploadFile = async (filePath, destFileName) => {
//           const [resUpload] = await storageBucket.upload(filePath, {
//             destination: destFileName,
//             public: true,
//           });

//           const [metadata] = await resUpload.getMetadata();
//           const url = metadata.mediaLink;
//           idxNThumbnail.push([idx, url]);
//         };

//         const destFileName = "thumbnails/" + thumbFileName;
//         await uploadFile(thumbFilePath, destFileName);
//         fs.unlinkSync(thumbFilePath);
//       };

//       await process(chapterIdx);

//       // ***** 4 - Update the chapter field in DB to write
//       for (const [idx, url] of idxNThumbnail) {
//         chaptersInDB[idx].thumbnail = url;
//       }

//       // ***** 5 - Write updated chapter field in DB
//       docRef.set({ chapters: chaptersInDB }, { merge: true });

//       res.status(200).send("Success");
//       return;
//     } catch (error) {
//       functions.logger.error("Error", error);
//       return res.status(400).send(error);
//     }
//   });

// exports.mangaChaptersGET = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     try {
//       // ***** 0 - Check input parameters
//       const queryPath = req.query.path;

//       if (!queryPath) {
//         res.status(400).send("[mangaChaptersGET] queryPath undefined.");
//         return;
//       }

//       // ***** 1 - Read chapter in DB and returns the result the client
//       const docRef = db.collection(LELSCANS_ROOT).doc(queryPath);
//       const snapshot = await docRef.get();
//       const dataDoc = snapshot.data();
//       const { chapters: chaptersInDB } = dataDoc;

//       res.status(200).send(chaptersInDB);

//       // ***** 2 - Create thumbnail for chapters
//       // 2.0 - Collect every chapter where the thumbnail is missing
//       const missingThumbnails = Object.entries(chaptersInDB)
//         .filter(([_, { thumbnail }]) => {
//           return thumbnail.length === 0;
//         })
//         .map(([idx, _]) => idx)
//         .reverse()
//         .slice(0, 2);

//       if (missingThumbnails.length === 0) {
//         return;
//       }

//       // 2.1 - Create the thumbnails with imageMagick and
//       //       upload to default bucket at 'thumbnails/'
//       let toWait = [];
//       const idxNThumbnail = [];
//       missingThumbnails.forEach((idx) => {
//         const process = async (idx) => {
//           const uri = chaptersInDB[idx].content[0];
//           const [thumbFileName, thumbFilePath] = await createThumbnail(uri);

//           const storageBucket = storage.bucket();

//           const uploadFile = async (filePath, destFileName) => {
//             const [resUpload] = await storageBucket.upload(filePath, {
//               destination: destFileName,
//               public: true,
//             });

//             const [metadata] = await resUpload.getMetadata();
//             const url = metadata.mediaLink;
//             idxNThumbnail.push([idx, url]);
//           };

//           const destFileName = "thumbnails/" + thumbFileName;
//           await uploadFile(thumbFilePath, destFileName);
//           fs.unlinkSync(thumbFilePath);
//         };

//         toWait.push(process(idx));
//       });

//       await Promise.all(toWait);

//       // 2.3 - Update the chapter field in DB to write
//       functions.logger.log("idxNThumbnail", idxNThumbnail);
//       for (const [idx, url] of idxNThumbnail) {
//         chaptersInDB[idx].thumbnail = url;
//       }

//       // 2.4 - Write updated chapter field in DB
//       docRef.set({ chapters: chaptersInDB }, { merge: true });
//     } catch (error) {
//       functions.logger.error("Error", error);
//       return res.status(400).send(error);
//     }
//   });

// exports.mangaImagesSET = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     try {
//       const queryPath = req.query.path;
//       const queryIdxChapter = req.query.idxChapter;

//       const errors = [];
//       if (!queryPath) {
//         errors.push("[mangaImagesSET]: queryPath undefined.");
//       }
//       if (!queryIdxChapter) {
//         errors.push("[mangaImagesSET]: queryIdxChapter undefined.");
//       }

//       if (errors.length > 0) {
//         functions.logger.error("[mangaImagesSET]: Error", errors);
//         res.status(400).send(errors.join("</br>"));
//         return;
//       }

//       const scrapedChapterImagesURL = await scrapChapterImagesURL(
//         queryPath,
//         queryIdxChapter
//       );

//       if (scrapedChapterImagesURL === FAILED) {
//         res.status(400).send("mangaImagesSET: Cannot scrap images.");
//       } else {
//         const docRef = db.collection(LELSCANS_ROOT).doc(queryPath);
//         const snapshot = await docRef.get();
//         let { chapters } = snapshot.data();

//         // Update image URL
//         chapters[queryIdxChapter] = {
//           content: scrapedChapterImagesURL,
//           thumbnail: "",
//         };
//         // functions.logger.info("[mangaImagesSET]: queryPath", queryPath);
//         // functions.logger.info("[mangaImagesSET]: queryIdxChapter", queryIdxChapter);
//         // functions.logger.info(
//         //   "[mangaImagesSET]: scrapedChapterImagesURL.length",
//         //   scrapedChapterImagesURL.length
//         // );
//         // const notEmptyChapterIdx = [];
//         // for (const [idx, details] of Object.entries(chapters)) {
//         //   if (details.content.length !== 0) {
//         //     notEmptyChapterIdx.push(idx);
//         //   }
//         // }
//         // functions.logger.info(
//         //   "[mangaImagesSET]: notEmptyChapterIdx",
//         //   notEmptyChapterIdx
//         // );

//         docRef.set({ chapters }, { merge: true });

//         // res.status(200).send(chapters);
//         res.status(200).send(chapters[queryIdxChapter]);
//       }
//     } catch (error) {
//       functions.logger.error("Error", error);
//       return res.status(400).send(error);
//     }
//   });

// exports.createThumbnail = functions
//   .region("europe-west1")
//   .runWith(runtimeOpts)
//   .https.onRequest(async (req, res) => {
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With,content-type"
//     );
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     try {
//       const uri = "https://lelscans.net/mangas/one-piece/680/00.jpg";
//       const splittedUri = uri.split("/");
//       const fileName = splittedUri
//         .slice(splittedUri.length - 3, splittedUri.length)
//         .join("_");

//       // const dir = path.dirname(filePath);
//       // // if (!path.dirname(filePath) === "images/books") return;

//       // // if (filename.startsWith("thumb_"))
//       // //   return functions.logger.log("Image already a thumbnail");

//       // functions.logger.log(fileBucket, filePath, contentType, dir);
//       // bucket = admin.storage().bucket(fileBucket);
//       const tempFilePath = path.join(os.tmpdir(), fileName);

//       await download(uri, tempFilePath);

//       // const result = await exec("identify", ["-format", "%w %h", tempFilePath]);
//       const command = 'identify -format "%w %h" ' + tempFilePath;
//       // functions.logger.log("command", command);
//       const result = await exec(command);
//       const dimensions = result.stdout;
//       // var dimensionsErr = result.stderr;
//       // const [width, height] = dimensions.split(" ").map((x) => Number(x));
//       // functions.logger.log("[width, height]", [width, height]);

//       const divisorFactor = 4;
//       const [shrinkedWidth, shrinkedHeight] = dimensions
//         .split(" ")
//         .map((x) => Math.floor(Number(x) / divisorFactor));
//       functions.logger.log("[shrinkedWidth, shrinkedHeight]", [
//         shrinkedWidth,
//         shrinkedHeight,
//       ]);
//       const subDimensions = shrinkedWidth + "x" + shrinkedHeight + ">";

//       const thumbFileName = `thumbnail_${fileName}`;
//       const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
//       await spawn("convert", [
//         tempFilePath,
//         "-thumbnail",
//         subDimensions,
//         thumbFilePath,
//       ]);

//       // gs://manga-b8fb3.appspot.com
//       // res.status(200).send("[createThumbnail] Ok", fileName);

//       // Points to the root reference
//       // functions.logger.log("storage", storage);
//       const storageBucket = storage.bucket();
//       // const storageRef = admin.firestore().ref();
//       // functions.logger.log("storageBucket  ", storageBucket);

//       const deleteFile = async (fileName) => {
//         await storageBucket.file(fileName).delete();

//         functions.logger.log(`${fileName} deleted`);
//       };

//       // // deleteFile().catch(functions.logger.error);
//       const [files0] = await storageBucket.getFiles();

//       const toWait = [];
//       functions.logger.log("0 Files:");
//       files0.forEach(async (file) => {
//         functions.logger.log(file.name);
//         // await deleteFile(file.name);
//         toWait.push(deleteFile(file.name));
//       });

//       await Promise.all(toWait);
//       // functions.logger.log("After wait all");

//       // const uploadFile = async (filePath, destFileName) => {
//       //   const [resUpload] = await storageBucket.upload(filePath, {
//       //     destination: destFileName,
//       //     public: true,
//       //   });

//       //   functions.logger.log(`${filePath} uploaded to root`);
//       //   const [metadata] = await resUpload.getMetadata();
//       //   functions.logger.log("metadata", metadata);
//       //   const url = metadata.mediaLink;
//       //   functions.logger.log("URL file:", url);
//       // };

//       // const filePath = "/tmp/thumbnail_one-piece_680_00.jpg";
//       // const destFileName = "thumbnails/thumbnail_one-piece_680_00.jpg";
//       // await uploadFile(filePath, destFileName);

//       // const [files1] = await storageBucket.getFiles();

//       // functions.logger.log("1 Files:");
//       // files1.forEach((file) => {
//       //   functions.logger.log(file.name);
//       // });

//       // Points to 'images'
//       // const imagesRef = storageRef.child("images");
//       // const allImages = imagesRef.listAll();
//       // const rootAll = storageRef.listAll();
//       // const rootAll = storage.listAll();
//       // functions.logger.log("[createThumbnail] rootAll", rootAll);

//       // Points to 'images/space.jpg'
//       // Note that you can use variables to create child values
//       // const imageFileName = "space.jpg";
//       // const spaceRef = imagesRef.child(imageFileName);

//       // // File path is 'images/space.jpg'
//       // var path = spaceRef.fullPath;

//       // // File name is 'space.jpg'
//       // var name = spaceRef.name;

//       // // Points to 'images'
//       // var imagesRef = spaceRef.parent;

//       res.status(200).send("OK");
//     } catch (error) {
//       functions.logger.error("Error", error);
//       res.status(400).send(error);
//     }
//   });
