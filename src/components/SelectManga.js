import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import { getMangas } from "../db.js";

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
    borderRadius: "4px",
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
    props.setPath(event.target.getAttribute("value"));
  };

  return (
    <React.Fragment>
      <Grid container className={classes.root} justify="center" spacing={2}>
        {lObjManga.map(({ URL, title, thumb, path }) => (
          <Box
            style={{
              flexGrow: "0",
              flexShrink: "0",
              flexBasis: "50%",
              maxWidth: "100px",
              height: "124px",
              marginBottom: "3rem",
              textAlign: "center",
            }}
            key={URL}
          >
            <Grid
              item
              className={classes.backgroundImageThumb}
              style={{
                backgroundImage: `url("${thumb}")`,
              }}
              value={path}
              onClick={handleOnClick}
            ></Grid>
            <span>{title}</span>
          </Box>
        ))}
      </Grid>
    </React.Fragment>
  );
}
