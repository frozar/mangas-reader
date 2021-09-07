import React from "react";
import axios from "axios";

// import history from "../history";
import Link from "../../src/Link";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

// import { getMangasMeta, getMangas, getMangaChapters } from "../../src/db.js";
import { getMangas } from "../../src/db.js";
import GridCard from "../../src/GridCard.js";
// import WaitingComponent from "./WaitingComponent.js";
import NavigationButton from "../../src/NavigationButton";

// import AddCount from "../../src/AddCount";

import { connect } from "react-redux";
// import { bindActionCreators } from "redux";

// import { addCount } from "../../store/count/action";
import { retrieveManga } from "../../store/manga/action";
// import { getMangaChapters2 } from "../../src/serverSide";
import { wrapper } from "../../store/store";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    textAlign: "center",
  },
  subTitle: {
    textAlign: "end",
    textTransform: "uppercase",
    fontWeight: "800",
    color: theme.palette.grey[500],
  },
}));

function oneThumbnailAtLeastIsMissing(chapters) {
  const oneAtLeastIsMissing = Object.values(chapters).some(
    ({ thumbnail }) => thumbnail.length === 0
  );
  return oneAtLeastIsMissing;
}

function computeMissingThumbnails(chapters) {
  const chaptersIdxMissingThumbnail = Object.entries(chapters)
    .map(([idxChapter, { thumbnail }]) => {
      return thumbnail.length === 0 ? idxChapter : null;
    })
    .filter((x) => x);
  return chaptersIdxMissingThumbnail;
}

async function fetchableThumbnail(chapters) {
  const indexesRecomputeThumbnails = [];
  const toWait = [];
  for (const idx of Object.keys(chapters)) {
    const process = async (idx) => {
      try {
        const res = await fetch(chapters[idx].thumbnail);
        if (res.status !== 200) {
          indexesRecomputeThumbnails.push(idx);
        }
      } catch (error) {
        console.error(error);
      }
    };
    toWait.push(process(idx));
  }
  await Promise.all(toWait);
  return indexesRecomputeThumbnails;
}

