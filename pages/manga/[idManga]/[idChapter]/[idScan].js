import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSpring } from "react-spring";
import { Helmet } from "react-helmet";

import DisplayImage from "../../../../src/scanViewer/DisplayImage";
import TopBar from "../../../../src/scanViewer/TopBar";
import ControlBar from "../../../../src/scanViewer/ControlBar";
import ImageCaption from "../../../../src/scanViewer/ImageCaption";
// import WaitingComponent from "../../../../src/WaitingComponent.js";
import { getMangasMeta, getMangaChapters } from "../../../../src/db.js";

// Documentation link (inspiration)
// https://jack72828383883.medium.com/how-to-preload-images-into-cache-in-react-js-ff1642708240
// https://css-tricks.com/pre-caching-image-with-react-suspense/
const imagesCache = {
  __cache: {},
  async readAll(imagesURLarg) {
    const imagesURL = [...imagesURLarg];
    const missingImages = imagesURL.some((imageURL) => !this.__cache[imageURL]);

    if (missingImages) {
      const promises = imagesURL.map((imageURL) => {
        return new Promise(function (resolve, reject) {
          const img = new Image();
          img.src = imageURL;
          img.onload = resolve();
          img.onerror = reject();
        });
      });
      await Promise.all(promises);
      imagesURL.map((imageURL) => (this.__cache[imageURL] = true));
    }
  },
};

export default function ScanViewer(props) {
  const {
    idManga,
    idChapter,
    idScan,
    chapter,
    previousLink,
    nextLink,
    imageURL,
  } = props;
  const router = useRouter();
  // console.log("[ScanViewer] props", props);
  const imagesURL = chapter.content;

  // const [idxImage, setIdxImage] = useState(idScan);
  // const [loading, setLoading] = useState(true);
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

  // const getPreviousImage = useCallback(async () => {
  //   resetPanAndZoom();
  //   let previousIdxImage;
  //   if (0 < idxImage) {
  //     // Go to the previous image
  //     previousIdxImage = idxImage - 1;
  //   } else if (idxImage === 0) {
  //     // Go to the previous chapter
  //     previousIdxImage = await previousChapter();
  //   }
  //   if (previousIdxImage !== null) {
  //     setIdxImage(previousIdxImage);
  //   }
  // }, [idxImage, setIdxImage, previousChapter, resetPanAndZoom]);

  // const getNextImage = useCallback(async () => {
  //   resetPanAndZoom();
  //   const idxImageMax = imagesURL.length - 1;
  //   let nextIdxImage;
  //   if (idxImage < idxImageMax) {
  //     // Go to the next image
  //     nextIdxImage = idxImage + 1;
  //   } else if (idxImage === idxImageMax) {
  //     // Go to the next chapter
  //     nextIdxImage = await nextChapter();
  //   }
  //   if (nextIdxImage !== null) {
  //     setIdxImage(nextIdxImage);
  //   }
  // }, [imagesURL, idxImage, setIdxImage, nextChapter, resetPanAndZoom]);

  const handleKeyDown = useCallback((evt) => {
    if (evt.key === "ArrowLeft") {
      // console.log("ArrowLeft");
      if (previousLink !== null) {
        // console.log("previousLink", previousLink);
        router.push(previousLink);
      }
      // TODO : else, snapbar to feekback the user there's no previous scan
    } else if (evt.key === "ArrowRight") {
      // console.log("ArrowRight");
      if (nextLink !== null) {
        // console.log("nextLink", nextLink);
        router.push(nextLink);
      }
      // TODO : else, snapbar to feekback the user there's no previous scan
    } else if (evt.key === "f") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (imagesURL.length !== 0) {
      imagesCache.readAll(imagesURL);
    }
  }, [imagesURL]);

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
          // setLoading={setLoading}
          // getPreviousImage={getPreviousImage}
          // getNextImage={getNextImage}
          resetPanAndZoom={resetPanAndZoom}
          displayResetButton={displayResetButton}
          previousLink={previousLink}
          nextLink={nextLink}
        />
      </div>
    );
  }
}

// export async function getStaticPaths() {
//   // TODO: Use directly the DB
//   const tmpLObjManga = await getMangasMeta();
//   const idMangas = Object.entries(tmpLObjManga).map(
//     ([_, objManga]) => objManga.path
//   );
//   let mangaChapters = {};
//   for (const idManga of idMangas) {
//     const docId = idManga + "_chapters";
//     const tmpChapters = await getMangaChapters(docId);
//     const chapters = {};
//     for (const [idChapter, chapter] of Object.entries(tmpChapters)) {
//       chapters[idChapter] = chapter.content;
//     }
//     mangaChapters[idManga] = chapters;
//   }

//   let res = [];
//   for (const [idManga, chapters] of Object.entries(mangaChapters)) {
//     for (const [idChapter, content] of Object.entries(chapters)) {
//       for (const i in content) {
//         res.push({
//           idManga,
//           idChapter,
//           idScan: i,
//         });
//       }
//     }
//   }

//   const paths = res.map((param) => {
//     return { params: { ...param } };
//   });

//   // fallback == true : generate the page on 1st visit
//   // fallback == false : generate the page at build time
//   return {
//     paths,
//     fallback: true,
//   };
// }

