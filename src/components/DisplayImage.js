import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Paper from "@material-ui/core/Paper";

class DisplayImage extends React.Component {
  getURL(mangaURL, idxChapter, idxImage) {
    const strIdxImg = idxImage.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    const baseURL = "https://lelscan.net/mangas";
    return `${baseURL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
  }

  // TODO: use the metarial theme style system
  render() {
    const { mangaURL, idxChapter, idxImage } = this.props;
    const srcURL = this.getURL(mangaURL, idxChapter, idxImage);
    return (
      <Tooltip title={`Chapter: ${idxChapter} - Scan: ${idxImage}`}>
        <Paper
          style={{
            display: "inline-block",
            margin: "2em",
            padding: "2em",
            // position: "absolute",
            // left: "50vw",
            // transform: "translate(-50%)",
            backgroundColor: "#4e536b",
          }}
          elevation={5}
        >
          <img
            // style={{
            //   margin: "2em",
            // }}
            alt="manga"
            src={srcURL}
            // onError={this.handleOnError}
            onLoad={this.props.imageLoaded}
          />
        </Paper>
      </Tooltip>
    );
  }
}

export default DisplayImage;
