// /* eslint-disable react/prop-types */
// import { useState, useMemo } from "react";
// export const useSearch = (data = [], keys = [], itemsPerPage = 10) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const handleSearch = (value) => {
//     setSearchQuery(value);
//     setCurrentPage(1);
//   };

//   const filteredData = useMemo(() => {
//     if (!searchQuery.trim()) return data;
//     const lower = searchQuery.toLowerCase().trim();
//     return data.filter((item) =>
//       keys.some((key) => {
//         const val = item[key];
//         if (val === null || val === undefined) return false;
//         return String(val).toLowerCase().includes(lower);
//       })
//     );
//   }, [data, keys, searchQuery]);

//   const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
//   const safePage = Math.min(currentPage, totalPages);
//   const startIndex = (safePage - 1) * itemsPerPage;
//   const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

//   return {
//     filteredData,
//     currentData,
//     searchQuery,
//     setSearchQuery: handleSearch,
//     currentPage: safePage,
//     setCurrentPage,
//     totalPages,
//     totalResults: filteredData.length,
//     startIndex,
//   };
// };

// // ─── COMPONENT ────────────────────────────────────────────────────────────────
// const Search = ({
//   value = "",
//   onChange,
//   placeholder = "Search here...",
// }) => {
//   return (
//     <div className="input-group search-area w-25">
//       <input
//         type="text"
//         className="form-control"
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />

//     </div>
//   );
// };

// export default Search;


/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";

export const useSearch = (data = [], keys = [], itemsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lower = searchQuery.toLowerCase().trim();
    return data.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lower);
      })
    );
  }, [data, keys, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return {
    filteredData,
    currentData,
    searchQuery,
    setSearchQuery: handleSearch,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    totalResults: filteredData.length,
    startIndex,
  };
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const Search = ({
  value = "",
  onChange,
  placeholder = "Search here...",
}) => {
  return (
    <div className="klk-search">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <i className="fa fa-times" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;