import React, { useState, useEffect } from "react";
import axios from "axios";
import history from "../history";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import {
  getChapters,
  CLOUD_FUNCTION_ROOT,
  getIdxChapters,
  getImagesURL,
} from "../db.js";
import GridCard from "./GridCard.js";

const URL_MANGA_CHAPTERS_SET = CLOUD_FUNCTION_ROOT + "mangaChaptersSET";

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
    async function fetchData(iter = 0) {
      if (1 < iter) {
        return;
      }
      // const tmpChaptersJacket = {};
      // const tmpListIdxChapters = await getIdxChapters(props.path);
      // console.log("[SelectChapter] tmpListIdxChapters", tmpListIdxChapters);
      // await Promise.all(
      //   tmpListIdxChapters.map(async (idxChapter) => {
      //     const imagesURL = await getImagesURL(props.path, idxChapter);
      //     console.log(
      //       "[SelectChapter] idxChapter, imagesURL",
      //       idxChapter,
      //       imagesURL
      //     );
      //     console.log("");
      //     tmpChaptersJacket[idxChapter] = imagesURL[0];
      //   })
      // );
      // // console.log("[SelectChapter] tmpChaptersJacket", tmpChaptersJacket);
      // // tmpListIdxChapters.map((idxChapter) => {
      // //   // const imagesURL = await getImagesURL(props.path, idxChapter);
      // //   tmpChaptersJacket[idxChapter] = undefined;
      // //   return idxChapter;
      // // });
      // console.log("[SelectChapter] tmpChaptersJacket", tmpChaptersJacket);
      // setChaptersJacket(tmpChaptersJacket);

      const chapters = await getChapters(props.path);
      // Object.entries(chapters, (key, val) => {
      //   console.log("key", key);
      //   console.log("val", val);
      // });

      // const idxToDisplay = [];
      console.log("[SelectChapter] chapters", chapters);
      const idxToLookFor = [];
      const chaptersJacket = {};
      for (const [idx, imagesURL] of Object.entries(chapters)) {
        console.log("[SelectChapter] idx", idx);
        console.log("[SelectChapter] imagesURL", imagesURL);
        if (imagesURL.length !== 0) {
          // idxToDisplay.push(idx);
          chaptersJacket[idx] = imagesURL[0];
        } else {
          idxToLookFor.push(idx);
        }
      }
      console.log("");
      setChaptersJacket(chaptersJacket);

      if (idxToLookFor.length !== 0) {
        console.log("[SelectChapter] idxToLookFor", idxToLookFor);
        await axios.get(URL_MANGA_CHAPTERS_SET, {
          params: {
            path: props.path,
            idxChapter: idxToLookFor,
          },
        });

        setTimeout(() => {
          fetchData(iter + 1);
        }, 1000);
      }
      // for (const idx of idxToDisplay) {

      // }
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
