import _ from "lodash";

import probeImage from "./components/ProbeImage";
import LIST_MANGA from "./listManga";

const NOT_EXIST = 0;
const EXIST = 1;

const SEARCH_BEGIN = 0;
const SEARCH_MIDDLE = 1;
const SEARCH_END = 2;
const KEY_ACTION = "action";
const KEY_FIRST_CHAPTER = "firstChapter";
const KEY_LAST_CHAPTER = "lastChapter";
const KEY_MAX_IDX_FOUND = "maxIdxFound";
const KEY_MIN_IDX_NOT_FOUND = "minIdxNotFound";

// export let mangaDict = {};

// DEV INITIALISATION
export let mangaDict = {
  "one-piece": {
    679: 0,
    680: 1,
    850: 1,
    935: 1,
    977: 1,
    987: 1,
    992: 1, //{ maxIdxFound: 15, minIdxNotFound: 16 },
    993: 0,
    995: 0,
    998: 0,
    1020: 0,
    1360: 0,
    action: null,
    firstChapter: 680,
    lastChapter: 992,
  },
};

function isChapterKnown(mangaURL, idxChapter) {
  if (
    mangaDict[mangaURL][idxChapter] === undefined ||
    mangaDict[mangaURL][idxChapter] === EXIST
  ) {
    return false;
  } else if (mangaDict[mangaURL][idxChapter] === NOT_EXIST) {
    return true;
  } else if (
    mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] === undefined ||
    mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND] === undefined
  ) {
    return false;
  } else {
    const maxIdxFound = mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND];
    const minIdxNotFound =
      mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND];
    if (minIdxNotFound - maxIdxFound !== 1) {
      return false;
    } else {
      return true;
    }
  }
}

export function pingMangaDict(mangaURL, idxChapter, idxImage) {
  console.log("PING");
  console.log(mangaDict);
  if (mangaDict[mangaURL] === undefined) {
    discoverManga(mangaURL, null);
  }

  if (!isChapterKnown(mangaURL, idxChapter)) {
    discoverChapter(mangaURL, idxChapter, idxImage, () => {
      discoverChapter(mangaURL, idxChapter + 1, idxImage, () => {
        if (1 < idxChapter) {
          discoverChapter(mangaURL, idxChapter - 1, idxImage);
        }
      });
    });
  }
}

function discoverChapter(mangaURL, idxChapter, idxImage, callback) {
  if (isChapterKnown(mangaURL, idxChapter)) {
    if (callback) {
      callback();
    }
    return;
  }

  // Init the chapter for the search
  if (
    mangaDict[mangaURL][idxChapter] === undefined ||
    mangaDict[mangaURL][idxChapter] === EXIST
  ) {
    mangaDict[mangaURL][idxChapter] = {
      [KEY_MAX_IDX_FOUND]: undefined,
      [KEY_MIN_IDX_NOT_FOUND]: undefined,
    };
  }

  // Update the current known boundary of the chapter
  if (
    mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] === undefined ||
    mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] < idxImage
  ) {
    mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] = idxImage;
  }

  let nextIdxImage = idxImage;
  if (nextIdxImage === 0) {
    nextIdxImage = 1;
  }
  discoverChapterAux(mangaURL, idxChapter, nextIdxImage);

  function discoverChapterAux(mangaURL, idxChapter, idxImage) {
    probeImage(
      { mangaURL, idxChapter, idxImage },
      discoverChapterImageExist,
      discoverChapterImageNotExist
    );
  }

  function discoverChapterImageExist({ mangaURL, idxChapter, idxImage }) {
    if (
      mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] === undefined ||
      mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] < idxImage
    ) {
      mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] = idxImage;
    }

    if (mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND] === undefined) {
      if (idxImage === 0) {
        discoverChapterAux(mangaURL, idxChapter, 1);
      } else {
        const nextIdxImage = idxImage * 2;
        discoverChapterAux(mangaURL, idxChapter, nextIdxImage);
      }
    } else {
      const idxFound = mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND];
      const idxNotFound =
        mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND];
      if (1 < idxNotFound - idxFound) {
        const nextIdxImage = Math.floor((idxNotFound + idxFound) / 2);
        discoverChapterAux(mangaURL, idxChapter, nextIdxImage);
      } else if (1 === idxNotFound - idxFound) {
        // Terminal case: end of chapter found!
        console.log("CHAPTER END AT", idxFound);
        console.log(mangaDict);
        if (callback) {
          callback();
        }
      }
    }
  }

  function discoverChapterImageNotExist({ mangaURL, idxChapter, idxImage }) {
    if (
      mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND] === undefined ||
      idxImage < mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND]
    ) {
      mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND] = idxImage;
    }

    if (mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND] === undefined) {
      if (idxImage === 0) {
        // Chapter doesn't exist
        mangaDict[mangaURL][idxChapter] = NOT_EXIST;
      } else {
        const nextIdxImage = Math.floor(idxImage / 2);
        discoverChapterAux(mangaURL, idxChapter, nextIdxImage);
      }
    } else {
      const idxFound = mangaDict[mangaURL][idxChapter][KEY_MAX_IDX_FOUND];
      const idxNotFound =
        mangaDict[mangaURL][idxChapter][KEY_MIN_IDX_NOT_FOUND];
      if (1 < idxNotFound - idxFound) {
        const nextIdxImage = Math.floor((idxNotFound + idxFound) / 2);
        discoverChapterAux(mangaURL, idxChapter, nextIdxImage);
      } else if (1 === idxNotFound - idxFound) {
        // Terminal case: end of chapter found!
        console.log("CHAPTER", idxChapter, " End at", idxFound);
        console.log(mangaDict);
        if (callback) {
          callback();
        }
      }
    }
  }
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

