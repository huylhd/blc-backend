import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyz".toUpperCase(),
  15,
);
export const genId = nanoid;
