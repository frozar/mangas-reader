import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import "../App.css";
import ScanViewer from "./ScanViewer";

// Documentation link:
// https://www.colorhexa.com/aaaec1
const theme = createMuiTheme({
  palette: {
    background: {
      default: "#aaaec1",
    },
  },
});

class App extends React.Component {
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

  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ScanViewer />
      </ThemeProvider>
    );
  }
}

export default App;
