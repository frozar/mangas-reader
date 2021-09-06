import { useSelector, useDispatch } from "react-redux";

const useCounter = () => {
  const count = useSelector((state) => state.count);
  const dispatch = useDispatch();
  const increment = () =>
    dispatch({
      type: "INCREMENT",
      value: 1,
    });
  const decrement = () =>
    dispatch({
      type: "DECREMENT",
      value: 2,
    });
  const reset = () =>
    dispatch({
      type: "RESET",
    });
  return { count, increment, decrement, reset };
};

const Counter = () => {
  const counterRes = useCounter();
  const { count, increment, decrement, reset } = counterRes;
  console.log("counterRes", counterRes);
  return (
    <div>
      <h1>
        Count: <span>{count}</span>
      </h1>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default Counter;