function SelectChapter(props) {
  const classes = useStyles();
  let idManga = "one-piece";
  let manga = {};

  if (props.idManga !== undefined && props.idManga !== null) {
    idManga = props.idManga;
  }
  if (props.manga !== undefined && props.manga !== null) {
    manga = props.manga;
  }

  // console.log("SelectChapter props", props);

  // const chapters = manga[idManga] ? manga[idManga] : {};
  // if (chapters !== {}) {
  //   if (oneThumbnailAtLeastIsMissing(chapters)) {
  //     const chapterIndexes = computeMissingThumbnails(chapters);
  //     axios.post(
  //       "/api/thumbnails/create",
  //       {
  //         mangaPath: idManga,
  //         chapterIndexes,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //   } else {
  //     const chapterIndexes = fetchableThumbnail(chapters);
  //     console.log("chapterIndexes", chapterIndexes);
  //     // axios.post(
  //     //   "/api/thumbnails/recreate",
  //     //   {
  //     //     mangaPath: idManga,
  //     //     chapterIndexes,
  //     //   },
  //     //   {
  //     //     headers: {
  //     //       "Content-Type": "application/json",
  //     //     },
  //     //   }
  //     // );
  //   }
  // }

  const chapters = manga[idManga] ? manga[idManga] : {};

  React.useEffect(async () => {
    if (chapters !== {}) {
      if (oneThumbnailAtLeastIsMissing(chapters)) {
        const chapterIndexes = computeMissingThumbnails(chapters);
        axios.post(
          "/api/thumbnails/create",
          {
            mangaPath: idManga,
            chapterIndexes,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const chapterIndexes = await fetchableThumbnail(chapters);
        if (chapterIndexes.length !== 0) {
          axios.post(
            "/api/thumbnails/recreate",
            {
              mangaPath: idManga,
              chapterIndexes,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
    }
  }, [props.idManga, props.manga]);

  const chaptersJacket = {};
  for (const [idxChapter, details] of Object.entries(chapters)) {
    const { content: imagesURL, thumbnail } = details;
    if (thumbnail.length !== 0) {
      chaptersJacket[idxChapter] = thumbnail;
    } else {
      chaptersJacket[idxChapter] = imagesURL[0];
    }
  }

  const cards = Object.keys(chaptersJacket)
    .map((idChapter) => {
      return {
        label: idChapter,
        picture: chaptersJacket[idChapter]
          ? chaptersJacket[idChapter]
          : "/img/imagePlaceholder.png",
        link: `/manga/${idManga}/${idChapter}/0`,
      };
    })
    .sort(({ label: idxA }, { label: idxB }) => {
      return Number(idxA) - Number(idxB);
    })
    .reverse();

  return (
    <div className={classes.container}>
      {/* <AddCount /> */}
      {/* <div>
          <style jsx>{`
            div {
              padding: 0 0 20px 0;
            }
          `}</style>
          <h1>Retrieve Manga:</h1>
          <button onClick={(_) => props.retrieveManga(props.idManga)}>
            Add To Count
          </button>
        </div> */}
      <Grid
        container
        direction="row"
        alignItems="center"
        style={{
          marginTop: "20px",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Grid item xs={3}>
          <Link href="/">
            <NavigationButton />
          </Link>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h1" className={classes.title}>
            Choisis ton chapitre
          </Typography>
        </Grid>
        <Grid
          item
          xs={3}
          style={{
            marginTop: "auto",
          }}
        >
          <Typography variant="h2" className={classes.subTitle}>
            {props.title}
          </Typography>
        </Grid>
      </Grid>
      <GridCard cards={cards} type="chapter" />
    </div>
  );
}

export async function getStaticPaths() {
  // Return a list of possible value for id
  // const tmpLObjManga = await getMangasMeta();
  const tmpLObjManga = await getMangas();
  // console.log("tmpLObjManga", tmpLObjManga);
  const paths = Object.entries(tmpLObjManga).map(([_, objManga]) => {
    return {
      params: {
        idManga: objManga.path,
      },
    };
  });
  // console.log("paths", paths);
  return {
    paths,
    fallback: true,
  };
}

export const getStaticProps = wrapper.getStaticProps(
  async ({ store, params }) => {
    // const fs = require("fs");

    // const bufferToUpload = fs.readFileSync("tmp/toto.txt");
    // console.log("bufferToUpload", bufferToUpload);

    // Fetch necessary data for the blog post using params.id
    // console.log("params", params);
    const { idManga } = params;

    // store.dispatch(serverRenderClock(true));
    // store.dispatch(addCount());
    // store.dispatch(setTo10());
    await store.dispatch(retrieveManga(idManga));

    // if (typeof windows === "undefined") {
    //   // import { getMangaChapters2 } from "../../src/serverSide";
    //   // const docId = idManga + "_chapters";
    //   // const resGetMangaChapters2 = await getMangaChapters2(docId);
    //   // console.log("resGetMangaChapters2", resGetMangaChapters2);
    //   const resAxios = await axios.get(
    //     "http://localhost:3000/api/mangaChaptersGET",
    //     { params }
    //   );
    //   // console.log("resAxios", resAxios);
    // }

    // const docId = idManga + "_chapters";
    // const chapters = await getMangaChapters(docId);

    return {
      props: {
        // mangaPath,
        idManga,
        // chapters,
      },
    };
  }
);

const mapStateToProps = (state) => {
  // console.log("SelectManga mapStateToProps: state", state);
  return {
    // count: state.count.count,
    manga: state.manga.manga,
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     // addCount: bindActionCreators(addCount, dispatch),
//     // startClock: bindActionCreators(startClock, dispatch),
//     retrieveManga: bindActionCreators(retrieveManga, dispatch),
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(SelectChapter);
export default connect(mapStateToProps, null)(SelectChapter);
