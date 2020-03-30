import React from "react";
import PropTypes from "prop-types";
import { Formik, Field, ErrorMessage, Form } from "formik";
import useUniqueId from "../common/hooks/useUniqueId";
import style from "./ControlServerLogin.module.scss";
import FormErrorMessage from "../common/components/FormErrorMessage";

export default function ControlServerLogin({ onLogin }) {
  const id = useUniqueId();
  return (
    <>
      <h2>Control Server</h2>
      <Formik
        onSubmit={(values) => {
          onLogin(values.password);
        }}
        initialValues={{ password: "" }}
      >
        <Form>
          <div className={style.formRow}>
            <label htmlFor={`${id}-password`}>
              Password:{" "}
              <Field
                as="input"
                name="password"
                id={`${id}-password`}
                type="password"
              />
            </label>
            <ErrorMessage name="password" component={FormErrorMessage} />
          </div>

          <div className={style.formRow}>
            <button type="submit">Login</button>
          </div>
        </Form>
      </Formik>
    </>
  );
}
ControlServerLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
