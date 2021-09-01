import React from "react";
import axios from "axios";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import Link from "./Link";

import Image from "next/image";
import { SERVER } from "../utils/url";

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
  thumbnailContainer: {
    position: "relative",
    height: "70%",
    width: "100%",
    marginTop: "15px",
    marginBottom: "10px",
  },
  cardTitleContainer: {
    height: "calc(100% - 70% - 15px - 10px)",
  },
  cardTitle: {
    textAlign: "center",
  },
}));

// function doHandleError(mangaPath, chapterIdx, thumbnailFilename) {
//   console.log("Thumbnail error");
//   console.log("mangaPath", mangaPath);
//   console.log("chapterIdx", chapterIdx);
//   console.log("thumbnailFilename", thumbnailFilename);
//   // axios
//   //   .post(URL_COMPUTER_THUMBNAIL, {
//   //     mangaPath,
//   //     chapterIdx,
//   //     thumbnailFilename,
//   //   })
//   //   .then(function (res) {
//   //     console.log("[doHandleError] Success");
//   //   })
//   //   .catch(function (error) {
//   //     console.log("[doHandleError] Failed");
//   //   });
//   // process.env.GOOGLE_CONFIG_BASE64
// }

function Portrait(props) {
  const classes = useStyles();
  // const inputEl = React.useRef(null);
  const { picture, type } = props;
  // const [current, setCurrent] = React.useState(null);

  // React.useEffect(() => {
  //   if (inputEl != null) {
  //     setCurrent(inputEl.current);
  //   }
  // }, [inputEl]);

  let mangaPath;
  let chapterIdx;
  let thumbnailFilename;

  // const handleError = React.useCallback(
  //   (_) => {
  //     doHandleError(mangaPath, chapterIdx, thumbnailFilename);
  //   },
  //   [mangaPath, chapterIdx, thumbnailFilename]
  // );

  // React.useEffect(() => {
  //   current?.addEventListener("error", handleError);

  //   return () => {
  //     current?.removeEventListener("error", handleError);
  //   };
  // }, [current, handleError]);

  let altStr;
  if (type === "manga") {
    altStr = picture !== undefined ? picture.split("/")[4] : "noPicture";
  } else if (type === "chapter") {
    // If chapter DOESN'T have a thumbnail
    if (picture.split("%2F").length === 1) {
      if (picture !== undefined) {
        const mangaChapter = picture.split("/").slice(4, 6);
        [mangaPath, chapterIdx] = mangaChapter;
        altStr = mangaChapter.join(" ");
      } else {
        altStr = "noPicture";
      }
    }
    // If chapter has a thumbnail
    else {
      if (picture !== undefined) {
        thumbnailFilename = picture
          .split("?")[0]
          .split("/")[9]
          .replace("%2F", "/");
        const mangaChapter = picture
          .split("%2F")[1]
          .split("?")[0]
          .split("_")
          .slice(1, 3);
        [mangaPath, chapterIdx] = mangaChapter;
        altStr = mangaChapter.join(" ");
      } else {
        altStr = "noPicture";
      }
    }
  }

  const handleErrorTest = () => {
    // console.log("handleErrorTest");
    // console.log("mangaPath", mangaPath);
    // console.log("chapterIdx", chapterIdx);
    // console.log("thumbnailFilename", thumbnailFilename);
    // console.log(
    //   "SERVER_URL + /api/computeThumbnail",
    //   SERVER + "/api/computeThumbnail"
    // );
    axios(SERVER + "/api/computeThumbnail", {
      params: {
        mangaPath,
        chapterIdx,
        thumbnailFilename,
      },
    });
  };

  return (
    <div className={classes.thumbnailContainer}>
      <Image
        src={picture}
        layout="fill"
        objectFit="contain"
        alt={altStr}
        onError={handleErrorTest}
      />
    </div>
  );
}

export default function GridCard(props) {
  const classes = useStyles();
  const { cards, type, ...other } = props;

  return (
    <Grid
      container
      className={classes.cardContainer}
      justify="center"
      wrap="wrap"
    >
      {cards.map(({ label, picture, link }) => {
        // console.log("link", link);
        return (
          <Link key={label} href={link}>
            <Grid
              item
              className={classes.cardItem}
              value={label}
              // onClick={(event) => {
              //   handleOnClick(event, label);
              // }}
            >
              <Box className={classes.card}>
                <Portrait {...other} picture={picture} type={type} />
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
          </Link>
        );
      })}
    </Grid>
  );
}
