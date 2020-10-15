import React from "react";

import DisplayImage from "./DisplayImage";
import WaitingScreen from "./WaitingScreen";
import { pingMangaDict } from "../probe";

const ACTION_INC = 1;
const ACTION_DEC = -1;

class ScanViewer extends React.Component {
  state = {
    mangaURL: "",
    idxChapter: null,
    idxImage: null,
    action: null,
    imageDisplayed: false,
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
  }

  componentDidUpdate() {
    const { mangaURL, idxChapter } = this.props;
    if (
      !(
        mangaURL === this.state.mangaURL && idxChapter === this.state.idxChapter
      )
    ) {
      this.setState({ mangaURL, idxChapter, idxImage: 0 });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  handleKeyPress = (evt) => {
    // TODO: check mangaDict to:
    // 1/ Trigger the update of mangaDict if information not found
    // 2/ Compute the next move, maybe compute by the probe
    const { idxImage } = this.state;
    if (evt.key === "ArrowLeft") {
      this.setState({
        imageDisplayed: false,
        idxImage: idxImage - 1,
        action: ACTION_DEC,
      });
      window.scrollTo(0, 0);
    }
    if (evt.key === "ArrowRight") {
      this.setState({
        imageDisplayed: false,
        idxImage: idxImage + 1,
        action: ACTION_INC,
      });
      window.scrollTo(0, 0);
    }
  };

  imageLoaded = () => {
    this.setState({ imageDisplayed: true, action: null });
  };

  render() {
    const { mangaURL, idxChapter, idxImage, imageDisplayed } = this.state;

    if (!(mangaURL !== "" && idxChapter !== null && idxImage !== null)) {
      return <WaitingScreen open={!imageDisplayed} />;
    } else {
      pingMangaDict(mangaURL, idxChapter, idxImage);
      return (
        <React.Fragment>
          <WaitingScreen open={!imageDisplayed} />
          <DisplayImage
            mangaURL={mangaURL}
            idxChapter={idxChapter}
            idxImage={idxImage}
            imageLoaded={this.imageLoaded}
          />
        </React.Fragment>
      );
    }
  }
}

export default ScanViewer;
