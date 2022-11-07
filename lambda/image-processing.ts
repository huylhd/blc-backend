import { Handler, SQSEvent } from "aws-lambda";
import { isEmpty } from "lodash";
import * as dotenv from "dotenv";
import { appConfig } from "../src/app-config";
import { DataSource, DataSourceOptions } from "typeorm";
import { S3 } from "aws-sdk";
import * as Jimp from "jimp";
import { ImageStatusEnum } from "../src/enums/image-status.enum";

dotenv.config();

const getConnection = async () => {
  const dbConfig = appConfig().database;
  dbConfig.synchronize = true;
  const connection = new DataSource(dbConfig as DataSourceOptions);
  await connection.initialize();
  return connection;
};

export const handler: Handler = async (event: SQSEvent, context, cb) => {
  try {
    if (isEmpty(event.Records)) {
      return;
    }

    const bodyStr = event.Records[0].body;
    const body = JSON.parse(bodyStr);
    const { imageId, base64Str } = body;
    if (!imageId || !base64Str) {
      return;
    }

    const connection = await getConnection();
    const queryResult = await connection.manager.query(
      'SELECT id, "originalName" FROM images WHERE id = $1',
      [imageId],
    );
    if (isEmpty(queryResult)) {
      return;
    }
    const imageRecord = queryResult[0];
    const s3 = new S3();
    const nameWithoutExtension = imageRecord.originalName
      .split(".")
      .slice(0, -1)
      .join(".");
    const originalFileName = `${imageRecord.id}-${imageRecord.originalName}`;
    const resizeFileName = `${imageRecord.id}-${nameWithoutExtension}-600x600.jpg`;
    const imageBuffer = Buffer.from(base64Str, "base64");

    // Resize to 600x600 and reformat image to jpg
    const resizedImage = (await Jimp.read(imageBuffer)).resize(600, 600);

    const bucket = appConfig().bucket;

    // Upload original and resize images to S3
    const [originalUpload, resizeUpload] = await Promise.all([
      s3
        .upload({
          Bucket: bucket,
          Body: imageBuffer,
          Key: originalFileName,
        })
        .promise(),
      s3
        .upload({
          Bucket: bucket,
          Body: await resizedImage.getBufferAsync(Jimp.MIME_JPEG),
          Key: resizeFileName,
        })
        .promise(),
    ]);

    const originalPath = originalUpload.Location;
    const resizePath = resizeUpload.Location;
    const status = ImageStatusEnum.UPLOADED;

    const [_, modifiedRow] = await connection.manager.query(
      'UPDATE images SET "originalPath" = $1, "resizePath" = $2, "status" = $3 WHERE id = $4',
      [originalPath, resizePath, status, imageId],
    );
    if (modifiedRow < 0) {
      throw Error("Failed to update image");
    }
    console.log("Update image successfully");
  } catch (err) {
    console.log(err);
    return;
  }
};
