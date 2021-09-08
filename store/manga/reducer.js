import { mangaActionTypes } from "./action";

const mangaInitialState = { manga: {} };

export default function reducer(state = mangaInitialState, action) {
  switch (action.type) {
    case mangaActionTypes.RETRIEVE:
      // console.log("[manga reducer] state.manga", state.manga);
      // console.log("[manga reducer] action", action);
      const newManga = { ...state.manga, [action.idManga]: action.chapters };
      const newState = {
        manga: newManga,
      };
      return newState;
    default:
      return state;
  }
}
