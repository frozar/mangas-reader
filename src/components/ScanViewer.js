import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";

// import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
// import { CSSTransition } from "react-transition-group";
import LinearProgress from "@material-ui/core/LinearProgress";

import DisplayImage from "./DisplayImage";

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

  let progressBarValue = 0;
  if (0 < imagesURL.length) {
    const nbImage = imagesURL.length;
    progressBarValue = ((idxImage + 1) / nbImage) * 100;
  }

  if (path !== "" && idxChapter !== null && imagesURL.length !== 0) {
    const imageURL = imagesURL[idxImage];
    return (
      <>
        <Helmet>
          <style>{"body { background-color: black; }"}</style>
        </Helmet>
        <div>
          <Button
            style={{
              // float: "left",
              // top: "10px",
              // left: "10px",
              color: "black",
            }}
            variant="contained"
            color="primary"
            href="/manga"
            // className="item"
          >
            {/* <Link style={{ color: "white" }} to="/manga" className="item"> */}
            Select Manga
            {/* </Link> */}
          </Button>
        </div>
        {/* <CSSTransition in={true} appear={true} timeout={500} classNames="fade"> */}
        <DisplayImage
          mangaInfo={{ idxChapter, idxImage }}
          imageURL={imageURL}
          getPreviousImage={getPreviousImage}
          getNextImage={getNextImage}
        />
        {/* </CSSTransition> */}

        <LinearProgress
          style={{
            position: "fixed",
            bottom: "0px",
            overflow: "inherit",
            height: "0.4em",
            width: "-webkit-fill-available",
            zIndex: 10000,
          }}
          variant="determinate"
          value={progressBarValue}
        />
      </>
    );
  } else {
    return null;
  }
}
