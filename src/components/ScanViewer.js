import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import DisplayImage from "./DisplayImage";
import WaitingComponent from "./WaitingComponent.js";
import history from "../history";

export default function ScanViewer(props) {
  const theme = useTheme();
  const { path, idxChapter, imagesURL, previousChapter, nextChapter } = props;

  const [idxImage, setIdxImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));
  const matchesSM = useMediaQuery(theme.breakpoints.down("sm"));
  const matchesXS = useMediaQuery(theme.breakpoints.down("xs"));

  const getPreviousImage = useCallback(async () => {
    let previousIdxImage;
    if (0 < idxImage) {
      // Go to the previous image
      previousIdxImage = idxImage - 1;
    } else if (idxImage === 0) {
      // Go to the previous chapter
      previousIdxImage = await previousChapter();
    }
    if (previousIdxImage !== null) {
      setIdxImage(previousIdxImage);
    }
  }, [idxImage, setIdxImage, previousChapter]);

  const getNextImage = useCallback(async () => {
    const idxImageMax = imagesURL.length - 1;
    let nextIdxImage;
    if (idxImage < idxImageMax) {
      // Go to the next image
      nextIdxImage = idxImage + 1;
    } else if (idxImage === idxImageMax) {
      // Go to the next chapter
      nextIdxImage = await nextChapter();
    }
    if (nextIdxImage !== null) {
      setIdxImage(nextIdxImage);
    }
  }, [imagesURL, idxImage, setIdxImage, nextChapter]);

  const handleKeyDown = useCallback(
    (evt) => {
      if (evt.key === "ArrowLeft") {
        setLoading(true);
        getPreviousImage();
      } else if (evt.key === "ArrowRight") {
        setLoading(true);
        getNextImage();
      }
    },
    [getPreviousImage, getNextImage]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // console.log(
  //   "path !==  && idxChapter !== null && imagesURL.length !== 0",
  //   path !== "" && idxChapter !== null && imagesURL.length !== 0
  // );
  const DisplayImageRended =
    path !== "" && idxChapter !== null && imagesURL.length !== 0 ? (
      <DisplayImage
        imageURL={imagesURL[idxImage]}
        getPreviousImage={getPreviousImage}
        getNextImage={getNextImage}
        loading={loading}
        setLoading={setLoading}
      />
    ) : (
      <WaitingComponent loading={loading} color="white" />
    );

  const undashify = (string) => {
    return string.replaceAll("-", " ");
  };

  let backArrowHeight = "18px";
  let buttonWidth = "230px";
  if (matchesMD) {
    if (matchesSM) {
      if (matchesXS) {
        backArrowHeight = "10px";
        buttonWidth = "100px";
      } else {
        backArrowHeight = "12px";
        buttonWidth = "125px";
      }
    } else {
      backArrowHeight = "15px";
      buttonWidth = "180px";
    }
  }

  return (
    <>
      <Helmet>
        <style>{"body { background-color: black; }"}</style>
      </Helmet>
      <div>
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
                <Button
                  style={{
                    color: "black",
                    width: buttonWidth,
                    padding: "3px 4px",
                  }}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    history.push("/manga");
                  }}
                  startIcon={
                    <img
                      src="/img/arrowBack.svg"
                      height={backArrowHeight}
                      alt="back arrow"
                    />
                  }
                >
                  <Typography variant="button">Changer de manga</Typography>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  style={{
                    color: "black",
                    width: buttonWidth,
                    padding: "3px 4px",
                  }}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    history.push("/chapter");
                  }}
                  startIcon={
                    <img
                      src="/img/arrowBack.svg"
                      height={backArrowHeight}
                      alt="back arrow"
                    />
                  }
                >
                  <Typography variant="button">Changer de chapitre</Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            style={{
              textAlign: "center",
              width: "30%",
              textTransform: "capitalize",
            }}
          >
            <Typography
              variant="h1"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              {undashify(path)}
            </Typography>
            <Typography
              variant="h2"
              style={{ color: "white" }}
            >{`Chap. ${idxChapter}`}</Typography>
          </Grid>
          <Grid item style={{ width: "30%" }}>
            <Typography
              variant="body1"
              style={{ color: "white", textAlign: "end" }}
            >
              {`${idxImage + 1} / ${imagesURL.length}`}
            </Typography>
          </Grid>
        </Grid>
      </div>
      {DisplayImageRended}
    </>
  );
}
