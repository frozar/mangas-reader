import React, { useState, useEffect, useCallback, useRef } from "react";
import _ from "lodash";
import { useSpring } from "react-spring";
import { Helmet } from "react-helmet";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  useHistory,
} from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import { getMangaChapters } from "../src/db";
import TopBar from "../src/scanViewer/TopBar";
import DisplayImage from "../src/scanViewer/DisplayImage";
import ImageCaption from "../src/scanViewer/ImageCaption";
import ControlBar from "../src/scanViewer/ControlBar";

const useStyles = makeStyles(() => ({
  flashScreen: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: "100%",
    zIndex: 1,
    // Dark background
    background: "#FFFF",
  },
  flashScreenTransition: {
    transition: "background 0.5s",
    background: "#FFF0",
  },
}));

/**
 * Just hand the first routing access to the 'view' component.
 *
 * @returns
 */
export default function view() {
  return (
    <Router>
      <Switch>
        <Route
          path="/v/:idManga/:idChapter/:idScan"
          children={<ViewDetail />}
        />
      </Switch>
    </Router>
  );
}

function isUndefinedOrNull(val) {
  return val === undefined || val === null;
}

const defaultIdManga = "one-piece";

function computeLink(idManga, idChapter, idScan) {
  return `/v/${idManga}/${idChapter}/${idScan}`;
}

/**
 * For the input hashmap 'chapters' of the form {idxChapter: chapterDetails, ..},
 * returns the greatest idxChapter. NB, idxChapter are string.
 *
 * @param {object} chapters
 * @returns the greatest index chapter.
 */
function getLatestChapterIndex(chapters) {
  const chaptersIndex = Object.keys(chapters).sort((k0, k1) => {
    return Number(k0) - Number(k1);
  });
  return chaptersIndex[chaptersIndex.length - 1];
}

/**
 * Checks if the input idManga, idChapter and isScan are valid.
 * If idManga is not valid, takes the default idManga ("one-piece").
 * If idChapter is not valid, takes the latest chapter index.
 * If idScan is not valid, takes "0" as idScan.
 *
 * @param {string} idManga
 * @param {string} idChapter
 * @param {string} idScan
 * @returns an array of [chapters, idManga, idChapter, idScan] valid.
 */
async function checkScanAddress(idManga, idChapter, idScan) {
  let idManga_ = null;
  let idChapter_ = null;
  let idScan_ = null;

  // Sanity check on idManga
  let chapters_ = await getMangaChapters(idManga);
  if (chapters_ === undefined) {
    const chaptersDefault = await getMangaChapters(defaultIdManga);
    const latestChapterIndex = getLatestChapterIndex(chaptersDefault);
    const idScanDefault = "0";
    return [chaptersDefault, defaultIdManga, latestChapterIndex, idScanDefault];
  } else {
    idManga_ = idManga;
  }

  // Sanity check on idChapter
  if (
    typeof idChapter !== "string" ||
    isNaN(Number(idChapter)) ||
    chapters_[idChapter] === undefined
  ) {
    const latestChapterIndex = getLatestChapterIndex(chapters_);
    const idScanDefault = "0";
    return [chapters_, idManga_, latestChapterIndex, idScanDefault];
  } else {
    idChapter_ = idChapter;
  }

  // Sanity check on idScan
  if (
    typeof idScan !== "string" ||
    isNaN(Number(idScan)) ||
    chapters_[idChapter_].content[Number(idScan)] === undefined
  ) {
    const idScanDefault = "0";
    return [chapters_, idManga_, idChapter_, idScanDefault];
  } else {
    idScan_ = idScan;
  }

  return [chapters_, idManga_, idChapter_, idScan_];
}

function computePreviousLink(idManga, idChapter, idScan, chapters) {
  const chapter = chapters[idChapter];

  const scanIdx = Object.keys(chapter.content)
    .map((n) => Number(n))
    .sort((a, b) => a - b);
  const isFirstIdScan = scanIdx[0] === Number(idScan);

  const chaptersIdx = Object.keys(chapters)
    .map((n) => Number(n))
    .sort((a, b) => a - b);
  const currentIdxChapter = chaptersIdx.indexOf(Number(idChapter));
  const isFirstChapter = 0 === currentIdxChapter;

  // Create the previous and next link considering the current scan
  // Handle the edge cases
  let previousLink = null;
  let previousIdChapter = null;
  let previousIdScan = null;

  if (!isFirstIdScan) {
    previousIdChapter = idChapter;
    previousIdScan = Number(idScan) - 1;
    previousLink = `/v/${idManga}/${previousIdChapter}/${previousIdScan}`;
  } else {
    if (!isFirstChapter) {
      previousIdChapter = String(chaptersIdx[currentIdxChapter - 1]);
      previousIdScan = chapters[previousIdChapter].content.length - 1;
      previousLink = `/v/${idManga}/${previousIdChapter}/${previousIdScan}`;
    }
  }

  return [previousLink, previousIdChapter, previousIdScan];
}

