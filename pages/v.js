import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import { useRouter } from "next/router";
import { useSpring } from "react-spring";

// import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
  useHistory,
} from "react-router-dom";

import { getMangaChapters } from "../src/db";

export default function view() {
  // console.log("[view] BEGIN");
  // console.log("[view] props", props);
  // const router = useRouter();
  // console.log("[view] router", router);

  // if (typeof window !== "undefined") {
  //   // let match = useRouteMatch();
  //   // console.log("[view] match", match);
  //   // let params = useParams();
  //   // console.log("[view] match", match);
  //   console.log("[view] params");
  // }
  // console.log("[view] ", typeof window);

  // if (router.isFallback) {
  //   return <div>Loading...</div>;
  // } else {
  //   return (
  //     <>
  //       <Helmet>
  //         <style>{"body { background-color: black; }"}</style>
  //       </Helmet>
  //       <TopBar
  //         imagesURL={imagesURL}
  //         idManga={idManga}
  //         idChapter={idChapter}
  //         idScan={idScan}
  //       />
  //       <DisplayImage
  //         imageURL={imageURL}
  //         set={set}
  //         setDisplayResetButton={setDisplayResetButton}
  //         springDict={{ x, y, zoom, scale }}
  //       />
  //       <ImageCaption
  //         displayResetButton={displayResetButton}
  //         idScan={idScan}
  //         totalIdScan={imagesURL.length}
  //       />
  //       <ControlBar
  //         resetPanAndZoom={resetPanAndZoom}
  //         displayResetButton={displayResetButton}
  //         previousLink={previousLink}
  //         nextLink={nextLink}
  //       />
  //     </>
  //   );
  // }

  return (
    <Router>
      <Switch>
        <Route
          path="/v/:idManga/:idChapter/:idScan"
          children={<ViewSanityCheck />}
        />
      </Switch>
    </Router>
  );
}

function isUndefinedOrNull(val) {
  return val === undefined || val === null;
}

const defaultIdManga = "one-piece";
const defaultIdChapter = "1027";
const defaultIdScan = "0";

function computeLink(idManga, idChapter, idScan) {
  return `/v/${idManga}/${idChapter}/${idScan}`;
}

function getLatestChapterIndex(chapters) {
  const chaptersIndex = Object.keys(chapters).sort((k0, k1) => {
    return Number(k0) - Number(k1);
  });
  return chaptersIndex[chaptersIndex.length - 1];
}

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

