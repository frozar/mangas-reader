import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const listManga = [
  {
    title: "One Piece",
    path: "one-piece",
  },
  {
    title: "One Punch Man",
    path: "one-punch-man",
  },
];

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
  const [manga, setManga] = React.useState(listManga[0].path);

  // console.log(props);
  const handleChange = (event) => {
    setManga(event.target.value);
    // console.log(props);
    props.selectManga(event.target.value);
  };

  const renderedManga = listManga.map((objManga) => {
    return (
      <MenuItem key={objManga.path} value={objManga.path}>
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