// export async function getStaticProps({ params }) {
//   const { idManga, idChapter, idScan } = params;
//   // For scan address in DB, create a route
//   // TODO: Use directly the DB
//   const docId = idManga + "_chapters";
//   const chapters = await getMangaChapters(docId);

//   const chapter = chapters[idChapter];
//   const imageURL = chapter.content[Number(idScan)];

//   const scanIdx = Object.keys(chapter.content)
//     .map((n) => Number(n))
//     .sort((a, b) => a - b);
//   const isFirstIdScan = scanIdx[0] === Number(idScan);
//   const isLastIdScan = scanIdx[scanIdx.length - 1] === Number(idScan);

//   const chaptersIdx = Object.keys(chapters)
//     .map((n) => Number(n))
//     .sort((a, b) => a - b);
//   const currentIdxChapter = chaptersIdx.indexOf(Number(idChapter));
//   const isFirstChapter = 0 === currentIdxChapter;
//   const isLastChapter = chaptersIdx.length - 1 === currentIdxChapter;

//   // console.log("idScan", idScan);
//   // console.log("idChapter", idChapter);
//   // console.log("scanIdx", scanIdx);
//   // console.log("isFirstIdScan", isFirstIdScan);
//   // console.log("isLastIdScan", isLastIdScan);
//   // console.log("chaptersIdx", chaptersIdx);
//   // console.log("isFirstChapter", isFirstChapter);
//   // console.log("isLastChapter", isLastChapter);

//   // Create the previous and next link considering the current scan
//   // Handle the edge cases
//   let previousLink = null;
//   let nextLink = null;

//   if (!isFirstIdScan) {
//     // console.log("!isFirstIdScan", !isFirstIdScan);
//     previousLink = `/manga/${idManga}/${idChapter}/${Number(idScan) - 1}`;
//   } else {
//     if (!isFirstChapter) {
//       // console.log("!isFirstChapter", !isFirstChapter);
//       const previousIdChapter = String(chaptersIdx[currentIdxChapter - 1]);
//       const previousChapterLastIdScan =
//         chapters[previousIdChapter].content.length - 1;
//       previousLink = `/manga/${idManga}/${previousIdChapter}/${previousChapterLastIdScan}`;
//     }
//   }

//   if (!isLastIdScan) {
//     // console.log("!isLastIdScan", !isLastIdScan);
//     nextLink = `/manga/${idManga}/${idChapter}/${Number(idScan) + 1}`;
//   } else {
//     if (!isLastChapter) {
//       // console.log("!isLastChapter", !isLastChapter);
//       const nextIdChapter = String(chaptersIdx[currentIdxChapter + 1]);
//       const nextChapterFirstIdScan = 0;
//       nextLink = `/manga/${idManga}/${nextIdChapter}/${nextChapterFirstIdScan}`;
//     }
//   }

//   // console.log("previousLink", previousLink);
//   // console.log("nextLink", nextLink);
//   // console.log("imageURL", imageURL);

//   return {
//     props: {
//       idManga,
//       idChapter,
//       idScan,
//       chapter,
//       previousLink,
//       nextLink,
//       imageURL,
//     },
//   };
// }

export async function getServerSideProps(context) {
  // console.log("context", context);
  const { idManga, idChapter, idScan } = context.params;
  // let lObjManga = [];
  // const tmpLObjManga = await getMangasMeta();
  // // console.log("tmpLObjManga", tmpLObjManga);
  // // console.log("typeof tmpLObjManga", typeof tmpLObjManga);
  // if (tmpLObjManga !== undefined && typeof tmpLObjManga === "object") {
  //   const mangas = Object.values(tmpLObjManga);
  //   mangas.sort((obj1, obj2) => {
  //     return obj1.title.localeCompare(obj2.title);
  //   });
  //   lObjManga = mangas;
  // }

  // return {
  //   props: {
  //     // lObjManga,
  //   },
  // };

  // For scan address in DB, create a route
  // TODO: Use directly the DB
  const docId = idManga + "_chapters";
  const chapters = await getMangaChapters(docId);

  const chapter = chapters[idChapter];
  const imageURL = chapter.content[Number(idScan)];

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
  } else {
    if (!isFirstChapter) {
      // console.log("!isFirstChapter", !isFirstChapter);
      const previousIdChapter = String(chaptersIdx[currentIdxChapter - 1]);
      const previousChapterLastIdScan =
        chapters[previousIdChapter].content.length - 1;
      previousLink = `/manga/${idManga}/${previousIdChapter}/${previousChapterLastIdScan}`;
    }
  }

  if (!isLastIdScan) {
    // console.log("!isLastIdScan", !isLastIdScan);
    nextLink = `/manga/${idManga}/${idChapter}/${Number(idScan) + 1}`;
  } else {
    if (!isLastChapter) {
      // console.log("!isLastChapter", !isLastChapter);
      const nextIdChapter = String(chaptersIdx[currentIdxChapter + 1]);
      const nextChapterFirstIdScan = 0;
      nextLink = `/manga/${idManga}/${nextIdChapter}/${nextChapterFirstIdScan}`;
    }
  }

  // console.log("previousLink", previousLink);
  // console.log("nextLink", nextLink);
  // console.log("imageURL", imageURL);

  return {
    props: {
      idManga,
      idChapter,
      idScan,
      chapter,
      previousLink,
      nextLink,
      imageURL,
    },
  };
}
