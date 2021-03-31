import firebase from "../firebase";
import "firebase/firestore";

import React from "react";
import { ThemeProvider } from "@material-ui/styles";
// import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import history from "../history";
import axios from "axios";

import theme from "../style/theme";

import "../App.css";

import SelectManga from "./SelectManga";
import SelectChapter from "./SelectChapter";
import ScanViewer from "./ScanViewer";
import { getImagesURL, getIdxChapters, CLOUD_FUNCTION_ROOT } from "../db.js";

firebase.analytics();
const db = firebase.firestore();

const URL_MANGA_TITLE_SET = CLOUD_FUNCTION_ROOT + "mangaTitleSET";

class App extends React.Component {
  state = {
    path: undefined,
    idxChapter: undefined,
    imagesURL: [],
  };

  // defaultMangaPath = "one-piece";

  componentDidMount() {
    axios.get(URL_MANGA_TITLE_SET);
  }

  selectManga = (path) => {
    this.setState({ path });
    console.log("[selectManga] path", path);
    history.push("/chapter");
  };

  selectChapter = async (path, idxChapter) => {
    console.log("selectChapter", { path, idxChapter });
    const imagesURL = await getImagesURL(path, idxChapter);
    this.setState({ path, idxChapter, imagesURL });
    history.push("/reader");
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
    const { path, idxChapter, imagesURL } = this.state;
    console.log("App: state:", { path, idxChapter, imagesURL });
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
              <SelectChapter selectChapter={this.selectChapter} path={path} />
            </Route>
            <Route path="/reader" exact>
              <ScanViewer
                path={path}
                idxChapter={idxChapter}
                imagesURL={imagesURL}
                nextChapter={this.nextChapter}
                previousChapter={this.previousChapter}
              />
            </Route>
          </Switch>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
