import { useEffect } from "react";

const InjectEnd = ({ onEditConfig, onAdvanceWorkflow }) => {
  useEffect(() => {
    onEditConfig("isExperimentCompleted", true);
    onEditConfig("endDate", new Date());
    onAdvanceWorkflow();
  }, [onEditConfig, onAdvanceWorkflow]);
  return null;
};

export default InjectEnd;
