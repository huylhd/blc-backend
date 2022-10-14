import { isEmpty, last, pick } from "lodash";

// Decode cursor from base64 string
export const decodeCursor = (base64String: string): any => {
  try {
    const jsonString = Buffer.from(base64String, "base64").toString("ascii");
    return JSON.parse(jsonString);
  } catch (err) {
    return {};
  }
};

// Base64 encode for cursor
const encodeCursor = (cursor: any): string => {
  return cursor ? Buffer.from(JSON.stringify(cursor)).toString("base64") : null;
};

// Example: createCursor({commentCount: 0, seqId: 0}, ["commentCount", "seqId"]) = {commentCount: 0, seqId: 0}
const createCursor = ({ item, keys }: { item: any; keys: string[] }): any => {
  if (isEmpty(item) || isEmpty(keys)) {
    return null;
  }
  return pick(item, keys);
};

export const getListAndPaging = ({
  data,
  keys,
  cursor,
  limit,
}: {
  data: any[];
  keys: string[];
  cursor: any;
  limit: number;
}) => {
  let hasNextPage = false,
    hasPrevPage = false;

  // Check if there is next page and previous page
  // Slice the extra data
  if (cursor.type === "after" || isEmpty(cursor)) {
    hasPrevPage = !isEmpty(cursor);
    if (data.length > limit) {
      hasNextPage = true;
      data = data.slice(0, limit);
    }
  } else if (cursor.type === "before") {
    hasNextPage = true;
    if (data.length > limit) {
      hasPrevPage = true;
      data = data.slice(1);
    }
  }

  // Create cursors at start and end position
  const startCursor = createCursor({ item: data[0], keys });
  const endCursor = createCursor({ item: last(data), keys });

  const paging = {
    nextCursor: hasNextPage
      ? encodeCursor({ ...endCursor, type: "after" })
      : null,
    prevCursor: hasPrevPage
      ? encodeCursor({ ...startCursor, type: "before" })
      : null,
  };
  return { data, paging };
};
