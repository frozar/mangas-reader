import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import { getMangas } from "../db.js";
import GridCard from "./GridCard.js";
import WaitingComponent from "./WaitingComponent.js";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    marginTop: "20px",
    textAlign: "center",
  },
}));

export default function SelectManga(props) {
  const classes = useStyles();

  const [lObjManga, setLObjManga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const tmpLObjManga = await getMangas();
      const mangas = Object.values(tmpLObjManga);
      mangas.sort((obj1, obj2) => {
        return obj1.title.localeCompare(obj2.title);
      });
      setLObjManga(mangas);
      setLoading(false);
    }
    setLoading(true);
    fetchData();
  }, []);

  const cards = lObjManga
    .map(({ title, thumbnail }) => {
      return {
        label: title,
        picture: thumbnail,
      };
    })
    .sort(function ({ label: labelA }, { label: labelB }) {
      return labelA.localeCompare(labelB);
    });

  const handleOnClick = (event, title) => {
    props.selectManga(title);
  };

  return (
    <div className={classes.container}>
      <Typography variant="h1" className={classes.title}>
        Choisis ton manga
      </Typography>
      <WaitingComponent loading={loading} />
      <GridCard cards={cards} handleOnClick={handleOnClick} />
    </div>
  );
}
