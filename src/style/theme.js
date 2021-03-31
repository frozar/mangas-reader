import { createMuiTheme } from "@material-ui/core/styles";

// const lightBlue = "#ABDAFF";
const dark = "#25313C";
const lightGrey = "#BBC8D4";

const defaultTheme = createMuiTheme({
  palette: {
    background: {
      default: "#e3e8ed",
    },
    containerBackground: "white",
    cardBackground: lightGrey,
    dark: dark,
  },
});

// Documentation link:
// https://www.colorhexa.com/aaaec1
export default createMuiTheme({
  palette: {
    ...defaultTheme.palette,
    // background: {
    //   default: "#e3e8ed",
    // },
    // containerBackground: "white",
    // cardBackground: lightGrey,
    // dark: dark,
  },
  typography: {
    h1: {
      fontFamily: "Lato",
      fontWeight: "800",
      fontStyle: "normal",
      fontSize: "36px",
      lineHeight: "40px",
      color: dark,
    },
    h2: {
      fontFamily: "Lato",
      fontWeight: "normal",
      fontStyle: "normal",
      fontSize: "18px",
      lineHeight: "20px",
      color: dark,
    },
  },
  container: {
    margin: "30px 180px",
    paddingLeft: "30px",
    paddingRight: "30px",
    background: defaultTheme.palette.containerBackground,
    borderRadius: 20,
    overflow: "hidden",
  },
  title: {
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "0px",
  },
});
