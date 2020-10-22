import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch } from "react-router-dom";
import history from "../history";

import "../App.css";
import SelectManga from "./SelectManga";
import SelectChapter from "./SelectChapter";
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
    idxChapter: 0,
  };

  // TODO: retrieve manga object: title + URLpath
  selectManga = (mangaURL) => {
    this.setState({ mangaURL });
    console.log("selectManga", mangaURL, this.state);
    // history.push("/");
    history.push("/select/chapter");
  };

  selectChapter = (idxChapter) => {
    console.log("selectChapter", this.state);
    this.setState({ idxChapter });
    history.push("/");
  };

  render() {
    console.log("App: render:", this.state);
    const { mangaURL, idxChapter } = this.state;
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div>
            <Switch>
              <Route path="/" exact>
                <ScanViewer mangaURL={mangaURL} idxChapter={idxChapter} />
              </Route>
              <Route path="/select/manga" exact>
                <SelectManga selectManga={this.selectManga} />
              </Route>
              <Route path="/select/chapter" exact>
                <SelectChapter
                  selectChapter={this.selectChapter}
                  mangaURL={this.state.mangaURL}
                />
              </Route>
            </Switch>
          </div>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
