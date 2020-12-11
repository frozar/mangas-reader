import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import { getIdxChapters } from "../db.js";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    alignItems: "center!important",
    padding: "1rem",
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

  const handleOnClick = (event) => {
    event.persist();
    const idxChapter = event.target.getAttribute("value");
    props.selectChapter(idxChapter);
  };

  const renderRange = (listIdxChapters) => {
    // TODO: make a request to get first image of each chapter
    return listIdxChapters.map((idx) => {
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
              backgroundImage: `url(https://lelscan.net/mangas/${props.path}/${idx}/00.jpg)`,
            }}
            value={idx}
            onClick={handleOnClick}
          ></Grid>
          <h3>{idx}</h3>
        </Box>
      );
    });
  };

  const [listIdxChapters, setListIdxChapters] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const tmpListIdxChapters = await getIdxChapters(props.path);
      tmpListIdxChapters.reverse();
      console.log("tmpListIdxChapters", tmpListIdxChapters);
      setListIdxChapters(tmpListIdxChapters);
    }
    fetchData();
  }, [props.path]);

  // console.log("listIdxChapters", listIdxChapters);
  return (
    <React.Fragment>
      <Grid container className={classes.root} justify="center" spacing={2}>
        {renderRange(listIdxChapters)}
      </Grid>
    </React.Fragment>
  );
}
