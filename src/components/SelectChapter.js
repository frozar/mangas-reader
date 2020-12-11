import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import WaitingScreen from "./WaitingScreen";
import { getIdxChapters, getImagesURL } from "../db.js";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    alignItems: "center!important",
    justifyContent: "flex-start!important",
  },
  backgroundImageThumb: {
    backgroundPosition: "50%",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    margin: "7px 7px 0",
    height: "100%",
    borderRadius: "8px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 20px 0 rgba(34,35,41,.9)",
    cursor: "pointer",

    transition: theme.transitions.create(["z-index", "transform"], {
      duration: theme.transitions.duration.shortest,
    }),
    "&:hover": {
      transform: "scale(1.1)",
      zIndex: theme.zIndex.mobileStepper,
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        transform: "scale(1.1)",
        zIndex: theme.zIndex.mobileStepper,
      },
    },
  },
}));

export default function SelectChapter(props) {
  const classes = useStyles();

  const [chaptersJacket, setChaptersJacket] = useState({});

  useEffect(() => {
    async function fetchData() {
      const tmpChaptersJacket = {};
      const tmpListIdxChapters = await getIdxChapters(props.path);
      await Promise.all(
        tmpListIdxChapters.map(async (idxChapter) => {
          const imagesURL = await getImagesURL(props.path, idxChapter);
          tmpChaptersJacket[idxChapter] = imagesURL[0];
        })
      );
      // console.log("tmpChaptersJacket", tmpChaptersJacket);
      setChaptersJacket(tmpChaptersJacket);
    }
    fetchData();
  }, [props.path]);

  const handleOnClick = (event) => {
    event.persist();
    const idxChapter = event.target.getAttribute("value");
    props.selectChapter(props.path, idxChapter);
  };

  const renderChaptersJacket = () => {
    return Object.keys(chaptersJacket)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      })
      .reverse()
      .map((idx) => {
        if (!chaptersJacket[idx]) {
          return null;
        } else {
          const url = chaptersJacket[idx];
          return (
            <Box
              style={{
                flexGrow: "0",
                flexShrink: "0",
                flexBasis: "50%",
                maxWidth: "25%",
                height: "400px",
                marginBottom: "3rem",
                textAlign: "center",
              }}
              key={idx}
            >
              <Grid
                item
                className={classes.backgroundImageThumb}
                style={{
                  backgroundImage: `url(${url})`,
                }}
                value={idx}
                onClick={handleOnClick}
              ></Grid>
              <h3>{idx}</h3>
            </Box>
          );
        }
      });
  };

  // console.log("chaptersJacket", Object.keys(chaptersJacket).length);
  const loading = Object.keys(chaptersJacket).length === 0;
  return (
    <React.Fragment>
      <WaitingScreen open={loading} />
      <Grid container className={classes.root} justify="center" spacing={0}>
        {renderChaptersJacket()}
      </Grid>
    </React.Fragment>
  );
}
