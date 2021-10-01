import React from "react";
// import dynamic from "next/dynamic";

import { makeStyles } from "@material-ui/core/styles";
// import { ThemeProvider } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";

// import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
// import Box from "@material-ui/core/Box";
// import ProTip from "../src/ProTip";
// import Link from "../src/Link";
// import Copyright from "../src/Copyright";
// import SelectManga from "../src/SelectManga";

// import { getMangasMeta, getMangas } from "../src/db.js";
import { getMangas } from "../src/db.js";

import GridCard from "../src/GridCard.js";
// import Counter from "../src/counter";
// import AddCount from "../src/AddCount";

import { connect } from "react-redux";
// import { bindActionCreators } from "redux";

// import { addCount } from "../store/count/action";
import { wrapper } from "../store/store";
// import { serverRenderClock, startClock } from "../store/tick_old/action";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.container,
  },
  title: {
    marginTop: "20px",
    textAlign: "center",
  },
}));

// export default function Index() {
//   return (
//     <Container maxWidth="sm">
//       <Box sx={{ my: 4 }}>
//         <Typography variant="h4" component="h1" gutterBottom>
//           Next.js v5-alpha example
//         </Typography>
//         <Link href="/about" color="secondary">
//           Go to the about page
//         </Link>
//         <ProTip />
//         <Copyright />
//       </Box>
//     </Container>
//   );
// }

// const fetcher = url => axios.get(url).then(res => res.data)
// const fetcher = (url) =>
//   getMangas().then((tmpLObjManga) => {
//     // res.data
//     let lObjManga = [];
//     if (tmpLObjManga !== undefined) {
//       const mangas = Object.values(tmpLObjManga);
//       mangas.sort((obj1, obj2) => {
//         return obj1.title.localeCompare(obj2.title);
//       });
//       lObjManga = mangas;
//     }
//     return lObjManga;
//   });

function Index(props) {
  // state = {
  //   path: undefined,
  //   title: undefined,
  //   idxChapter: undefined,
  //   imagesURL: [],
  // };
  const classes = useStyles();
  // console.log("Home props", props);

  // selectManga = (title) => {
  //   const path = dashify(title);
  //   this.setState({ path, title });
  //   // history.push("/chapter");
  // };

  // selectChapter = async (path, idxChapter) => {
  //   this.setState({ path, idxChapter, imagesURL: [] });
  //   // history.push("/reader");
  //   const imagesURL = await getImagesURL(path, idxChapter);
  //   // console.log("[selectChapter] imagesURL", imagesURL);
  //   if (imagesURL.length === 0) {
  //     console.error("[selectChapter] Didn't get chapter images.");
  //   }
  //   this.setState({ path, idxChapter, imagesURL });
  // };

  // previousChapter = async () => {
  //   const { path, idxChapter } = this.state;
  //   const idxChapters = await getIdxChapters(path);
  //   const idx = idxChapters.indexOf(idxChapter);
  //   if (0 < idx) {
  //     const idxPreviousChapter = idxChapters[idx - 1];
  //     const imagesURL = await getImagesURL(path, idxPreviousChapter);
  //     if (imagesURL.length === 0) {
  //       console.error("[previousChapter] Didn't get chapter images.");
  //     }
  //     const idxImage = imagesURL.length - 1;
  //     this.setState({ idxChapter: idxPreviousChapter, imagesURL });
  //     return idxImage;
  //   } else {
  //     console.info("previousChapter: no more scan");
  //     return null;
  //   }
  // };

  // nextChapter = async () => {
  //   const { path, idxChapter } = this.state;
  //   const idxChapters = await getIdxChapters(path);
  //   const idx = idxChapters.indexOf(idxChapter);
  //   const maxIdx = idxChapters.length - 1;
  //   if (idx < maxIdx) {
  //     const idxNextChapter = idxChapters[idx + 1];
  //     const imagesURL = await getImagesURL(path, idxNextChapter);
  //     if (imagesURL.length === 0) {
  //       console.error("[nextChapter] Didn't get chapter images.");
  //     }
  //     const idxImage = 0;
  //     this.setState({ idxChapter: idxNextChapter, imagesURL });
  //     return idxImage;
  //   } else {
  //     console.info("nextChapter: no more scan");
  //     return null;
  //   }
  // };

  // resetState = () => {
  //   this.setState({
  //     path: undefined,
  //     idxChapter: undefined,
  //     imagesURL: [],
  //   });
  // };

  // console.log("Index props", props);

  const cards =
    props.lObjManga !== undefined
      ? props.lObjManga
          .map(({ title, thumbnail, path }) => {
            return {
              label: title,
              picture: thumbnail,
              link: `/manga/${path}`,
            };
          })
          .sort(function ({ label: labelA }, { label: labelB }) {
            return labelA.localeCompare(labelB);
          })
      : [];

  // const { data, error } = useSWR("", fetcher);
  // console.log("error", error);
  // const cards =
  //   data !== undefined
  //     ? data
  //         .map(({ title, thumbnail }) => {
  //           return {
  //             label: title,
  //             picture: thumbnail,
  //           };
  //         })
  //         .sort(function ({ label: labelA }, { label: labelB }) {
  //           return labelA.localeCompare(labelB);
  //         })
  //     : [];

  // const handleOnClick = (event, title) => {
  //   props.selectManga(title);
  // };

  // const { path, title, idxChapter, imagesURL } = this.state;

  // console.log("cards", cards);
  return (
    <div className={classes.container}>
      {/* <AddCount /> */}
      <Typography variant="h1" className={classes.title}>
        Choisis ton manga
      </Typography>
      <GridCard cards={cards} type="manga" />
    </div>
  );
}

// export async function getStaticProps() {

//   let lObjManga = [];
//   const tmpLObjManga = await getMangasMeta();
//   // console.log("tmpLObjManga", tmpLObjManga);
//   // console.log("typeof tmpLObjManga", typeof tmpLObjManga);
//   if (tmpLObjManga !== undefined && typeof tmpLObjManga === "object") {
//     const mangas = Object.values(tmpLObjManga);
//     mangas.sort((obj1, obj2) => {
//       return obj1.title.localeCompare(obj2.title);
//     });
//     lObjManga = mangas;
//   }

//   return {
//     props: {
//       lObjManga,
//     },
//   };
// }

export const getStaticProps = wrapper.getStaticProps(async ({ store }) => {
  // store.dispatch(serverRenderClock(true));
  // store.dispatch(addCount());

  let lObjManga = [];
  // getMangas();
  // const tmpLObjManga = await getMangasMeta();
  const tmpLObjManga = await getMangas();
  // console.log("tmpLObjManga", tmpLObjManga);
  // console.log("typeof tmpLObjManga", typeof tmpLObjManga);
  if (tmpLObjManga !== undefined && typeof tmpLObjManga === "object") {
    const mangas = Object.values(tmpLObjManga);
    mangas.sort((obj1, obj2) => {
      return obj1.title.localeCompare(obj2.title);
    });
    if (process.env.NODE_ENV === "development") {
      // lObjManga = mangas;
      lObjManga = mangas.slice(0, 2);
    } else {
      lObjManga = mangas;
    }
  }

  return {
    props: {
      lObjManga,
    },
  };
});

const mapStateToProps = (state) => {
  // console.log("SelectManga mapStateToProps: state", state);
  return {
    // count: state.count.count,
    manga: state.manga.manga,
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     addCount: bindActionCreators(addCount, dispatch),
//     // startClock: bindActionCreators(startClock, dispatch),
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Index);
export default connect(mapStateToProps, null)(Index);
