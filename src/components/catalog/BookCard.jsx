import { coverColorClass, shortCategory, statusClass } from '../../lib/helpers';
import BookIcon from './BookIcon';

export default function BookCard({ book, onClick }) {
  return (
    <div className="book-card" onClick={onClick}>
      <div className={`cover-fallback ${coverColorClass(book.categoria)}`}>
        <BookIcon />
      </div>
      <span className="cat">{shortCategory(book.categoria)}</span>
      <h3>{book.titulo}</h3>
      <p className="author">{book.autor || 'Autor não identificado'}</p>
      <div className="status-row">
        <span className={`badge ${statusClass(book.status)}`}>{book.status}</span>
      </div>
    </div>
  );
}