export function discoverManga(mangaURL, dicoverMangaCallback) {
  if (isMangaKnown(mangaDict[mangaURL])) {
    if (dicoverMangaCallback !== null) {
      dicoverMangaCallback(mangaURL, mangaDict[mangaURL][KEY_LAST_CHAPTER]);
    }
    return;
  }

  let firstIdxChapter = 1;
  const mangaInfo = _.find(LIST_MANGA, (objManga) => objManga.URL === mangaURL);
  if (mangaInfo) {
    firstIdxChapter = mangaInfo.biasFirstIdxChapter;
  }
  // Update the action key for the discovery of this manga
  _.merge(mangaDict, { [mangaURL]: { [KEY_ACTION]: SEARCH_BEGIN } });
  discoverMangaAux(mangaURL, firstIdxChapter);

  function discoverMangaAux(mangaURL, idxChapter) {
    const idxImage = 0;
    probeImage(
      { mangaURL, idxChapter, idxImage },
      discoverMangaImageExist,
      discoverMangaImageNotExist
    );
  }

  let lastIdxChapterFound = null;
  let lastIdxChapterNotFound = null;
  const debug = false;

  function discoverMangaImageExist({ mangaURL, idxChapter, idxImage }) {
    if (idxImage === 0 && mangaDict[mangaURL][idxChapter] === undefined) {
      mangaDict[mangaURL][idxChapter] = EXIST;
    }
    if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_BEGIN) {
      mangaDict[mangaURL][KEY_FIRST_CHAPTER] = idxChapter;
      mangaDict[mangaURL][KEY_ACTION] = SEARCH_MIDDLE;
      lastIdxChapterFound = idxChapter;
      const nextIdxChapter = idxChapter * 2;
      if (debug) {
        console.log("cas 0", mangaDict);
      }
      discoverMangaAux(mangaURL, nextIdxChapter);
    } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_MIDDLE) {
      lastIdxChapterFound = idxChapter;
      const nextIdxChapter = idxChapter * 2;
      if (debug) {
        console.log("cas 1", mangaDict);
      }
      discoverMangaAux(mangaURL, nextIdxChapter);
    } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_END) {
      lastIdxChapterFound = idxChapter;
      if (lastIdxChapterNotFound - lastIdxChapterFound !== 1) {
        const nextIdxChapter = Math.floor(
          (lastIdxChapterNotFound + lastIdxChapterFound) / 2
        );
        if (debug) {
          console.log("cas 2", mangaDict);
        }
        discoverMangaAux(mangaURL, nextIdxChapter);
      } else {
        mangaDict[mangaURL][KEY_LAST_CHAPTER] = lastIdxChapterFound;
        mangaDict[mangaURL][KEY_ACTION] = null;
        if (debug) {
          console.log("cas 3", mangaDict);
        }
        if (dicoverMangaCallback !== null) {
          dicoverMangaCallback(mangaURL, lastIdxChapterFound);
        }
      }
    }
  }

  function discoverMangaImageNotExist({ mangaURL, idxChapter, idxImage }) {
    if (idxImage === 0 && mangaDict[mangaURL][idxChapter] === undefined) {
      mangaDict[mangaURL][idxChapter] = NOT_EXIST;
    }
    if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_BEGIN) {
      const nextIdxChapter = idxChapter + 1;
      if (debug) {
        console.log("cas 4", mangaDict);
      }
      discoverMangaAux(mangaURL, nextIdxChapter);
    } else if (mangaDict[mangaURL][KEY_ACTION] === SEARCH_MIDDLE) {
      mangaDict[mangaURL][KEY_ACTION] = SEARCH_END;
      lastIdxChapterNotFound = idxChapter;
      if (lastIdxChapterNotFound - lastIdxChapterFound !== 1) {
        const nextIdxChapter = Math.floor(
          (lastIdxChapterNotFound + lastIdxChapterFound) / 2
        );
        if (debug) {
          console.log("cas 5", mangaDict);
        }
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
        if (debug) {
          console.log("cas 6", mangaDict);
        }
        discoverMangaAux(mangaURL, nextIdxChapter);
      } else {
        mangaDict[mangaURL][KEY_LAST_CHAPTER] = lastIdxChapterFound;
        mangaDict[mangaURL][KEY_ACTION] = null;
        if (debug) {
          console.log("cas 7", mangaDict);
        }
        if (dicoverMangaCallback !== null) {
          dicoverMangaCallback(mangaURL, lastIdxChapterFound);
        }
      }
    }
  }
}
