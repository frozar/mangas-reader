import React from "react";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Backdrop from "@material-ui/core/Backdrop";
import { withStyles, makeStyles } from "@material-ui/core/styles";

import DisplayImage from "./DisplayImage";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#111",
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
}));

const MANGA_TITLE = "one-piece";
const ACTION_INC = 1;
const ACTION_DEC = -1;

class ScanViewer extends React.Component {
  state = { idxChapter: 991, idxImg: 3, action: null, imageDisplayed: false };

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

  render() {
    const { idxChapter, idxImg, imageDisplayed } = this.state;
    const { classes } = this.props;
    return (
      <Container style={{ backgroundColor: "#555" }}>
        <Backdrop className={classes.backdrop} open={!imageDisplayed}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Box style={{ display: imageDisplayed ? "flex" : "none" }}>
          <DisplayImage
            mangaTitle={MANGA_TITLE}
            idxChapter={idxChapter}
            idxImg={idxImg}
            imageLoaded={this.imageLoaded}
          />
        </Box>
      </Container>
    );
  }
}

export default withStyles(useStyles, { withTheme: true })(ScanViewer);
