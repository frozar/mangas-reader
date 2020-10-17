import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => {
  return {
    backdrop: {
      zIndex: theme.zIndex.mobileStepper,
      color: theme.palette.info.contrastText,
      backgroundColor: theme.palette.action.active,
      display: "flex",
      flexDirection: "column",
    },
  };
});

const WaitingScreen = (props) => {
  const classes = useStyles();

  return (
    <Backdrop className={classes.backdrop} open={props.open}>
      <div>Loading</div>
      <br />
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default WaitingScreen;
