import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import LIST_MANGA from "../listManga";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    background: "#9ba0b6",
    position: "absolute",
    left: "1rem",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function SelectManga(props) {
  const classes = useStyles();
  const [manga, setManga] = React.useState(LIST_MANGA[0].URL);

  // console.log(props);
  const handleChange = (event) => {
    setManga(event.target.value);
    // console.log(props);
    props.selectManga(event.target.value);
  };

  const renderedManga = LIST_MANGA.map((objManga) => {
    return (
      <MenuItem key={objManga.URL} value={objManga.URL}>
        {objManga.title}
      </MenuItem>
    );
  });

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="manga-select-label">Manga</InputLabel>
      <Select
        labelId="manga-select-label"
        id="manga-select"
        value={manga}
        onChange={handleChange}
      >
        {renderedManga}
      </Select>
    </FormControl>
  );
}
