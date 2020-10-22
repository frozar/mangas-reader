import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

import LIST_MANGA from "../listManga";

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

export default function SelectManga(props) {
  const classes = useStyles();

  const handleOnClick = (event) => {
    props.selectManga(event.target.getAttribute("value"));
  };

  return (
    <React.Fragment>
      <Grid container className={classes.root} justify="center" spacing={2}>
        {LIST_MANGA.map((objManga) => (
          <Box
            style={{
              flexGrow: "0",
              flexShrink: "0",
              flexBasis: "50%",
              maxWidth: "25%",
              height: "400px",
              marginBottom: "1rem",
            }}
            key={objManga.URL}
          >
            <Grid
              item
              className={classes.backgroundImageThumb}
              style={{
                backgroundImage: `url(${objManga.jacket})`,
              }}
              value={objManga.URL}
              onClick={handleOnClick}
            ></Grid>
          </Box>
        ))}
      </Grid>
    </React.Fragment>
  );
}
