import React from "react";
import PropTypes from "prop-types";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import useMultiRef from "../utils/useMultiRef";

export default function SentenceSelect({
  corpus,
  selectedIndex,
  setSelectedIndex
}) {
  const callbacks = useMultiRef(corpus.length, i => () => setSelectedIndex(i));

  const items = corpus.map((sentence, i) => (
    <ListItem
      // eslint-disable-next-line react/no-array-index-key
      key={i}
      button
      onClick={callbacks[i]}
      selected={selectedIndex === i}
    >
      <ListItemText primary={sentence} />
    </ListItem>
  ));

  return (
    <List dense component="nav">
      {items}
    </List>
  );
}

SentenceSelect.propTypes = {
  corpus: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedIndex: PropTypes.number.isRequired,
  setSelectedIndex: PropTypes.func.isRequired
};
