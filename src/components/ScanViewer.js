import React from "react";
import ReactDOM from "react-dom";
import Slide from "@material-ui/core/Slide";

import DisplayImage from "./DisplayImage";
import WaitingScreen from "./WaitingScreen";
// import probeImage from "./ProbeImage";
import {
  discoverManga,
  pingMangaDict,
  previousImage,
  nextImage,
} from "../probe";

class ScanViewer extends React.Component {
  state = {
    mangaURL: "",
    idxChapter: null,
    idxImage: 0,
    previousMangaURL: "", // Not used
    previousIdxChapter: null, // Not used
    previousIdxImage: 0, // Not used
    previousOffsetX: 0,
    displayedImage: false,
    offsetX: null,
    errorMsg: "",
  };

  mayUpdateMangaURL = () => {
    if (this.state.mangaURL !== this.props.mangaURL) {
      this.setState({
        mangaURL: this.props.mangaURL,
        idxChapter: null,
        idxImage: 0,
        offsetX: null,
      });
      discoverManga(this.props.mangaURL, this.updateIdxLastChapter);
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.mayUpdateMangaURL();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate = () => {
    this.mayUpdateMangaURL();
    const { mangaURL, idxChapter, idxImage } = this.state;
    // console.log({ mangaURL, idxChapter, idxImage });
    probeImage({ mangaURL, idxChapter, idxImage }, this.setOffsetX);
    // console.log("this.state", this.state);
  };

  handleKeyDown = (evt) => {
    const { mangaURL, idxChapter, idxImage, displayedImage } = this.state;
    if (displayedImage && evt.shiftKey && evt.key === "Enter") {
      let answer = previousImage(mangaURL, idxChapter, idxImage);
      while (answer === "NOT_READY") {
        answer = previousImage(mangaURL, idxChapter, idxImage);
      }
      if (answer === "NO_PREVIOUS_IMAGE") {
        this.setState({ errorMsg: "No previous scan" });
      } else if (typeof answer === "object") {
        this.setState({
          ...answer,
          displayedImage: false,
          offsetX: null,
          previousMangaURL: this.state.mangaURL,
          previousIdxChapter: this.state.idxChapter,
          previousIdxImage: this.state.idxImage,
          previousOffsetX: this.state.offsetX,
        });
        window.scrollTo(0, 0);
      }
    } else if (displayedImage && !evt.shiftKey && evt.key === "Enter") {
      let answer = nextImage(mangaURL, idxChapter, idxImage);

      while (answer === "NOT_READY") {
        answer = nextImage(mangaURL, idxChapter, idxImage);
      }
      if (answer === "NO_NEXT_IMAGE") {
        this.setState({ errorMsg: "No next scan" });
      } else if (typeof answer === "object") {
        this.setState({
          ...answer,
          displayedImage: false,
          offsetX: null,
          previousMangaURL: this.state.mangaURL,
          previousIdxChapter: this.state.idxChapter,
          previousIdxImage: this.state.idxImage,
          previousOffsetX: this.state.offsetX,
        });
        window.scrollTo(0, 0);
      }
    }
  };

  imageLoaded = () => {
    // this.centerImage();
    const { mangaURL, idxChapter, idxImage } = this.state;
    pingMangaDict(mangaURL, idxChapter, idxImage);
    this.setState({ displayedImage: true, action: null });
  };

  updateIdxLastChapter = (mangaURL, idxLastChapter) => {
    this.setState({ mangaURL, idxChapter: idxLastChapter });
  };

  setOffsetX = (ref) => {
    // console.log("ScanViewer: setOffsetX", ref);
    const midWindowWidth = window.innerWidth / 2;
    const midImageFrameWidth = ref.current.offsetWidth / 2;
    const signedDist = midWindowWidth - midImageFrameWidth;
    const offsetX = 0 < signedDist ? signedDist : 0;
    // console.log({ midWindowWidth, midImageFrameWidth, signedDist, offsetX });
    if (this.state.offsetX !== offsetX) {
      this.setState({ offsetX });
    }
  };

  // TODO: Show a progress bar over the current chapter
  render() {
    // console.log("render: ", this.state);
    const { mangaURL, idxChapter, idxImage, displayedImage } = this.state;

    if (mangaURL !== this.props.mangaURL) {
      return <WaitingScreen open={!displayedImage} />;
    }

    if (!(mangaURL !== "" && idxChapter !== null && idxImage !== null)) {
      return <WaitingScreen open={!displayedImage} />;
    } else {
      // console.log(this.state);
      // const visibilityStyle = displayedImage ? "visible" : "hidden"
      const offsetXProp = this.state.offsetX;
      const inProp = offsetXProp !== null;
      const visibilityProp = inProp ? "visible" : "hidden";
      // console.log({ offsetXProp, inProp });
      return (
        <React.Fragment>
          <WaitingScreen open={!displayedImage} />
          <Slide
            direction="left"
            in={inProp}
            mountOnEnter
            unmountOnExit
            timeout={2000}
          >
            <DisplayImage
              imageInfo={{ mangaURL, idxChapter, idxImage }}
              imageLoaded={this.imageLoaded}
              visibility={visibilityProp}
              offsetX={offsetXProp}
            />
          </Slide>
        </React.Fragment>
      );
    }
  }
}

function probeImage(imageInfo, getRef) {
  ReactDOM.render(
    <DisplayImage imageInfo={imageInfo} getRef={getRef} visibility="hidden" />,
    document.querySelector("#probe")
  );
}

export default ScanViewer;
