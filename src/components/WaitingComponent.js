import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => {
  return {
    waitingWheel: {
      textAlign: "center",
      marginTop: "30px",
      [theme.breakpoints.down("md")]: {
        marginTop: "20px",
      },
      [theme.breakpoints.down("sm")]: {
        marginTop: "15px",
      },
      [theme.breakpoints.down("xs")]: {
        marginTop: "10px",
      },
    },
  };
});

export default function WaitingComponent(props) {
  const classes = useStyles();
  const { loading, color, marginTop } = props;

  if (loading) {
    return (
      <div
        className={classes.waitingWheel}
        style={{
          color: color ? color : undefined,
          marginTop: marginTop ? marginTop : undefined,
        }}
      >
        <div>Loading...</div>
        <br />
        <CircularProgress color="inherit" />
      </div>
    );
  } else {
    return null;
  }
}
