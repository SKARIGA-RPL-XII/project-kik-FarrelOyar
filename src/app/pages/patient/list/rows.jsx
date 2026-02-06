// Import Dependencies
import { useState } from "react";
import { toast } from "sonner";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";

// Local Imports
import MenIcon from 'assets/men.svg?react'
import WomenIcon from 'assets/women.svg?react'
import { FaUser } from "react-icons/fa";
import { Avatar, Badge, Button } from "components/ui";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { Highlight } from "components/shared/Highlight";
import { ensureString } from "utils/ensureString";

// ----------------------------------------------------------------------
// Name with Avatar + Preview
export function NameCell({ row, getValue, column, table }) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  const [preview, setPreview] = useState(null);

  const handleClick = () => {
    if (!row.original.profile_picture) return;
    setPreview(row.original.profile_picture);
  };

  const handleClose = () => setPreview(null);

  return (
    <>
      <div
        className={`flex items-center space-x-3 ltr:-ml-1 rtl:-mr-1 ${
          row.original.profile_picture ? "cursor-pointer" : ""
        }`}
        onClick={handleClick}
      >
        <Avatar
          size={10}
          classNames={{
            root: row.original.profile_picture
              ? "rounded-full border-2 border-dashed border-transparent p-0.5 transition-colors group-hover/tr:border-gray-400 dark:group-hover/tr:border-dark-300"
              : "rounded-full border-2 p-0.5",
            display: row.original.profile_picture
              ? "text-xs-plus"
              : "bg-gradient-to-br from-dark-400 to-teal-400 text-white dark:text-white",
          }}
          src={row.original.profile_picture ? row.original.profile_picture : undefined}
          initialColor={row.original.profile_picture ? "success" : undefined}
          name={row.original.name}
        >
          {!row.original.profile_picture && <FaUser />}
        </Avatar>
        <div className="font-medium text-gray-800 dark:text-dark-100">
          <Highlight query={[globalQuery, columnQuery]}>
            {`${row.original.title ? `${row.original.title} ` : ""}${getValue()}`}
          </Highlight>
        </div>

      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={handleClose}
        >
          <img
            src={preview}
            alt="Avatar Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
}

// Active / Inactive Badge
export function ActiveCell({ getValue }) {
  const val = getValue();
  if (val == 1) {
    return (
      <Badge
        color="success"
        className="animate-pulse gap-1 px-2 shadow-lg shadow-this/50 dark:shadow-this-light/50"
      >
        <CheckBadgeIcon className="size-4.5" /><span className="text-[9px]">Active</span>
      </Badge>
    );
  }
  return (
    <Badge
      color="error"
      className="animate-pulse gap-2 px-3 shadow-lg shadow-this/50 dark:shadow-this-light/50"
    >
      <XCircleIcon className="size-4.5" /><span className="text-[9px]">Inactive</span>
    </Badge>
  );
}

// Gender Badge
export function GenderCell({ getValue }) {
  const val = getValue();
  if (val == "male") {
    return (
      <Badge unstyled className="rounded-full bg-gradient-to-r from-blue-500 to-teal-600 px-3 py-1.5 text-xs text-white ">
        <MenIcon className="w-3 h-3"/>
      </Badge>
    );
  }
  return (
    <Badge unstyled className="rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-1.5 text-xs text-white ">
      <WomenIcon className="w-3 h-3"/>
    </Badge>
  );
}

// Switch Status
export function StatusCell({ getValue, row: { index }, column: { id }, table }) {
  const val = getValue();
  const [loading, setLoading] = useState(false);

  const onChange = async (checked) => {
    setLoading(true);
    setTimeout(() => {
      table.options.meta?.updateData(index, id, checked);
      toast.success("User status updated");
      setLoading(false);
    }, 1000);
  };

  return (
    <StyledSwitch
      className="mx-auto"
      checked={val}
      onChange={onChange}
      loading={loading}
    />
  );
}

// Branches
export function BranchCell({ getValue }) {
  const colors = [
    "from-[#166534] to-[#22C55E]", // hijau tua → hijau muda
    "from-[#1E3A8A] to-[#3B82F6]", // biru tua → biru muda
    "from-[#7E22CE] to-[#A855F7]", // ungu tua → ungu muda
    "from-[#9A3412] to-[#F97316]", // oranye tua → oranye muda

    "from-[#991B1B] to-[#EF4444]", // merah tua → merah muda
    "from-[#9D174D] to-[#EC4899]", // pink tua → pink muda
    "from-[#92400E] to-[#FACC15]", // emas → kuning terang
    "from-[#111827] to-[#6B7280]", // hitam → abu muda
  ];

  const branches = getValue()?.map((m) => m.Branch) || [];

  if (!branches.length) {
    return <span className="text-gray-400 italic">No Branch</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {branches.map((branch, idx) => {
        const gradient = colors[idx % colors.length];
        return (
          <Button
            key={branch.branch_id}
            unstyled
            className={`group h-7 text-xs rounded-md bg-gradient-to-r ${gradient} p-0.5 duration-200 ease-out [contain:paint] active:translate-y-px`}
            data-tooltip
            data-tooltip-content={branch.name}
          >
            <span className="inline-flex h-full items-center justify-center rounded-md bg-white/80 px-3 transition-colors hover:text-white group-hover:bg-transparent group-hover:text-white group-focus:bg-transparent group-focus:text-white dark:bg-dark-700/80">
              {branch.name}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

// Medical History
export function MedicalHistoryCell({ getValue }) {
  const history = getValue().medical_history;
  
  if (!history) {
    return <span className="text-gray-400 italic">No History</span>;
  }

  let parsed;
  try {
    parsed = typeof history === "string" ? JSON.parse(history) : history;
  } catch (e) {
    console.log(e);
    
    return <span className="text-red-500 italic">Invalid Data</span>;
  }

  const entries = Object.entries(parsed);

  if (!entries.length) {
    return <span className="text-gray-400 italic">No History</span>;
  }

  return (
    <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
      {entries.map(([key, value], idx) => (
        <li key={idx}>
          <span className="font-medium text-gray-900 dark:text-gray-100">{key}</span>:{" "}
          <span className="text-gray-600 dark:text-gray-300">{value}</span>
        </li>
      ))}
    </ul>
  );
}

// ----------------------------------------------------------------------
NameCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object,
};
StatusCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object,
};
