import React from "react";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { withStyles } from "@material-ui/core/styles";

import DisplayImage from "./DisplayImage";
import SelectManga from "./SelectManga";

const styles = {
  backdrop: {
    zIndex: 10, // arbitrary value
    color: "#111",
  },
};

const MANGA_TITLE = "one-piece";
const ACTION_INC = 1;
const ACTION_DEC = -1;

class ScanViewer extends React.Component {
  state = {
    idxChapter: 991,
    idxImg: 3,
    action: null,
    imageDisplayed: false,
    mangaPath: "one-piece",
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  handleKeyPress = (evt) => {
    const { idxImg } = this.state;
    if (evt.key === "ArrowLeft") {
      this.setState({ imageDisplayed: false });
      this.setState({ idxImg: idxImg - 1, action: ACTION_DEC });
    }
    if (evt.key === "ArrowRight") {
      this.setState({ imageDisplayed: false });
      this.setState({ idxImg: idxImg + 1, action: ACTION_INC });
    }
  };

  imageLoaded = () => {
    this.setState({ imageDisplayed: true });
  };

  selectManga = (mangaPath) => {
    this.setState({ mangaPath: mangaPath });
    console.log(mangaPath);
  };

  render() {
    const { idxChapter, idxImg, imageDisplayed } = this.state;
    const { classes } = this.props;
    return (
      <Container>
        <Backdrop className={classes.backdrop} open={!imageDisplayed}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <SelectManga selectManga={this.selectManga} />
        <DisplayImage
          mangaTitle={MANGA_TITLE}
          idxChapter={idxChapter}
          idxImg={idxImg}
          imageLoaded={this.imageLoaded}
        />
      </Container>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ScanViewer);
