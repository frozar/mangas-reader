import { mangaActionTypes } from "./action";

const countInitialState = {
  manga: {},
};

// let iDbg = 0;

export default function reducer(state = countInitialState, action) {
  // console.log("manga Reducer: state ", state);
  // console.log("manga Reducer: 0 action ", action);
  switch (action.type) {
    case mangaActionTypes.RETRIEVE:
      // console.log("manga Reducer: 1 action ", action);
      // iDbg += 1;
      return Object.assign({}, state, {
        manga: { ...state.manga, toto: action.data },
      });
    default:
      return state;
  }
}
