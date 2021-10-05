import React from "react";

import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import RotateLeftRoundedIcon from "@material-ui/icons/RotateLeftRounded";

// import Link from "../Link";

// import { Link } from "react-router-dom";

function ControlButton(props) {
  const { onClick } = props;

  return (
    <IconButton
      color="primary"
      aria-label="next scan"
      component="span"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
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
    resetPanAndZoom,
    displayResetButton,
    previousLink,
    nextLink,
    goNextLink,
    goPreviousLink,
  } = props;

  return (
    <Grid
      container
      direction="row"
      justify="space-around"
      alignItems="center"
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
        {previousLink !== null && (
          <ControlButton
            onClick={() => {
              goPreviousLink();
            }}
          >
            <KeyboardArrowLeftRoundedIcon fontSize="large" />
          </ControlButton>
        )}
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
        {nextLink !== null && (
          <ControlButton
            onClick={() => {
              goNextLink();
            }}
          >
            <KeyboardArrowRightRoundedIcon fontSize="large" />
          </ControlButton>
        )}
      </Grid>
    </Grid>
  );
}