function computeNextLink(idManga, idChapter, idScan, chapters) {
  const chapter = chapters[idChapter];

  const scanIdx = Object.keys(chapter.content)
    .map((n) => Number(n))
    .sort((a, b) => a - b);
  const isLastIdScan = scanIdx[scanIdx.length - 1] === Number(idScan);

  const chaptersIdx = Object.keys(chapters)
    .map((n) => Number(n))
    .sort((a, b) => a - b);
  const currentIdxChapter = chaptersIdx.indexOf(Number(idChapter));
  const isLastChapter = chaptersIdx.length - 1 === currentIdxChapter;

  // Create the previous and next link considering the current scan
  // Handle the edge cases
  let nextLink = null;
  let nextIdChapter = null;
  let nextIdScan = null;

  if (!isLastIdScan) {
    nextIdChapter = idChapter;
    nextIdScan = Number(idScan) + 1;
    nextLink = `/v/${idManga}/${idChapter}/${nextIdScan}`;
  } else {
    if (!isLastChapter) {
      nextIdChapter = String(chaptersIdx[currentIdxChapter + 1]);
      nextIdScan = 0;
      nextLink = `/v/${idManga}/${nextIdChapter}/${nextIdScan}`;
    }
  }

  return [nextLink, nextIdChapter, nextIdScan];
}

/**
 * For a given scan address and an hashmap of chapters, compute when it's 
 * possible the previous and the next link.
 * 
 * @param {string} idManga 
 * @param {string} idChapter 
 * @param {string} idScan 
 * @param {string} chapters 
 * @returns an array of [
    previousLink,
    nextLink,
    previousIdChapter,
    previousIdScan,
    nextIdChapter,
    nextIdScan,
  ]
 */
function computePreviousAndNextLink(idManga, idChapter, idScan, chapters) {
  const [previousLink, previousIdChapter, previousIdScan] = computePreviousLink(
    idManga,
    idChapter,
    idScan,
    chapters
  );

  const [nextLink, nextIdChapter, nextIdScan] = computeNextLink(
    idManga,
    idChapter,
    idScan,
    chapters
  );

  return [
    previousLink,
    nextLink,
    previousIdChapter,
    previousIdScan,
    nextIdChapter,
    nextIdScan,
  ];
}

let TIMEOUT_ID = null;
let cacheImages = {};

function populateCacheImages(url) {
  if (cacheImages[url] === undefined) {
    cacheImages[url] = new Image();
    cacheImages[url].src = url;
  }
}

