import React from "react";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import history from "../history";

export default function NavigationButton(props) {
  const theme = useTheme();
  const { setLoading, label, route } = props;

  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));
  const matchesSM = useMediaQuery(theme.breakpoints.down("sm"));
  const matchesXS = useMediaQuery(theme.breakpoints.down("xs"));

  let backArrowHeight = "18px";
  if (matchesMD) {
    if (matchesSM) {
      if (matchesXS) {
        backArrowHeight = "10px";
      } else {
        backArrowHeight = "12px";
      }
    } else {
      backArrowHeight = "15px";
    }
  }

  const color = props.color ? props.color : "inherit";

  return (
    <Button
      style={{
        color,
        paddingLeft: "10px",
        paddingRight: "10px",
      }}
      variant="contained"
      color="primary"
      onClick={() => {
        setLoading(true);
        history.push(route);
      }}
      startIcon={
        <img
          src="/img/arrowBack.svg"
          height={backArrowHeight}
          alt="back arrow"
        />
      }
    >
      <Typography variant="button">{label}</Typography>
    </Button>
  );
}
