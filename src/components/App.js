import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch } from "react-router-dom";
import history from "../history";

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
    console.log("selectManga", mangaURL, this.state);
    history.push("/");
  };

  render() {
    console.log("App: render:", this.state);
    const { mangaURL } = this.state;
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div>
            <Switch>
              <Route path="/" exact>
                <ScanViewer mangaURL={mangaURL} />
              </Route>
              <Route path="/select/manga" exact>
                <SelectManga selectManga={this.selectManga} />
              </Route>
            </Switch>
          </div>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
