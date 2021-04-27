import React, { useState, useEffect, useCallback } from "react";
import { useSpring } from "react-spring";
import { Helmet } from "react-helmet";

import WaitingComponent from "../WaitingComponent.js";
import DisplayImage from "./DisplayImage";
import TopBar from "./TopBar";
import ControlBar from "./ControlBar";
import ImageCaption from "./ImageCaption";

export default function ScanViewer(props) {
  const { path, idxChapter, imagesURL, previousChapter, nextChapter } = props;

  const [idxImage, setIdxImage] = useState(0);
  const [loading, setLoading] = useState(true);
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
      <TopBar path={path} idxChapter={idxChapter} setLoading={setLoading} />
      {path !== "" && idxChapter !== null && imagesURL.length !== 0 ? (
        <>
          <DisplayImage
            imageURL={imagesURL[idxImage]}
            loading={loading}
            setLoading={setLoading}
            setDisplayResetButton={setDisplayResetButton}
            resetPanAndZoom={resetPanAndZoom}
            set={set}
            springDict={{ x, y, zoom, scale }}
          />
          <ImageCaption idxImage={idxImage} imagesURL={imagesURL} />
          <ControlBar
            setLoading={setLoading}
            getPreviousImage={getPreviousImage}
            getNextImage={getNextImage}
            resetPanAndZoom={resetPanAndZoom}
            displayResetButton={displayResetButton}
          />
        </>
      ) : (
        <WaitingComponent loading={loading} color="white" />
      )}
    </>
  );
}
