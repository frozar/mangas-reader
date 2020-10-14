import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import "../App.css";
import ScanViewer from "./ScanViewer";
import LIST_MANGA from "../listManga";
import { discoverManga } from "../Probe";

// Documentation link:
// https://www.colorhexa.com/aaaec1
const theme = createMuiTheme({
  palette: {
    background: {
      default: "#aaaec1",
    },
  },
});

// Trigger the discovery of the first manga in the list
discoverManga(LIST_MANGA[0].URL);

class App extends React.Component {
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
