import React from "react";
import ReactDOM from "react-dom";
import Slide from "@material-ui/core/Slide";
import Box from "@material-ui/core/Box";

import DisplayImage from "./DisplayImage";
import WaitingScreen from "./WaitingScreen";
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

  moveImage = (previousOrNextImage, errorMsg) => {
    const { mangaURL, idxChapter, idxImage } = this.state;
    let answer = previousOrNextImage(mangaURL, idxChapter, idxImage);
    while (answer === "NOT_READY") {
      answer = previousOrNextImage(mangaURL, idxChapter, idxImage);
    }
    if (answer === "NO_IMAGE") {
      this.setState({ errorMsg });
    } else if (typeof answer === "object") {
      this.setState({
        ...answer,
        displayedImage: false,
        offsetX: null,
      });
      window.scrollTo(0, 0);
    }
  };

  handleKeyDown = (evt) => {
    const { displayedImage } = this.state;
    if (displayedImage && evt.shiftKey && evt.key === "Enter") {
      this.moveImage(previousImage, "No previous scan");
    } else if (displayedImage && !evt.shiftKey && evt.key === "Enter") {
      this.moveImage(nextImage, "No next scan");
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
      const offsetXProp = this.state.offsetX;
      const inProp = offsetXProp !== null;
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
              mangaInfo={{ mangaURL, idxChapter, idxImage }}
              imageLoaded={this.imageLoaded}
              offsetX={offsetXProp}
            />
          </Slide>
        </React.Fragment>
      );
    }
  }
}

function probeImage(mangaInfo, getRef) {
  ReactDOM.render(
    <Box style={{ visibility: "hidden", position: "fixed", top: 0, left: 0 }}>
      <DisplayImage {...{ mangaInfo, getRef }} />
    </Box>,
    document.querySelector("#probe")
  );
}

export default ScanViewer;
