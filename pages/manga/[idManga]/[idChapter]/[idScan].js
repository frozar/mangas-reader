import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSpring } from "react-spring";
import { Helmet } from "react-helmet";

import DisplayImage from "../../../../src/scanViewer/DisplayImage";
import TopBar from "../../../../src/scanViewer/TopBar";
import ControlBar from "../../../../src/scanViewer/ControlBar";
import ImageCaption from "../../../../src/scanViewer/ImageCaption";
// import WaitingComponent from "../../../../src/WaitingComponent.js";
import { getMangas, getMangaChapters } from "../../../../src/db.js";
import { wrapper } from "../../../../store/store";
import { retrieveManga } from "../../../../store/manga/action";

import { connect } from "react-redux";

// // Documentation link (inspiration)
// // https://jack72828383883.medium.com/how-to-preload-images-into-cache-in-react-js-ff1642708240
// // https://css-tricks.com/pre-caching-image-with-react-suspense/
// const imagesCache = {
//   __cache: {},
//   async readAll(imagesURLarg) {
//     // console.log("[readAll] PASS 0");
//     const imagesURL = [...imagesURLarg];
//     const missingImages = imagesURL.some((imageURL) => !this.__cache[imageURL]);
//     // console.log("[readAll] PASS 1");

//     if (missingImages) {
//       const promises = imagesURL.map((imageURL) => {
//         return new Promise(function (resolve, reject) {
//           const img = new Image();
//           img.src = imageURL;
//           img.onload = resolve();
//           img.onerror = reject();
//         });
//       });
//       await Promise.all(promises);
//       imagesURL.map((imageURL) => (this.__cache[imageURL] = true));
//     }
//     // console.log("[readAll] PASS 2");
//   },
// };

function computePreviousAndNextLink(idManga, idChapter, idScan, chapters) {
  // For scan address in DB, create a route
  // TODO: Use directly the DB
  // const docId = idManga + "_chapters";
  // const chapters = await getMangaChapters(docId);
  // console.log("computePreviousAndNextLink");
  // console.log("idManga", idManga);
  // console.log("idChapter", idChapter);
  // console.log("idScan", idScan);

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
  let nextLink = null;

  if (!isFirstIdScan) {
    // console.log("!isFirstIdScan", !isFirstIdScan);
    previousLink = `/manga/${idManga}/${idChapter}/${Number(idScan) - 1}`;
    // console.log("previousLink", previousLink);
  } else {
    if (!isFirstChapter) {
      // console.log("!isFirstChapter", !isFirstChapter);
      const previousIdChapter = String(chaptersIdx[currentIdxChapter - 1]);
      const previousChapterLastIdScan =
        chapters[previousIdChapter].content.length - 1;
      previousLink = `/manga/${idManga}/${previousIdChapter}/${previousChapterLastIdScan}`;
      // console.log("previousLink", previousLink);
    }
  }

  if (!isLastIdScan) {
    // console.log("!isLastIdScan", !isLastIdScan);
    nextLink = `/manga/${idManga}/${idChapter}/${Number(idScan) + 1}`;
    // console.log("nextLink", nextLink);
  } else {
    if (!isLastChapter) {
      // console.log("!isLastChapter", !isLastChapter);
      const nextIdChapter = String(chaptersIdx[currentIdxChapter + 1]);
      const nextChapterFirstIdScan = 0;
      nextLink = `/manga/${idManga}/${nextIdChapter}/${nextChapterFirstIdScan}`;
      // console.log("nextLink", nextLink);
    }
  }

  return [previousLink, nextLink];
}

function isUndefinedOrNull(val) {
  return val === undefined || val === null;
}