function ViewDetail() {
  // Initially, retrieve input parameters from the route.
  const params = useParams();

  const classes = useStyles();

  const flashScreen = useRef(null);

  if (
    isUndefinedOrNull(params.idManga) ||
    isUndefinedOrNull(params.idChapter) ||
    isUndefinedOrNull(params.idScan)
  ) {
    return <h1>Nothing to show o_O !</h1>;
  }

  const [chapters, setChapters] = useState(null);
  const [idManga, setIdManga] = useState(null);
  const [idChapter, setIdChapter] = useState(null);
  const [idScan, setIdScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayFlashScreen, setDisplayFlashScreen] = useState(false);

  // const setLoading = useCallback((val) => {
  //   loading = val;
  // });

  // Massive sanity check
  let history = useHistory();
  useEffect(() => {
    const computeScanAddress = async () => {
      const [chapters_, idManga_, idChapter_, idScan_] = await checkScanAddress(
        params.idManga,
        params.idChapter,
        params.idScan
      );
      if (
        !_.isEqual(chapters, chapters_) ||
        idManga !== idManga_ ||
        idChapter !== idChapter_ ||
        idScan !== idScan_
      ) {
        setChapters(chapters_);
        setIdManga(idManga_);
        setIdChapter(idChapter_);
        setIdScan(idScan_);
        setLoading(true);
      }
      const link = computeLink(idManga_, idChapter_, idScan_);
      if (history.location.pathname !== link) {
        history.push(link);
      }
    };
    computeScanAddress();
  }, [params.idManga, params.idChapter, params.idScan]);

  let previousLink = "";
  let nextLink = "";
  let previousIdChapter = "";
  let previousIdScan = "";
  let nextIdChapter = "";
  let nextIdScan = "";
  let imagesURL = [];
  let imageURL = "";

  if (
    !(
      isUndefinedOrNull(chapters) ||
      isUndefinedOrNull(idManga) ||
      isUndefinedOrNull(idChapter) ||
      isUndefinedOrNull(idScan)
    )
  ) {
    if (
      !isUndefinedOrNull(chapters) &&
      chapters[idChapter] !== undefined &&
      chapters[idChapter].content !== undefined
    ) {
      imagesURL = chapters[idChapter].content;
    }
    if (imagesURL[Number(idScan)] !== undefined) {
      imageURL = imagesURL[Number(idScan)];
    }

    [
      previousLink,
      nextLink,
      previousIdChapter,
      previousIdScan,
      nextIdChapter,
      nextIdScan,
    ] = computePreviousAndNextLink(idManga, idChapter, idScan, chapters);
  }

  const [displayResetButton, setDisplayResetButton] = useState(false);

  const [{ x, y, zoom, scale }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    zoom: 0,
    scale: 1,
    config: { mass: 5, tension: 1350, friction: 150 },
  }));

  const resetPanAndZoom = useCallback(() => {
    set.start({ x: 0, y: 0, zoom: 0, scale: 1 });
    setDisplayResetButton(false);
  }, [set]);

  const goPreviousLink = useCallback(() => {
    if (!isUndefinedOrNull(previousLink)) {
      setIdChapter(previousIdChapter);
      setIdScan(previousIdScan);
      resetPanAndZoom();
      window.history.replaceState(
        { page: previousLink },
        `Manga ${idManga} - ${previousIdChapter} ${previousIdScan}`,
        previousLink
      );
    }
  }, [previousLink, previousIdChapter, previousIdScan]);

  const goNextLink = useCallback(() => {
    if (!isUndefinedOrNull(nextLink)) {
      setIdChapter(nextIdChapter);
      setIdScan(nextIdScan);
      resetPanAndZoom();
      window.history.replaceState(
        { page: nextLink },
        `Manga ${idManga} - ${nextIdChapter} ${nextIdScan}`,
        nextLink
      );
    }
  }, [nextLink, nextIdChapter, nextIdScan]);

  // Replace the URL without using the React 'history' object, in a hacky way :
  // https://stackoverflow.com/questions/824349/how-do-i-modify-the-url-without-reloading-the-page
  // The use of the React 'history' object will pass throught the React Router
  // and trigger all the sanity process and make a call to the DB again.
  const handleKeyDown = useCallback(
    (evt) => {
      if (evt.key === "ArrowLeft") {
        if (!isUndefinedOrNull(previousLink)) {
          goPreviousLink();
          setLoading(true);
        } else {
          setDisplayFlashScreen(true);
          setTimeout(() => {
            duringFlashScreenAnimation();
          }, 0);
        }
      } else if (evt.key === "ArrowRight") {
        if (!isUndefinedOrNull(nextLink)) {
          goNextLink();
          setLoading(true);
        } else {
          setDisplayFlashScreen(true);
          setTimeout(() => {
            duringFlashScreenAnimation();
          }, 0);
        }
      } else if (evt.key === "f") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    },
    [
      previousLink,
      previousIdChapter,
      previousIdScan,
      nextLink,
      nextIdChapter,
      nextIdScan,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const goScanAddress = useCallback((idManga_, idChapter_, idScan_) => {
    setIdChapter(idChapter_);
    setIdScan(idScan_);
    resetPanAndZoom();
    const newLink = computeLink(idManga_, idChapter_, idScan_);
    window.history.replaceState(
      { page: newLink },
      `Manga ${idManga_} - ${idChapter_} ${idScan_}`,
      newLink
    );
  }, []);

  const duringFlashScreenAnimation = () => {
    const flashScreenRef = flashScreen.current;
    if (flashScreenRef !== null && flashScreenRef.classList !== null) {
      if (!flashScreenRef.classList.contains(classes.flashScreenTransition)) {
        flashScreenRef.classList.add(classes.flashScreenTransition);
      } else {
        // In case of restart of the animation, delete and add the whole
        // DOM element
        setDisplayFlashScreen(false);
        setDisplayFlashScreen(true);
        if (TIMEOUT_ID !== null) {
          clearTimeout(TIMEOUT_ID);
          TIMEOUT_ID = null;
        }
        setTimeout(() => {
          duringFlashScreenAnimation();
        }, 0);
      }
    }

    if (TIMEOUT_ID !== null) {
      clearTimeout(TIMEOUT_ID);
      TIMEOUT_ID = null;
    }
    TIMEOUT_ID = setTimeout(() => {
      setDisplayFlashScreen(false);
      if (TIMEOUT_ID !== null) {
        clearTimeout(TIMEOUT_ID);
      }
      TIMEOUT_ID = null;
    }, 500);
  };

  // When it's possible, preload 10 images next to the current position,
  // and 10 images before.
  if (
    !(
      isUndefinedOrNull(chapters) ||
      isUndefinedOrNull(idManga) ||
      isUndefinedOrNull(idChapter) ||
      isUndefinedOrNull(idScan)
    )
  ) {
    const iterateFunc = (
      idManga,
      startIdChapter,
      startIdScan,
      chapters,
      computeNextOrPeviousLink,
      nbIter
    ) => {
      let iterLink_;
      let iterIdChapter_;
      let iterIdScan_;
      let currentIdChapter_ = startIdChapter;
      let currentIdScan_ = startIdScan;
      for (const x of Array(nbIter).keys()) {
        [iterLink_, iterIdChapter_, iterIdScan_] = computeNextOrPeviousLink(
          idManga,
          currentIdChapter_,
          currentIdScan_,
          chapters
        );
        if (iterLink_ === null) {
          break;
        }
        [currentIdChapter_, currentIdScan_] = [iterIdChapter_, iterIdScan_];
        let imageURL = chapters[iterIdChapter_].content[Number(iterIdScan_)];
        populateCacheImages(imageURL);
      }
    };
    iterateFunc(idManga, idChapter, idScan, chapters, computeNextLink, 10);
    iterateFunc(idManga, idChapter, idScan, chapters, computePreviousLink, 10);
  }

  if (
    isUndefinedOrNull(chapters) ||
    isUndefinedOrNull(idManga) ||
    isUndefinedOrNull(idChapter) ||
    isUndefinedOrNull(idScan)
  ) {
    // TODO: make something better
    return (
      <>
        <Helmet>
          <style>{"body { background-color: black; }"}</style>
        </Helmet>
        <h3 style={{ color: "white" }}>
          ID: params {params.idManga} {params.idChapter} {params.idScan}
        </h3>
        <h3 style={{ color: "white" }}>
          As long as I'm living, i'll be waiting
        </h3>
      </>
    );
  } else {
    return (
      <>
        <Helmet>
          <style>{"body { background-color: black; }"}</style>
        </Helmet>
        {displayFlashScreen ? (
          <div ref={flashScreen} className={classes.flashScreen} />
        ) : null}
        <TopBar
          imagesURL={imagesURL}
          idManga={idManga}
          idChapter={idChapter}
          idScan={idScan}
          goScanAddress={goScanAddress}
        />
        <DisplayImage
          imageURL={imageURL}
          set={set}
          setDisplayResetButton={setDisplayResetButton}
          springDict={{ x, y, zoom, scale }}
          loading={loading}
          setLoading={setLoading}
        />
        <ImageCaption
          displayResetButton={displayResetButton}
          idScan={idScan}
          totalIdScan={imagesURL.length}
        />
        <ControlBar
          resetPanAndZoom={resetPanAndZoom}
          displayResetButton={displayResetButton}
          previousLink={previousLink}
          nextLink={nextLink}
          goNextLink={goNextLink}
          goPreviousLink={goPreviousLink}
        />
      </>
    );
  }
}

{
  /* <div style={{ color: "white" }}>
  <h3>
    ID: params {params.idManga} {params.idChapter} {params.idScan}
  </h3>
  <h3>
    ID: local variable {idManga} {idChapter} {idScan}
  </h3>
  <h3>previousLink: {previousLink}</h3>
  <h3>nextLink: {nextLink}</h3>
  <h3>
    imagesURL:
    <ul>
      {imagesURL.map((url) => {
        return <li key={url}>{url}</li>;
      })}
    </ul>
  </h3>
  <h3>imageURL: {imageURL}</h3>
  <h3>previousIdChapter: {previousIdChapter}</h3>
  <h3>previousIdScan: {previousIdScan}</h3>
  <h3>nextIdChapter: {nextIdChapter}</h3>
  <h3>nextIdScan: {nextIdScan}</h3>
</div> */
}
