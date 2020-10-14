import React from "react";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { withStyles } from "@material-ui/core/styles";

import DisplayImage from "./DisplayImage";
import SelectManga from "./SelectManga";
import { pingMangaDict } from "../Probe";

const styles = {
  backdrop: {
    zIndex: 10, // arbitrary value
    color: "#111",
  },
};

// const MANGA_TITLE = "one-piece";
const ACTION_INC = 1;
const ACTION_DEC = -1;

class ScanViewer extends React.Component {
  state = {
    idxChapter: 991,
    idxImage: 3,
    action: null,
    imageDisplayed: false,
    mangaURL: "one-piece",
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
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
    }
    if (evt.key === "ArrowRight") {
      this.setState({
        imageDisplayed: false,
        idxImage: idxImage + 1,
        action: ACTION_INC,
      });
    }
  };

  imageLoaded = () => {
    this.setState({ imageDisplayed: true, action: null });
  };

  // TODO: retrieve manga object: title + URLpath
  selectManga = (mangaURL) => {
    this.setState({ mangaURL });
    console.log("selectManga");
  };

  render() {
    const { mangaURL, idxChapter, idxImage, imageDisplayed } = this.state;
    const { classes } = this.props;

    pingMangaDict(mangaURL, idxChapter, idxImage);
    return (
      <Container>
        <Backdrop className={classes.backdrop} open={!imageDisplayed}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <SelectManga selectManga={this.selectManga} />
        <DisplayImage
          mangaURL={mangaURL}
          idxChapter={idxChapter}
          idxImage={idxImage}
          imageLoaded={this.imageLoaded}
        />
        {/* <DiscoverManga
          mangaTitle={MANGA_TITLE}

          idxChapter={probeIdxChapter}
          idxImage={probeIdxImage}
        /> */}
      </Container>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ScanViewer);
