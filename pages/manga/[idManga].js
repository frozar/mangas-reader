import React from "react";
import axios from "axios";

// import history from "../history";
import Link from "../../src/Link";
import { useRouter } from "next/router";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { getMangasMeta, getMangaChapters } from "../../src/db.js";
import GridCard from "../../src/GridCard.js";
// import WaitingComponent from "./WaitingComponent.js";
import NavigationButton from "../../src/NavigationButton";

import AddCount from "../../src/AddCount";

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

function SelectChapter(props) {
  // console.log("SelectChapter props", props);
  // console.log("SelectChapter props.manga", props.manga);
  const classes = useStyles();
  const router = useRouter();

  // const [chaptersJacket, setChaptersJacket] = useState({});
  // const [loading, setLoading] = useState(true);
  // console.log("props", props);

  // useEffect(() => {
  //   async function fetchData() {
  //     const chapters = await getMangaChapters(props.path);

  //     const chaptersJacket = {};
  //     for (const [idx, details] of Object.entries(chapters)) {
  //       const { content: imagesURL, thumbnail } = details;
  //       if (thumbnail.length !== 0) {
  //         chaptersJacket[idx] = thumbnail;
  //       } else {
  //         chaptersJacket[idx] = imagesURL[0];
  //       }
  //     }
  //     // console.log("");
  //     setChaptersJacket(chaptersJacket);
  //     setLoading(false);
  //   }
  //   if (props.path) {
  //     setLoading(true);
  //     fetchData();
  //   }
  // }, [props.path]);

  // const { idManga, chapters } = props;

  let idManga = "one-piece";
  // let chapters = {};
  let manga = {};

  if (props.idManga !== undefined && props.idManga !== null) {
    idManga = props.idManga;
  }
  // if (props.chapters !== undefined && props.chapters !== null) {
  //   chapters = props.chapters;
  // }
  if (props.manga !== undefined && props.manga !== null) {
    manga = props.manga;
  }

  // console.log("SelectChapter props", props);

  const chapters = manga[idManga] ? manga[idManga] : {};

  const chaptersJacket = {};
  for (const [idChapter, details] of Object.entries(chapters)) {
    const { content: imagesURL, thumbnail } = details;
    if (thumbnail.length !== 0) {
      chaptersJacket[idChapter] = thumbnail;
    } else {
      chaptersJacket[idChapter] = imagesURL[0];
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

  // const handleOnClick = (event, label) => {
  //   event.persist();
  //   props.selectChapter(props.path, label);
  // };

  // // If the current path is undefined, get back to manga selection.
  // if (!props.path) {
  //   history.push("/manga");
  // }

  if (router.isFallback) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className={classes.container}>
        <AddCount />
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
        {/* <WaitingComponent loading={loading} /> */}
        <GridCard cards={cards} type="chapter" />
      </div>
    );
  }
}

export async function getStaticPaths() {
  // Return a list of possible value for id
  const tmpLObjManga = await getMangasMeta();
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

    if (typeof windows === "undefined") {
      // import { getMangaChapters2 } from "../../src/serverSide";
      // const docId = idManga + "_chapters";
      // const resGetMangaChapters2 = await getMangaChapters2(docId);
      // console.log("resGetMangaChapters2", resGetMangaChapters2);
      const resAxios = await axios.get(
        "http://localhost:3000/api/mangaChaptersGET"
      );
      // console.log("resAxios", resAxios);
    }

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