function ScanViewer(props) {
  // console.log("[ScanViewer] props", props);
  if (
    isUndefinedOrNull(props.idManga) ||
    isUndefinedOrNull(props.idChapter) ||
    isUndefinedOrNull(props.idScan) ||
    isUndefinedOrNull(props.manga)
  ) {
    return <h1>Nothing to show o_O !</h1>;
  }

  let idManga = "one-piece";
  let idChapter = "1";
  let idScan = "0";
  let manga = null;
  if (!isUndefinedOrNull(props.idManga)) {
    idManga = props.idManga;
  }
  if (!isUndefinedOrNull(props.idChapter)) {
    idChapter = props.idChapter;
  }
  if (!isUndefinedOrNull(props.idScan)) {
    idScan = props.idScan;
  }
  if (!isUndefinedOrNull(props.manga)) {
    manga = props.manga;
  }

  // console.log("[ScanViewer] PASS 1");
  // console.log("[ScanViewer] PASS manga", manga);
  const chapters = manga[idManga];
  const chapter = chapters[idChapter];
  const imagesURL = chapter.content;
  const imageURL = imagesURL[Number(idScan)];

  // console.log("[ScanViewer] PASS 2");
  const [previousLink, setPreviousLink] = React.useState(null);
  const [nextLink, setNextLink] = React.useState(null);

  React.useEffect(() => {
    // console.log("[ScanViewer] useEffect PASS 0");
    const [previousLink_, nextLink_] = computePreviousAndNextLink(
      idManga,
      idChapter,
      idScan,
      chapters
    );
    setPreviousLink(previousLink_);
    setNextLink(nextLink_);
    // console.log("previousLink", previousLink);
    // console.log("nextLink", nextLink);
    // console.log("[ScanViewer] useEffect PASS 1");
  }, [
    props.idManga,
    props.idChapter,
    props.idScan,
    computePreviousAndNextLink,
  ]);

  // console.log("[ScanViewer] PASS 3");
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

  // console.log("[ScanViewer] PASS 4");
  const router = useRouter();
  const handleKeyDown = useCallback(
    (evt) => {
      if (evt.key === "ArrowLeft") {
        // console.log("ArrowLeft");
        if (previousLink !== null) {
          // console.log("previousLink", previousLink);
          router.push(previousLink);
          resetPanAndZoom();
        }
        // TODO : else, snapbar to feekback the user there's no previous scan
      } else if (evt.key === "ArrowRight") {
        // console.log("ArrowRight");
        if (nextLink !== null) {
          // console.log("nextLink", nextLink);
          router.push(nextLink);
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
    [previousLink, nextLink]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // // console.log("[ScanViewer] PASS 5");
  // useEffect(() => {
  //   if (imagesURL.length !== 0) {
  //     imagesCache.readAll(imagesURL);
  //   }
  // }, [imagesURL]);

  // console.log("[ScanViewer] PASS 6");
  if (router.isFallback) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <Helmet>
          <style>{"body { background-color: black; }"}</style>
        </Helmet>
        <TopBar
          imagesURL={imagesURL}
          idManga={idManga}
          idChapter={idChapter}
          idScan={idScan}
        />
        <DisplayImage
          imageURL={imageURL}
          set={set}
          setDisplayResetButton={setDisplayResetButton}
          springDict={{ x, y, zoom, scale }}
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
        />
      </div>
    );
  }
}

// export const getServerSideProps = wrapper.getServerSideProps(
//   async ({ store, params }) => {
//     const { idManga, idChapter, idScan } = params;

//     // console.log("paths", paths);

//     await store.dispatch(retrieveManga(idManga));

//     return {
//       props: {
//         idManga,
//         idChapter,
//         idScan,
//       },
//     };
//   }
// );

export async function getStaticPaths() {
  // Return a list of possible value for idManga, idChapter, idScan
  const tmpLObjManga = await getMangas();

  const mangaToGenerateStatically = [
    "one-piece",
    // "one-punch-man",
    // "my-hero-academia",
  ];
  // const mangaToGenerateStatically = ["gantz"];

  const paths = [];
  for (const objManga of Object.values(tmpLObjManga)) {
    const idManga = objManga.path;
    if (!mangaToGenerateStatically.includes(idManga)) {
      continue;
    }
    console.info(`[Build] Collecting paths to generate statically ${idManga}`);
    const chapters = await getMangaChapters(idManga);
    for (const [idChapter, details] of Object.entries(chapters)) {
      for (const idScan of details.content.keys()) {
        paths.push({ params: { idManga, idChapter, idScan: String(idScan) } });
      }
    }
  }

  // Documentation link:
  // https://vercel.com/docs/next.js/incremental-static-regeneration
  // fallback: true - when a request is made to a page that hasn't
  // been generated, Next.js will immediately serve a static page
  // with a loading state on the first request. When the data is
  // finished loading, the page will re-render using this data and
  // be cached. Future requests will serve the static file from the cache.
  return {
    paths,
    fallback: true,
  };
}

// export const getStaticProps = wrapper.getStaticProps(
//   async ({ store, params }) => {
//     // console.log("params", params);
//     const { idManga, idChapter, idScan } = params;
//     console.log("[getStaticProps]", { idManga, idChapter, idScan });

//     await store.dispatch(retrieveManga(idManga));

//     // if (typeof windows === "undefined") {
//     //   // import { getMangaChapters2 } from "../../src/serverSide";
//     //   // const docId = idManga + "_chapters";
//     //   // const resGetMangaChapters2 = await getMangaChapters2(docId);
//     //   // console.log("resGetMangaChapters2", resGetMangaChapters2);
//     //   const resAxios = await axios.get(
//     //     "http://localhost:3000/api/mangaChaptersGET",
//     //     { params }
//     //   );
//     //   // console.log("resAxios", resAxios);
//     // }

//     // const docId = idManga + "_chapters";
//     // const chapters = await getMangaChapters(docId);

//     // Documentation link:
//     // https://vercel.com/docs/next.js/incremental-static-regeneration
//     return {
//       props: {
//         // mangaPath,
//         idManga,
//         idChapter,
//         idScan,
//         // chapters,
//       },
//       // every day (24 hours), chek if regeneration of the page is necessary
//       revalidate: 60 * 60 * 24,
//     };
//   }
// );

// const mapStateToProps = (state) => {
//   return {
//     manga: state.manga.manga,
//   };
// };

// export default connect(mapStateToProps, null)(ScanViewer);

export async function getStaticProps({ params }) {
  // console.log("params", params);
  const { idManga, idChapter, idScan } = params;
  // console.log("[getStaticProps]", { idManga, idChapter, idScan });

  // await store.dispatch(retrieveManga(idManga));
  const chapters = await getMangaChapters(idManga);
  // for (const [idChapter, details] of Object.entries(chapters)) {
  const manga = { [idManga]: chapters };
  // console.log("[getStaticProps] manga", manga);

  // if (typeof windows === "undefined") {
  //   // import { getMangaChapters2 } from "../../src/serverSide";
  //   // const docId = idManga + "_chapters";
  //   // const resGetMangaChapters2 = await getMangaChapters2(docId);
  //   // console.log("resGetMangaChapters2", resGetMangaChapters2);
  //   const resAxios = await axios.get(
  //     "http://localhost:3000/api/mangaChaptersGET",
  //     { params }
  //   );
  //   // console.log("resAxios", resAxios);
  // }

  // const docId = idManga + "_chapters";
  // const chapters = await getMangaChapters(docId);

  // Documentation link:
  // https://vercel.com/docs/next.js/incremental-static-regeneration
  return {
    props: {
      // mangaPath,
      idManga,
      idChapter,
      idScan,
      manga,
      // chapters,
    },
    // every day (24 hours), chek if regeneration of the page is necessary
    revalidate: 60 * 60 * 24,
  };
}

export default ScanViewer;
