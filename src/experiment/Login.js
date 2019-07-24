import React, { useState } from "react";
import PropTypes from "prop-types";
import { loginDiv, inputZone, submitButton } from "./Login.module.css";

const Login = ({ onEditConfig, onAdvanceWorkflow }) => {
  const [value, setValue] = useState("");
  return (
    <div className={loginDiv}>
      <form
        onSubmit={e => {
          if (value !== "") {
            onEditConfig("participant", value);
            onAdvanceWorkflow();
            e.preventDefault();
          }
        }}
      >
        <input
          className={inputZone}
          type="text"
          placeholder="Enter your ID"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <input
          className={submitButton}
          type="submit"
          value="Start the experiment"
        />
      </form>
    </div>
  );
};

Login.propTypes = {
  onEditConfig: PropTypes.func.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default Login;
