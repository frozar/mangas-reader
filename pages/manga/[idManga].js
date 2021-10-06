import React from "react";
// import axios from "axios";

// import history from "../history";
import Link from "../../src/Link";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

// import { getMangasMeta, getMangas, getMangaChapters } from "../../src/db.js";
// import { getMangas } from "../../src/db.js";
import { getMangas, getMangaChapters } from "../../src/db.js";
import GridCard from "../../src/GridCard.js";
// import WaitingComponent from "./WaitingComponent.js";
import NavigationButton from "../../src/NavigationButton";

// import AddCount from "../../src/AddCount";

import { connect } from "react-redux";
// import { bindActionCreators } from "redux";

// import { retrieveManga } from "../../store/manga/action";
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
  // let manga = {};
  let chaptersJacket = {};

  if (props.idManga !== undefined && props.idManga !== null) {
    idManga = props.idManga;
  }
  // if (props.manga !== undefined && props.manga !== null) {
  //   manga = props.manga;
  // }
  if (props.chaptersJacket !== undefined && props.chaptersJacket !== null) {
    chaptersJacket = props.chaptersJacket;
  }

  // console.log("SelectChapter props", props);

  // const chapters = manga[idManga] ? manga[idManga] : {};

  // // TODO: Move in a scheduled cloud function
  // React.useEffect(async () => {
  //   if (chapters !== {}) {
  //     if (oneThumbnailAtLeastIsMissing(chapters)) {
  //       const chapterIndexes = computeMissingThumbnails(chapters);
  //       axios.post(
  //         "/api/thumbnails/create",
  //         {
  //           mangaPath: idManga,
  //           chapterIndexes,
  //         },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //     } else {
  //       const chapterIndexes = await fetchableThumbnail(chapters);
  //       if (chapterIndexes.length !== 0) {
  //         axios.post(
  //           "/api/thumbnails/recreate",
  //           {
  //             mangaPath: idManga,
  //             chapterIndexes,
  //           },
  //           {
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //           }
  //         );
  //       }
  //     }
  //   }
  // }, [props.idManga, props.manga]);

  // const chaptersJacket = {};
  // for (const [idxChapter, details] of Object.entries(chapters)) {
  //   const { content: imagesURL, thumbnail } = details;
  //   if (thumbnail.length !== 0) {
  //     chaptersJacket[idxChapter] = thumbnail;
  //   } else {
  //     chaptersJacket[idxChapter] = imagesURL[0];
  //   }
  // }

  const cards = Object.keys(chaptersJacket)
    .map((idChapter) => {
      return {
        label: idChapter,
        picture: chaptersJacket[idChapter],
        link: `/v/${idManga}/${idChapter}/0`,
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
  // Return a list of possible value for idManga
  const tmpLObjManga = await getMangas();
  // console.log("tmpLObjManga", tmpLObjManga);
  const paths = Object.entries(tmpLObjManga).map(([_, objManga]) => {
    return {
      params: {
        idManga: objManga.path,
      },
    };
  });

  // Documentation link:
  // https://vercel.com/docs/next.js/incremental-static-regeneration
  // fallback: true - when a request is made to a page that hasn't
  // been generated, Next.js will immediately serve a static page
  // with a loading state on the first request. When the data is
  // finished loading, the page will re-render using this data and
  // be cached. Future requests will serve the static file from the cache.
  return {
    paths,
    fallback: true,
  };
}

export const getStaticProps = wrapper.getStaticProps(
  async ({ store, params }) => {
    // console.log("params", params);
    const { idManga } = params;

    // await store.dispatch(retrieveManga(idManga));

    let chapters = await getMangaChapters(idManga);
    const chaptersJacket = {};
    // if (process.env.DEV_TOKEN !== "") {
    //   let chaptersTmp = {};
    //   for (const k of Object.keys(chapters).slice(0, 2)) {
    //     chaptersTmp[k] = chapters[k];
    //   }
    //   chapters = chaptersTmp;
    // }
    let MAX_STATIC_CHAPTER = 1000;
    if (process.env.NODE_ENV === "development") {
      // MAX_STATIC_CHAPTER = 1000;
    }

    for (const [idxChapter, details] of Object.entries(chapters).slice(
      0,
      MAX_STATIC_CHAPTER
    )) {
      const { content: imagesURL, thumbnail } = details;
      if (thumbnail.length !== 0) {
        chaptersJacket[idxChapter] = thumbnail;
      } else {
        chaptersJacket[idxChapter] = imagesURL[0];
      }
    }
    // console.log("chaptersJacket", chaptersJacket);

    // Documentation link:
    // https://vercel.com/docs/next.js/incremental-static-regeneration
    return {
      props: {
        // mangaPath,
        idManga,
        chaptersJacket,
        // chapters,
      },
      // every hours, check if regeneration of the page is necessary
      revalidate: 60 * 60 * 1,
    };
  }
);

// const mapStateToProps = (state) => {
//   // console.log("SelectManga mapStateToProps: state", state);
//   return {
//     // count: state.count.count,
//     manga: state.manga.manga,
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   return {
//     // addCount: bindActionCreators(addCount, dispatch),
//     // startClock: bindActionCreators(startClock, dispatch),
//     retrieveManga: bindActionCreators(retrieveManga, dispatch),
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(SelectChapter);
// export default connect(mapStateToProps, null)(SelectChapter);
export default connect(null, null)(SelectChapter);
