import React, { useState, useEffect, useCallback } from "react";
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

export default function view(props) {
  console.log("[view] BEGIN");
  console.log("[view] props", props);
  const router = useRouter();
  console.log("[view] router", router);
  // if (typeof window !== "undefined") {
  //   // let match = useRouteMatch();
  //   // console.log("[view] match", match);
  //   // let params = useParams();
  //   // console.log("[view] match", match);
  //   console.log("[view] params");
  // }
  // console.log("[view] ", typeof window);

  // if (
  //   isUndefinedOrNull(props.idManga) ||
  //   isUndefinedOrNull(props.idChapter) ||
  //   isUndefinedOrNull(props.idScan) ||
  //   isUndefinedOrNull(props.imagesURL) ||
  //   isUndefinedOrNull(props.imageURL)
  // ) {
  //   return <h1>Nothing to show o_O !</h1>;
  // }

  // let idManga = "one-piece";
  // let idChapter = "1";
  // let idScan = "0";
  // // let manga = null;
  // let previousLink = null;
  // let nextLink = null;
  // let imagesURL = [];
  // let imageURL = null;
  // if (!isUndefinedOrNull(props.idManga)) {
  //   idManga = props.idManga;
  // }
  // if (!isUndefinedOrNull(props.idChapter)) {
  //   idChapter = props.idChapter;
  // }
  // if (!isUndefinedOrNull(props.idScan)) {
  //   idScan = props.idScan;
  // }
  // // if (!isUndefinedOrNull(props.manga)) {
  // //   manga = props.manga;
  // // }
  // if (!isUndefinedOrNull(props.previousLink)) {
  //   previousLink = props.previousLink;
  // }
  // if (!isUndefinedOrNull(props.nextLink)) {
  //   nextLink = props.nextLink;
  // }
  // if (!isUndefinedOrNull(props.imagesURL)) {
  //   imagesURL = props.imagesURL;
  // }
  // if (!isUndefinedOrNull(props.imageURL)) {
  //   imageURL = props.imageURL;
  // }

  // // console.log("[ScanViewer] PASS 1");
  // // console.log("[ScanViewer] PASS manga", manga);
  // // const chapters = manga[idManga];
  // // const chapter = chapters[idChapter];
  // // const imagesURL = chapter.content;
  // // const imageURL = imagesURL[Number(idScan)];

  // // console.log("[ScanViewer] PASS 2");
  // // const [previousLink, setPreviousLink] = React.useState(null);
  // // const [nextLink, setNextLink] = React.useState(null);

  // // React.useEffect(() => {
  // //   // console.log("[ScanViewer] useEffect PASS 0");
  // //   const [previousLink_, nextLink_] = computePreviousAndNextLink(
  // //     idManga,
  // //     idChapter,
  // //     idScan,
  // //     chapters
  // //   );
  // //   setPreviousLink(previousLink_);
  // //   setNextLink(nextLink_);
  // //   // console.log("previousLink", previousLink);
  // //   // console.log("nextLink", nextLink);
  // //   // console.log("[ScanViewer] useEffect PASS 1");
  // // }, [
  // //   props.idManga,
  // //   props.idChapter,
  // //   props.idScan,
  // //   computePreviousAndNextLink,
  // // ]);

  // // console.log("[ScanViewer] PASS 3");
  // const [displayResetButton, setDisplayResetButton] = useState(false);

  // const [{ x, y, zoom, scale }, set] = useSpring(() => ({
  //   x: 0,
  //   y: 0,
  //   zoom: 0,
  //   scale: 1,
  //   config: { mass: 5, tension: 1350, friction: 150 },
  // }));

  // const resetPanAndZoom = useCallback(() => {
  //   set.start({ x: 0, y: 0, zoom: 0, scale: 1 });
  //   setDisplayResetButton(false);
  // }, [set]);

  // // console.log("[ScanViewer] PASS 4");
  // const router = useRouter();
  // const handleKeyDown = useCallback(
  //   (evt) => {
  //     if (evt.key === "ArrowLeft") {
  //       // console.log("ArrowLeft");
  //       if (previousLink !== null) {
  //         // console.log("previousLink", previousLink);
  //         router.push(previousLink);
  //         resetPanAndZoom();
  //       }
  //       // TODO : else, snapbar to feekback the user there's no previous scan
  //     } else if (evt.key === "ArrowRight") {
  //       // console.log("ArrowRight");
  //       if (nextLink !== null) {
  //         // console.log("nextLink", nextLink);
  //         router.push(nextLink);
  //         resetPanAndZoom();
  //       }
  //     } else if (evt.key === "f") {
  //       if (!document.fullscreenElement) {
  //         document.documentElement.requestFullscreen();
  //       } else {
  //         document.exitFullscreen();
  //       }
  //     }
  //   },
  //   [previousLink, nextLink]
  // );

  // useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [handleKeyDown]);

  // // // console.log("[ScanViewer] PASS 5");
  // // useEffect(() => {
  // //   if (imagesURL.length !== 0) {
  // //     imagesCache.readAll(imagesURL);
  // //   }
  // // }, [imagesURL]);

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
      <div>
        <ul>
          <li>
            <Link to="/v/assassination-classroom/51/0">Home</Link>
          </li>
          {/* <li>
            <Link to="/v/assassination-classroom/51/0/about">About</Link>
          </li> */}
        </ul>

        <Switch>
          {/* <Route exact path="/v/assassination-classroom/51/0">
            <h2>Home</h2>
          </Route>
          <Route exact path="/v/assassination-classroom/51/0/about">
            <h2>About</h2>
          </Route> */}
          <Route
            path="/v/:idManga/:idChapter/:idScan"
            children={<ViewDetail />}
          />
        </Switch>
      </div>
    </Router>
  );
}

