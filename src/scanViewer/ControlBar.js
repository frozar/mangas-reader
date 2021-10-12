import React from "react";

import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

import KeyboardArrowLeftRoundedIcon from "@material-ui/icons/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@material-ui/icons/KeyboardArrowRightRounded";
import RotateLeftRoundedIcon from "@material-ui/icons/RotateLeftRounded";
import Typography from "@material-ui/core/Typography";
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
    idScan,
    totalIdScan,
    setResetPanAndZoom,
    displayResetButton,
    setDisplayResetButton,
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
      {displayResetButton ? (
        <Grid item>
          <ControlButton
            onClick={() => {
              setResetPanAndZoom(true);
              setDisplayResetButton(false);
            }}
          >
            <RotateLeftRoundedIcon fontSize="large" />
          </ControlButton>
        </Grid>
      ) : (
        <Grid item>
          <Typography
            variant="subtitle1"
            style={{
              color: "white",
              textAlign: "end",
              borderRadius: "100px",
              borderColor: "rgb(255, 255, 255)",
              borderWidth: "1px",
              borderStyle: "groove",
              fontSize: "0.7rem",
              lineHeight: "1",
              padding: "0.2rem 0.75rem",
            }}
          >
            {`${Number(idScan) + 1} / ${totalIdScan}`}
          </Typography>
        </Grid>
      )}
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
