import _ from "lodash";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

// import LIST_MANGA from "../listManga";
import WaitingScreen from "./WaitingScreen";
import { discoverManga, KEY_FIRST_CHAPTER, KEY_LAST_CHAPTER } from "../probe";

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
  // const [mangaURL, setMangaURL] = useState("");
  const [rangeChapter, setRangeChapter] = useState([-1, -1]);
  const classes = useStyles();

  useEffect(() => {
    console.log("useEffect props", props);
    // setMangaURL(props.mangaURL);
    discoverManga(props.mangaURL, updateRange);
  }, [rangeChapter]);

  const updateRange = (mangaURL, dict) => {
    // console.log("updateRange", dict);
    const firstIdx = dict[KEY_FIRST_CHAPTER];
    const lastIdx = dict[KEY_LAST_CHAPTER];
    if (!_.isEqual(rangeChapter, [firstIdx, lastIdx])) {
      setRangeChapter([firstIdx, lastIdx]);
    }
  };

  const handleOnClick = (event) => {
    event.persist();
    console.log(event);
    console.log(event.target.getAttribute("value"));
    const idxChapter = event.target.getAttribute("value");
    props.selectChapter(idxChapter);
  };

  const renderRange = (rangeChapter) => {
    // console.log("renderRange", rangeChapter);
    // console.log(
    //   "_.range(rangeChapter)",
    //   _.range(rangeChapter[1], rangeChapter[0], -1)
    // );
    // const listToRender = _.range(rangeChapter[0], rangeChapter[0] + 7);
    const listToRender = _.range(rangeChapter[1], rangeChapter[0], -1);
    return listToRender.map((idx) => {
      // console.log("idx", idx);
      return (
        <Box
          style={{
            flexGrow: "0",
            flexShrink: "0",
            flexBasis: "50%",
            maxWidth: "25%",
            height: "400px",
            marginBottom: "1rem",
          }}
          key={idx}
        >
          <Grid
            item
            className={classes.backgroundImageThumb}
            style={{
              backgroundImage: `url(https://lelscan.net/mangas/${props.mangaURL}/${idx}/00.jpg)`,
            }}
            value={idx}
            onClick={handleOnClick}
          ></Grid>
        </Box>
      );
    });
  };

  if (rangeChapter === [-1, -1]) {
    return <WaitingScreen open={true} />;
  } else {
    return (
      <React.Fragment>
        <Grid container className={classes.root} justify="center" spacing={2}>
          {renderRange(rangeChapter)}
        </Grid>
      </React.Fragment>
    );
  }
}
