import React, { useState, useEffect } from "react";
import history from "../history";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { getIdxChapters, getImagesURL } from "../db.js";
import GridCard from "./GridCard.js";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    ...theme.title,
  },
  cardContainer: {
    ...theme.cardContainer,
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
      setChaptersJacket(tmpChaptersJacket);
    }
    if (props.path) {
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
    console.log("[selectChapter] path", props.path);
    history.push("/manga");
  }

  return (
    <div className={classes.container}>
      <Grid
        container
        direction="row"
        alignItems="center"
        style={{
          marginTop: "20px",
        }}
      >
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log("before push");
              history.push("/manga");
              console.log("after push");
            }}
            // style={{ textDecoration: "none" }}
            startIcon={
              <img src="/img/arrowBack.svg" height="18px" alt="back arrow" />
            }
          >
            Changer de manga
          </Button>
        </Grid>
        <Grid item xs={6}>
          <h1 className={classes.title}>Choisis ton chapitre</h1>
        </Grid>
        <Grid item xs={3} />
      </Grid>
      <Grid
        container
        className={classes.cardContainer}
        justify="center"
        spacing={2}
        wrap="wrap"
      >
        <GridCard cards={cards} handleOnClick={handleOnClick} />
      </Grid>
    </div>
  );
}
