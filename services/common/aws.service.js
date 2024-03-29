const AWS = require('aws-sdk');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');

const GetS3Obj = () => {
  const credentials = {
    accessKeyId: config.aws.access_key_id,
    secretAccessKey: config.aws.secret_access_key,
  };

  AWS.config.update({ credentials, region: config.aws.region });
  const s3 = new AWS.S3();

  return s3;
};

exports.GetSignedUrl = async (Key, increaseExpire) => {
  const s3obj = GetS3Obj();

  const presignedGETURL = await s3obj.getSignedUrlPromise('getObject', {
    Bucket: config.aws.bucket_name,
    Key, // filename
    Expires: increaseExpire
      ? config?.aws?.extra_expires_access
      : config?.aws?.expires_access, // time to expire in seconds
  });

  return presignedGETURL;
};

exports.PutSignedUrl = async (Key, ContentType) => {
  const s3obj = GetS3Obj();

  const presignedPUTURL = await s3obj.getSignedUrlPromise('putObject', {
    Bucket: config.aws.bucket_name,
    Key, // filename
    ContentType,
    Expires: config.aws.expires_access, // time to expire in seconds
  });

  return presignedPUTURL;
};

exports.uploadFile = async (file, Key) => {
  const s3obj = GetS3Obj();
  const uploadParams = {
    Bucket: config.aws.bucket_name,
    Body: file,
    Key,
  };

  try {
    const upload = await s3obj.upload(uploadParams).promise();
    console.log('🚀 ~ file: aws.service.js:33 ~ upload');
    return upload;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};
