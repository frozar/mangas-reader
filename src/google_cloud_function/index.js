"use strict";

// [START functions_helloworld_http]
const axios = require("axios");
const { parse } = require("node-html-parser");
const fs = require("fs");

async function getIdxChapters(mangaURL) {
  const data = await axios
    .get(mangaURL)
    .then(function (response) {
      // console.log("response");
      // console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      // res.send(error);
      return error;
    });

  const root = parse(data);
  // console.log("root");
  const selectChapters = root
    .querySelector("#header-image")
    .querySelectorAll("select")[0];
  const chapters = selectChapters.querySelectorAll("option");
  // console.log(chapters.slice(0, 1));
  // console.log(chapters[0].childNodes[0]);
  const idxChapters = chapters.map((opt) => opt.childNodes[0].rawText);
  return idxChapters;
}

async function getNbImage(path, idxChapter) {
  const URL = "https://lelscan.net/scan-" + path + "/" + idxChapter;
  const data = await axios
    .get(URL)
    .then(function (response) {
      // console.log("response");
      // console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      // res.send(error);
      return error;
    });

  const root = parse(data);
  const imagesLink = root.querySelector("#navigation").querySelectorAll("a");
  const nbImage = imagesLink.length - 3;
  // console.log("nbImage", idxChapter, nbImage);

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

async function getMangas() {
  const data = await axios
    .get("https://lelscan.net/lecture-en-ligne.php")
    .then(function (response) {
      // console.log("response");
      // console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      // res.send(error);
      return error;
    });
  // .then(function (data) {
  // console.log(data);
  const root = parse(data);
  // console.log("root");
  const selectMangas = root
    .querySelector("#header-image")
    .querySelectorAll("select")[1];
  // const chapters = selectChapters.querySelectorAll("option");
  // console.log(chapters.slice(0, 1));
  // console.log(chapters[0].childNodes[0]);
  // const idxChapter = chapters.map((opt) => opt.childNodes[0].rawText);
  // console.log(idxChapter);

  const mangas = selectMangas.querySelectorAll("option");
  // console.log(mangas[0]);
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
        // idxChapters,
        chapters: dict,
      };
    })
  );

  // console.log(objMangas[0]);
  console.log(objMangas);

  // const res = await getDictChaptersNbImage(
  //   objMangas[0].path,
  //   objMangas[0].idxChapters
  // );
  // console.log("res", res);

  // const t = await res.then((content) => {
  //   console.log("content", content);
  //   return content;
  // });
  // console.log("t", t);

  console.log(objMangas);

  return objMangas;
  // res.send("NOTHING\n");
  // res.send(mangas);
  // res.json(JSON.parse({ mangas, chapters }));
  // });
}

// [START functions_helloworld_get]
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
exports.helloGET = async (req, res) => {
  // let objMangas = await getMangas();
  // fs.writeFile("mangas.json", JSON.stringify(objMangas), () => {});

  let objMangas;
  fs.readFile("mangas.json", (err, data) => {
    // if (err) throw err;
    objMangas = JSON.parse(data);
    res.send(objMangas);
    // console.log(objMangas);
  });
  // res.send("NOTHING\n");
  // res.send(objMangas);

  objMangas = await getMangas();
  fs.writeFile("mangas.json", JSON.stringify(objMangas), () => {});
};
// [END functions_helloworld_get]
