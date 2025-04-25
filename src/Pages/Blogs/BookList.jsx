/* eslint-disable react/prop-types */
import useFirestore from "../../hooks/useFirestore";
import SingleBook from "./SingleBook";
import { useLocation } from "react-router-dom";

export default function BookList({
  limit = null,
  query = null,
  field = "created_at",
  order = "desc",
}) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchValue = params.get("search");
  const filterValue = params.get("category");

  const { getAllDocuments } = useFirestore();

  // Fetch data
  const {
    data: books,
    error: erroR,
    loading: loadinG,
  } = getAllDocuments(
    "books",
    query,
    query
      ? null
      : {
          field: "title",
          value: searchValue,
          filter: filterValue,
        },
    field,
    order
  );

  // Handle loading, error, and no data cases
  if (erroR) {
    return (
      <h3 className="my-24 text-xl font-bold text-center text-gray-500">
        {erroR}
      </h3>
    );
  }

  if (!books?.length) {
    return (
      <h3 className="my-24 text-xl font-bold text-center text-gray-500">
        Oops. No Blog(s) Found.
      </h3>
    );
  }

  // Determine books to display
  const displayedBooks = limit ? books.slice(0, limit) : books;

  return (
    <div className={`max-w-screen-xl mx-auto mt-5 ${query ? "" : "px-7"}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {displayedBooks.map((book) => (
          <SingleBook key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
