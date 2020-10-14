import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import ProbeImage from "./components/ProbeImage";
import LIST_MANGA from "./listManga";

const NOT_EXIST = 0;
const EXIST = 1;

const SEARCH_BEGIN = 0;
const SEARCH_MIDDLE = 1;
const SEARCH_END = 2;
const KEY_ACTION = "action";
const KEY_FOUND = "maxIdxFound";
const KEY_NOT_FOUND = "minIdxNotFound";
const KEY_FIRST_CHAPTER = "firstChapter";
const KEY_LAST_CHAPTER = "lastChapter";

export let mangaDict = {};

export function pingMangaDict(mangaPath, idxChapter, idxImage) {
  // console.log("PING");
}

function isMangaKnown(mangaURLValue) {
  if (mangaURLValue === undefined) {
    return false;
  } else if (
    mangaURLValue[KEY_FIRST_CHAPTER] === undefined ||
    mangaURLValue[KEY_LAST_CHAPTER] === undefined
  ) {
    return false;
  } else {
    return true;
  }
}

export function discoverManga(mangaURL) {
  // console.log("discoverManga", mangaURL);
  if (isMangaKnown(mangaDict[mangaURL])) {
    return;
  }

  let firstIdxChapter = 1;
  const mangaInfo = _.find(LIST_MANGA, (objManga) => objManga.URL === mangaURL);
  if (mangaInfo) {
    firstIdxChapter = mangaInfo.biasFirstIdxChapter;
  }
  // Update the action key for the discovery of this manga
  _.merge(mangaDict, { [mangaURL]: { [KEY_ACTION]: SEARCH_BEGIN } });
  // console.log(mangaDict);
  discoverMangaAux(mangaURL, firstIdxChapter);
}

export function discoverChapter(mangaURL, idxChapter) {
  return true;
}

function discoverMangaAux(mangaURL, idxChapter) {
  const idxImage = 0;
  probeImage({ mangaURL, idxChapter, idxImage });
}

let lastIdxChapterFound = null;
let lastIdxChapterNotFound = null;

function imageExist({ mangaURL, idxChapter, idxImage }) {
  // console.log("imageExist");
  if (idxImage === 0 && mangaDict[mangaURL][idxChapter] === undefined) {
    mangaDict[mangaURL][idxChapter] = EXIST;
  }
  if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_BEGIN) {
    mangaDict[mangaURL][KEY_FIRST_CHAPTER] = idxChapter;
    mangaDict[mangaURL][KEY_ACTION] = SEARCH_MIDDLE;
    lastIdxChapterFound = idxChapter;
    const nextIdxChapter = idxChapter * 2;
    discoverMangaAux(mangaURL, nextIdxChapter);
  } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_MIDDLE) {
    lastIdxChapterFound = idxChapter;
    const nextIdxChapter = idxChapter * 2;
    discoverMangaAux(mangaURL, nextIdxChapter);
  } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_END) {
    lastIdxChapterFound = idxChapter;
    if (lastIdxChapterNotFound - lastIdxChapterFound !== 1) {
      const nextIdxChapter = Math.floor(
        (lastIdxChapterNotFound + lastIdxChapterFound) / 2
      );
      discoverMangaAux(mangaURL, nextIdxChapter);
    } else {
      mangaDict[mangaURL][KEY_LAST_CHAPTER] = idxChapter;
      mangaDict[mangaURL][KEY_ACTION] = null;
    }
  }
}

function imageNotExist({ mangaURL, idxChapter, idxImage }) {
  // console.log("imageNotExist");
  if (idxImage === 0 && mangaDict[mangaURL][idxChapter] === undefined) {
    mangaDict[mangaURL][idxChapter] = NOT_EXIST;
  }
  if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_BEGIN) {
    const nextIdxChapter = idxChapter + 1;
    discoverMangaAux(mangaURL, nextIdxChapter);
  } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_MIDDLE) {
    mangaDict[mangaURL][KEY_ACTION] = SEARCH_END;
    lastIdxChapterNotFound = idxChapter;
    if (lastIdxChapterNotFound - lastIdxChapterFound !== 1) {
      const nextIdxChapter = Math.floor(
        (lastIdxChapterNotFound + lastIdxChapterFound) / 2
      );
      discoverMangaAux(mangaURL, nextIdxChapter);
    } else {
      mangaDict[mangaURL][KEY_LAST_CHAPTER] = idxChapter;
      mangaDict[mangaURL][KEY_ACTION] = null;
    }
  } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_END) {
    lastIdxChapterNotFound = idxChapter;
    if (lastIdxChapterNotFound - lastIdxChapterFound !== 1) {
      const nextIdxChapter = Math.floor(
        (lastIdxChapterNotFound + lastIdxChapterFound) / 2
      );
      discoverMangaAux(mangaURL, nextIdxChapter);
    } else {
      mangaDict[mangaURL][KEY_LAST_CHAPTER] = idxChapter;
      mangaDict[mangaURL][KEY_ACTION] = null;
    }
  }
}

function probeImage(mangaInfo) {
  ReactDOM.render(
    <ProbeImage
      mangaInfo={mangaInfo}
      imageExist={imageExist}
      imageNotExist={imageNotExist}
    />,
    document.querySelector("#probe")
  );
}
