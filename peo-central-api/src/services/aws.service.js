const { BUCKET_NAME, SECRET_ID_AWS, SECRET_KEY_AWS, AWS_REGION } = process.env;
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

const s3 = new S3({
  accessKeyId: SECRET_ID_AWS,
  secretAccessKey: SECRET_KEY_AWS,
  region: AWS_REGION,
});

// the updated version accepts multiple uploads for mimetype upload
const uploadFilesToS3 = async (files, foreignId) => {
  const urls = [];

  // If only one file is passed in, wrap it in an array
  const fileArray = Array.isArray(files) ? files : [files];

  for (const file of fileArray) {
    const fileStream = fs.createReadStream(file.tempFilePath);
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Body: fileStream,
      Key: `doc-attachment_${foreignId}_${Date.now()}_${file.name}/${file.name}`,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    const result = await s3.upload(uploadParams).promise();
    urls.push(result.Location);
  }

  return urls;
};
const uploadFilesToS3base64 = async (base64, name, mimetype, foreignId) => {
  let buffer = base64
  const newBuffer = buffer.replace(/^data:.+;base64,/, "")
  const params = {
    Bucket: BUCKET_NAME,
    Key: `doc-attachment_${foreignId}_${Date.now()}_${name}/${name}`,
    Body: Buffer.from(newBuffer, 'base64'),
    ACL: 'public-read',
    ContentType: mimetype
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}


const getFileStreamFromS3 = async (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: BUCKET_NAME,
  };

  return s3.getObject(downloadParams).createReadStream();
};

// to be deleted once ests are done

const mimeTypeUpload = async (file, foreignId) => {
  const processFile = async (singleFile) => {
    const result = await uploadFilesToS3(singleFile, foreignId);
    return {
      mime_type: singleFile.mimetype,
      file_name: singleFile.name,
      url: result[0],
      isDeleted: false,
      size_in_bytes: singleFile.size,
    };
  };

  if (Array.isArray(file)) {
    const uploadedFiles = [];
    for (const singleFile of file) {
      const uploadResult = await processFile(singleFile);
      uploadedFiles.push(uploadResult);
    }
    return uploadedFiles;
  } else {
    // Handle a single file
    return await processFile(file);
  }
};



module.exports = {
  uploadFilesToS3base64,
  uploadFilesToS3,
  getFileStreamFromS3,
  mimeTypeUpload,
};
