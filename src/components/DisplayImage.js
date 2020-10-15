import React from "react";
import Tooltip from "@material-ui/core/Tooltip";

class DisplayImage extends React.Component {
  getURL(mangaURL, idxChapter, idxImage) {
    const strIdxImg = idxImage.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    const baseURL = "https://lelscan.net/mangas";
    return `${baseURL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
  }

  render() {
    const { mangaURL, idxChapter, idxImage } = this.props;
    const srcURL = this.getURL(mangaURL, idxChapter, idxImage);
    return (
      <Tooltip title={`Chapter: ${idxChapter} - Scan: ${idxImage}`}>
        <img
          style={{
            position: "absolute",
            left: "50vw",
            transform: "translate(-50%)",
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
