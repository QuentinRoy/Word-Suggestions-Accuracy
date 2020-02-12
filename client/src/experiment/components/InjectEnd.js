import { useEffect } from "react";
import short from "short-uuid";

const InjectEnd = ({ onEditConfig, onAdvanceWorkflow }) => {
  useEffect(() => {
    const confirmationCode = short.uuid();
    onEditConfig("confirmationCode", confirmationCode);
    onEditConfig("isExperimentCompleted", true);
    onEditConfig("endDate", new Date());
    onAdvanceWorkflow();
  }, [onEditConfig, onAdvanceWorkflow]);
  return null;
};

export default InjectEnd;
