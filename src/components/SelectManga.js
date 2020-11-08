import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

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

  const handleOnClick = (event) => {
    props.selectManga(event.target.getAttribute("value"));
  };

  let lObjManga = [];
  if (props.mangaDict) {
    lObjManga = Object.values(props.mangaDict)
      .map((objManga) => {
        return objManga;
      })
      .sort((obj1, obj2) => {
        return obj1.title.localeCompare(obj2.title);
      });
  }

  return (
    <React.Fragment>
      <Grid container className={classes.root} justify="center" spacing={2}>
        {lObjManga.map(({ URL, title, path }) => (
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
                backgroundImage: `url("https://lelscan.net/mangas/${path}/thumb_cover.jpg")`,
              }}
              value={URL}
              onClick={handleOnClick}
            ></Grid>
            <span>{title}</span>
          </Box>
        ))}
      </Grid>
    </React.Fragment>
  );
}
