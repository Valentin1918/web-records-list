import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { addParamsToUrl, removeRowsDuplicates } from '../utils';
import { QUOTES_BASE_URL, QUOTES_PER_PAGE_LIMIT } from '../constants';
import { PageProps } from '../types';

const addParamsToQuotesUrl = addParamsToUrl(QUOTES_BASE_URL);

const fetchPage = async (params: { limit: number, page: number }) => {
  const quotesUrl = addParamsToQuotesUrl(params);
  const res = await fetch(quotesUrl);
  return res.json();
};

const useQuotesApi = () => {
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['quotes'],
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: { limit: QUOTES_PER_PAGE_LIMIT, page: 1 },
    getNextPageParam: (lastPage: PageProps) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.totalPages ? { limit: QUOTES_PER_PAGE_LIMIT, page: nextPage } : null;
    },
  })

  const allRows = useMemo(() => {
    if (!data) return [];
    // TODO: we need to remove duplicates because the API provides duplicates on different pages
    return removeRowsDuplicates(data.pages.flatMap((d) => d.results));
  }, [data]);

  const [allRowsIds, setAllRowsIds] = useState<Array<string>>(() => allRows.map(row => row._id));

  useEffect(() => {
    setAllRowsIds((currentAllRowsIds) => ([
      ...currentAllRowsIds,
      ...allRows.slice(currentAllRowsIds.length).map(row => row._id)
    ]));
  }, [allRows]);

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    allRows,
    setAllRowsIds,
    allRowsIds,
    status,
    error,
  }
}

export default useQuotesApi;
