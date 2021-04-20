import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  cardContainer: {
    ...theme.cardContainer,
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
  card: {
    background: "#BBC8D4",
    borderRadius: "20px",
    overflow: "hidden",
    height: "300px",
    width: "150px",
    paddingLeft: "15px",
    paddingRight: "15px",
    marginBottom: "30px",
    boxShadow: "0 5px 18px 3px rgba(0, 0, 0,.2)",
    [theme.breakpoints.down("md")]: {
      height: "250px",
      width: "125px",
      paddingLeft: "12px",
      paddingRight: "12px",
      marginBottom: "20px",
      boxShadow: "0 4px 15px 3px rgba(0, 0, 0,.2)",
    },
    [theme.breakpoints.down("sm")]: {
      height: "200px",
      width: "100px",
      paddingLeft: "10px",
      paddingRight: "10px",
      marginBottom: "15px",
      boxShadow: "0 3px 14px 3px rgba(0, 0, 0,.2)",
    },
    [theme.breakpoints.down("xs")]: {
      height: "175px",
      width: "80px",
      paddingLeft: "8px",
      paddingRight: "8px",
      marginBottom: "10px",
      boxShadow: "0 2px 14px 3px rgba(0, 0, 0,.2)",
    },
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
    [theme.breakpoints.down("md")]: {
      marginTop: "12px",
      marginBottom: "8px",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "10px",
      marginBottom: "6px",
    },

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

  return (
    <Grid
      container
      className={classes.cardContainer}
      justify="center"
      wrap="wrap"
    >
      {cards.map(({ label, picture }) => (
        <Grid
          key={label}
          item
          className={classes.cardItem}
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
      ))}
    </Grid>
  );
}
