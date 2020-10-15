import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";

import "../App.css";
import SelectManga from "./SelectManga";
import ScanViewer from "./ScanViewer";
import LIST_MANGA from "../listManga";
import { discoverManga } from "../probe";

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
  state = { mangaURL: LIST_MANGA[0].URL, idxLastChapter: null };

  componentDidMount() {
    // Trigger the discovery of the first manga in the list
    discoverManga(this.state.mangaURL, this.updateIdxLastChapter);
  }

  updateIdxLastChapter = (mangaURL, idxLastChapter) => {
    this.setState({ mangaURL, idxLastChapter });
    // console.log("UPDATED");
  };

  // TODO: retrieve manga object: title + URLpath
  selectManga = (mangaURL) => {
    this.setState({ mangaURL });
    console.log("selectManga");
  };

  render() {
    const { mangaURL, idxLastChapter } = this.state;
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <SelectManga selectManga={this.selectManga} />
          <ScanViewer mangaURL={mangaURL} idxChapter={idxLastChapter} />
        </Container>
      </ThemeProvider>
    );
  }
}

export default App;
