import firebase from "../firebase";

import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import history from "../history";
import dashify from "dashify";

import theme from "../style/theme";

import "../App.css";

import SelectManga from "./SelectManga";
import SelectChapter from "./SelectChapter";
import ScanViewer from "./ScanViewer";
import { getImagesURL, getIdxChapters } from "../db.js";

firebase.analytics();

class App extends React.Component {
  state = {
    path: undefined,
    title: undefined,
    idxChapter: undefined,
    imagesURL: [],
  };

  selectManga = (title) => {
    const path = dashify(title);
    this.setState({ path, title });
    console.log("[selectManga] path", path);
    history.push("/chapter");
  };

  selectChapter = async (path, idxChapter) => {
    this.setState({ path, idxChapter });
    console.log("[selectChapter] state", this.state);
    history.push("/reader");
    const imagesURL = await getImagesURL(path, idxChapter);
    // console.log("[selectChapter] imagesURL", imagesURL);
    this.setState({ path, idxChapter, imagesURL });
  };

  previousChapter = async () => {
    const { path, idxChapter } = this.state;
    const idxChapters = await getIdxChapters(path);
    // console.log("idxChapters", idxChapters);
    const idx = idxChapters.indexOf(idxChapter);
    if (0 < idx) {
      const idxPreviousChapter = idxChapters[idx - 1];
      const imagesURL = await getImagesURL(path, idxPreviousChapter);
      const idxImage = imagesURL.length - 1;
      this.setState({ idxChapter: idxPreviousChapter, imagesURL });
      return idxImage;
    } else {
      console.info("previousChapter: no more scan");
      return null;
    }
  };

  nextChapter = async () => {
    const { path, idxChapter } = this.state;
    const idxChapters = await getIdxChapters(path);
    const idx = idxChapters.indexOf(idxChapter);
    const maxIdx = idxChapters.length - 1;
    if (idx < maxIdx) {
      const idxNextChapter = idxChapters[idx + 1];
      const imagesURL = await getImagesURL(path, idxNextChapter);
      const idxImage = 0;
      this.setState({ idxChapter: idxNextChapter, imagesURL });
      return idxImage;
    } else {
      console.info("nextChapter: no more scan");
      return null;
    }
  };

  resetState = () => {
    this.setState({
      path: undefined,
      idxChapter: undefined,
      imagesURL: [],
    });
  };

  render() {
    const { path, title, idxChapter, imagesURL } = this.state;
    console.log("App: state:", { path, title, idxChapter, imagesURL });
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Switch>
            <Route path="/" exact>
              <Redirect to="/manga" />
            </Route>
            <Route path="/manga" exact>
              <SelectManga selectManga={this.selectManga} />
            </Route>
            <Route path="/chapter" exact>
              <SelectChapter
                selectChapter={this.selectChapter}
                path={path}
                title={title}
              />
            </Route>
            <Route path="/reader" exact>
              {path === undefined || idxChapter === undefined ? (
                <Redirect to="/manga" />
              ) : (
                <ScanViewer
                  path={path}
                  idxChapter={idxChapter}
                  imagesURL={imagesURL}
                  nextChapter={this.nextChapter}
                  previousChapter={this.previousChapter}
                />
              )}
            </Route>
          </Switch>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
