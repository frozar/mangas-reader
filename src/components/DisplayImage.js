import React, { useState, useEffect, useCallback } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";

import WaitingScreen from "./WaitingScreen";
import WaitingComponent from "./WaitingComponent";

function MyBackdrop(props, ref) {
  const {
    children,
    // classes,
    // className,
    // // invisible = false,
    // open,
    // transitionDuration,
    // eslint-disable-next-line react/prop-types
    // TransitionComponent = Fade,
    // ...other
  } = props;

  return (
    // <TransitionComponent in={open} timeout={transitionDuration} {...other}>
    <div
      data-mui-test="Backdrop"
      // className={clsx(
      //   classes.root,
      //   {
      //     [classes.invisible]: invisible,
      //   },
      //   className,
      // )}
      aria-hidden
      // ref={ref}
      style={{
        // Improve scrollable dialog support.
        zIndex: 10000,
        position: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div>Loading</div>
      <br />
      <CircularProgress color="inherit" />
      {children}
    </div>
    // </TransitionComponent>
  );
}

const LimitedBackdrop = withStyles({
  root: {
    // position: "absolute",
    position: "relative",
    zIndex: 1,
  },
})(Backdrop);

export default function DisplayImage(props) {
  const { mangaInfo, imageURL } = props;

  const [loading, setLoading] = useState(true);
  const [openTooltip, setOpenTooltip] = React.useState(false);

  const handleTooltipClose = () => {
    setOpenTooltip(false);
  };

  const handleTooltipOpen = () => {
    setOpenTooltip(true);
  };

  const updateLoadingState = useCallback(() => {
    const scans = Array.from(document.querySelectorAll("#scan"));
    if (scans.length === 0) {
      setLoading(true);
    } else if (scans.length === 1) {
      const scan = scans[0];
      const isLoaded = scan.complete && scan.naturalHeight !== 0;
      setLoading(!isLoaded);
    } else {
      const someScanNotLoaded = scans
        .map((scan) => scan.complete && scan.naturalHeight !== 0)
        .some((bool) => bool === false);
      setLoading(someScanNotLoaded);
      if (someScanNotLoaded) {
        setTimeout(() => updateLoadingState(), 0);
      }
    }
  }, []);

  useEffect(() => {
    updateLoadingState();
  }, [updateLoadingState]);

  const imageLoaded = () => {
    updateLoadingState();
  };

  const tooltipTitle = ({ idxChapter, idxImage }) => {
    return `Chapter: ${idxChapter} - Scan: ${idxImage + 1}`;
  };

  const [{ x }, set] = useSpring(() => ({ x: 0 }));
  const bind = useDrag(
    ({ movement: [mx], swipe: [swipeX], down, tap }) => {
      if (tap) {
        if (!openTooltip) {
          handleTooltipOpen();
        } else {
          handleTooltipClose();
        }
      }

      if (down) {
        set.start({ x: mx });
      } else {
        if (swipeX === 1) {
          props.getPreviousImage();
          setLoading(true);
        } else if (swipeX === -1) {
          props.getNextImage();
          setLoading(true);
        } else {
          set.start({ x: 0 });
        }
      }
    },
    { axis: "x", filterTaps: true }
  );

  useEffect(() => {
    set.start({ x: 0 });
  }, [imageURL, set]);

  return (
    <>
      <div
        style={{
          marginTop: "1em",
          marginBottom: "1em",
          position: "relative",
        }}
      >
        {/* <WaitingScreen open={loading} /> */}
        {/* <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          open={openTooltip}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={tooltipTitle(mangaInfo)}
        > */}
        {/* <LimitedBackdrop open={true}> */}
        <div>
          {/* <div
             style={{
               position: "relative",
               // display: loading ? "flex" : "block",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               right: 0,
               bottom: 0,
               top: 0,
               left: 0,
               backgroundColor: loading
                 ? "rgba(0, 0, 0, 0.5)"
                 : "rgba(0, 0, 0, 0)",
               WebkitTapHighlightColor: "transparent",
               color: "white",
             }}
          > */}
          {loading && (
            <div
              style={{
                position: "absolute",
                // display: loading ? "flex" : "block",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                right: 0,
                bottom: 0,
                top: 0,
                left: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                WebkitTapHighlightColor: "transparent",
                color: "white",
              }}
            >
              {/* <div style={{ fontSize: "18px" }}>Loading</div>
              <br />
              <CircularProgress color="inherit" /> */}
              <WaitingComponent
                loading={loading}
                color={"white"}
                marginTop={"0px"}
              />
            </div>
          )}
          {/* </div> */}
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
            onLoad={imageLoaded}
          />
        </div>
        {/* </LimitedBackdrop> */}
        {/* <animated.img
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
          onLoad={imageLoaded}
        /> */}
        {/* </Tooltip> */}
      </div>
    </>
  );
}
