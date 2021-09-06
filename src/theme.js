import { createMuiTheme } from "@material-ui/core/styles";

const dark = "#25313C";
const lightGrey = "#BBC8D4";

const defaultTheme = createMuiTheme({
  palette: {
    background: {
      default: "#e3e8ed",
    },
    primary: { main: "#e3e8ed" },
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
  },
  typography: {
    h1: {
      fontFamily: "Lato",
      fontWeight: "800",
      fontStyle: "normal",
      fontSize: "26px",
      lineHeight: "28px",
      [defaultTheme.breakpoints.down("md")]: {
        fontSize: "22px",
        lineHeight: "24px",
      },
      [defaultTheme.breakpoints.down("sm")]: {
        fontSize: "18px",
        lineHeight: "20px",
      },
      [defaultTheme.breakpoints.down("xs")]: {
        fontSize: "14px",
        lineHeight: "15px",
      },
      color: dark,
    },
    h2: {
      fontFamily: "Lato",
      fontWeight: "normal",
      fontStyle: "normal",
      fontSize: "18px",
      lineHeight: "20px",
      [defaultTheme.breakpoints.down("md")]: {
        fontSize: "16px",
        lineHeight: "18px",
      },
      [defaultTheme.breakpoints.down("sm")]: {
        fontSize: "13px",
        lineHeight: "14px",
      },
      [defaultTheme.breakpoints.down("xs")]: {
        fontSize: "10px",
        lineHeight: "11px",
      },
      color: dark,
    },
    button: {
      fontFamily: "Lato",
      fontWeight: "normal",
      fontStyle: "normal",
      lineHeight: "1.05",
      fontSize: "15px",
      [defaultTheme.breakpoints.down("md")]: {
        fontSize: "12px",
      },
      [defaultTheme.breakpoints.down("sm")]: {
        fontSize: "8px",
      },
      [defaultTheme.breakpoints.down("xs")]: {
        fontSize: "6px",
      },
    },
  },
  container: {
    margin: "30px 180px",
    paddingLeft: "30px",
    paddingRight: "30px",
    [defaultTheme.breakpoints.down("lg")]: {
      margin: "30px 60px",
      paddingLeft: "20px",
      paddingRight: "20px",
    },
    [defaultTheme.breakpoints.down("md")]: {
      margin: "30px 30px",
      paddingLeft: "10px",
      paddingRight: "10px",
    },
    [defaultTheme.breakpoints.down("sm")]: {
      margin: "20px 20px",
      paddingLeft: "2px",
      paddingRight: "2px",
    },
    [defaultTheme.breakpoints.down("xs")]: {
      margin: "5px 5px",
      paddingLeft: "2px",
      paddingRight: "2px",
    },
    background: defaultTheme.palette.containerBackground,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardContainer: {
    width: "100%",
    marginLeft: 0,
    marginRight: 0,
    marginTop: "30px",
    [defaultTheme.breakpoints.down("md")]: {
      marginTop: "20px",
    },
    [defaultTheme.breakpoints.down("sm")]: {
      marginTop: "15px",
    },
    [defaultTheme.breakpoints.down("xs")]: {
      marginTop: "10px",
    },
    marginBottom: "-10px",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          fontSize: "unset",
          // fontFamily: "unset",
          fontWeight: "unset",
          lineHeight: "unset",
          letterSpacing: "unset",
          // WebkitFontSmoothing: 'auto',
        },
      },
    },
  },
});
