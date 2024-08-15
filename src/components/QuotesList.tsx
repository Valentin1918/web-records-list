import { FC, useRef, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuotesApi } from '../hooks';
import QuoteItem from './QuoteItem';

const QuotesList: FC = () => {
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    allRows,
    setAllRowsIds,
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
      setAllRowsIds((currentAllRowsIds) => {
        const oldIndex = currentAllRowsIds.indexOf(active.id as string);
        const newIndex = currentAllRowsIds.indexOf(over?.id as string);
        return arrayMove(currentAllRowsIds, oldIndex, newIndex);
      });
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
