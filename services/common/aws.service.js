/* eslint-disable security/detect-non-literal-fs-filename */
const AWS = require('aws-sdk');

const fs = require('fs');

const httpStatus = require('http-status');
// const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const ApiError = require('../../utils/ApiError');

const bucketName = config.aws.bucket_name_upload;

AWS.config.update({
  region: config.aws.region,
});

const s3 = new AWS.S3();

exports.uploadFile = async ({ path, id }, customDir) => {
  const fileContent = fs.readFileSync(path);

  const targetPath = customDir
    ? `${customDir}/${id}`
    : `/${path.slice(1).split('/')[2]}/${id}`;

  const params = {
    Bucket: bucketName,
    Key: targetPath,
    Body: fileContent,
    // ContentType: 'image/jpeg',
  };

  try {
    const upload = await s3.upload(params).promise();
    fs.unlinkSync(`${path}`);
    return upload;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};

exports.deleteFile = async fileKey => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  s3.headObject(params, err => {
    if (err) {
      console.error('Error retrieving object metadata:', err);
      return;
    }

    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }

      console.log('File deleted successfully:', data);
    });
  });
};

exports.getSignedUrl = (Key, prefix, cropped = true) => {
  if (typeof prefix !== 'string' || typeof Key !== 'string')
    return `${prefix}NOT_FOUND.JPG`;

  if (prefix.includes('catalog')) return prefix + Key;

  const parts = Key.split('/');
  if (parts.length === 2) {
    const [path, name] = parts;
    if (name.includes('side'))
      if (cropped) return `${prefix + path}/cropped/${name}`;
      else return `${prefix + path}/${name}`;
  }

  return prefix + Key;
};

exports.putSignedUrl = async (Key, ContentType, Bucket) => {
  try {
    const presignedPUTURL = await s3.getSignedUrlPromise('putObject', {
      Bucket,
      Key, // filename
      ContentType,
      Expires: config.aws.expires_access, // time to expire in seconds
    });
    return presignedPUTURL;
  } catch (error) {
    // console.log(
    //   '🚀 ~ file: aws.service.js ~ line 41 ~ exports.putSignedUrl= ~ error',
    //   error,
    // );
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      'aws putSignedUrl error',
      error,
    );
  }
};
