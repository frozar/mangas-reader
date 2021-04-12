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
const FAILED = 42;

/**
 * For a given manga, returns the number of chapter in this manga.
 *
 * @param {String} mangaURL URL of a manga
 */
async function scrapIdxChapters(mangaURL) {
  const data = await axios
    .get(mangaURL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("getIdxChapters: Cannot get info from lelscans");
      console.error("mangaURL:", mangaURL);
      console.error("error.code:", error.code);
      return null;
    });

  if (data) {
    const root = parse(data);
    const selectChapters = root
      .querySelector("#header-image")
      .querySelectorAll("select")[0];
    const chapters = selectChapters.querySelectorAll("option");
    const idxChapters = chapters.map((opt) => opt.childNodes[0].rawText);
    return idxChapters;
  } else {
    return null;
  }
}

async function getImageURL(URL) {
  const data = await axios
    .get(URL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("[getImageURL] Cannot get info from lelscans");
      console.error("URL:", URL);
      console.error("error.code:", error.code);
      return null;
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
  // console.log("[scrapChapterImagesURL] path", path);
  // console.log("[scrapChapterImagesURL] idxChapter", idxChapter);
  const URL = "https://lelscans.net/scan-" + path + "/" + idxChapter;
  const data = await axios
    .get(URL)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("getChapterImagesURL: Cannot get info from lelscans");
      console.error("error.code:", error.code);
      return;
    });

  if (data) {
    // console.log("[scrapChapterImagesURL] in if");
    const root = parse(data);
    // Every link which is not a number is filter out
    // const chapterURLs = await Promise.all(
    //   root
    //     .querySelector("#navigation")
    //     .querySelectorAll("a")
    //     .filter((link) => {
    //       const reg = /^\d+$/;
    //       return reg.test(link.childNodes[0].rawText);
    //     })
    //     // Retrieve the URL link of each image of the chapter
    //     .map((link) =>
    //       link.rawAttrs.split(" ")[0].split("=")[1].replace(/['"]+/g, "")
    //     )
    //     .map((link) => getImageURL(link))
    // );

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

    // console.log(
    //   "[scrapChapterImagesURL] chapterURLs.some((res) => res === FAILED)",
    //   chapterURLs.some((res) => res === FAILED)
    // );

    // console.log("[scrapChapterImagesURL] URL", URL);
    if (chapterURLs.some((res) => res === FAILED)) {
      // console.error("[scrapChapterImagesURL] 0 return FAILED");
      return FAILED;
    } else {
      // console.log("[scrapChapterImagesURL] chapterURLs", chapterURLs);
      return chapterURLs;
    }
  } else {
    // console.error("[scrapChapterImagesURL] 1 return FAILED");
    return FAILED;
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

function diffScrapedVsDB(scrapedData, DBData) {
  const dataStillAvailable = _.intersection(scrapedData, DBData);
  const mangaToRemoveFromDB = _.xor(DBData, dataStillAvailable);
  const mangaToAddToDB = _.xor(scrapedData, dataStillAvailable);

  return [mangaToRemoveFromDB, mangaToAddToDB];
}

async function updateChaptersCollection(docRef, URL) {
  const scrapedIdx = await scrapIdxChapters(URL);
  if (scrapedIdx === FAILED) {
    return null;
  }

  const snapshot = await docRef.get();
  const docData = snapshot.data();

  // Initialise the 'chapters' var depending if the document is found
  // in the DB are not
  let chapters;
  if (!docData) {
    chapters = {};
  } else {
    chapters = docData.chapters;
  }

  const idxInDB = Object.keys(chapters);
  const [idxToRemove, idxToAdd] = diffScrapedVsDB(scrapedIdx, idxInDB);

  if (idxToRemove.length === 0 && idxToAdd.length === 0) {
    return null;
  } else {
    // Remove the unavailable chapters
    for (const idx of idxToRemove) {
      delete chapters[idx];
    }

    // Add the unavailable chapters
    for (const idx of idxToAdd) {
      chapters[idx] = { content: [], thumbnail: "" };
    }

    return { chapters };
  }
}

async function scrapMangas() {
  const data = await axios
    .get("https://lelscans.net")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("scrapMangaTitle: Cannot get info from lelscans");
      console.error(error);
      return null;
    });

  if (data === null) {
    return null;
  }

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
    const thumb = "https://lelscans.net/mangas/" + path + "/thumb_cover.jpg";
    scrapedMangas[path] = { title, URL, path, thumb };
  }

  return scrapedMangas;
}

