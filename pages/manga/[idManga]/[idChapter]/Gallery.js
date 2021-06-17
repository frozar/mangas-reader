import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Link from "../../../../src/Link";

const useStyles = makeStyles((theme) => ({
  drawerContainer: {
    width: "80vw",
  },
  galleryTitle: {
    marginTop: "30px",
    marginBottom: "15px",
  },
  cardTitleContainer: {
    marginBottom: "30px",
  },
  cardItem: {
    padding: "8px",
    [theme.breakpoints.down("sm")]: {
      padding: "4px",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "3px",
    },
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 5px 18px 3px rgba(0, 0, 0,.2)",
    [theme.breakpoints.down("md")]: {
      boxShadow: "0 4px 15px 3px rgba(0, 0, 0,.2)",
    },
    [theme.breakpoints.down("sm")]: {
      boxShadow: "0 3px 14px 3px rgba(0, 0, 0,.2)",
    },
    [theme.breakpoints.down("xs")]: {
      boxShadow: "0 2px 14px 3px rgba(0, 0, 0,.2)",
    },
    cursor: "pointer",

    transition: theme.transitions.create(["z-index", "transform"], {
      duration: theme.transitions.duration.short,
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
  image: {
    width: "150px",
    [theme.breakpoints.down("md")]: {
      width: "125px",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100px",
    },
    [theme.breakpoints.down("xs")]: {
      width: "80px",
    },
    cursor: "pointer",
  },
  label: {
    position: "absolute",
    padding: "0 4px",
    fontWeight: "bold",
    right: 0,
    bottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    WebkitTapHighlightColor: "transparent",
    color: theme.palette.grey[300],
  },
}));

export default function Gallery(props) {
  const classes = useStyles();
  const { imagesURL, openGallery, toggleGallery, idManga, idChapter, idScan } =
    props;

  return (
    <Drawer anchor={"right"} open={openGallery} onClose={toggleGallery}>
      <div className={classes.drawerContainer}>
        <Grid item container className={classes.galleryTitle} justify="center">
          <Typography variant="h2">{`Chapitre ${idChapter}`}</Typography>
        </Grid>
        <Grid
          container
          className={classes.cardContainer}
          justify="center"
          alignItems="center"
          wrap="wrap"
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {imagesURL.map((imageURL, idx) => {
            return (
              <Grid
                key={idx}
                item
                className={classes.cardItem}
                onClick={(_) => {
                  // setIdxImage(idx);
                  toggleGallery();
                }}
              >
                <Link href={`/manga/${idManga}/${idChapter}/${idx}`}>
                  <div className={classes.imageContainer}>
                    <img
                      src={imageURL}
                      alt={`${idx}`}
                      className={classes.image}
                    />
                    <div
                      className={classes.label}
                      style={{
                        color:
                          Number(idScan) === Number(idx) ? "lime" : "undefined",
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </Drawer>
  );
}
