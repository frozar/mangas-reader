import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import WaitingScreen from "./WaitingScreen";

export default class DisplayImage extends React.Component {
  state = { loading: true };

  componentDidMount() {
    this.updateLoadingState("componentDidMount");
  }

  updateLoadingState = (callerName) => {
    // console.log("callerName", callerName);
    const scans = Array.from(document.querySelectorAll("#scan"));
    if (scans.length === 0) {
      this.setState({ loading: true });
      // console.log("0 loading: true");
      // console.log("");
    } else if (scans.length === 1) {
      const scan = scans[0];
      const isLoaded = scan.complete && scan.naturalHeight !== 0;
      this.setState({ loading: !isLoaded });
      // console.log("1 loading:", !isLoaded);
      // console.log("");
    } else {
      const someScanNotLoaded = scans
        .map((scan) => scan.complete && scan.naturalHeight !== 0)
        .some((bool) => bool === false);
      this.setState({ loading: someScanNotLoaded });
      // console.log(
      //   "1 map",
      //   scans.map((scan) => scan.complete && scan.naturalHeight !== 0)
      // );
      // console.log(
      //   "2 map",
      //   scans
      //     .map((scan) => scan.complete && scan.naturalHeight !== 0)
      //     .some((bool) => bool === false)
      // );
      // console.log("2 loading:", someScanNotLoaded);
      // console.log("");
      if (someScanNotLoaded) {
        setTimeout(() => this.updateLoadingState("self)"), 0);
      }
    }
  };

  imageLoaded = () => {
    this.updateLoadingState("imageLoaded");
  };

  tooltipTitle({ idxChapter, idxImage }) {
    return `Chapter: ${idxChapter} - Scan: ${idxImage + 1}`;
  }

  render() {
    const { mangaInfo, imageURL } = this.props;

    return (
      <React.Fragment>
        <WaitingScreen open={this.state.loading} />
        <TransitionGroup>
          <CSSTransition
            key={imageURL}
            timeout={600}
            classNames="slide"
            /**
             * Compute the position of the DisplayImage component to adjust the
             * scroll behavior to its top.
             */
            onEnter={(node) => {
              this.updateLoadingState("onEnter");
              if (node) {
                const bodyRect = document.body.getBoundingClientRect();
                const elemRect = node.getBoundingClientRect();
                const offsetTop = elemRect.top - bodyRect.top;
                // Weirdly have to put the scrolling animation in a setTimeout to get
                // it work simultanously with the image transition animation
                setTimeout(() => {
                  window.scrollTo({ top: offsetTop, behavior: "smooth" });
                }, 0);
              }
            }}
            onExit={() => this.updateLoadingState("onExit")}
            onExited={() => this.updateLoadingState("onExited")}
            onEntered={() => this.updateLoadingState("onEntered")}
          >
            <Tooltip title={this.tooltipTitle(mangaInfo)}>
              <img
                id="scan"
                style={{
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
                src={imageURL}
                onLoad={this.imageLoaded}
              />
            </Tooltip>
          </CSSTransition>
        </TransitionGroup>
      </React.Fragment>
    );
  }
}