async function getMangasPathInDB(collRef) {
  const snapshot = await collRef.get();

  const mangasPathInDB = [];
  snapshot.forEach((doc) => {
    mangasPathInDB.push(doc.id);
  });

  return mangasPathInDB;
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

    const scrapedMangas = await scrapMangas();
    if (scrapedMangas === null) {
      const errorMsg = "[mangaTitleSET] scrapedMangas() failed.";
      console.error(errorMsg);
      res.status(400).send(errorMsg);
      return;
    }

    const collRef = db.collection(LELSCANS_ROOT);
    const mangasPathInDB = await getMangasPathInDB(collRef);

    const scrapedMangasPath = Object.keys(scrapedMangas);
    const [mangaToRemove, mangaToAdd] = diffScrapedVsDB(
      scrapedMangasPath,
      mangasPathInDB
    );

    if (mangaToAdd.length !== 0) {
      console.info("[mangaTitleSET] mangaToAdd", mangaToAdd);
    }
    if (mangaToRemove.length !== 0) {
      console.info("[mangaTitleSET] mangaToRemove", mangaToRemove);
    }

    // Delete manga to remove
    for (const mangaPath in mangaToRemove) {
      deletePathDB(LELSCANS_ROOT + "/" + mangaPath);
    }

    // Add manga to add
    let toWait = [];
    for (const [path, manga] of Object.entries(scrapedMangas)) {
      const { title, URL, thumb } = manga;

      const docRef = collRef.doc(path);

      let objToWrite = {};
      if (mangaToAdd.includes(path)) {
        objToWrite = { title, URL, path, thumb };
      }

      if (scrapedMangasPath.includes(path)) {
        const chapters = await updateChaptersCollection(docRef, URL);
        objToWrite = { ...objToWrite, ...chapters };
      }
      toWait.push(docRef.set(objToWrite, { merge: true }));
    }
    await Promise.all(toWait);

    res.status(200).send("mangaTitleSET: SUCCESS");
    // return mangaToAdd;
    return true;
  });

/**
 * Write the title and URL in DB for each manga available on lelscans.
 */
exports.mangasGET = functions
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

    // ***** 0 - Read mangas in DB and returns the result the client
    const collRef = db.collection(LELSCANS_ROOT);
    const snapshot = await collRef.get();

    const mangas = {};
    snapshot.forEach((doc) => {
      mangas[doc.id] = doc.data();
    });

    // console.log("[mangasGET] mangas", mangas);
    res.status(200).send(mangas);

    // ***** 1 - Scrapping of manga available
    const scrapedMangas = await scrapMangas();
    if (scrapedMangas === null) {
      const errorMsg = "[mangasGET] scrapedMangas() failed.";
      console.error(errorMsg);
      return;
    }

    const scrapedMangasPath = Object.keys(scrapedMangas);
    const mangasPathInDB = Object.keys(mangas);

    // ***** 2 - Compare scrapped data with the DB. If different, update DB.
    const [mangaToRemove, mangaToAdd] = diffScrapedVsDB(
      scrapedMangasPath,
      mangasPathInDB
    );

    // Delete manga to remove
    for (const mangaPath in mangaToRemove) {
      deletePathDB(LELSCANS_ROOT + "/" + mangaPath);
    }

    // Add manga to add
    let toWait = [];
    for (const [path, manga] of Object.entries(scrapedMangas)) {
      const { title, URL, thumb } = manga;

      const docRef = collRef.doc(path);

      let objToWrite = {};
      if (mangaToAdd.includes(path)) {
        objToWrite = { title, URL, path, thumb };
      }

      const chapters = await updateChaptersCollection(docRef, URL);
      if (chapters !== null) {
        objToWrite = { ...objToWrite, ...chapters };
      }

      if (!_.isEmpty(objToWrite)) {
        toWait.push(docRef.set(objToWrite, { merge: true }));
      }
    }
    await Promise.all(toWait);
  });

