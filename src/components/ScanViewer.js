import React from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import Slide from "@material-ui/core/Slide";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import DisplayImage from "./DisplayImage";
import WaitingScreen from "./WaitingScreen";
import {
  discoverManga,
  pingMangaDict,
  previousImage,
  nextImage,
  KEY_LAST_CHAPTER,
} from "../probe";

class ScanViewer extends React.Component {
  initState = {
    idxChapter: null,
    idxImage: 0,
    displayedImage: false,
    offsetX: 0,
    errorMsg: "",
    action: "",
    in: false,
  };
  state = {
    mangaURL: "",
    initIdxChapter: 0,
    ...this.initState,
  };

  mayUpdateMangaURL = () => {
    if (this.state.mangaURL !== this.props.mangaURL) {
      this.setState({
        mangaURL: this.props.mangaURL,
        ...this.initState,
      });
      discoverManga(this.props.mangaURL, this.updateIdxLastChapter);
    } else if (this.state.initIdxChapter !== this.props.idxChapter) {
      this.setState({
        ...this.initState,
        mangaURL: this.props.mangaURL,
        initIdxChapter: this.props.idxChapter,
        idxChapter: this.props.idxChapter,
        idxImage: 0,
      });
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.mayUpdateMangaURL();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (evt) => {
    const { displayedImage } = this.state;
    if (displayedImage && evt.shiftKey && evt.key === "Enter") {
      this.setState({ action: "PREVIOUS", in: false });
    } else if (displayedImage && !evt.shiftKey && evt.key === "Enter") {
      this.setState({ action: "NEXT", in: false });
    }
  };

  componentDidUpdate = () => {
    this.mayUpdateMangaURL();
    // const { offsetX } = this.state;
    // console.log({ offsetX });
    // if (offsetX === null) {
    const { mangaURL, idxChapter, idxImage } = this.state;
    // console.log("componentDidUpdate", { mangaURL, idxChapter, idxImage });
    probeImage(
      "probe-current",
      { mangaURL, idxChapter, idxImage },
      this.setOffsetX
    );
    // console.log("this.state", this.state);
    // }
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
        offsetX: 0,
        // action: "",
      });
      window.scrollTo(0, 0);
    }
  };

  handleOnExited = () => {
    const { action } = this.state;
    if (action === "PREVIOUS") {
      this.moveImage(previousImage, "No previous scan");
    } else if (action === "NEXT") {
      this.moveImage(nextImage, "No next scan");
    }
  };

  imageLoaded = () => {
    this.setState({
      displayedImage: true,
    });
    const { mangaURL, idxChapter, idxImage } = this.state;
    // I - Discover the current and sibling chapter if not done
    pingMangaDict(mangaURL, idxChapter, idxImage);
    // II - Probe the next image
    const nextMangaInfo = nextImage(mangaURL, idxChapter, idxImage);
    if (typeof nextMangaInfo === "object") {
      // console.log("BEFORE nextMangaInfo");
      probeImage("probe-next", nextMangaInfo);
      // console.log("AFTER  nextMangaInfo");
    }
    const previousMangaInfo = previousImage(mangaURL, idxChapter, idxImage);
    if (typeof previousMangaInfo === "object") {
      // console.log("BEFORE previousMangaInfo");
      probeImage("probe-previous", previousMangaInfo);
      // console.log("AFTER  previousMangaInfo");
    }
  };

  updateIdxLastChapter = (mangaURL, dict) => {
    const idxLastChapter = dict[KEY_LAST_CHAPTER];
    this.setState({ mangaURL, idxChapter: idxLastChapter });
  };

  setOffsetX = (ref) => {
    // console.log("ScanViewer: setOffsetX", ref);
    const midWindowWidth = window.innerWidth / 2;
    const midImageFrameWidth = ref.current.offsetWidth / 2;
    const signedDist = midWindowWidth - midImageFrameWidth;
    const offsetX = 0 < signedDist ? signedDist : 0;
    // console.log({ midWindowWidth, midImageFrameWidth, signedDist, offsetX });
    this.setState({ offsetX, in: true });
  };

  // TODO: Show a progress bar over the current chapter
  render() {
    const { mangaURL, idxChapter, idxImage } = this.state;

    if (mangaURL !== this.props.mangaURL) {
      return <WaitingScreen open={true} />;
    }

    if (!(mangaURL !== "" && idxChapter !== null && idxImage !== null)) {
      return <WaitingScreen open={true} />;
    } else {
      const displayedImageProp = this.state.displayedImage;
      const offsetXProp = this.state.offsetX;
      const inProp = this.state.in;

      let directionProp = "";
      const { action } = this.state;
      if (inProp) {
        if (action === "PREVIOUS") {
          directionProp = "right";
        } else if (action === "NEXT") {
          directionProp = "left";
        } else {
          directionProp = "left";
        }
      } else {
        if (action === "PREVIOUS") {
          directionProp = "left";
        } else if (action === "NEXT") {
          directionProp = "right";
        } else {
          directionProp = "right";
        }
      }
      const timeout = 500;
      // console.log({ offsetXProp, action, inProp, directionProp });
      return (
        <React.Fragment>
          <WaitingScreen open={!displayedImageProp} />
          <Button
            style={{ position: "fixed", top: "10px", left: "10px" }}
            variant="contained"
            color="primary"
          >
            <Link
              style={{ color: "white" }}
              to="/select/manga"
              className="item"
            >
              Select Manga
            </Link>
          </Button>
          <Slide
            direction={directionProp}
            in={inProp}
            mountOnEnter
            unmountOnExit
            onExited={this.handleOnExited}
            timeout={timeout}
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

function probeImage(htmlId, mangaInfo, getRef) {
  // console.log("probeImage mangaInfo:", mangaInfo);
  const { mangaURL, idxChapter, idxImage } = mangaInfo;
  if (mangaURL !== "" && idxChapter !== null && idxImage !== null) {
    ReactDOM.render(
      <Box style={{ visibility: "hidden", position: "fixed", top: 0, left: 0 }}>
        <DisplayImage {...{ mangaInfo, getRef }} />
      </Box>,
      document.querySelector("#" + htmlId)
    );
  }
}

export default ScanViewer;
