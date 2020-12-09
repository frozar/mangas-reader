import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import WaitingScreen from "./WaitingScreen";

export default class DisplayImage extends React.Component {
  state = { loading: true };

  componentDidMount() {
    this.updateLoadingState("componentDidMount");
  }

  updateLoadingState = () => {
    const scans = document.querySelectorAll("#scan");
    if (scans.length !== 1) {
      this.setState({ loading: true });
      return;
    }
    const scan = scans[0];
    if (!scan) {
      this.setState({ loading: true });
      return;
    }
    const isLoaded = scan.complete && scan.naturalHeight !== 0;
    this.setState({ loading: !isLoaded });
  };

  imageLoaded = () => {
    this.updateLoadingState();
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
            onExit={this.updateLoadingState}
            onExited={this.updateLoadingState}
            onEntered={this.updateLoadingState}
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
