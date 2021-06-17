import React from "react";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

export default function ImageCaption(props) {
  const { displayResetButton, idScan, totalIdScan } = props;

  return (
    <Grid
      container
      item
      direction="row"
      justify="center"
      style={{ marginBottom: "8em" }}
    >
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
          visibility: displayResetButton ? "hidden" : "visible",
        }}
      >
        {`${Number(idScan) + 1} / ${totalIdScan}`}
      </Typography>
    </Grid>
  );
}
