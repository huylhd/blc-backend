import { S3 } from "aws-sdk";

export const S3Provider = {
  provide: "S3",
  useFactory: () => {
    const s3 = new S3();
    return s3;
  },
};
