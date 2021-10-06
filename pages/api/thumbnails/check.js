import axios from "axios";

import { db, functions } from "../../../utils/serverSide/firebase";
import { setCORSHeader } from "../../../utils/serverSide/request";

import { applicationBaseUrl } from "../../../utils/serverSide/url";

const LELSCANS_ROOT = "lelscans";

async function getMangaChapters(queryPath) {
  // ***** 0 - Read DB to retrieve manga URL and chapters already scraped
  const docRef = db.collection(LELSCANS_ROOT).doc(queryPath);
  const docChapterRef = docRef.collection("chapters").doc("data");

  const docChapters = await docChapterRef.get();
  const chapters = docChapters.data();
  return { [queryPath]: chapters };
}

function oneThumbnailAtLeastIsMissing(chapters) {
  const oneAtLeastIsMissing = Object.values(chapters).some(
    ({ thumbnail }) => thumbnail.length === 0
  );
  return oneAtLeastIsMissing;
}

function computeMissingThumbnails(chapters) {
  const chaptersIdxMissingThumbnail = Object.entries(chapters)
    .map(([idxChapter, { thumbnail }]) => {
      return thumbnail.length === 0 ? idxChapter : null;
    })
    .filter((x) => x);
  return chaptersIdxMissingThumbnail;
}

async function fetchableThumbnail(chapters) {
  const indexesRecomputeThumbnails = [];
  const toWait = [];
  for (const idx of Object.keys(chapters)) {
    const process = async (idx) => {
      try {
        const res = await fetch(chapters[idx].thumbnail);
        if (res.status !== 200) {
          indexesRecomputeThumbnails.push(idx);
        }
      } catch (error) {
        console.error(error);
      }
    };
    toWait.push(process(idx));
  }
  await Promise.all(toWait);
  return indexesRecomputeThumbnails;
}

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).end("Bad method");
  }

  setCORSHeader(res);

  try {
    // ***** 0 - Read chapter in DB: retrive all idManga
    const collRef = db.collection(LELSCANS_ROOT);
    const snapshot = await collRef.get();

    let idsManga = [];
    snapshot.forEach((doc) => {
      idsManga.push(doc.id);
    });

    // ***** 1 - Scrap chapters for every manga available in DB
    const toWait = [];
    for (const idManga of idsManga) {
      toWait.push(getMangaChapters(idManga));
    }
    await Promise.all(toWait);

    // Unwrap promises in results
    const results = [];
    for (const item of toWait) {
      results.push(await item);
    }

    // Take the results in a normal form : {idManga: chapterDetails, ...}
    const mangas = {};
    for (const item of results) {
      for (const [idManga, chapters] of Object.entries(item)) {
        mangas[idManga] = chapters;
      }
    }

    functions.logger.log(`DBG applicationBaseUrl ${applicationBaseUrl}`);
    // Limit the number of thumbnail to (re)generate
    const LIMIT_MAX_THUMBNAIL = 10;
    // ***** 2 - Check every thumbnail
    for (const [idManga, chapters] of Object.entries(mangas)) {
      functions.logger.log(`Check thumbnails for ${idManga}`);
      if (chapters !== {}) {
        if (oneThumbnailAtLeastIsMissing(chapters)) {
          const chapterIndexes = computeMissingThumbnails(chapters).slice(
            0,
            LIMIT_MAX_THUMBNAIL
          );
          axios.post(
            applicationBaseUrl + "/api/thumbnails/create",
            {
              mangaPath: idManga,
              chapterIndexes,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          let chapterIndexes = await fetchableThumbnail(chapters);
          chapterIndexes = chapterIndexes.slice(0, LIMIT_MAX_THUMBNAIL);
          if (chapterIndexes.length !== 0) {
            axios.post(
              applicationBaseUrl + "/api/thumbnails/recreate",
              {
                mangaPath: idManga,
                chapterIndexes,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
      }
    }

    return res.status(200).send("Check thumbnails DONE\n");
  } catch (error) {
    functions.logger.error("Error", error);
    console.error("[check]", error);
    return res.status(400).send(error);
  }
};
