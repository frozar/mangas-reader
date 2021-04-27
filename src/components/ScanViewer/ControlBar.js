import React from "react";

import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import RotateLeftRoundedIcon from "@material-ui/icons/RotateLeftRounded";

function ControlButton(props) {
  const { onClick } = props;

  return (
    <IconButton
      color="primary"
      aria-label="next scan"
      component="span"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "100px",
        borderColor: "rgb(255, 255, 255)",
        borderWidth: "1px",
        borderStyle: "groove",
        pointerEvents: "all",
      }}
      onClick={onClick}
    >
      {props.children}
    </IconButton>
  );
}

export default function ControlBar(props) {
  const {
    setLoading,
    getPreviousImage,
    getNextImage,
    resetPanAndZoom,
    displayResetButton,
  } = props;

  return (
    <Grid
      container
      direction="row"
      justify="space-around"
      style={{
        position: "fixed",
        right: 0,
        bottom: 30,
        left: 0,
        WebkitTapHighlightColor: "transparent",
        color: "black",
        pointerEvents: "none",
      }}
    >
      <Grid item>
        <ControlButton
          onClick={(_) => {
            setLoading(true);
            getPreviousImage();
          }}
        >
          <KeyboardArrowLeftRoundedIcon fontSize="large" />
        </ControlButton>
      </Grid>
      <Grid
        item
        style={{ visibility: displayResetButton ? "inherit" : "hidden" }}
      >
        <ControlButton
          onClick={(_) => {
            resetPanAndZoom();
          }}
        >
          <RotateLeftRoundedIcon fontSize="large" />
        </ControlButton>
      </Grid>
      <Grid item>
        <ControlButton
          onClick={(_) => {
            setLoading(true);
            getNextImage();
          }}
        >
          <KeyboardArrowRightRoundedIcon fontSize="large" />
        </ControlButton>
      </Grid>
    </Grid>
  );
}
