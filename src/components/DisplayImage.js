import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";

const BASE_URL = "https://lelscan.net/mangas";

class DisplayImage extends React.Component {
  constructor(props) {
    super(props);
    this.refImageFrame = React.createRef();
  }

  imageLoaded = () => {
    if (this.props.imageLoaded) {
      this.props.imageLoaded();
    }
    if (this.props.getRef) {
      this.props.getRef(this.refImageFrame);
    }
  };

  getURL({ mangaURL, idxChapter, idxImage }) {
    const strIdxImg = idxImage.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    return `${BASE_URL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
  }

  tooltipTitle({ idxChapter, idxImage }) {
    return `Chapter: ${idxChapter} - Scan: ${idxImage}`;
  }

  // TODO: use the metarial theme style system
  render() {
    const { mangaInfo } = this.props;
    const offsetXProp = this.props.offsetX ? this.props.offsetX : 0;
    return (
      <Box
        style={{
          display: "inline-block",
          position: "relative",
          left: `${offsetXProp}px`,
        }}
        ref={this.refImageFrame}
      >
        <Tooltip title={this.tooltipTitle(mangaInfo)}>
          <Paper
            style={{
              display: "inline-block",
              margin: "2em",
              padding: "2em",
              backgroundColor: "#4e536b",
            }}
            elevation={5}
          >
            <img
              alt="manga"
              src={this.getURL(mangaInfo)}
              onLoad={this.imageLoaded}
            />
          </Paper>
        </Tooltip>
      </Box>
    );
  }
}

export default DisplayImage;
