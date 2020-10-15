import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  backdrop: {
    zIndex: 10, // arbitrary value
    color: "#111",
    backgroundColor: "#a0b69b80",
    display: "flex",
    flexDirection: "column",
  },
};

const WaitingScreen = (props) => {
  const { classes } = props;

  return (
    <Backdrop className={classes.backdrop} open={props.open}>
      <div>Loading</div>
      <br />
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default withStyles(styles, { withTheme: true })(WaitingScreen);
