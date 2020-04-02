import React from "react";
import PropTypes from "prop-types";
import ConfigForm from "../common/components/ConfigForm";
import { Devices } from "../common/constants";

export default function ParticipantStartupForm({ initialValues, onSubmit }) {
  return (
    <ConfigForm
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        onSubmit(values);
      }}
      initialValues={{ participant: "", device: "", ...initialValues }}
      enabledFields={["participant", "device"]}
    />
  );
}
ParticipantStartupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    participant: PropTypes.string,
    device: PropTypes.oneOf(Object.values(Devices)),
  }),
};
ParticipantStartupForm.defaultProps = {
  initialValues: undefined,
};
