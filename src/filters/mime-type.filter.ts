import { UnsupportedMediaTypeException } from "@nestjs/common";

export const mimeTypeFilter = (...types: string[]) => {
  return (
    req,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (types.some((type) => file.mimetype.includes(type))) {
      callback(null, true);
    } else {
      callback(
        new UnsupportedMediaTypeException(
          `File type is not matching: ${types.join(", ")}`,
        ),
        false,
      );
    }
  };
};
