import {RowProps} from "../types";

export const removeRowsDuplicates = (array: Array<RowProps>): Array<RowProps> => {
  const map = new Map<string, RowProps>();
  array.forEach(item => map.set(item._id, item));
  return Array.from(map.values());
};
