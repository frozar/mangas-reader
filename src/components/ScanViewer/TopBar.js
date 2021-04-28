import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ViewComfyRoundedIcon from "@material-ui/icons/ViewComfyRounded";

import NavigationButton from "../NavigationButton";
import Gallery from "./Gallery";

export default function TopBar(props) {
  const {
    path,
    idxChapter,
    setLoading,
    imagesURL,
    idxImage,
    setIdxImage,
  } = props;
  const [openGallery, setOpenGallery] = useState(false);

  const toggleGallery = () => {
    setOpenGallery(!openGallery);
  };

  const undashify = (string) => {
    return string.replaceAll("-", " ");
  };

  const title = undashify(path);

  return (
    <>
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
            direction="column"
            justify="center"
            style={{
              textTransform: "capitalize",
              textAlign: "center",
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
          <Grid item container justify="flex-end">
            <IconButton
              color="primary"
              aria-label="next scan"
              component="span"
              onClick={(_) => {
                toggleGallery();
              }}
            >
              <ViewComfyRoundedIcon fontSize="large" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      <Gallery
        imagesURL={imagesURL}
        idxImage={idxImage}
        setIdxImage={setIdxImage}
        openGallery={openGallery}
        toggleGallery={toggleGallery}
        idxChapter={idxChapter}
      />
    </>
  );
}
