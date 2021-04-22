import React, { useState, useEffect } from "react";
import history from "../history";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { getMangaChapters } from "../db.js";
import GridCard from "./GridCard.js";
import WaitingComponent from "./WaitingComponent.js";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    textAlign: "center",
  },
  subTitle: {
    textAlign: "end",
    textTransform: "uppercase",
    fontWeight: "800",
    color: theme.palette.grey[500],
  },
}));

export default function SelectChapter(props) {
  const classes = useStyles();
  const theme = useTheme();
  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));
  const matchesSM = useMediaQuery(theme.breakpoints.down("sm"));
  const matchesXS = useMediaQuery(theme.breakpoints.down("xs"));

  const [chaptersJacket, setChaptersJacket] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const chapters = await getMangaChapters(props.path);

      const chaptersJacket = {};
      for (const [idx, details] of Object.entries(chapters)) {
        const { content: imagesURL } = details;
        chaptersJacket[idx] = imagesURL[0];
        // console.log("[SelectChapter] idx", idx);
        // console.log("[SelectChapter] imagesURL", imagesURL);
      }
      // console.log("");
      setChaptersJacket(chaptersJacket);
      setLoading(false);
    }
    if (props.path) {
      setLoading(true);
      fetchData();
    }
  }, [props.path]);

  const cards = Object.keys(chaptersJacket)
    .map((idx) => {
      return {
        label: idx,
        picture: chaptersJacket[idx]
          ? chaptersJacket[idx]
          : "/img/imagePlaceholder.png",
      };
    })
    .sort(({ label: idxA }, { label: idxB }) => {
      return Number(idxA) - Number(idxB);
    })
    .reverse();

  const handleOnClick = (event, label) => {
    event.persist();
    props.selectChapter(props.path, label);
  };

  // If the current path is undefined, get back to manga selection.
  if (!props.path) {
    history.push("/manga");
  }

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

  return (
    <div className={classes.container}>
      <Grid
        container
        direction="row"
        alignItems="center"
        style={{
          marginTop: "20px",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Grid item xs={3}>
          <Button
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
        <Grid item xs={6}>
          <Typography variant="h1" className={classes.title}>
            Choisis ton chapitre
          </Typography>
        </Grid>
        <Grid
          item
          xs={3}
          style={{
            marginTop: "auto",
          }}
        >
          <Typography variant="h2" className={classes.subTitle}>
            {props.title}
          </Typography>
        </Grid>
      </Grid>
      <WaitingComponent loading={loading} />
      <GridCard cards={cards} handleOnClick={handleOnClick} />
    </div>
  );
}
