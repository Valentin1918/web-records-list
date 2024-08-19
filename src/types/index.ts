export interface RowProps {
  _id: string;
  author: string;
  content: string;
}

export interface PageProps {
  page: number;
  lastItemIndex: number;
  totalPages: number;
  results: RowProps;
}