import { createStore, applyMiddleware, combineReducers } from "redux";
import { HYDRATE, createWrapper } from "next-redux-wrapper";
import thunkMiddleware from "redux-thunk";
// import { mangaActionTypes } from "./action";

// import count from "./count/reducer";
// import tick from "./tick_old/reducer";
import manga from "./manga/reducer";
import { mangaActionTypes } from "./manga/action";

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const combinedReducer = combineReducers({
  // count,
  // tick,
  manga,
});

const reducer = (state, action) => {
  // console.log("[main reducer] action", action);
  // console.log("[main reducer] state", state);
  if (action.type === HYDRATE) {
    // console.log("[main reducer] HYDRATE action", action);
    // console.log(
    //   "[main reducer] HYDRATE action.payload.manga",
    //   action.payload.manga
    // );
    // console.log(
    //   "[main reducer] HYDRATE action.payload.manga.manga",
    //   action.payload.manga.manga
    // );
    // console.log("[main reducer] HYDRATE state.manga", state.manga);
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    // console.log("[main reducer] nextState.manga", nextState.manga);
    // preserve count value on client side navigation
    // if (state.count.count) {
    //   nextState.count.count = state.count.count;
    // }
    // console.log("[main reducer] state.manga.manga", state.manga.manga);
    // console.log(
    //   "[main reducer] Boolean(state.manga.manga)",
    //   Boolean(state.manga.manga)
    // );
    if (state.manga.manga) {
      // // nextState.manga.manga = state.manga.manga;
      // const newManga = { ...nextState.manga.manga, ...state.manga.manga };
      // // console.log("[main reducer] newManga", newManga);
      // nextState.manga.manga = newManga;
      nextState.manga.manga = {
        ...state.manga.manga,
        ...nextState.manga.manga,
      };
    }
    return nextState;
  } else {
    // console.log("[main reducer] else");
    // if (action.type !== mangaActionTypes.RETRIEVE) {
    //   console.log("[main reducer] action", action);
    // }
    return combinedReducer(state, action);
  }
};

const initStore = () => {
  // console.log("initStore arguments", arguments);
  return createStore(reducer, bindMiddleware([thunkMiddleware]));
};

export const wrapper = createWrapper(initStore);
