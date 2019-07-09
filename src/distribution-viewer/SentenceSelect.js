import React, { memo } from "react";
import PropTypes from "prop-types";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import useMultiRef from "../utils/useMultiRef";

// The list is long. Extracting this in its own component so we can optimize it.
const SentenceItem = memo(({ onClick, sentence, selected }) => (
  <ListItem button onClick={onClick} selected={selected}>
    <ListItemText primary={sentence} />
  </ListItem>
));

SentenceItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  sentence: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired
};

const SentenceSelect = memo(({ corpus, selectedIndex, setSelectedIndex }) => {
  const callbacks = useMultiRef(corpus.length, i => () => setSelectedIndex(i));

  const items = corpus.map((sentence, i) => (
    <SentenceItem
      // eslint-disable-next-line react/no-array-index-key
      key={i}
      onClick={callbacks[i]}
      selected={selectedIndex === i}
      sentence={sentence}
    />
  ));

  return (
    <List dense component="nav">
      {items}
    </List>
  );
});

SentenceSelect.propTypes = {
  corpus: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedIndex: PropTypes.number.isRequired,
  setSelectedIndex: PropTypes.func.isRequired
};

export default SentenceSelect;
