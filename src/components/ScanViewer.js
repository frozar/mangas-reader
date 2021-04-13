import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { CSSTransition } from "react-transition-group";
import LinearProgress from "@material-ui/core/LinearProgress";

import DisplayImage from "./DisplayImage";

class ScanViewer extends React.Component {
  state = {
    idxImage: 0,
    errorMsg: "",
  };

  previousImage = async (imagesURL, idxImage) => {
    let previousIdxImage;
    if (0 < idxImage) {
      // Go to the previous image
      previousIdxImage = idxImage - 1;
    } else if (idxImage === 0) {
      // Go to the previous chapter
      previousIdxImage = await this.props.previousChapter();
    }
    if (previousIdxImage !== null) {
      this.setState({ idxImage: previousIdxImage });
    }
  };

  nextImage = async (imagesURL, idxImage) => {
    const idxImageMax = imagesURL.length - 1;
    let nextIdxImage;
    if (idxImage < idxImageMax) {
      // Go to the next image
      nextIdxImage = idxImage + 1;
    } else if (idxImage === idxImageMax) {
      // Go to the next chapter
      nextIdxImage = await this.props.nextChapter();
    }
    if (nextIdxImage !== null) {
      this.setState({ idxImage: nextIdxImage });
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (evt) => {
    const { imagesURL } = this.props;
    const { idxImage } = this.state;
    let followingImageFct;
    if (evt.key === "ArrowLeft") {
      followingImageFct = this.previousImage;
    } else if (evt.key === "ArrowRight") {
      followingImageFct = this.nextImage;
    }
    if (followingImageFct) {
      followingImageFct(imagesURL, idxImage);
    }
  };

  render() {
    const { path, idxChapter, imagesURL } = this.props;
    const { idxImage } = this.state;

    let progressBarValue = 0;
    if (0 < imagesURL.length) {
      const nbImage = imagesURL.length;
      progressBarValue = ((idxImage + 1) / nbImage) * 100;
    }

    if (path !== "" && idxChapter !== null && imagesURL.length !== 0) {
      const imageURL = imagesURL[idxImage];
      return (
        <React.Fragment>
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
          <CSSTransition
            in={true}
            appear={true}
            timeout={500}
            classNames="fade"
          >
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
        </React.Fragment>
      );
    } else {
      return null;
    }
  }
}

export default ScanViewer;
