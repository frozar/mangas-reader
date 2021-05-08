import firebase from "../firebase";

import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import dashify from "dashify";

import history from "../history";
import theme from "../style/theme";
import { getImagesURL, getIdxChapters, getMangas } from "../db.js";
import SelectManga from "./SelectManga";
import SelectChapter from "./SelectChapter";
import ScanViewer from "./ScanViewer";

import "../App.css";

firebase.analytics();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

async function scrapRandomChapter() {
  getMangas()
    .then((db) => {
      const filterDb = {};
      for (const [mangaPath, detail] of Object.entries(db)) {
        const emptyChapters = [];
        for (const [idx, chapterDetail] of Object.entries(detail.chapters)) {
          if (chapterDetail.content.length === 0) {
            emptyChapters.push(idx);
          }
        }
        if (emptyChapters.length !== 0) {
          filterDb[mangaPath] = emptyChapters;
        }
      }
      const keys = Object.keys(filterDb);
      // If there's no more chapter to scrap, skip.
      if (keys.length === 0) {
        return;
      }
      const idxManga = getRandomInt(0, keys.length);
      const electedMangaPath = keys[idxManga];
      const idxChapter = getRandomInt(0, filterDb[electedMangaPath].length);
      const electedIdxChapter = filterDb[electedMangaPath][idxChapter];

      console.debug(
        "[scrapRandomChapter] Trigger scrap of",
        electedMangaPath,
        "chapter",
        electedIdxChapter
      );
      getImagesURL(electedMangaPath, electedIdxChapter);
    })
    .catch((err) => {
      console.debug("[scrapRandomChapter] getMangas failed", err);
    });
}

setInterval(() => {
  scrapRandomChapter();
}, 1000 * 20);

export default class App extends React.Component {
  state = {
    path: undefined,
    title: undefined,
    idxChapter: undefined,
    imagesURL: [],
  };

  selectManga = (title) => {
    const path = dashify(title);
    this.setState({ path, title });
    history.push("/chapter");
  };

  selectChapter = async (path, idxChapter) => {
    this.setState({ path, idxChapter, imagesURL: [] });
    history.push("/reader");
    const imagesURL = await getImagesURL(path, idxChapter);
    // console.log("[selectChapter] imagesURL", imagesURL);
    this.setState({ path, idxChapter, imagesURL });
  };

  previousChapter = async () => {
    const { path, idxChapter } = this.state;
    const idxChapters = await getIdxChapters(path);
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
    // console.log("App: state:", { path, title, idxChapter, imagesURL });
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
