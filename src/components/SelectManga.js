import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import { getMangas } from "../db.js";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: "30px 180px",
    paddingLeft: "30px",
    paddingRight: "30px",
    background: theme.palette.lightBlue,
    borderRadius: 20,
    overflow: "hidden",
  },
  title: {
    /* H1 */
    fontFamily: "Lato",
    fontStyle: "normal",
    fontWeight: "800",
    fontSize: "36px",
    lineHeight: "40px",

    color: theme.palette.dark,
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "0px",
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

    /* H2 */
    fontFamily: "Lato",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "18px",
    lineHeight: "20px",

    color: theme.palette.dark,
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

  const handleOnClick = (event) => {
    props.selectManga(event.target.getAttribute("value"));
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
        {lObjManga.map(({ URL, title, thumb, path }, idx) => (
          <Grid key={URL} item value={path} onClick={handleOnClick}>
            <Box className={classes.card}>
              <Box
                className={classes.backgroundImageThumb}
                style={{
                  backgroundImage: `url("${thumb}")`,
                }}
              />
              <Grid
                container
                direction="column"
                justify="center"
                className={classes.cardTitleContainer}
              >
                <Grid item>
                  <Box className={classes.cardTitle}>{title}</Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
