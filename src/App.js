import React from "react";
// import axios from "axios";
// import PinchZoomPan from "react-responsive-pinch-zoom-pan";
// import Container from "@material-ui/core/Container";
// import Tooltip from "@material-ui/core/Tooltip";
// import CircularProgress from "@material-ui/core/CircularProgress";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

// import MaximizableView from "./MaximizableView";
import "./App.css";
import ScanViewer from "./components/ScanViewer";
import { Container } from "@material-ui/core";

// Documentation link:
// https://www.colorhexa.com/aaaec1
const theme = createMuiTheme({
  palette: {
    background: {
      default: "#aaaec1",
    },
  },
});

// const ACTION_INC = 1;
// const ACTION_DEC = -1;
const START_IDX = 0;
const MAX_IDX = 30;
const MANGA_TITLE = "one-piece";
// one-punch-man

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { idxChapter: 991, idxImg: 3, action: null };
  }

  // componentDidMount() {
  //   document.addEventListener("keydown", this.handleKeyPress);
  // }

  // // componentDidUpdate() {
  // //   console.log("idxChapter", this.state.idxChapter);
  // //   console.log("idxImg", this.state.idxImg);
  // // }

  // componentWillUnmount() {
  //   document.removeEventListener("keydown", this.handleKeyPress);
  // }

  // handleKeyPress = (evt) => {
  //   const { idxImg } = this.state;
  //   if (evt.key === "ArrowLeft") {
  //     this.setState({ idxImg: idxImg - 1, action: ACTION_DEC });
  //   }
  //   if (evt.key === "ArrowRight") {
  //     this.setState({ idxImg: idxImg + 1, action: ACTION_INC });
  //   }
  // };

  // handleOnError = (evt) => {
  //   // console.log(evt);
  //   // console.log(evt.target);
  //   const { action, idxImg, idxChapter } = this.state;
  //   console.log(this.state);
  //   console.log(action === ACTION_DEC && idxImg === START_IDX);
  //   console.log(action === ACTION_DEC && START_IDX < idxImg);
  //   console.log(START_IDX === idxImg);
  //   console.log(START_IDX < idxImg);
  //   if (action === ACTION_DEC && START_IDX - 1 === idxImg) {
  //     this.setState({
  //       idxChapter: idxChapter - 1,
  //       idxImg: MAX_IDX,
  //     });
  //   } else if (action === ACTION_DEC && START_IDX < idxImg) {
  //     this.setState({
  //       idxChapter: idxChapter,
  //       idxImg: idxImg - 1,
  //     });
  //   } else if (action === ACTION_INC) {
  //     // First error to get the next image:
  //     // should try the next chapter
  //     if (idxImg !== START_IDX) {
  //       this.setState({
  //         idxChapter: idxChapter + 1,
  //         idxImg: START_IDX,
  //       });
  //     }
  //     // Second error in a row to get the next image:
  //     // the next chapter doesn't exist, get back to the previous chapter
  //     else {
  //       this.setState({
  //         idxChapter: idxChapter - 1,
  //         idxImg: START_IDX,
  //       });
  //     }
  //   }
  // };

  // handleOnLoad = () => {
  //   console.log("Loading");
  // };

  render() {
    // const { idxChapter, idxImg } = this.state;
    // const strIdxImg = idxImg.toLocaleString(undefined, {
    //   minimumIntegerDigits: 2,
    // });
    return (
      <ThemeProvider theme={theme}>
        {/* <Container className={classes.root}> */}

        <CssBaseline />
        <ScanViewer />
      </ThemeProvider>
    );
  }
}

export default App;
