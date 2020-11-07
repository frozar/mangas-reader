import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Paper, { styles } from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const BASE_URL = "https://lelscan.net/mangas";

class DisplayImage extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.refImageFrame = React.createRef();
  // }

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
    // const offsetXProp = this.props.offsetX ? this.props.offsetX : 0;
    // console.log({ offsetXProp }); className="card-container"
    // console.log("DisplayImage: mangaInfo:", mangaInfo);
    return (
      // <Box
      //   style={{
      //     // display: "inline-block",
      //     // position: "relative",
      //     // width: "100%",
      //     // margin: "auto",
      //     // // left: `${offsetXProp}px`,

      //     margin: "auto",
      //     display: "flex",
      //     outline: "0",
      //     // position: "relative",
      //     // justifyContent: "center",
      //     // flex-start | flex-end | center | space-between | space-around | space-evenly | start | end | left | right ... + safe | unsafe;
      //     // justifyContent: "flex-start",
      //     // justifyContent: "flex-end",
      //     // justifyContent: "start",
      //     // justifyContent: "end",
      //     // justifyContent: "left",
      //     // justifyContent: "right",
      //     // justifyContent: "center",
      //     // justifyContent: "space-between",
      //     // justifyContent: "space-around",
      //     // justifyContent: "space-evenly",
      //   }}
      //   // ref={this.refImageFrame}
      // >
      // <Paper
      //   style={{
      //     display: "inline-block",
      //     // display: "table",
      //     // margin: "2em auto",
      //     // padding: "2em",
      //     // backgroundColor: "#4e536b",
      //     // border: "2px",
      //     // borderStyle: "solid",
      //     textAlign: "center",
      //     // position: "absolute",
      //     // top: 0,
      //     // left: 0,
      //     // position: "absolute",
      //     // left: "0",
      //     // right: "0",
      //     // marginLeft: "auto",
      //     // marginRight: "auto",
      //     // // width: "90%",
      //     // maxWidth: "-webkit-fill-available",
      //     // justifyContent: "center",
      //   }}
      //   elevation={5}
      //   // component="p"
      // >
      <TransitionGroup
        style={
          {
            // position: "relative",
            // top: 0,
            // left: 0,
            // position: "relative",
            // display: "table-cell",
            // height: "300px",
            // textAlign: "center",
            // width: "300px",
            // verticalAlign: "middle",
            // position: "relative",
            // display: "block",
            // textAlign: "center",
            // // background: "yellow",
            // // height: "909px",
            // position: "absolute",
            // left: "0",
            // right: "0",
            // marginLeft: "auto",
            // marginRight: "auto",
            // width: "100px",
          }
        }
      >
        <CSSTransition
          key={this.getURL(mangaInfo)}
          // key={mangaInfo.idxImage}
          timeout={300}
          // classNames="slide"
          classNames="fade"
          // ref={this.refImageFrame}
        >
          {/* <div
              style={
                {
                  // // position: "absolute", left: "50%"
                  // position: "absolute",
                  // left: "0",
                  // right: "0",
                  // // marginLeft: "auto",
                  // // marginRight: "auto",
                  // // width: "90%",
                  // maxWidth: "-webkit-fill-available",
                }
              }
            > */}
          <Tooltip title={this.tooltipTitle(mangaInfo)}>
            <img
              style={{
                // display: "inline",
                // // // position: "absolute",
                // // // margin: "0 auto",
                // position: "relative",
                // // left: "-50%",
                // // border: "dotted red 1px",
                position: "absolute",
                left: "0",
                right: "0",
                // marginLeft: "auto",
                // marginRight: "auto",
                // // // // width: "90%",
                // // maxWidth: "-webkit-fill-available",
                // // minWidth: "fit-content",
                margin: "1em auto",
                padding: "2em",
                backgroundColor: "rgb(78, 83, 107)",
                // position: "absolute",

                // .MuiPaper-elevation-5
                boxShadow:
                  "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
                // .MuiPaper-rounded
                borderRadius: "2em",
                // .MuiPaper-root
                color: "rgba(0, 0, 0, 0.87)",
                maxWidth: "-webkit-fill-available",
              }}
              alt="manga"
              src={this.getURL(mangaInfo)}
              onLoad={this.imageLoaded}
            />
            {/* </div> */}
          </Tooltip>
        </CSSTransition>
      </TransitionGroup>
      // </Paper>
      // </Box>
    );
  }
}

export default DisplayImage;
