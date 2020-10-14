import _ from "lodash";
import React from "react";

import ProbeImage from "./ProbeImage";

const FOUND_KEY = "maxIdxFound";
const NOT_FOUND_KEY = "minIdxNotFound";

class DiscoverManga extends React.Component {
  state = {
    currentMangaURL: "",
    currentIdxChapter: 0,
    currentIdxImage: 0,
  };

  mangaDict = {};

  componentDidMount() {
    const { mangaTitle, idxChapter, idxImage } = this.props;
    this.setState({
      currentMangaURL: mangaTitle,
      currentIdxChapter: idxChapter,
      currentIdxImage: idxImage,
    });
  }

  imageExist = (mangaURL, idxChapter, idxImage) => {
    // console.log("DiscoverManga EXIST", mangaURL, idxChapter, idxImage);
    this.updateAndTrigger(mangaURL, idxChapter, idxImage, true);
  };

  imageDoesntExist = (mangaURL, idxChapter, idxImage) => {
    // console.log("DiscoverManga DOESN'T EXIST", mangaURL, idxChapter, idxImage);
    this.updateAndTrigger(mangaURL, idxChapter, idxImage, false);
  };

  updateAndTrigger = (mangaURL, idxChapter, idxImage, found) => {
    this.updateMangaDict(mangaURL, idxChapter, idxImage, found);
    this.triggerNextSearch(mangaURL, idxChapter, idxImage);
  };

  updateMangaDict = (mangaURL, idxChapter, idxImg, found) => {
    const keyName = found ? FOUND_KEY : NOT_FOUND_KEY;
    const newProbe = { [mangaURL]: { [idxChapter]: { [keyName]: idxImg } } };
    _.merge(this.mangaDict, newProbe);
  };

  // Search by dichotomie the end of a chapter
  triggerNextSearch = (mangaURL, idxChapter, idxImage) => {
    const idxFound = this.mangaDict[mangaURL][idxChapter][FOUND_KEY];
    const idxNotFound = this.mangaDict[mangaURL][idxChapter][NOT_FOUND_KEY];
    console.log("idxFound", idxFound);
    console.log("idxNotFound", idxNotFound);
    if (idxNotFound === undefined) {
      const nextIdx = idxImage === 0 ? 2 : idxImage * 2;
      this.setState({ currentIdxImage: nextIdx });
    } else if (idxFound === undefined && 0 < idxImage) {
      const nextIdx = Math.floor(idxImage / 2);
      this.setState({ currentIdxImage: nextIdx });
    } else if (idxFound === undefined && 0 === idxImage) {
      // Terminal case: chapter doesn't exist
      console.log("CHAPTER DOESN'T EXIST");
    } else if (1 < idxNotFound - idxFound) {
      const nextIdx = Math.floor((idxNotFound + idxFound) / 2);
      this.setState({ currentIdxImage: nextIdx });
    } else if (1 === idxNotFound - idxFound) {
      // Terminal case: end of chapter found!
      console.log("CHAPTER END AT", idxFound);
    }
    // console.log(this.mangaDict);
  };

  render() {
    const { currentMangaURL, currentIdxChapter, currentIdxImage } = this.state;
    return (
      <ProbeImage
        mangaURL={currentMangaURL}
        idxChapter={currentIdxChapter}
        idxImage={currentIdxImage}
        imageExist={this.imageExist}
        imageDoesntExist={this.imageDoesntExist}
      />
    );
  }
}

export default DiscoverManga;
