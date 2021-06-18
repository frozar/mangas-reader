import React from "react";
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

export default function SelectChapter(props) {
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
  let chapters = {};

  if (props.idManga !== undefined && props.idManga !== null) {
    idManga = props.idManga;
  }
  if (props.chapters !== undefined && props.chapters !== null) {
    chapters = props.chapters;
  }

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

export async function getStaticProps({ params }) {
  // Fetch necessary data for the blog post using params.id
  // console.log("params", params);
  const { idManga } = params;
  const docId = idManga + "_chapters";
  const chapters = await getMangaChapters(docId);

  return {
    props: {
      // mangaPath,
      idManga,
      chapters,
    },
  };
}

// export async function getServerSideProps(context) {
//   const { params } = context;
//   // Fetch necessary data for the blog post using params.id
//   // console.log("params", params);
//   const { idManga } = params;
//   const docId = idManga + "_chapters";
//   const chapters = await getMangaChapters(docId);

//   return {
//     props: {
//       chapters,
//       idManga,
//     },
//   };
// }
