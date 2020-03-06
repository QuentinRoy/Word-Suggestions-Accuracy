import { createUpload } from "@hcikit/tasks";
import createS3Uploader from "../s3Uploader";

const UploadTask = createUpload(
  createS3Uploader(
    "us-east-2",
    "us-east-2:5e4b7193-2a48-42b9-be38-de801a857b26",
    "exii-accuracy-control-uploads"
  )
);

export default UploadTask;
