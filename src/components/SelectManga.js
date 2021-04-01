import React, { useState, useEffect } from "react";
import dashify from "dashify";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

import { getMangas } from "../db.js";
import GridCard from "./GridCard.js";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    ...theme.title,
    marginTop: "20px",
  },
  cardContainer: {
    ...theme.cardContainer,
  },
}));

export default function SelectManga(props) {
  const classes = useStyles();

  const [lObjManga, setLObjManga] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const tmpLObjManga = await getMangas();
      setLObjManga(tmpLObjManga);
    }
    fetchData();
  }, []);

  const cards = lObjManga
    .map(({ title, thumb }) => {
      return {
        label: title,
        picture: thumb,
      };
    })
    .sort(function ({ label: labelA }, { label: labelB }) {
      return labelA.localeCompare(labelB);
    });

  const handleOnClick = (event, title) => {
    const path = dashify(title);
    props.selectManga(path);
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Choisis ton manga</h1>
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
