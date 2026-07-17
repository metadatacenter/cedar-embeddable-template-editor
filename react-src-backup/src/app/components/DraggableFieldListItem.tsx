import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface Field {
  id: number;
  type: string;
  name: string;
  status: string;
  customFieldId?: number;
}

interface DraggableFieldListItemProps {
  field: Field;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  onFieldClick?: (fieldId: number) => void;
  selectedField: number | null;
  getFieldIcon: (field: Field) => JSX.Element | undefined;
  COLORS: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
  };
}

export function DraggableFieldListItem({
  field,
  index,
  moveField,
  onFieldClick,
  selectedField,
  getFieldIcon,
  COLORS
}: DraggableFieldListItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'SIDEBAR_FIELD',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'SIDEBAR_FIELD',
    item: () => {
      return { id: field.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <button
      ref={ref}
      onClick={() => onFieldClick?.(field.id)}
      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors border-l-3 group ${
        selectedField === field.id ? 'bg-gray-100' : ''
      }`}
      style={{
        borderLeftColor: selectedField === field.id ? COLORS.primary : 'transparent',
        borderLeftWidth: '3px',
        borderLeftStyle: 'solid',
        opacity: isDragging ? 0.4 : 1,
        cursor: 'pointer'
      }}
      data-handler-id={handlerId}
    >
      <span className="text-gray-600 flex-shrink-0">
        {getFieldIcon(field)}
      </span>
      <div className="flex-1 text-left min-w-0">
        <div className="text-sm text-gray-900 truncate">{field.name}</div>
      </div>
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ 
          backgroundColor: selectedField === field.id ? COLORS.primary : '#94A3B8'
        }}
      />
      <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="7" cy="8" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="17" cy="8" r="1.5" />
          <circle cx="7" cy="16" r="1.5" />
          <circle cx="12" cy="16" r="1.5" />
          <circle cx="17" cy="16" r="1.5" />
        </svg>
      </div>
    </button>
  );
}
