import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";

// import withRedux from "next-redux-wrapper"; //HOC wich helps us use Redux with Next.js
// import { Provider } from "react-redux";

import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

// import initStore from "../store"; //Our function for store initialization
import theme from "../src/theme";

// import { useStore } from "../store";
import { wrapper } from "../store/store";

function MyApp(props) {
  const { Component, pageProps } = props;
  // const store = useStore(pageProps.initialReduxState);

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Manga reader</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {/* <Provider store={store}> */}
        <div suppressHydrationWarning>
          {typeof window === "undefined" ? null : <Component {...pageProps} />}
        </div>
        {/* </Provider> */}
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default wrapper.withRedux(MyApp);

// //we pass our initStore function and our App componnent
// export default withRedux(initStore)(MyApp);
