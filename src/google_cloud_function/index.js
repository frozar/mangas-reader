"use strict";

// [START functions_helloworld_http]
// const { exec } = require("child_process");
const axios = require("axios");
const { parse } = require("node-html-parser");

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
  console.log("root");
  const [selectChapters, selectMangas] = root
    .querySelector("#header-image")
    .querySelectorAll("select");
  const chapters = selectChapters.querySelectorAll("option");
  // console.log(chapters.slice(0, 1));
  // console.log(chapters[0].childNodes[0]);
  const idxChapter = chapters.map((opt) => opt.childNodes[0].rawText);
  // console.log(idxChapter);

  const mangas = selectMangas.querySelectorAll("option");
  // console.log(mangas[0]);
  const objMangas = mangas.map((opt) => {
    return {
      title: opt.childNodes[0].rawText,
      URL: opt.rawAttrs.split("=")[1].split("'")[1],
    };
  });
  // console.log(objMangas);
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
  //   exec("./toRun.sh", (error, stdout, stderr) => {
  //     if (error) {
  //       res.send(error.message);
  //       return;
  //   }
  //   if (stderr) {
  //       res.send(stderr);
  //       return;
  //   }
  //   res.json(JSON.parse(stdout));
  // });
  // res.send(`Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);

  // axios
  //   // .get("https://lelscan.net/lecture-en-ligne-one-piece.php")
  //   .get("https://lelscan.net/lecture-en-ligne.php")
  //   .then(function (response) {
  //     // console.log("response");
  //     // console.log(response.data);
  //     return response.data;
  //   })
  //   .catch(function (error) {
  //     res.send(error);
  //   })
  //   .then(function (data) {
  //     const root = parse(data);
  //     // console.log("root");
  //     const [selectChapters, selectMangas] = root
  //       .querySelector("#header-image")
  //       .querySelectorAll("select");
  //     const chapters = selectChapters.querySelectorAll("option");
  //     // console.log(chapters.slice(0, 1));
  //     // console.log(chapters[0].childNodes[0]);
  //     const idxChapter = chapters.map((opt) => opt.childNodes[0].rawText);
  //     console.log(idxChapter);

  //     const mangas = selectMangas.querySelectorAll("option");
  //     // console.log(mangas[0]);
  //     const objMangas = mangas.map((opt) => {
  //       return {
  //         title: opt.childNodes[0].rawText,
  //         URL: opt.rawAttrs.split("=")[1].split("'")[1],
  //       };
  //     });
  //     console.log(objMangas);
  //     // res.send(mangas);
  //     // res.json(JSON.parse({ mangas, chapters }));
  //   });

  let objMangas = await getMangas();
  // console.log(objMangas);
  console.log(objMangas[0].URL);

  // const idxChapters = await getIdxChapters(objMangas[0].URL);
  objMangas = await Promise.all(
    objMangas.map(async (manga) => {
      const idxChapters = await getIdxChapters(manga.URL);
      // console.log(manga);
      // console.log(idxChapters);
      // const res = { ...manga, idxChapters };
      // // console.log(res);
      // return res;
      return { ...manga, idxChapters };
    })
  );

  console.log(objMangas);
  // res.send("NOTHING\n");
  res.send(objMangas);
  // res.json(JSON.parse(objMangas));
};
// [END functions_helloworld_get]
