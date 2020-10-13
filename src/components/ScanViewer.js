import React from "react";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Backdrop from "@material-ui/core/Backdrop";
import { withStyles, makeStyles } from "@material-ui/core/styles";

import DisplayImage from "./DisplayImage";

const useStyles = makeStyles((theme) => {
  console.log("theme", theme);
  return {
    // root: {
    //   backgroundColor: "#000",
    // },
    // root: {
    //   zIndex: 10,
    // },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#111",
      backgroundColor: "red",
    },
  };
});

const styles = {
  // root: {
  //   background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  //   border: 0,
  //   borderRadius: 3,
  //   boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  //   color: 'white',
  //   height: 48,
  //   padding: '0 30px',
  // },
  backdrop: {
    zIndex: 10,
    color: "#111",
    // backgroundColor: "red",
  },
};

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
    console.log(this.props);
    return (
      <Container>
        <Backdrop className={classes.backdrop} open={!imageDisplayed}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {/* <Box style={{ display: imageDisplayed ? "flex" : "none" }}> */}
        <Box style={{ display: "flex" }}>
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

export default withStyles(styles, { withTheme: true })(ScanViewer);
