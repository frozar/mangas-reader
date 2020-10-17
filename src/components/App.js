import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import "../App.css";
import SelectManga from "./SelectManga";
import ScanViewer from "./ScanViewer";
import LIST_MANGA from "../listManga";

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
  state = {
    mangaURL: LIST_MANGA[0].URL,
  };

  // TODO: retrieve manga object: title + URLpath
  selectManga = (mangaURL) => {
    this.setState({ mangaURL });
  };

  render() {
    // console.log("App: reander:", this.state);
    const { mangaURL } = this.state;
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <SelectManga selectManga={this.selectManga} />
          <ScanViewer mangaURL={mangaURL} />
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
