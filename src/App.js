import React from "react";
// import axios from "axios";
// import PinchZoomPan from "react-responsive-pinch-zoom-pan";
// import Container from "@material-ui/core/Container";
// import Tooltip from "@material-ui/core/Tooltip";
// import CircularProgress from "@material-ui/core/CircularProgress";

// import MaximizableView from "./MaximizableView";
import "./App.css";
import ScanViewer from "./components/ScanViewer";

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
      // <div>
      //   {/* <MaximizableView backgroundColor="#efefef"> */}
      //   {/* <h3 style={{ textAlign: "center" }}>
      //     {`Chapter: ${idxChapter} - Scan: ${idxImg}`}
      //   </h3> */}

      //   {/* <div style={{ backgroundColor: "#555" }}>
      //     <div
      //       style={{
      //         width: "50%",
      //         // height: "94vh",
      //         marginLeft: "auto",
      //         marginRight: "auto",
      //       }}
      //     > */}

      //   <Container style={{ backgroundColor: "#555" }}>
      //     <Tooltip title={`Chapter: ${idxChapter} - Scan: ${idxImg}`}>
      //       <img
      //         style={{
      //           display: "flex",
      //           marginLeft: "auto",
      //           marginRight: "auto",
      //           height: "99vh",
      //         }}
      //         alt="manga"
      //         src={`https://lelscan.net/mangas/${MANGA_TITLE}/${idxChapter}/${strIdxImg}.jpg`}
      //         onError={this.handleOnError}
      //         onLoad={this.handleOnLoad}
      //       />
      //     </Tooltip>
      //     {/* <div
      //       style={{
      //         display: "flex",
      //         marginLeft: "auto",
      //         marginRight: "auto",
      //         // height: "99vh",
      //       }}
      //     >
      //       <CircularProgress />
      //     </div> */}
      //   </Container>
      //   {/* </div>
      //   </div> */}
      // </div>
      <ScanViewer />
    );
  }
}

export default App;
