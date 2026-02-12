// Import Dependencies
import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useState, useEffect } from "react";

// Local Imports
import { Page } from "components/shared/Page";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useDidUpdate, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { Toolbar } from "./Toolbar";
import { columns } from "./columns";
import { PaginationSection } from "./paginationSection";
import { SelectedRowsActions } from "./SelectedRowsActions";
import { ListView } from "./ListView";
// import { GridView } from "./GridView";
import { useAppointmentContext } from "../context";

// ----------------------------------------------------------------------

export default function List() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [patients, setPatient] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  // console.log(pa);

  const { getAllAppointments } = useAppointmentContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const res = await getAllAppointments({
        page: pagination.page,
        limit: pagination.limit,
        search: globalFilter,
      });

      if (res.success) {
        setPatient(res.data.data || []);
        setPagination({
          page: res.data.pagination.page,
          limit: res.data.pagination.limit,
          total: res.data.pagination.total, // mapping
          totalPages: res.data.pagination.totalPages, // mapping
        });
      }
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    fetchData();
  }, [pagination.page, pagination.limit, globalFilter]);

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [sorting, setSorting] = useState([]);

  const [viewType, setViewType] = useLocalStorage(
    "users-table-view-type",
    "list",
  );

  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-users",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-users",
    {},
  );

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data: patients,
    columns: columns,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
      viewType,
    },
    meta: {
      pagination,
      reloadTable: async () => {
        setLoading(true);
        const res = await getAllAppointments({
          page: pagination.page,
          limit: pagination.limit,
          search: globalFilter,
        });
        if (res.success) {
          setPatient(res.data.data || []);
          setPagination({
            page: res.data.pagination.page,
            limit: res.data.pagination.limit,
            total: res.data.pagination.total, // mapping
            totalPages: res.data.pagination.totalPages, // mapping
          });
        }
        setLoading(false);
      },
      updateData: (rowIndex, columnId, value) => {
        skipAutoResetPageIndex();
        setPatient((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          }),
        );
      },
      deleteRow: (row) => {
        skipAutoResetPageIndex();
        setPatient((old) =>
          old.filter(
            (oldRow) => oldRow.patients_id !== row.original.patients_id,
          ),
        );
      },
      deleteRows: (rows) => {
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.patients_id);
        setPatient((old) =>
          old.filter((row) => !rowIds.includes(row.patients_id)),
        );
      },
      setTableSettings,
      setViewType,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,

    autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [patients]);
  useLockScrollbar(tableSettings.enableFullScreen);

  const rows = table.getRowModel().rows;
  const WrapComponent = viewType === "list" ? Card : Box;

  return (
    <Page title="Appointment List">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen &&
              "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3",
          )}
        >
          <Toolbar table={table} />
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3",
              tableSettings.enableFullScreen
                ? "overflow-hidden"
                : "px-(--margin-x)",
            )}
          >
            <WrapComponent
              className={clsx(
                "relative flex grow flex-col",
                tableSettings.enableFullScreen && "overflow-hidden",
              )}
            >
              {viewType === "list" && (
                <ListView
                  table={table}
                  flexRender={flexRender}
                  rows={rows}
                  loading={loading}
                />
              )}
              {/* {viewType === "grid" && <GridView table={table} rows={rows} />} */}

              {!loading && table.getCoreRowModel().rows.length > 0 && (
                <div
                  className={clsx(
                    "pb-4 sm:pt-4",
                    (viewType === "list" || tableSettings.enableFullScreen) &&
                      "px-4 sm:px-5",
                    tableSettings.enableFullScreen &&
                      "dark:bg-dark-800 bg-gray-50",
                    !(
                      table.getIsSomeRowsSelected() ||
                      table.getIsAllRowsSelected()
                    ) && "pt-4",
                    viewType === "grid" &&
                      !tableSettings.enableFullScreen &&
                      "mt-3",
                  )}
                >
                  <PaginationSection
                    pagination={pagination}
                    setPagination={setPagination}
                  />
                </div>
              )}
            </WrapComponent>
            <SelectedRowsActions table={table} />
          </div>
        </div>
      </div>
    </Page>
  );
}
