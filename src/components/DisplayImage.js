import React from "react";
import Tooltip from "@material-ui/core/Tooltip";

class DisplayImage extends React.Component {
  getURL(mangaTitle, idxChapter, idxImg) {
    const strIdxImg = idxImg.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    const baseURL = "https://lelscan.net/mangas";
    return `${baseURL}/${mangaTitle}/${idxChapter}/${strIdxImg}.jpg`;
  }

  render() {
    const { mangaTitle, idxChapter, idxImg } = this.props;
    const srcURL = this.getURL(mangaTitle, idxChapter, idxImg);
    return (
      <Tooltip title={`Chapter: ${idxChapter} - Scan: ${idxImg}`}>
        <img
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
            height: "100vh",
          }}
          alt="manga"
          src={srcURL}
          // onError={this.handleOnError}
          onLoad={this.props.imageLoaded}
        />
      </Tooltip>
    );
  }
}

export default DisplayImage;
