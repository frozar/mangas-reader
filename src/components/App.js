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
// import LIST_MANGA from "../listManga";

const URL_MANGA_GET =
  "https://europe-west1-manga-b8fb3.cloudfunctions.net/mangaGET";
const URL_MANGA_CHAPTER_SET =
  "https://europe-west1-manga-b8fb3.cloudfunctions.net/mangaChapterSET";

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
    mangaDict: null,
    // mangaURL: LIST_MANGA[0].URL,
    mangaURL: "",
    idxChapter: 0,
  };

  defaultManga = "one-piece";

  initStore = async () => {
    const request = await axios.get(URL_MANGA_GET);
    const mangaDict = request.data;
    // console.log("mangaDict", mangaDict);
    this.setState({ mangaDict });
  };

  updateMangaChapters = async (mangaTitle) => {
    // const request = await axios.get(URL_MANGA_CHAPTER_SET, {
    //   params: {
    //     path: mangaTitle,
    //   },
    // });
    // const chapters = request.data;
    // console.log("chapters", chapters);
    axios.get(URL_MANGA_CHAPTER_SET, {
      params: {
        path: mangaTitle,
      },
    });
  };

  componentDidMount() {
    this.initStore();
  }

  componentDidUpdate() {
    if (!this.state.mangaDict) {
      return;
    }

    // console.log("DidUpdate", this.state);
    if (this.state.mangaURL === "") {
      // console.log(this.defaultManga, this.state.mangaDict[this.defaultManga]);
      // If the DB doesn't contain the chapters data about the default manga
      // (extremly rare), then:
      // 1. send a request to update default manga data,
      // 2. look for a manga with chapters data and display it
      // console.log(
      //   "this.state.mangaDict[this.defaultManga]",
      //   this.state.mangaDict[this.defaultManga]
      // );
      if (this.state.mangaDict[this.defaultManga].chapters === undefined) {
        this.updateMangaChapters(this.defaultManga);
        for (const [path, objManga] of Object.entries(this.state.mangaDict)) {
          const { chapters } = objManga;
          if (chapters) {
            const idxLastChapter = Object.keys(chapters).sort().reverse()[0];
            // console.log("chapters", idxLastChapter);
            // console.log("URL", URL);
            this.setState({
              mangaURL: path,
              idxChapter: idxLastChapter,
            });
            break;
          }
        }
      }
      // Else chapters data is avalaible in the default manga, so display it
      else {
        const { path, chapters } = this.state.mangaDict[this.defaultManga];
        const idxLastChapter = Object.keys(chapters).sort().reverse()[0];
        this.setState({
          mangaURL: path,
          idxChapter: idxLastChapter,
        });
      }
      // this.updateMangaChapters(this.defaultManga);
    }
  }

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
    // console.log("App: state:", this.state);
    const { mangaDict, mangaURL, idxChapter } = this.state;
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div>
            <Switch>
              <Route path="/" exact>
                <ScanViewer
                  mangaURL={mangaURL}
                  idxChapter={idxChapter}
                  mangaDict={mangaDict}
                />
              </Route>
              <Route path="/select/manga" exact>
                <SelectManga
                  selectManga={this.selectManga}
                  mangaDict={mangaDict}
                />
              </Route>
              <Route path="/select/chapter" exact>
                <SelectChapter
                  selectChapter={this.selectChapter}
                  mangaURL={mangaURL}
                  mangaDict={mangaDict}
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
