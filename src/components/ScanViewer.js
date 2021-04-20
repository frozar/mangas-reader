import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";

import Button from "@material-ui/core/Button";

import DisplayImage from "./DisplayImage";
import WaitingComponent from "./WaitingComponent.js";

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

  // console.log(
  //   "path !==  && idxChapter !== null && imagesURL.length !== 0",
  //   path !== "" && idxChapter !== null && imagesURL.length !== 0
  // );
  const DisplayImageRended =
    path !== "" && idxChapter !== null && imagesURL.length !== 0 ? (
      <DisplayImage
        mangaInfo={{ idxChapter, idxImage }}
        imageURL={imagesURL[idxImage]}
        getPreviousImage={getPreviousImage}
        getNextImage={getNextImage}
        loading={loading}
        setLoading={setLoading}
      />
    ) : (
      <WaitingComponent loading={loading} color="white" />
    );

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
      {DisplayImageRended}
    </>
  );
}
