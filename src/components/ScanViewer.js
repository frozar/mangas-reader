import React from "react";
// import ReactDOM from "react-dom";

import DisplayImage from "./DisplayImage";
import WaitingScreen from "./WaitingScreen";
import {
  discoverManga,
  pingMangaDict,
  previousImage,
  nextImage,
} from "../probe";

class ScanViewer extends React.Component {
  constructor(props) {
    super(props);
    this.imageFrame = React.createRef();
  }

  state = {
    mangaURL: "",
    idxChapter: null,
    idxImage: 0,
    imageDisplayed: false,
    offsetX: 0,
    errorMsg: "",
  };

  mayUpdateMangaURL = () => {
    if (this.state.mangaURL !== this.props.mangaURL) {
      this.setState({
        mangaURL: this.props.mangaURL,
        idxChapter: null,
        idxImage: 0,
        offsetX: 0,
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

  componentDidUpdate() {
    this.mayUpdateMangaURL();
  }

  handleKeyDown = (evt) => {
    // TODO: handle a zoom level for the current image
    // if ((evt.ctrlKey && evt.key === "+") || (evt.ctrlKey && evt.key === "-")) {
    //   evt.preventDefault();
    //   console.log("Ctrl +");
    // }

    const { mangaURL, idxChapter, idxImage, imageDisplayed } = this.state;
    if (imageDisplayed && evt.shiftKey && evt.key === "Enter") {
      let answer = previousImage(mangaURL, idxChapter, idxImage);
      while (answer === "NOT_READY") {
        answer = previousImage(mangaURL, idxChapter, idxImage);
      }
      if (answer === "NO_PREVIOUS_IMAGE") {
        this.setState({ errorMsg: "No previous scan" });
      } else if (typeof answer === "object") {
        this.setState({
          ...answer,
          imageDisplayed: false,
        });
        window.scrollTo(0, 0);
      }
    } else if (imageDisplayed && !evt.shiftKey && evt.key === "Enter") {
      let answer = nextImage(mangaURL, idxChapter, idxImage);

      while (answer === "NOT_READY") {
        answer = nextImage(mangaURL, idxChapter, idxImage);
      }
      if (answer === "NO_NEXT_IMAGE") {
        this.setState({ errorMsg: "No next scan" });
      } else if (typeof answer === "object") {
        this.setState({
          ...answer,
          imageDisplayed: false,
        });
        window.scrollTo(0, 0);
      }
    }
  };

  centerImage = () => {
    const midWindowWidth = window.innerWidth / 2;
    const midImageFrameWidth = this.imageFrame.current.offsetWidth / 2;
    const signedDist = midWindowWidth - midImageFrameWidth;
    const offsetX = 0 < signedDist ? signedDist : 0;
    this.setState({ offsetX: offsetX });
  };

  imageLoaded = () => {
    this.centerImage();
    const { mangaURL, idxChapter, idxImage } = this.state;
    pingMangaDict(mangaURL, idxChapter, idxImage);
    this.setState({ imageDisplayed: true, action: null });
  };

  updateIdxLastChapter = (mangaURL, idxLastChapter) => {
    this.setState({ mangaURL, idxChapter: idxLastChapter });
  };

  // TODO: Show a progress bar over the current chapter
  render() {
    // console.log("render: ", this.state);
    const { mangaURL, idxChapter, idxImage, imageDisplayed } = this.state;

    if (mangaURL !== this.props.mangaURL) {
      // this.setState({ mangaURL, idxChapter: null, idxImage: 0 });
      return <WaitingScreen open={!imageDisplayed} />;
      // return null;
    }

    if (!(mangaURL !== "" && idxChapter !== null && idxImage !== null)) {
      return <WaitingScreen open={!imageDisplayed} />;
      // return null;
    } else {
      // console.log("state", this.state);
      return (
        <React.Fragment>
          <WaitingScreen open={!imageDisplayed} />
          <div
            style={{
              display: "inline-block",
              position: "relative",
              left: `${this.state.offsetX}px`,
            }}
            ref={this.imageFrame}
          >
            <DisplayImage
              mangaURL={mangaURL}
              idxChapter={idxChapter}
              idxImage={idxImage}
              imageLoaded={this.imageLoaded}
            />
          </div>
        </React.Fragment>
      );
    }
  }
}

export default ScanViewer;
