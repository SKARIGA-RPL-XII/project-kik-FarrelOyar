// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCallback, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import { useInvoiceContext } from "../context";
import { toast } from "sonner";
// import { useDisclosure } from "hooks";
// import { DatePicker } from "components/shared/form/Datepicker";
import { ClipboardDocumentListIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router";
import { PencilIcon } from "lucide-react";

// ----------------------------------------------------------------------

const confirmMessages = {
  pending: {
    description: "Yakin melunasi Invoice ini?",
    actionText: "Lunas",
  },
  success: {
    title: "Invoice Lunas",
  },
};

export function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const navigate = useNavigate();

  const { lunasInvoice } = useInvoiceContext();

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };
  const handleDeleteRows = useCallback(async () => {
    try {
      setConfirmDeleteLoading(true);

      const response = await lunasInvoice({ invoice_id: row.original.invoice_id });

      if (response?.success) {
        table.options.meta?.deleteRow(row);
        table.options.meta?.reloadTable();
        setDeleteSuccess(true);
      }
    } catch (err) {
      // ambil message dari axios error
      toast.error(
        err?.response?.data?.message || err?.message || "Terjadi kesalahan",
      );
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  // const formatDate = (date) => {
  //   if (!date) return "";
  //   const d = new Date(date);
  //   return d.toISOString().split("T")[0]; // YYYY-MM-DD
  // };

  const tindakan = () => {
    const data = row.original;

    navigate("/invoice/detail", {
      state: {
        tindakan: data,
      },
    });
  };

  return (
    <>
      <div className="flex justify-center">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton
            as={Button}
            variant="flat"
            isIcon
            className="size-7 rounded-full"
          >
            <EllipsisHorizontalIcon className="size-4.5" />
          </MenuButton>
          <Transition
            as={MenuItems}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
            anchor={{ to: "bottom end" }}
            className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:shadow-none"
          >
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={tindakan}
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <ClipboardDocumentListIcon className="size-4.5 stroke-1" />
                  <span>Detail</span>
                </button>
              )}
            </MenuItem>
            {row.original.payment_status == "PENDING" && (
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={openModal}
                    className={clsx(
                      "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                    )}
                  >
                    <PencilIcon className="size-4.5 stroke-1" />
                    <span>Lunas</span>
                  </button>
                )}
              </MenuItem>
            )}
          </Transition>
        </Menu>
      </div>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteRows}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
