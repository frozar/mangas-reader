import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { CSSTransition } from "react-transition-group";
import LinearProgress from "@material-ui/core/LinearProgress";

import DisplayImage from "./DisplayImage";

export default function ScanViewer(props) {
  const [state, setState] = useState({ idxImage: 0, errorMsg: "" });

  useEffect(() => {
    const previousImage = async (imagesURL, idxImage) => {
      let previousIdxImage;
      if (0 < idxImage) {
        // Go to the previous image
        previousIdxImage = idxImage - 1;
      } else if (idxImage === 0) {
        // Go to the previous chapter
        previousIdxImage = await props.previousChapter();
      }
      if (previousIdxImage !== null) {
        setState({ ...state, idxImage: previousIdxImage });
      }
    };

    const nextImage = async (imagesURL, idxImage) => {
      const idxImageMax = imagesURL.length - 1;
      let nextIdxImage;
      if (idxImage < idxImageMax) {
        // Go to the next image
        nextIdxImage = idxImage + 1;
      } else if (idxImage === idxImageMax) {
        // Go to the next chapter
        nextIdxImage = await props.nextChapter();
      }
      if (nextIdxImage !== null) {
        setState({ ...state, idxImage: nextIdxImage });
      }
    };

    const handleKeyDown = (evt) => {
      const { imagesURL } = props;
      const { idxImage } = state;
      let followingImageFct;
      if (evt.key === "ArrowLeft") {
        followingImageFct = previousImage;
      } else if (evt.key === "ArrowRight") {
        followingImageFct = nextImage;
      }
      if (followingImageFct) {
        followingImageFct(imagesURL, idxImage);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [props, state]);

  const { path, idxChapter, imagesURL } = props;
  const { idxImage } = state;

  let progressBarValue = 0;
  if (0 < imagesURL.length) {
    const nbImage = imagesURL.length;
    progressBarValue = ((idxImage + 1) / nbImage) * 100;
  }

  if (path !== "" && idxChapter !== null && imagesURL.length !== 0) {
    const imageURL = imagesURL[idxImage];
    return (
      <>
        <Button
          style={{
            float: "left",
            top: "10px",
            left: "10px",
          }}
          variant="contained"
          color="primary"
        >
          <Link style={{ color: "white" }} to="/manga" className="item">
            Select Manga
          </Link>
        </Button>
        <CSSTransition in={true} appear={true} timeout={500} classNames="fade">
          <DisplayImage
            mangaInfo={{ idxChapter, idxImage }}
            imageURL={imageURL}
          />
        </CSSTransition>

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
