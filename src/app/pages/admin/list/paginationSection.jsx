// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import {
  Pagination,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
  Select,
} from "components/ui";

// ----------------------------------------------------------------------

export function PaginationSection({ pagination, setPagination }) {
  return (
    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div className="flex items-center space-x-2 text-xs-plus ">
        <span>Show</span>
        <Select
          data={[1, 10, 20, 30, 40, 50, 100]}
          value={pagination.limit}
          onChange={(e) => {
            setPagination((prev) => ({
              ...prev,
              limit: Number(e.target.value),
              page: 1, // reset ke page 1 kalau limit berubah
            }));
          }}
          classNames={{
            root: "w-fit",
            select: "h-7 rounded-full py-1 text-xs ltr:pr-7! rtl:pl-7!",
          }}
        />
        <span>entries</span>
      </div>
      <div>
        <Pagination
          total={pagination.totalPages}
          value={pagination.page}
          onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          siblings={2}
          boundaries={1}
        >
          <PaginationPrevious />
          <PaginationItems />
          <PaginationNext />
        </Pagination>
      </div>
      <div className="truncate text-xs-plus">
        {(pagination.page - 1) * pagination.limit + 1} -{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} entries
      </div>
    </div>
  );
}

PaginationSection.propTypes = {
  pagination: PropTypes.shape({
    total: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  setPagination: PropTypes.func.isRequired,
};
