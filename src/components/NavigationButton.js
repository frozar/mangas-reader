import React from "react";

import IconButton from "@material-ui/core/IconButton";
import SvgIcon from "@material-ui/core/SvgIcon";
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";

import { makeStyles } from "@material-ui/core/styles";
import history from "../history";

const useStyles = makeStyles((theme) => ({
  label: {
    padding: "5px",
    borderRadius: "50%",
    borderWidth: "thin",
    borderStyle: "groove",
  },
}));

export default function NavigationButton(props) {
  const classes = useStyles();

  const { setLoading, route } = props;

  const color = props.color ? props.color : "black";

  return (
    <IconButton
      size="medium"
      style={{
        color,
      }}
      onClick={() => {
        setLoading(true);
        history.push(route);
      }}
      classes={{
        label: classes.label,
      }}
    >
      <SvgIcon component={ArrowBackRoundedIcon} />
    </IconButton>
  );
}
