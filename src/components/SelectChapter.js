import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import { getIdxChapters, getImagesURL } from "../db.js";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    ...theme.title,
  },
  cardContainer: {
    marginTop: "30px",
    marginBottom: "-10px",
  },
  card: {
    background: "#BBC8D4",
    borderRadius: "20px",
    overflow: "hidden",
    marginBottom: "30px",
    paddingLeft: "15px",
    paddingRight: "15px",
    height: "300px",
    width: "150px",
    boxShadow: "0 10px 15px 2px rgba(0, 0, 0,.3)",
    cursor: "pointer",

    transition: theme.transitions.create(["z-index", "transform"], {
      duration: theme.transitions.duration.shortest,
    }),
    "&:hover": {
      transform: "scale(1.02)",
      zIndex: theme.zIndex.mobileStepper,
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        transform: "scale(1.02)",
        zIndex: theme.zIndex.mobileStepper,
      },
    },
  },
  backgroundImageThumb: {
    backgroundPosition: "50%",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",

    height: "70%",
    marginTop: "15px",
    marginBottom: "10px",

    borderRadius: "4px",
    position: "relative",
    overflow: "hidden",
  },
  cardTitleContainer: {
    height: "calc(100% - 70% - 15px - 10px)",
  },
  cardTitle: {
    textAlign: "center",
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
      .sort(function (a, b) {
        return Number(a) - Number(b);
      })
      .reverse()
      .map((idx) => (
        <Grid
          key={idx}
          item
          value={idx}
          onClick={(event) => {
            handleOnClick(event, idx);
          }}
        >
          <Box className={classes.card}>
            <Box
              className={classes.backgroundImageThumb}
              style={{
                backgroundImage: `url("${
                  chaptersJacket[idx]
                    ? chaptersJacket[idx]
                    : "/imagePlaceholder.png"
                }")`,
              }}
            />
            <Grid
              container
              direction="column"
              justify="center"
              className={classes.cardTitleContainer}
            >
              <Grid item>
                <Typography className={classes.cardTitle} variant="h2">
                  {idx}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ));
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Choisis ton chapitre</h1>
      <Grid
        container
        className={classes.cardContainer}
        justify="center"
        spacing={2}
        wrap="wrap"
      >
        {renderChaptersJacket()}
      </Grid>
    </div>
  );
}
