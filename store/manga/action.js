import axios from "axios";

export const mangaActionTypes = {
  RETRIEVE: "RETRIEVE",
};

export const retrieveManga = (arg0) => {
  // console.log("arg0", arg0);
  // console.log("arguments 0 ", arguments);
  return async (dispatch) => {
    // console.log("arg0", arg0);
    // console.log("arguments 1 ", arguments);
    console.log("arg0", arg0);
    const res = await axios.get("https://jsonplaceholder.typicode.com/users");
    console.log("res.data", res.data);
    return dispatch({ type: mangaActionTypes.RETRIEVE, data: res.data });
  };
};
