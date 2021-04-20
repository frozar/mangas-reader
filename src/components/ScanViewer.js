import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";

import Button from "@material-ui/core/Button";

import DisplayImage from "./DisplayImage";
import WaitingComponent from "./WaitingComponent.js";

export default function ScanViewer(props) {
  const { path, idxChapter, imagesURL, previousChapter, nextChapter } = props;

  const [state, setState] = useState({ idxImage: 0, errorMsg: "" });
  const { idxImage } = state;

  const getPreviousImage = useCallback(async () => {
    let previousIdxImage;
    if (0 < idxImage) {
      // Go to the previous image
      previousIdxImage = idxImage - 1;
    } else if (idxImage === 0) {
      // Go to the previous chapter
      previousIdxImage = await previousChapter();
    }
    if (previousIdxImage !== null) {
      setState({ ...state, idxImage: previousIdxImage });
    }
  }, [idxImage, state, setState, previousChapter]);

  const getNextImage = useCallback(async () => {
    const idxImageMax = imagesURL.length - 1;
    let nextIdxImage;
    if (idxImage < idxImageMax) {
      // Go to the next image
      nextIdxImage = idxImage + 1;
    } else if (idxImage === idxImageMax) {
      // Go to the next chapter
      nextIdxImage = await nextChapter();
    }
    if (nextIdxImage !== null) {
      setState({ ...state, idxImage: nextIdxImage });
    }
  }, [imagesURL, idxImage, state, setState, nextChapter]);

  const handleKeyDown = useCallback(
    (evt) => {
      if (evt.key === "ArrowLeft") {
        getPreviousImage();
      } else if (evt.key === "ArrowRight") {
        getNextImage();
      }
    },
    [getPreviousImage, getNextImage]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // console.log("ScanViewer: idxImage", idxImage);

  console.log(
    "path !==  && idxChapter !== null && imagesURL.length !== 0",
    path !== "" && idxChapter !== null && imagesURL.length !== 0
  );
  const DisplayImageRended =
    path !== "" && idxChapter !== null && imagesURL.length !== 0 ? (
      <DisplayImage
        mangaInfo={{ idxChapter, idxImage }}
        imageURL={imagesURL[idxImage]}
        getPreviousImage={getPreviousImage}
        getNextImage={getNextImage}
      />
    ) : (
      <WaitingComponent loading={true} color="white" />
    );

  // if (path !== "" && idxChapter !== null && imagesURL.length !== 0) {
  //   const imageURL = imagesURL[idxImage];
  //   return (
  //     <>
  //       <Helmet>
  //         <style>{"body { background-color: black; }"}</style>
  //       </Helmet>
  //       <div>
  //         <Button
  //           style={{
  //             color: "black",
  //             textDecoration: "underline",
  //           }}
  //           variant="contained"
  //           color="primary"
  //           href="/manga"
  //         >
  //           Select Manga
  //         </Button>
  //       </div>
  //       <DisplayImage
  //         mangaInfo={{ idxChapter, idxImage }}
  //         imageURL={imageURL}
  //         getPreviousImage={getPreviousImage}
  //         getNextImage={getNextImage}
  //       />
  //     </>
  //   );
  // } else {
  //   return null;
  // }
  return (
    <>
      <Helmet>
        <style>{"body { background-color: black; }"}</style>
      </Helmet>
      <div>
        <Button
          style={{
            color: "black",
            textDecoration: "underline",
          }}
          variant="contained"
          color="primary"
          href="/manga"
        >
          Select Manga
        </Button>
      </div>
      {/* <DisplayImage
        mangaInfo={{ idxChapter, idxImage }}
        imageURL={imageURL}
        getPreviousImage={getPreviousImage}
        getNextImage={getNextImage}
      /> */}
      {DisplayImageRended}
    </>
  );
}
