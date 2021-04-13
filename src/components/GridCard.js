import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
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

export default function GridCard(props) {
  const classes = useStyles();
  const { cards, handleOnClick } = props;

  return cards.map(({ label, picture }) => (
    <Grid
      key={label}
      item
      value={label}
      onClick={(event) => {
        handleOnClick(event, label);
      }}
    >
      <Box className={classes.card}>
        <Box
          className={classes.backgroundImageThumb}
          style={{
            backgroundImage: `url("${picture}")`,
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
              {label}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  ));
}
