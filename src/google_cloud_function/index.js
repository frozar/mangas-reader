"use strict";

const axios = require("axios");
const { parse } = require("node-html-parser");
const fs = require("fs");

const CACHE_FILE_NAME = "mangas.json";

/**
 * For a given manga, returns the number of chapter in this manga.
 *
 * @param {String} mangaURL URL of a manga
 */
async function getIdxChapters(mangaURL) {
  const data = await axios
    .get(mangaURL)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
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
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
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

/**
 * Makes requests to lelscan.net to retrieve all information about every
 * manga available on the site. Returns a JS object with every information.
 */
async function getMangas() {
  console.log("BEGIN getMangas");
  const data = await axios
    .get("https://lelscan.net/lecture-en-ligne.php")
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error("getMangas: Cannot get info from lelscan");
      return error;
    });

  const root = parse(data);
  const selectMangas = root
    .querySelector("#header-image")
    .querySelectorAll("select")[1];

  const mangas = selectMangas.querySelectorAll("option");
  let objMangas = await Promise.all(
    mangas.map(async (opt) => {
      const URL = opt.rawAttrs.split("=")[1].split("'")[1];
      const path = URL.replace(
        "https://lelscan.net/lecture-en-ligne-",
        ""
      ).split(".")[0];
      let idxChapters = await getIdxChapters(URL);
      idxChapters.reverse();
      const dict = await getDictChaptersNbImage(path, idxChapters);
      return {
        title: opt.childNodes[0].rawText,
        URL,
        path,
        chapters: dict,
      };
    })
  );

  console.log("END getMangas");
  return objMangas;
}

/**
 * HTTP Cloud Function.
 * This function is exported by index.js, and is executed when
 * you make an HTTP request to the deployed function's endpoint.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.mangaGET = async (req, res) => {
  // Read information about manga from the cache file
  let objMangas;
  fs.readFile(CACHE_FILE_NAME, (err, data) => {
    if (err) {
      res.send(err);
      throw err;
    }
    objMangas = JSON.parse(data);
    res.send(objMangas);
  });

  // Update the cache file which store information about manga from lelscan
  objMangas = await getMangas();
  fs.writeFile(CACHE_FILE_NAME, JSON.stringify(objMangas, null, 4), () => {});
};