async function scrapChapters(path, idxChapter) {
  // const toWait = [];
  // for (const idx of idxChapter) {
  //   // console.log("[mangaChaptersGET] path", path);
  //   // console.log("[mangaChaptersGET] idx", idx);
  //   // const promise = scrapChapterImagesURL(path, idx);
  //   // toWait.push(promise);
  //   toWait.push(scrapChapterImagesURL(path, idx));
  //   // console.log("");
  //   // const chapterURLs = await scrapChapterImagesURL(path, idx);
  //   // toWait.push(chapterURLs);
  // }
  // await Promise.all(toWait);

  // console.log("[scrapChapters] BEFORE Promise.all");
  // const toWait = await Promise.all(
  //   idxChapter.map(async (idx) => await scrapChapterImagesURL(path, idx))
  // );
  // console.log("[scrapChapters] AFTER Promise.all");
  // console.log("[scrapChapters] toWait", toWait);

  const allWait = [];
  const chunkedIdxChapter = _.chunk(idxChapter, 24);
  // console.log(
  //   "[scrapChapters] chunkedIdxChapter.length",
  //   chunkedIdxChapter.length
  // );
  // console.log(
  //   "[scrapChapters] _.flatten(chunkedIdxChapter)",
  //   _.flatten(chunkedIdxChapter)
  // );
  for (let i = 0; i < chunkedIdxChapter.length; ++i) {
    console.info(
      "[scrapChapters]",
      path,
      Math.floor((i / chunkedIdxChapter.length) * 100),
      "%"
    );
    const oneIdxChapter = chunkedIdxChapter[i];
    allWait.push(
      await Promise.all(
        oneIdxChapter.map(async (idx) => await scrapChapterImagesURL(path, idx))
      )
    );
  }
  console.info("[scrapChapters]", path, "100 %");
  const toWait = _.flatten(allWait);
  // console.log("[scrapChapters] toWait", toWait);

  // toWait.map(async (promise) => {
  //   return await promise;
  // });
  // const toWaitValue = [];
  // for (let i = 0; i < toWait.length; ++i) {
  //   toWaitValue.push(await toWait[i]);
  // }
  // console.log("[scrapChapters] toWaitValue", toWaitValue);

  // console.log(
  //   "[scrapChapters] toWait.some((res) => res === FAILED)",
  //   toWait.some((res) => res === FAILED)
  // );

  if (toWait.some((res) => res === FAILED)) {
    console.error("[scrapChapters] return FAILED");
    return FAILED;
  } else {
    const scrapedChapters = {};
    // console.log("[mangaChaptersGET] PASS 2");
    for (let i = 0; i < idxChapter.length; ++i) {
      const idx = idxChapter[i];
      const imagesURL = toWait[i];
      scrapedChapters[idx] = { content: imagesURL, thumbnail: "" };
    }
    // console.log("[scrapChapters] scrapedChapters", scrapedChapters);
    // console.log("[scrapChapters] END");
    return scrapedChapters;
  }
}

exports.mangaChaptersGET = functions
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

    // ***** 0 - Check input parameters
    const queryPath = req.query.path;

    if (!queryPath) {
      res.status(400).send("[mangaChaptersGET] queryPath undefined.");
      return;
    }

    // ***** 1 - Read chapter in DB and returns the result the client
    const docRef = db.collection(LELSCANS_ROOT).doc(queryPath);
    const snapshot = await docRef.get();
    const dataDoc = snapshot.data();
    const { chapters: chaptersInDB } = dataDoc;
    const { lastScrapingDate: lastScrapingDateISOString } = dataDoc;
    // console.log(
    //   "[mangaChaptersGET] lastScrapingDateISOString",
    //   lastScrapingDateISOString
    // );

    res.status(200).send(chaptersInDB);

    const currentScrapingDate = new Date();
    if (lastScrapingDateISOString !== undefined) {
      const lastScrapingDate = new Date(lastScrapingDateISOString);
      const diffTimeInMin = Math.floor(
        (currentScrapingDate.getTime() - lastScrapingDate.getTime()) /
          (1000 * 60)
      );
      // console.log("[mangaChaptersGET] diffTimeInMin", diffTimeInMin);
      if (diffTimeInMin < 60) {
        return;
      }
    }

    // ***** 2 - Scrapping of chapter available
    const idxChapter = Object.keys(chaptersInDB);
    const scrapedChapters = await scrapChapters(queryPath, idxChapter);
    // console.log("[mangaChaptersGET] scrapedChapters", scrapedChapters);
    if (scrapedChapters === FAILED) {
      console.error(
        "[mangaChaptersGET]",
        queryPath,
        ": Cannot scrap chapters."
      );
      return;
    }

    // Filter the thumbnail field because it may change arbitrary
    const filterChapters = (srcChapters) => {
      let filteredChapters = {};
      for (const [idx, obj] of Object.entries(srcChapters)) {
        let filteredObj = {};
        for (const [key, val] of Object.entries(obj)) {
          if (key !== "thumbnail") {
            filteredObj[key] = val;
          }
        }
        filteredChapters[idx] = filteredObj;
      }
      return filteredChapters;
    };

    const chaptersInDBWithoutThumbnail = filterChapters(chaptersInDB);
    const scrapedChaptersWithoutThumbnail = filterChapters(scrapedChapters);

    // ***** 3 - Compare scrapped chapters with the DB. If different, update DB.
    if (
      !_.isEqual(chaptersInDBWithoutThumbnail, scrapedChaptersWithoutThumbnail)
    ) {
      await docRef.set(
        {
          chapters: scrapedChapters,
          lastScrapingDate: currentScrapingDate.toISOString(),
        },
        { merge: true }
      );
    }
  });

