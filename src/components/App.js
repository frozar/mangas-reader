import firebase from "../firebase";

import React, { useState } from "react";
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

export default function App() {
  const [state, setState] = useState({
    path: undefined,
    title: undefined,
    idxChapter: undefined,
    imagesURL: [],
  });

  const selectManga = (title) => {
    const path = dashify(title);
    setState({ path, title });
    history.push("/chapter");
  };

  const selectChapter = async (path, idxChapter) => {
    setState({ path, idxChapter, imagesURL: [] });
    history.push("/reader");
    const imagesURL = await getImagesURL(path, idxChapter);
    setState({ path, idxChapter, imagesURL });
  };

  const previousChapter = async () => {
    const { path, idxChapter } = state;
    const idxChapters = await getIdxChapters(path);
    const idx = idxChapters.indexOf(idxChapter);
    if (0 < idx) {
      const idxPreviousChapter = idxChapters[idx - 1];
      const imagesURL = await getImagesURL(path, idxPreviousChapter);
      const idxImage = imagesURL.length - 1;
      setState({ idxChapter: idxPreviousChapter, imagesURL });
      return idxImage;
    } else {
      console.info("previousChapter: no more scan");
      return null;
    }
  };

  const nextChapter = async () => {
    const { path, idxChapter } = state;
    const idxChapters = await getIdxChapters(path);
    const idx = idxChapters.indexOf(idxChapter);
    const maxIdx = idxChapters.length - 1;
    if (idx < maxIdx) {
      const idxNextChapter = idxChapters[idx + 1];
      const imagesURL = await getImagesURL(path, idxNextChapter);
      const idxImage = 0;
      setState({ idxChapter: idxNextChapter, imagesURL });
      return idxImage;
    } else {
      console.info("nextChapter: no more scan");
      return null;
    }
  };

  const { path, title, idxChapter, imagesURL } = state;
  return (
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Switch>
          <Route path="/" exact>
            <Redirect to="/manga" />
          </Route>
          <Route path="/manga" exact>
            <SelectManga selectManga={selectManga} />
          </Route>
          <Route path="/chapter" exact>
            <SelectChapter
              selectChapter={selectChapter}
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
                nextChapter={nextChapter}
                previousChapter={previousChapter}
              />
            )}
          </Route>
        </Switch>
      </ThemeProvider>
    </Router>
  );
}