function isUndefinedOrNull(val) {
  return val === undefined || val === null;
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

function ViewDetail(props) {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  console.log("[ViewDetail] props", props);

  const params = useParams();
  console.log("params", params);

  if (
    isUndefinedOrNull(params.idManga) ||
    isUndefinedOrNull(params.idChapter) ||
    isUndefinedOrNull(params.idScan)
  ) {
    return <h1>Nothing to show o_O !</h1>;
  }

  let idManga = "one-piece";
  // let idChapter = "1";
  // let idScan = "0";
  // const [idManga, setIdManga] = useState("one-piece");
  const [idChapter, setIdChapter] = useState("1");
  const [idScan, setIdScan] = useState("0");
  if (!isUndefinedOrNull(params.idManga)) {
    idManga = params.idManga;
    // setIdManga(params.idManga);
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

  // // let manga = null;
  // let previousLink = null;
  // let nextLink = null;
  // let imagesURL = [];
  // let imageURL = null;
  // // if (!isUndefinedOrNull(props.manga)) {
  // //   manga = props.manga;
  // // }
  // if (!isUndefinedOrNull(props.previousLink)) {
  //   previousLink = props.previousLink;
  // }
  // if (!isUndefinedOrNull(props.nextLink)) {
  //   nextLink = props.nextLink;
  // }
  // if (!isUndefinedOrNull(props.imagesURL)) {
  //   imagesURL = props.imagesURL;
  // }
  // if (!isUndefinedOrNull(props.imageURL)) {
  //   imageURL = props.imageURL;
  // }

  // const [touch, setTouch] = React.useState(0);
  const [previousLink, setPreviousLink] = React.useState("");
  const [nextLink, setNextLink] = React.useState("");
  const [previousIdChapter, setPreviousIdChapter] = React.useState("");
  const [previousIdScan, setPreviousIdScan] = React.useState("");
  const [nextIdChapter, setNextIdChapter] = React.useState("");
  const [nextIdScan, setNextIdScan] = React.useState("");
  const [imagesURL, setImagesURL] = React.useState([]);
  const [imageURL, setImageURL] = React.useState("");
  const [chapters, setChapters] = React.useState(null);

  useEffect(() => {
    // console.log("[ScanViewer] useEffect PASS 0");
    const differ = async () => {
      // let chapters_ = await getMangaChapters(params.idManga);
      let chapters_ = null;
      if (!isUndefinedOrNull(chapters)) {
        chapters_ = chapters;
      } else {
        chapters_ = await getMangaChapters(params.idManga);
      }

      // let chapters_ = null;
      // if (!isUndefinedOrNull(chapters)) {
      //   chapters_ = await getMangaChapters(params.idManga);
      //   setChapters(chapters_);
      // }
      // const chaptersWk = !isUndefinedOrNull(chapters) ? chapters : chapters_;

      // console.log("chapters", chapters);
      const [
        previousLink_,
        nextLink_,
        previousIdChapter_,
        previousIdScan_,
        nextIdChapter_,
        nextIdScan_,
      ] = computePreviousAndNextLink(
        params.idManga,
        params.idChapter,
        params.idScan,
        // chaptersWk
        chapters_
      );
      const imagesURL_ = chapters_[params.idChapter].content;
      const imageURL_ = imagesURL_[Number(params.idScan)];
      // const imageURL_ = imagesURL_[0];
      if (imageURL !== imageURL_) {
        // setTouch(previousLink_);
        setPreviousLink(previousLink_);
        setNextLink(nextLink_);
        setPreviousIdChapter(previousIdChapter_);
        setPreviousIdScan(previousIdScan_);
        setNextIdChapter(nextIdChapter_);
        setNextIdScan(nextIdScan_);
        setImagesURL(imagesURL_);
        setImageURL(imageURL_);
      }
      if (isUndefinedOrNull(chapters)) {
        setChapters(chapters_);
      }
    };

    differ();

    // setPreviousLink(previousLink_);
    // setNextLink(nextLink_);
    // console.log("previousLink", previousLink);
    // console.log("nextLink", nextLink);
    // console.log("[ScanViewer] useEffect PASS 1");
  }, [
    // params.idManga, params.idChapter, params.idScan,
    idManga,
    idChapter,
    idScan,
  ]);

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

  const [dbg, setDbg] = useState("");
  let history = useHistory();
  const handleKeyDown = useCallback(
    (evt) => {
      setDbg(evt.key);
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
      nextLink,
      previousIdChapter,
      previousIdScan,
      nextIdChapter,
      nextIdScan,
      // idChapter,
      // idScan,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
      <h3>dbg: {dbg}</h3>
    </>
  );
}
