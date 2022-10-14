import { IBaseCursor } from "src/interfaces/base-cursor.interface";

export interface ICommentCursor extends IBaseCursor {
  commentCount?: number | string;
  seqId?: number;
}
