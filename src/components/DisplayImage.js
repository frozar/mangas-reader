import _ from "lodash";
import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import WaitingScreen from "./WaitingScreen";

const BASE_URL = "https://lelscan.net/mangas";

class DisplayImage extends React.Component {
  state = { loading: true };

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props, nextProps)) {
      this.setState({ loading: true });
    }
    return true;
  }

  imageLoaded = () => {
    this.setState({ loading: false });
    if (this.props.imageLoaded) {
      this.props.imageLoaded();
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

  render() {
    // console.log("state:", this.state);
    const { mangaInfo } = this.props;
    return (
      <React.Fragment>
        <WaitingScreen open={this.state.loading} />
        <TransitionGroup>
          <CSSTransition
            key={this.getURL(mangaInfo)}
            timeout={300}
            classNames="fade"
          >
            <Tooltip title={this.tooltipTitle(mangaInfo)}>
              <img
                style={{
                  display: this.state.loading ? "none" : "block",
                  position: "absolute",
                  left: "0",
                  right: "0",
                  margin: "1em auto",
                  padding: "2em",
                  backgroundColor: "rgb(78, 83, 107)",
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
                ref={this.props.innerRef}
              />
            </Tooltip>
          </CSSTransition>
        </TransitionGroup>
      </React.Fragment>
    );
  }
}

// Documentation link:
// https://stackoverflow.com/questions/51526461/how-to-use-react-forwardref-in-a-class-based-component#answer-52223103
export default React.forwardRef((props, ref) => (
  <DisplayImage innerRef={ref} {...props} />
));
