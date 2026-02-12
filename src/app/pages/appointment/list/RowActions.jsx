// Import Dependencies
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Input } from "components/ui";
import { useAppointmentContext } from "../context";
import { toast } from "sonner";
import { useDisclosure } from "hooks";
import { DatePicker } from "components/shared/form/Datepicker";
import { ClipboardDocumentListIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

const confirmMessages = {
  pending: {
    description: "Yakin cancle appointment?",
  },
  success: {
    title: "Appointment canceled",
  },
};

export function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const navigate = useNavigate();

  const { cancleAppointment, rescheduleAppointment } = useAppointmentContext();
  const { user } = useAuthContext();
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

      const response = await cancleAppointment({ id: row.original.id });

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

  const [isOpen, { open, close }] = useDisclosure(false);

  const saveRef = useRef(null);
  const [form, setForm] = useState({
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  // const formatDate = (date) => {
  //   if (!date) return "";
  //   const d = new Date(date);
  //   return d.toISOString().split("T")[0]; // YYYY-MM-DD
  // };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toTimeString().slice(0, 5); // HH:mm
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatToGMT7 = (date) => {
    if (!date) return "";

    const d = new Date(date);

    // Convert ke GMT+7
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const gmt7 = new Date(utc + 7 * 60 * 60000);

    const year = gmt7.getFullYear();
    const month = String(gmt7.getMonth() + 1).padStart(2, "0");
    const day = String(gmt7.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const openEdit = () => {
    const data = row.original;

    setForm({
      appointment_date: formatToGMT7(data.appointment_date),
      appointment_time: data.appointment_time,
      notes: data.notes,
    });

    open();
  };

  const tindakan = () => {
    const data = row.original;

    navigate("/appointment/tindakan", {
      state: {
        tindakan: data,
      },
    });
  };

  const handleSave = async () => {
    try {
      if (!form.appointment_date || !form.appointment_time) {
        toast.error("Tanggal dan Jam wajib diisi");
        return;
      }

      const payload = {
        id: row.original.id,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        notes: form.notes,
      };

      const res = await rescheduleAppointment(payload);

      if (res?.success) {
        toast.success("Patient berhasil diupdate");
        table.options.meta?.reloadTable();
        close();
      } else {
        toast.error(res?.message || "Gagal update data");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan");
    }
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
            {user.role.name == "admin" || user.role.name == "superadmin" && (
              <>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={openEdit}
                      className={clsx(
                        "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                        focus &&
                          "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                      )}
                    >
                      <PencilIcon className="size-4.5 stroke-1" />
                      <span>Reschedule</span>
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={openModal}
                      className={clsx(
                        "this:error text-this dark:text-this-light flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                        focus && "bg-this/10 dark:bg-this-light/10",
                      )}
                    >
                      <TrashIcon className="size-4.5 stroke-1" />
                      <span>Cancel</span>
                    </button>
                  )}
                </MenuItem>
              </>
            )}
            {user.role.name == "doctor" && (
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
                    <span>Tindakan</span>
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

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={close}
          initialFocus={saveRef}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="dark:bg-dark-700 relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300">
              <div className="dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-100 text-base font-medium text-gray-800"
                >
                  Edit Pin
                </DialogTitle>
                <Button
                  onClick={close}
                  variant="flat"
                  isIcon
                  className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>

              <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                <div className="mt-5 grid grid-cols-1 gap-4">
                  <DatePicker
                    label="Tanggal"
                    value={form.appointment_date}
                    onChange={(date) =>
                      handleChange("appointment_date", formatToGMT7(date))
                    }
                  />

                  <DatePicker
                    label="Jam"
                    value={form.appointment_time}
                    onChange={(date) =>
                      handleChange("appointment_time", formatTime(date))
                    }
                    options={{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: "H:i",
                      time_24hr: true,
                    }}
                  />
                  <Input
                    label="Notes"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>

                <div className="mt-4 space-x-3 text-end">
                  <Button
                    onClick={close}
                    variant="outlined"
                    className="min-w-[7rem] rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    color="primary"
                    ref={saveRef}
                    className="min-w-[7rem] rounded-full"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
