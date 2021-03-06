import React, { useMemo } from "react";
import { stringify } from "qs";
import { useHistory } from "react-router-dom";
import pick from "lodash/pick";
import ConfigForm from "../common/components/ConfigForm";
import useBodyBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import { Paths } from "../common/constants";

const savedValues = ["device", "isTest", "participant"];
const localStorageSavedValuesKey = "startup-values";

const fetchStoredValues = () => {
  const prevValuesJSON = localStorage.getItem(localStorageSavedValuesKey);
  return prevValuesJSON == null
    ? {}
    : pick(JSON.parse(prevValuesJSON), savedValues);
};

const saveValues = (values) => {
  localStorage.setItem(
    localStorageSavedValuesKey,
    JSON.stringify(pick(values, savedValues))
  );
};

const StartForm = () => {
  const history = useHistory();

  const handleConfigFormSubmit = (values, { setSubmitting }) => {
    setSubmitting(true);
    const {
      targetExperiment,
      config,
      participant,
      isTest,
      ...otherValues
    } = values;
    // Register some of the keys that should not change often.
    saveValues(values);
    history.push({
      pathname:
        targetExperiment === "speed-test" ? Paths.typingTest : Paths.experiment,
      search: `?${stringify({
        ...otherValues,
        isTest,
        participant:
          isTest && (participant === "" || participant == null)
            ? "test"
            : participant,
        config: targetExperiment === "speed-test" ? undefined : config,
      })}`,
    });
  };

  useBodyBackgroundColor("#EEE");

  return (
    <>
      <h2>Startup</h2>
      <ConfigForm
        onSubmit={handleConfigFormSubmit}
        submitLabel="Start"
        initialValues={useMemo(fetchStoredValues, [])}
      />
    </>
  );
};

export default StartForm;
