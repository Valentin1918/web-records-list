import { FC, useRef, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuotesApi } from '../hooks';
import QuoteItem from './QuoteItem';
import { PageProps } from '../types';
import {removeRowsDuplicates} from "../utils";
import {QUOTES_PER_PAGE_LIMIT} from "../constants";

const QuotesList: FC = () => {
  const queryClient = useQueryClient();

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    allRows,
    allRowsIds,
    status,
    error,
  } = useQuotesApi();

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem || !allRows.length) {
      return
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    virtualItems,
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (active.id !== over?.id) {
      queryClient.setQueryData(['quotes'], (oldData: { pages: Array<PageProps> }) => {

        const oldRows = oldData ? removeRowsDuplicates(oldData.pages.flatMap((d) => d.results)) : [];
        const oldIndex = oldRows.findIndex(({ _id }) => _id ===  active.id);
        const newIndex = oldRows.findIndex(({ _id }) => _id === over?.id);
        const newRows = arrayMove(oldRows, oldIndex, newIndex);

        const newPages = oldData.pages.map(
          page => ({
            ...page,
            results: newRows.slice(page.lastItemIndex - QUOTES_PER_PAGE_LIMIT, page.lastItemIndex)
          })
        )

        return {
          ...oldData,
          pages: newPages
        }
      })
    }
  };

  if (['pending', 'error'].includes(status)) {
    return (
      <div className="centered">
        <p>
          {status === 'pending' ? 'Loading...' : `Error: ${error?.message}`}
        </p>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={allRowsIds} strategy={verticalListSortingStrategy}>
        <div
          className="quotes-list"
          ref={parentRef}
        >
          <div
            className="virtual-list"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow) => {
              const currentRowId = allRowsIds[virtualRow.index];
              const currentRow = allRows.find(row => row._id === currentRowId)!;
              const isLoaderRow = virtualRow.index > allRows.length - 1;

              return (
                <div
                  key={virtualRow.index}
                  className="virtual-row"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {isLoaderRow
                    ? 'Loading more...'
                    : <QuoteItem id={currentRowId} {...currentRow} />}
                </div>
              )
            })}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default QuotesList;
