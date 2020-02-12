import AWS from "aws-sdk";

export default function createS3Uploader(
  AWS_REGION,
  AWS_COGNITO_IDENTITY_POOL_ID,
  AWS_S3_BUCKET
) {
  AWS.config.region = AWS_REGION;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: AWS_COGNITO_IDENTITY_POOL_ID
  });

  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: AWS_S3_BUCKET }
  });

  return (fileName, data) => {
    return s3
      .upload({
        Key: fileName,
        Body: JSON.stringify(data),
        ContentType: "json",
        ACL: "bucket-owner-full-control"
      })
      .promise();
  };
}