function ViewSanityCheck() {
  const params = useParams();

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
      }
      const link = computeLink(idManga_, idChapter_, idScan_);
      if (history.location.pathname !== link) {
        history.push(link);
      }
    };
    computeScanAddress();
  }, [params.idManga, params.idChapter, params.idScan]);

  // const [previousLink, setPreviousLink] = useState("");
  // const [nextLink, setNextLink] = useState("");
  // const [previousIdChapter, setPreviousIdChapter] = useState("");
  // const [previousIdScan, setPreviousIdScan] = useState("");
  // const [nextIdChapter, setNextIdChapter] = useState("");
  // const [nextIdScan, setNextIdScan] = useState("");
  // const [imagesURL, setImagesURL] = useState([]);
  // const [imageURL, setImageURL] = useState("");

  // useEffect(() => {
  //   const computePreviousNextLink = async () => {
  //     console.log("[ViewSanityCheck] Differ begin");

  //     if (
  //       isUndefinedOrNull(chapters) ||
  //       isUndefinedOrNull(idManga) ||
  //       isUndefinedOrNull(idChapter) ||
  //       isUndefinedOrNull(idScan)
  //     ) {
  //       return;
  //     }

  //     let imagesURL_ = [];
  //     if (
  //       !isUndefinedOrNull(chapters) &&
  //       chapters[idChapter] !== undefined &&
  //       chapters[idChapter].content !== undefined
  //     ) {
  //       imagesURL_ = chapters[idChapter].content;
  //     }
  //     let imageURL_ = "";
  //     if (imagesURL_[Number(idScan)] !== undefined) {
  //       imageURL_ = imagesURL_[Number(idScan)];
  //     }

  //     const [
  //       previousLink_,
  //       nextLink_,
  //       previousIdChapter_,
  //       previousIdScan_,
  //       nextIdChapter_,
  //       nextIdScan_,
  //     ] = computePreviousAndNextLink(idManga, idChapter, idScan, chapters);

  //     // if (previousLink !== previousLink_) {
  //     //   setPreviousLink(previousLink_);
  //     // }
  //     // if (previousIdChapter !== previousIdChapter_) {
  //     //   setPreviousIdChapter(previousIdChapter_);
  //     // }
  //     // if (previousIdScan !== previousIdScan_) {
  //     //   setPreviousIdScan(previousIdScan_);
  //     // }
  //     // if (nextLink !== nextLink_) {
  //     //   setNextLink(nextLink_);
  //     // }
  //     // if (nextIdChapter !== nextIdChapter_) {
  //     //   setNextIdChapter(nextIdChapter_);
  //     // }
  //     // if (nextIdScan !== nextIdScan_) {
  //     //   setNextIdScan(nextIdScan_);
  //     // }
  //     // if (!_.isEqual(imagesURL, imagesURL_)) {
  //     //   setImagesURL(imagesURL_);
  //     // }
  //     // if (imageURL !== imageURL_) {
  //     //   setImageURL(imageURL_);
  //     // }
  //     if (
  //       previousLink !== previousLink_ ||
  //       previousIdChapter !== previousIdChapter_ ||
  //       previousIdScan !== previousIdScan_ ||
  //       nextLink !== nextLink_ ||
  //       nextIdChapter !== nextIdChapter_ ||
  //       nextIdScan !== nextIdScan_ ||
  //       !_.isEqual(imagesURL, imagesURL_) ||
  //       imageURL !== imageURL_
  //     ) {
  //       setPreviousLink(previousLink_);
  //       setPreviousIdChapter(previousIdChapter_);
  //       setPreviousIdScan(previousIdScan_);
  //       setNextLink(nextLink_);
  //       setNextIdChapter(nextIdChapter_);
  //       setNextIdScan(nextIdScan_);
  //       setImagesURL(imagesURL_);
  //       setImageURL(imageURL_);
  //     }
  //   };

  //   computePreviousNextLink();
  // }, [idManga, idChapter, idScan, chapters]);

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

  // Replace the URL without using the React 'history' object, in a hacky way :
  // https://stackoverflow.com/questions/824349/how-do-i-modify-the-url-without-reloading-the-page
  // The use of the React 'history' object will pass throught the React Router
  // and trigger all the sanity process and make a call to the DB again.
  const handleKeyDown = useCallback(
    (evt) => {
      // setDbg(evt.key);
      if (evt.key === "ArrowLeft") {
        // console.log("ArrowLeft");
        if (!isUndefinedOrNull(previousLink)) {
          // console.log("previousLink", previousLink);
          // setPreviousLink("");
          // if (idChapter !== previousIdChapter || idScan !== previousIdScan) {
          // }
          setIdChapter(previousIdChapter);
          setIdScan(previousIdScan);
          resetPanAndZoom();
          // history.push(previousLink);
          // window.location.pathname = previousLink;
          window.history.replaceState(
            { page: previousLink },
            `Manga ${idManga} - ${previousIdChapter} ${previousIdScan}`,
            previousLink
          );
        }
        // TODO : else, snapbar to feedback the user there's no previous scan
      } else if (evt.key === "ArrowRight") {
        // console.log("ArrowRight");
        if (!isUndefinedOrNull(nextLink)) {
          // console.log("nextLink", nextLink);
          // setNextLink("");
          // if (idChapter !== nextIdChapter || idScan !== nextIdScan) {
          // }
          setIdChapter(nextIdChapter);
          setIdScan(nextIdScan);
          resetPanAndZoom();
          // history.push(nextLink);
          // window.location.pathname = nextLink;
          window.history.replaceState(
            { page: nextLink },
            `Manga ${idManga} - ${nextIdChapter} ${nextIdScan}`,
            nextLink
          );
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

  if (
    isUndefinedOrNull(chapters) ||
    isUndefinedOrNull(idManga) ||
    isUndefinedOrNull(idChapter) ||
    isUndefinedOrNull(idScan)
  ) {
    return (
      <>
        <h3>
          ID: params {params.idManga} {params.idChapter} {params.idScan}
        </h3>
        <h3>As long as I'm living, i'll be waiting</h3>
      </>
    );
  } else {
    return (
      <>
        <h3>
          ID: params {params.idManga} {params.idChapter} {params.idScan}
        </h3>
        <h3>
          ID: local variable {idManga} {idChapter} {idScan}
        </h3>
        <h3>previousLink: {previousLink}</h3>
        <h3>nextLink: {nextLink}</h3>
        <h3>imagesURL: {imagesURL}</h3>
        <h3>imageURL: {imageURL}</h3>
        <h3>previousIdChapter: {previousIdChapter}</h3>
        <h3>previousIdScan: {previousIdScan}</h3>
        <h3>nextIdChapter: {nextIdChapter}</h3>
        <h3>nextIdScan: {nextIdScan}</h3>
      </>
    );
  }
}

function computePreviousAndNextLink(idManga, idChapter, idScan, chapters) {
  const chapter = chapters[idChapter];
  // const imageURL = chapter.content[Number(idScan)];

  const scanIdx = Object.keys(chapter.content)
    .map((n) => Number(n))
    .sort((a, b) => a - b);
  const isFirstIdScan = scanIdx[0] === Number(idScan);
  const isLastIdScan = scanIdx[scanIdx.length - 1] === Number(idScan);

  const chaptersIdx = Object.keys(chapters)
    .map((n) => Number(n))
    .sort((a, b) => a - b);
  const currentIdxChapter = chaptersIdx.indexOf(Number(idChapter));
  const isFirstChapter = 0 === currentIdxChapter;
  const isLastChapter = chaptersIdx.length - 1 === currentIdxChapter;

  // console.log("idScan", idScan);
  // console.log("idChapter", idChapter);
  // console.log("scanIdx", scanIdx);
  // console.log("isFirstIdScan", isFirstIdScan);
  // console.log("isLastIdScan", isLastIdScan);
  // console.log("chaptersIdx", chaptersIdx);
  // console.log("isFirstChapter", isFirstChapter);
  // console.log("isLastChapter", isLastChapter);

  // Create the previous and next link considering the current scan
  // Handle the edge cases
  let previousLink = null;
  let previousIdChapter = null;
  let previousIdScan = null;
  let nextLink = null;
  let nextIdChapter = null;
  let nextIdScan = null;

  if (!isFirstIdScan) {
    // console.log("!isFirstIdScan", !isFirstIdScan);
    previousIdChapter = idChapter;
    previousIdScan = Number(idScan) - 1;
    previousLink = `/v/${idManga}/${previousIdChapter}/${previousIdScan}`;
    // console.log("previousLink", previousLink);
  } else {
    if (!isFirstChapter) {
      // console.log("!isFirstChapter", !isFirstChapter);
      previousIdChapter = String(chaptersIdx[currentIdxChapter - 1]);
      previousIdScan = chapters[previousIdChapter].content.length - 1;
      previousLink = `/v/${idManga}/${previousIdChapter}/${previousIdScan}`;
      // console.log("previousLink", previousLink);
    }
  }

  if (!isLastIdScan) {
    // console.log("!isLastIdScan", !isLastIdScan);
    nextIdChapter = idChapter;
    nextIdScan = Number(idScan) + 1;
    nextLink = `/v/${idManga}/${idChapter}/${nextIdScan}`;
    // console.log("nextLink", nextLink);
  } else {
    if (!isLastChapter) {
      // console.log("!isLastChapter", !isLastChapter);
      nextIdChapter = String(chaptersIdx[currentIdxChapter + 1]);
      nextIdScan = 0;
      nextLink = `/v/${idManga}/${nextIdChapter}/${nextIdScan}`;
      // console.log("nextLink", nextLink);
    }
  }

  return [
    previousLink,
    nextLink,
    previousIdChapter,
    previousIdScan,
    nextIdChapter,
    nextIdScan,
  ];
}

function ViewDetail() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  // console.log("[ViewDetail] props", props);

  const params = useParams();
  console.log("[ViewDetail] params", params);

  if (
    isUndefinedOrNull(params.idManga) ||
    isUndefinedOrNull(params.idChapter) ||
    isUndefinedOrNull(params.idScan)
  ) {
    return <h1>Nothing to show o_O !</h1>;
  }

  const [idManga, setIdManga] = useState(null);
  const [idChapter, setIdChapter] = useState(null);
  const [idScan, setIdScan] = useState(null);
  if (!isUndefinedOrNull(params.idManga)) {
    //idManga = params.idManga;
    if (idManga !== params.idManga) {
      setIdManga(params.idManga);
    }
  }
  if (!isUndefinedOrNull(params.idChapter)) {
    // idChapter = params.idChapter;
    if (idChapter !== params.idChapter) {
      setIdChapter(params.idChapter);
    }
  }
  if (!isUndefinedOrNull(params.idScan)) {
    // idScan = params.idScan;
    if (idScan !== params.idScan) {
      setIdScan(params.idScan);
    }
  }
  console.log("[ViewDetail] {idManga, idChapter, idScan}", {
    idManga,
    idChapter,
    idScan,
  });

  const [previousLink, setPreviousLink] = React.useState("");
  const [nextLink, setNextLink] = React.useState("");
  const [previousIdChapter, setPreviousIdChapter] = React.useState("");
  const [previousIdScan, setPreviousIdScan] = React.useState("");
  const [nextIdChapter, setNextIdChapter] = React.useState("");
  const [nextIdScan, setNextIdScan] = React.useState("");
  const [imagesURL, setImagesURL] = React.useState([]);
  const [imageURL, setImageURL] = React.useState("");
  const [chapters, setChapters] = React.useState(null);

  // useEffect(() => {
  //   const differ = async () => {
  //     const inspect = await getMangaChapters("gantz");
  //     // console.log("inspect", inspect);
  //     // console.log("Object.keys(inspect)[0]", Object.keys(inspect)[0]);
  //     // console.log(
  //     //   "typeof Object.keys(inspect)[0]",
  //     //   typeof Object.keys(inspect)[0]
  //     // );
  //     console.log(
  //       "Object.keys(inspect)",
  //       Object.keys(inspect).sort((k0, k1) => {
  //         return Number(k0) - Number(k1);
  //       })
  //     );
  //   };
  //   differ();
  // }, []);

  useEffect(() => {
    console.log("[ViewDetail] useEffect begin");
    const differ = async () => {
      console.log("[ViewDetail] Differ begin");
      console.log({ idManga, idChapter, idScan });
      let chapters_ = null;
      // Sanity check on idManga
      if (isUndefinedOrNull(chapters) || typeof chapters !== "object") {
        chapters_ = await getMangaChapters(idManga);
        if (chapters_ === undefined) {
          setIdManga(defaultIdManga);
          return;
        }
      } else {
        chapters_ = chapters;
      }

      // if(chapters_[idManga] === "undefined") {
      //   setIdManga(defaultIdManga);
      // }

      // Sanity check on idChapter
      if (typeof idChapter !== "string" || isNaN(Number(idChapter))) {
        setIdChapter(defaultIdChapter);
        return;
      }
      // Sanity check on idScan
      if (typeof idScan !== "string" || isNaN(Number(idScan))) {
        setIdScan(defaultIdScan);
        return;
      }

      // If the current idChapter is not found, set the idChapter to the
      // lastest chapter
      if (chapters_[idChapter] === undefined) {
        const chaptersIndex = Object.keys(chapters_).sort((k0, k1) => {
          return Number(k0) - Number(k1);
        });
        const lastIndex = chaptersIndex[chaptersIndex.length - 1];
        setIdChapter(lastIndex);
        return;
      }

      // Nearest scan, maybe ?
      console.log(
        "[ViewDetail] chapters_[idChapter].content[Number(idScan)] === undefined",
        chapters_[idChapter].content[Number(idScan)] === undefined
      );
      if (chapters_[idChapter].content[Number(idScan)] === undefined) {
        setIdScan(defaultIdScan);
        // return;
      }

      const imagesURL_ = chapters_[idChapter].content;
      const imageURL_ = imagesURL_[Number(idScan)];
      console.log("[ViewDetail] Number(idScan)", Number(idScan));
      console.log("[ViewDetail] imageURL_", imageURL_);

      // console.log("chapters", chapters);
      const [
        previousLink_,
        nextLink_,
        previousIdChapter_,
        previousIdScan_,
        nextIdChapter_,
        nextIdScan_,
      ] = computePreviousAndNextLink(idManga, idChapter, idScan, chapters_);

      if (imageURL !== imageURL_) {
        setPreviousLink(previousLink_);
        setNextLink(nextLink_);
        setPreviousIdChapter(previousIdChapter_);
        setPreviousIdScan(previousIdScan_);
        setNextIdChapter(nextIdChapter_);
        setNextIdScan(nextIdScan_);
        setImagesURL(imagesURL_);
        setImageURL(imageURL_);
      }
      if (isUndefinedOrNull(chapters) || !_.isEqual(chapters, chapters_)) {
        setChapters(chapters_);
      }
    };

    differ();
  }, [idManga, idChapter, idScan, chapters]);

  const resetPanAndZoom = useCallback(() => {
    set.start({ x: 0, y: 0, zoom: 0, scale: 1 });
    setDisplayResetButton(false);
  }, [set]);

  // const [dbg, setDbg] = useState("");
  let history = useHistory();
  const handleKeyDown = useCallback(
    (evt) => {
      // setDbg(evt.key);
      if (evt.key === "ArrowLeft") {
        // console.log("ArrowLeft");
        if (!isUndefinedOrNull(previousLink)) {
          // console.log("previousLink", previousLink);
          history.push(previousLink);
          // setPreviousLink("");
          setIdChapter(previousIdChapter);
          setIdScan(previousIdScan);
          resetPanAndZoom();
        }
        // TODO : else, snapbar to feedback the user there's no previous scan
      } else if (evt.key === "ArrowRight") {
        // console.log("ArrowRight");
        if (!isUndefinedOrNull(nextLink)) {
          // console.log("nextLink", nextLink);
          history.push(nextLink);
          // setNextLink("");
          setIdChapter(nextIdChapter);
          setIdScan(nextIdScan);
          resetPanAndZoom();
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

  const [displayResetButton, setDisplayResetButton] = useState(false);

  const [{ x, y, zoom, scale }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    zoom: 0,
    scale: 1,
    config: { mass: 5, tension: 1350, friction: 150 },
  }));

  return (
    <>
      <h3>
        ID: local variable {idManga} {idChapter} {idScan}
      </h3>
      <h3>
        ID: params {params.idManga} {params.idChapter} {params.idScan}
      </h3>
      <h3>previousLink: {previousLink}</h3>
      <h3>nextLink: {nextLink}</h3>
      <h3>imagesURL: {imagesURL}</h3>
      <h3>imageURL: {imageURL}</h3>
      <h3>previousIdChapter: {previousIdChapter}</h3>
      <h3>previousIdScan: {previousIdScan}</h3>
      <h3>nextIdChapter: {nextIdChapter}</h3>
      <h3>nextIdScan: {nextIdScan}</h3>
      {/* <h3>dbg: {dbg}</h3> */}
    </>
  );
}