exports.mangaChaptersSET = functions
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
    console.log("[mangaChaptersSET] queryPath", queryPath);
    console.log("[mangaChaptersSET] queryIdxChapter", queryIdxChapter);

    // res.status(200).send(queryIdxChapter);
    const errors = [];
    if (!queryPath) {
      errors.push("[mangaChaptersSET]: queryPath undefined.");
    }
    if (!queryIdxChapter) {
      errors.push("[mangaChaptersSET]: queryIdxChapter undefined.");
    }

    if (errors.length > 0) {
      res.send(errors.join("</br>"));
      return;
    }

    let toWait = [];
    for (const idx of queryIdxChapter) {
      console.log("[mangaChaptersSET]: queryPath", queryPath);
      console.log("[mangaChaptersSET]: idx", idx);
      const promise = scrapChapterImagesURL(queryPath, idx);
      toWait.push(promise);
      console.log("");
    }

    try {
      await Promise.all(toWait);
      // console.log("[mangaChaptersSET]: toWait", toWait);

      // console.log("[mangaChaptersSET]: toWait[0]", await toWait[0]);
      const chapters = {};
      for (let i = 0; i < queryIdxChapters.length; ++i) {
        const idx = queryIdxChapter[i];
        const imagesURL = await toWait[i];
        chapters[idx] = imagesURL;
      }

      console.log("[mangaChaptersSET]: chapters", chapters);
      res.status(200).send(chapters);
    } catch {
      res.status(400).send("mangaChaptersSET: Promise execution failed.");
    }

    //   // console.log("[mangaImagesSET] chapterImagesURL", chapterImagesURL);

    //   const snapshot = await db.collection(LELSCANS_ROOT).doc(queryPath).get();
    //   let { chapters } = snapshot.data();

    //   // Update image URL
    //   chapters[queryIdxChapter] = chapterImagesURL;

    //   const doc = await db.collection(LELSCANS_ROOT).doc(queryPath);
    //   doc.set({ chapters }, { merge: true });

    //   // res.status(200).send(chapters);
    //   res.status(200).send(chapters[queryIdxChapter]);
    // } else {
    //   res.status(400).send("mangaChaptersSET: URL not found.");
    // }
  });

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

//     const queryPath = req.query.path;
//     const queryIdxChapter = req.query.idxChapter;
//     // console.log("[mangaImagesSET] queryPath", queryPath);
//     // console.log("[mangaImagesSET] queryIdxChapter", queryIdxChapter);

//     const errors = [];
//     if (!queryPath) {
//       errors.push("[mangaImagesSET]: queryPath undefined.");
//     }
//     if (!queryIdxChapter) {
//       errors.push("[mangaImagesSET]: queryIdxChapter undefined.");
//     }

//     if (errors.length > 0) {
//       res.send(errors.join("</br>"));
//       return;
//     }

//     const queryURL = await getQueryURL(queryPath);
//     if (queryURL) {
//       const chapterImagesURL = await getChapterImagesURL(
//         queryPath,
//         queryIdxChapter
//       );

//       // console.log("[mangaImagesSET] chapterImagesURL", chapterImagesURL);

//       const snapshot = await db.collection(LELSCANS_ROOT).doc(queryPath).get();
//       let { chapters } = snapshot.data();

//       // Update image URL
//       chapters[queryIdxChapter] = chapterImagesURL;

//       const doc = await db.collection(LELSCANS_ROOT).doc(queryPath);
//       doc.set({ chapters }, { merge: true });

//       // res.status(200).send(chapters);
//       res.status(200).send(chapters[queryIdxChapter]);
//     } else {
//       res.status(400).send("mangaImagesSET: URL not found.");
//     }
//   });
