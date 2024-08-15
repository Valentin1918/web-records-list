import { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuoteItemProps {
  id: string | number;
  author: string;
  content: string;
}

const QuoteItem: FC<QuoteItemProps> = ({ id, author, content }) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="quote-item"
      style={{ transform: CSS.Transform.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      <span className="author">{author}</span>
      <span className="content">{content}</span>
    </div>
  );
};

export default QuoteItem;
