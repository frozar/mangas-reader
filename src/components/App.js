import firebase from "../firebase";
import "firebase/firestore";

import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch } from "react-router-dom";
import history from "../history";
import axios from "axios";

import "../App.css";

import SelectManga from "./SelectManga";
import SelectChapter from "./SelectChapter";
import ScanViewer from "./ScanViewer";
import { getLastIdxChapter, getImagesURL, getIdxChapters } from "../db.js";

firebase.analytics();
const db = firebase.firestore();

const URL_MANGA_TITLE_SET =
  "https://europe-west1-manga-b8fb3.cloudfunctions.net/mangaTitleSET";

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
    path: "",
    idxChapter: "0",
    imagesURL: [],
  };

  defaultMangaPath = "one-piece";

  async componentDidMount() {
    const doc = await db.collection("lelscan").doc(this.defaultMangaPath).get();
    let data = doc.data();

    if (data === undefined) {
      await axios.get(URL_MANGA_TITLE_SET);
      const doc1 = await db
        .collection("lelscan")
        .doc(this.defaultMangaPath)
        .get();
      data = doc1.data();
    } else {
      axios.get(URL_MANGA_TITLE_SET);
    }

    const lastIdxChapter = await getLastIdxChapter(this.defaultMangaPath);
    const imagesURL = await getImagesURL(this.defaultMangaPath, lastIdxChapter);
    this.setState({
      path: this.defaultMangaPath,
      idxChapter: lastIdxChapter,
      imagesURL: imagesURL,
    });
  }

  // TODO: retrieve manga object: title + URLpath
  setPath = (path) => {
    this.setState({ path });
    console.log("setPath", path, this.state);
    history.push("/select/chapter");
  };

  selectChapter = (idxChapter) => {
    console.log("selectChapter", this.state);
    this.setState({ idxChapter });
    history.push("/");
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

  render() {
    console.log("App: state:", this.state);
    const { path: path, idxChapter, imagesURL } = this.state;
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div>
            <Switch>
              <Route path="/" exact>
                <ScanViewer
                  mangaPath={path}
                  idxChapter={idxChapter}
                  imagesURL={imagesURL}
                  nextChapter={this.nextChapter}
                  previousChapter={this.previousChapter}
                />
              </Route>
              <Route path="/select/manga" exact>
                <SelectManga setPath={this.setPath} />
              </Route>
              <Route path="/select/chapter" exact>
                <SelectChapter
                  selectChapter={this.selectChapter}
                  path={path}
                  //  mangaDict={mangaDict}
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
