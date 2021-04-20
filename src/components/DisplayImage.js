import React, { useState, useEffect, useCallback } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import WaitingComponent from "./WaitingComponent";

export default function DisplayImage(props) {
  const { mangaInfo, imageURL, loading, setLoading } = props;
  const [openTooltip, setOpenTooltip] = useState(false);

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
  }, [setLoading]);

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
    <div
      style={{
        marginTop: "1em",
        marginBottom: "1em",
        position: "relative",
      }}
    >
      <Tooltip
        PopperProps={{
          disablePortal: true,
        }}
        onClose={handleTooltipClose}
        open={openTooltip}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        title={tooltipTitle(mangaInfo)}
      >
        <div>
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
              <WaitingComponent
                loading={loading}
                color={"white"}
                marginTop={"0px"}
              />
            </div>
          )}
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
      </Tooltip>
    </div>
  );
}
