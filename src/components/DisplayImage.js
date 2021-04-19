import React, { useState, useEffect, useCallback } from "react";
// import Tooltip from "@material-ui/core/Tooltip";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

// import WaitingScreen from "./WaitingScreen";

export default function DisplayImage(props) {
  const [state, setState] = useState({ loading: true });
  // console.log("state", state);

  // componentDidMount() {
  //   this.updateLoadingState("componentDidMount");
  // }

  const updateLoadingState = useCallback((callerName) => {
    // console.log("callerName", callerName);
    const scans = Array.from(document.querySelectorAll("#scan"));
    if (scans.length === 0) {
      // this.setState({ loading: true });
      setState({ loading: true });
      // console.log("0 loading: true");
      // console.log("");
    } else if (scans.length === 1) {
      const scan = scans[0];
      const isLoaded = scan.complete && scan.naturalHeight !== 0;
      //this.setState({ loading: !isLoaded });
      setState({ loading: !isLoaded });
      // console.log("1 loading:", !isLoaded);
      // console.log("");
    } else {
      const someScanNotLoaded = scans
        .map((scan) => scan.complete && scan.naturalHeight !== 0)
        .some((bool) => bool === false);
      // this.setState({ loading: someScanNotLoaded });
      setState({ loading: someScanNotLoaded });
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
        setTimeout(() => updateLoadingState("self"), 0);
      }
    }
  }, []);

  useEffect(() => {
    updateLoadingState("componentDidMount");
  }, [updateLoadingState]);

  // const imageLoaded = () => {
  //   updateLoadingState("imageLoaded");
  // };

  // const tooltipTitle = ({ idxChapter, idxImage }) => {
  //   return `Chapter: ${idxChapter} - Scan: ${idxImage + 1}`;
  // };

  // const { mangaInfo, imageURL } = props;
  const { imageURL } = props;
  // const animatedTooltip = animated(Tooltip);

  // const [idx, setIdx] = useState(0);

  const [{ x }, set] = useSpring(() => ({ x: 0 }));
  const bind = useDrag(
    ({ movement: [x], swipe: [swipeX], down }) => {
      // console.log("swipeX", swipeX);
      set.start({ x: down ? x : 0 });
      if (swipeX === 1) {
        props.getPreviousImage();
      } else if (swipeX === -1) {
        props.getNextImage();
      }
    },
    { axis: "x" }
  );

  return (
    <div
      style={{
        marginTop: "1em",
        marginBottom: "1em",
      }}
    >
      <animated.img
        id="scan"
        style={{
          x,
          touchAction: "pan-y",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          border: "4px solid white",
          maxWidth: "98vw",
        }}
        alt="manga"
        src={imageURL}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        {...bind()}
      />
    </div>
  );
}

/* <Tooltip title={tooltipTitle(mangaInfo)}>
</Tooltip> */

/* <WaitingScreen open={state.loading} /> */
/* <TransitionGroup>
        <CSSTransition
          key={imageURL}
          timeout={600}
          classNames="slide"
          onEnter={(node) => {
            updateLoadingState("onEnter");
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
          onExit={() => updateLoadingState("onExit")}
          onExited={() => updateLoadingState("onExited")}
          onEntered={() => updateLoadingState("onEntered")}
        >
          <Tooltip title={tooltipTitle(mangaInfo)}>
            <animated.img
              id="scan"
              {...bind()}
              // style={{ x, y }}
              style={{
                x,
                y,
                // position: "absolute",
                // left: "0",
                // right: "0",
                margin: "1em auto",
                boxShadow:
                  "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
                // maxWidth: "-webkit-fill-available",
                border: "4px solid white",
              }}
              alt="manga"
              src={imageURL}
              onLoad={imageLoaded}
            />
          </Tooltip>
        </CSSTransition>
      </TransitionGroup> */
