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
    const { imageInfo } = this.props;
    const visibilityStyle = this.props.visibility
      ? this.props.visibility
      : "visible";
    const offsetX = this.props.offsetX ? this.props.offsetX : 0;
    return (
      <Box
        style={{
          display: "inline-block",
          visibility: visibilityStyle,
          position: "relative",
          left: `${offsetX}px`,
        }}
        ref={this.refImageFrame}
        component="div"
      >
        <Tooltip title={this.tooltipTitle(imageInfo)}>
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
              src={this.getURL(imageInfo)}
              onLoad={this.imageLoaded}
            />
          </Paper>
        </Tooltip>
      </Box>
    );
  }
}

export default DisplayImage;
