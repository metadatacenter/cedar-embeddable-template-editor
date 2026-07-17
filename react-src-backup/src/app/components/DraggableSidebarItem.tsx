import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Library } from '../types';

const COLORS = {
  primary: '#2D6F5F',
  primaryHover: '#245A4D',
  primaryLight: '#E8F3F0',
  border: '#3B7A5D'
};

interface DraggableSidebarItemProps {
  field: any;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  selectedField: number | null;
  onFieldClick: (fieldId: number) => void;
  fieldIcon: React.ReactNode;
  fieldTypeLabel: string;
  libraries: Library[];
}

export function DraggableSidebarItem({
  field,
  index,
  moveField,
  selectedField,
  onFieldClick,
  fieldIcon,
  fieldTypeLabel,
  libraries
}: DraggableSidebarItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'FIELD',
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

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'FIELD',
    item: () => {
      return { id: field.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  preview(drop(ref));

  // Find the library for this field if it's a custom field
  const fieldLibrary = field.libraryId ? libraries.find(lib => lib.id === field.libraryId) : null;

  return (
    <button
      ref={ref}
      onClick={() => onFieldClick(field.id)}
      className="w-full px-4 py-2.5 transition-colors flex items-center gap-3 border-b border-gray-100 text-left group"
      style={{
        backgroundColor: selectedField === field.id ? COLORS.primaryLight : 'white',
        opacity
      }}
      onMouseEnter={(e) => {
        if (selectedField !== field.id) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (selectedField !== field.id) {
          e.currentTarget.style.backgroundColor = 'white';
        }
      }}
      data-handler-id={handlerId}
    >
      <div style={{ color: COLORS.primary }} className="flex-shrink-0">
        {fieldIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900 truncate font-medium">{field.name}</div>
        <div className="text-xs text-gray-500">{fieldTypeLabel}</div>
      </div>
      {/* Library icon for custom fields */}
      {fieldLibrary && (
        <div className="flex-shrink-0" title={`From library: ${fieldLibrary.name}`}>
          <svg className="w-4 h-4" style={{ color: fieldLibrary.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div>
      )}
      {field.status === 'required' && (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          Req
        </span>
      )}
      {field.status === 'recommended' && (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
          Rec
        </span>
      )}
      <div
        ref={drag}
        className="flex-shrink-0 cursor-move text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ cursor: 'grab' }}
        onClick={(e) => e.stopPropagation()}
      >
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