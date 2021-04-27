import React from "react";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import NavigationButton from "../NavigationButton";

export default function TopBar(props) {
  const { path, idxChapter, imagesURL, idxImage, setLoading } = props;

  const undashify = (string) => {
    return string.replaceAll("-", " ");
  };

  const title = undashify(path);

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justify="space-between"
      style={{
        marginTop: "0.5em",
        marginLeft: "auto",
        marginRight: "auto",
        width: "98vw",
        maxWidth: "906px",
      }}
    >
      <Grid item style={{ width: "30%" }}>
        <Grid
          container
          direction="column"
          justify="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Grid item>
            <NavigationButton
              setLoading={setLoading}
              label="Retour aux chapitres"
              color="black"
              route="/chapter"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        style={{
          width: "40%",
        }}
      >
        <Grid
          container
          directory="column"
          justify="center"
          style={{
            textTransform: "capitalize",
          }}
        >
          <Grid item>
            <Typography
              variant="h1"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="h2"
              style={{ color: "white" }}
            >{`Chap. ${idxChapter}`}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ width: "30%" }}>
        <Typography
          variant="body1"
          style={{ color: "white", textAlign: "end" }}
        >
          {`${idxImage + 1} / ${
            imagesURL.length === 0 ? "N.A." : imagesURL.length
          }`}
        </Typography>
      </Grid>
    </Grid>
  );
}
