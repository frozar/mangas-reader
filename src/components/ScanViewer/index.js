import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";

import WaitingComponent from "../WaitingComponent.js";
import DisplayImage from "./DisplayImage";
import TopBar from "./TopBar";

export default function ScanViewer(props) {
  const { path, idxChapter, imagesURL, previousChapter, nextChapter } = props;

  const [idxImage, setIdxImage] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setIdxImage(previousIdxImage);
    }
  }, [idxImage, setIdxImage, previousChapter]);

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
      setIdxImage(nextIdxImage);
    }
  }, [imagesURL, idxImage, setIdxImage, nextChapter]);

  const handleKeyDown = useCallback(
    (evt) => {
      if (evt.key === "ArrowLeft") {
        setLoading(true);
        getPreviousImage();
      } else if (evt.key === "ArrowRight") {
        setLoading(true);
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

  return (
    <>
      <Helmet>
        <style>{"body { background-color: black; }"}</style>
      </Helmet>
      <TopBar
        path={path}
        idxChapter={idxChapter}
        imagesURL={imagesURL}
        idxImage={idxImage}
        setLoading={setLoading}
      />
      {path !== "" && idxChapter !== null && imagesURL.length !== 0 ? (
        <DisplayImage
          imageURL={imagesURL[idxImage]}
          getPreviousImage={getPreviousImage}
          getNextImage={getNextImage}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <WaitingComponent loading={loading} color="white" />
      )}
    </>
  );
}
