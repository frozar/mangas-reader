export const countActionTypes = {
  ADD: "ADD",
};

export const addCount = () => {
  return (dispatch) => {
    return dispatch({ type: countActionTypes.ADD });
  };
};
