import React, { useState, useEffect } from "react";
import "./wordHelper.css";

function WorldHelper(props) {
  const [wordHelp, setWordHelp] = useState([" ", " ", " "]);

  useEffect(() => {
    setWordHelp(["Here", "is", "text"]);
  }, []);

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <button onClick={() => props.wordHelpHandler(wordHelp[0])}>
              {wordHelp[0]}
            </button>
          </td>
          <td>
            <button onClick={() => props.wordHelpHandler(wordHelp[1])}>
              {wordHelp[1]}
            </button>
          </td>
          <td>
            <button onClick={() => props.wordHelpHandler(wordHelp[2])}>
              {wordHelp[2]}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default WorldHelper;
