import { getMangaChapters } from "../../src/db.js";
import { getMangaChapters2 } from "../../src/serverSide.js";

export const mangaActionTypes = {
  RETRIEVE: "RETRIEVE",
};

export const retrieveManga = (idManga) => {
  return async (dispatch, getState) => {
    const currentState = getState();

    if (typeof currentState.manga[idManga] !== "object") {
      const docId = idManga + "_chapters";
      // console.log("[action retrieveManga] TRIGGER RETRIEVE");
      // console.log(
      //   "[action retrieveManga] currentState.manga",
      //   currentState.manga
      // );
      // console.log("[action retrieveManga] idManga", idManga);
      // console.log(
      //   "[action retrieveManga] typeof currentState.manga[idManga]",
      //   typeof currentState.manga[idManga]
      // );
      const chapters = await getMangaChapters(docId);
      // console.log("[action retrieveManga] chapters", chapters);
      return dispatch({
        type: mangaActionTypes.RETRIEVE,
        idManga,
        chapters,
      });
    }
  };
};
