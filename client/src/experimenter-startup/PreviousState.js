import React, { useState } from "react";

// This is the key used by hcikit. It is hacky to access it like this,
// but there is no other way that I am aware of.
const localStorageStateKey = "state";

const getPreviousState = () => {
  const previousState = localStorage.getItem(localStorageStateKey);
  if (previousState == null) return null;
  return JSON.parse(previousState);
};

const previousState = getPreviousState();

const PreviousState = () => {
  const [storageState, setStorageState] = useState(previousState);

  const clearState = () => {
    localStorage.removeItem(localStorageStateKey);
    setStorageState(getPreviousState());
  };

  if (storageState == null)
    return (
      <>
        <h2>Existing Experiment State</h2>
        <p>No previous state.</p>
      </>
    );

  const isCompleted = storageState.Configuration.isExperimentCompleted;

  return (
    <>
      <h2>Existing Experiment State</h2>
      <p>
        There is already an existing experiment state (participant: &ldquo;
        {storageState.Configuration.participant}&rdquo;, config: &ldquo;
        {storageState.Configuration.config}&rdquo;).{" "}
      </p>
      {isCompleted ? (
        <p>This experiment is complete.</p>
      ) : (
        <p>This experiment is incomplete.</p>
      )}
      <p>
        Starting now would resume this state (regardless of config settings).
      </p>
      <p>
        If you remove this state, any unsaved content from the previous run will
        be lost.
      </p>
      <p>
        <button type="button" onClick={clearState}>
          Clear previous state
        </button>
      </p>
    </>
  );
};

export default PreviousState;
