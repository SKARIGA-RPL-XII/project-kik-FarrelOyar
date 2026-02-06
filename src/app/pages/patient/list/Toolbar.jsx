// Import Dependencies
import {
  MagnifyingGlassIcon,
  // ChevronUpDownIcon,
  EllipsisHorizontalIcon,
  // PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { 
  TbGridDots, 
  TbList,
  // TbUpload, 
 } from "react-icons/tb";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  Menu,
  MenuButton,
  // MenuItem,
  // MenuItems,
  // Transition,
} from "@headlessui/react";

// Local Imports
import { Button, Input } from "components/ui";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { TableConfig } from "./TableConfig";
// import { useNavigate } from "react-router";

// ----------------------------------------------------------------------

export function Toolbar({ table }) {
  // const navigate = useNavigate();

  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;

  return (
    <div className="table-toolbar">
       <div
        className={clsx(
          "transition-content flex items-center justify-between space-x-4 ",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) pt-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Patient Table
          </h2>
        </div>
         {isXs ? (
                  // Mobile / small screen
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton
                      as={Button}
                      variant="flat"
                      className="size-8 shrink-0 rounded-full p-0"
                    >
                      <EllipsisHorizontalIcon className="size-4.5" />
                    </MenuButton>
                  </Menu>
                ) : (
                  // Desktop / large screen
                  <div className="flex space-x-2 ">
                    {/* <Button
                      unstyled
                      className="h-6 space-x-1 text-xs rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 px-2 py-2 text-white duration-100 ease-out [contain:paint] hover:opacity-[.85] focus:opacity-[.85] active:translate-y-px"
                      onClick={() => navigate("/patients/add")}
                    >
                      <PlusCircleIcon className="size-4" />
                      <span>Add New</span>
                    </Button> */}
        
                  </div>
                )}
      
      </div>

      {isXs ? (
        <>
          <div
            className={clsx(
              "flex space-x-2 pt-4  [&_.input-root]:flex-1",
              isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
            )}
          >
            <SearchInput table={table} />
            <TableConfig table={table} />
            {/* <ViewTypeSelect table={table} /> */}
          </div>
        </>
      ) : (
        <div
          className={clsx(
            "custom-scrollbar transition-content flex justify-between space-x-4 overflow-x-auto pb-1 pt-4 ",
            isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
          )}
          style={{
            "--margin-scroll": isFullScreenEnabled
              ? "1.25rem"
              : "var(--margin-x)",
          }}
        >
          <div className="flex shrink-0 space-x-2 ">
            <SearchInput table={table} />
            <TableConfig table={table} />
            {/* <ViewTypeSelect table={table} /> */}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchInput({ table }) {
  return (
    <Input
      value={table.getState().globalFilter}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      classNames={{
        root: "shrink-0",
        input: "text-xs ring-primary-500/50 focus:ring-3",
      }}
      placeholder="Search by name"
    />
  );
}

function ViewTypeSelect({ table }) {
  const setViewType = table.options.meta.setViewType;
  const viewType = table.getState().viewType;

  return (
    <div
      data-tab
      className="flex rounded-md bg-gray-200 px-1 py-1 text-xs-plus text-gray-800 dark:bg-dark-700 dark:text-dark-200"
    >
      <Button
        data-tooltip
        data-tooltip-content="List View"
        data-tab-item
        className={clsx(
          "shrink-0 whitespace-nowrap rounded-sm px-1.5 py-1 font-medium",
          viewType === "list"
            ? "bg-white shadow-sm dark:bg-dark-500 dark:text-dark-100"
            : "hover:text-gray-900 focus:text-gray-900 dark:hover:text-dark-100 dark:focus:text-dark-100",
        )}
        unstyled
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: "[data-tab-item]",
          parentSelector: "[data-tab]",
          activateOnFocus: true,
          loop: false,
          orientation: "horizontal",
        })}
        onClick={() => setViewType("list")}
      >
        <TbList className="size-4.5" />
      </Button>

      <Button
        data-tooltip
        data-tooltip-content="Grid View"
        data-tab-item
        className={clsx(
          "shrink-0 whitespace-nowrap rounded-sm px-1.5 py-1 font-medium",
          viewType === "grid"
            ? "bg-white shadow-sm dark:bg-dark-500 dark:text-dark-100"
            : "hover:text-gray-900 focus:text-gray-900 dark:hover:text-dark-100 dark:focus:text-dark-100",
        )}
        unstyled
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: "[data-tab-item]",
          parentSelector: "[data-tab]",
          activateOnFocus: true,
          loop: false,
          orientation: "horizontal",
        })}
        onClick={() => setViewType("grid")}
      >
        <TbGridDots className="size-4.5" />
      </Button>
    </div>
  );
}

Toolbar.propTypes = {
  table: PropTypes.object,
};

SearchInput.propTypes = {
  table: PropTypes.object,
};

ViewTypeSelect.propTypes = {
  table: PropTypes.object,
};
