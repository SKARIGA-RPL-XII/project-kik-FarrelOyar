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
  LockClosedIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button, Input, Select } from "components/ui";
import { useDoctorContext } from "../context";
import { toast } from "sonner";
import { useDisclosure } from "hooks";
import { DatePicker } from "components/shared/form/Datepicker";

// ----------------------------------------------------------------------

const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this user? Once deleted, it cannot be restored.",
  },
  success: {
    title: "User Deleted",
  },
};

export function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const { deleteDoctor, editDoctor, resetPasswordDoctor } = useDoctorContext();

  const [password, setPassword] = useState("");

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

      const response = await deleteDoctor({
        id: row.original.id,
      });

      if (response?.success) {
        table.options.meta?.deleteRow(row);
        table.options.meta?.reloadTable();
        setDeleteSuccess(true);
      } else {
        toast.error(response?.message || "Gagal menghapus Doctor");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setConfirmDeleteLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  const [isOpenEdit, { open:openedit, close:closeedit }] = useDisclosure(false);
  const [isOpenPassword, { open: openpassword, close: closepassword }] =
    useDisclosure(false);

  const saveRef = useRef(null);
  const saveRefPassword = useRef(null);

  const [form, setForm] = useState({
    name: row.original.name,
    gender: row.original.gender,
    phone: row.original.phone,
    email: row.original.email,
    birth: row.original.birth,
    address: row.original.address,
    action_commission: row.original.contract.action_commission,
  });

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
      id: data.id,
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      birth: formatToGMT7(data.birth),
      address: data.address,
      action_commission: data.contract.action_commission,
    });

    openedit();
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.phone) {
        toast.error("Name dan Phone wajib diisi");
        return;
      }

      const payload = {
        id: row.original.id,
        name: form.name,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        birth: form.birth,
        address: form.address,
        action_commission: form.action_commission,
      };

      const res = await editDoctor(payload);

      if (res?.success) {
        toast.success("Doctor berhasil diupdate");
        table.options.meta?.reloadTable();
        closeedit();
      } else {
        toast.error(res?.message || "Gagal update data");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan");
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!password) {
        toast.error("Password wajib diisi");
        return;
      }

      const payload = {
        id: row.original.id,
        password: password,
      };

      const res = await resetPasswordDoctor(payload);

      if (res?.success) {
        toast.success("Password berhasil direset");
        setPassword("");
        closepassword();
      } else {
        toast.error(res?.message || "Gagal reset password");
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
                  <span>Edit</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openpassword}
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <LockClosedIcon className="size-4.5 stroke-1" />
                  <span>Reset Password</span>
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
                  <span>Delete</span>
                </button>
              )}
            </MenuItem>
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

      <Transition appear show={isOpenEdit} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={closeedit}
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
                  Edit Doctor
                </DialogTitle>
                <Button
                  onClick={closeedit}
                  variant="flat"
                  isIcon
                  className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>

              <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <Input
                    type="text"
                    label="Name"
                    value={form.name}
                    placeholder="Masukkan Nama Pasien"
                    onChange={(e) => handleChange("name", e.target.value)}
                  />

                  {/* Gender */}
                  <Select
                    label="Gender"
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>

                  {/* Phone */}
                  <Input
                    type="number"
                    label="Phone"
                    value={form.phone}
                    placeholder="Masukkan Nomor Telepon"
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />

                  {/* Email */}
                  <Input
                    type="email"
                    label="Email"
                    value={form.email}
                    placeholder="Masukkan Email"
                    onChange={(e) => handleChange("email", e.target.value)}
                  />

                  {/* Birth */}
                  <DatePicker
                    label="Date of Birth"
                    value={form.birth}
                    onChange={(date) =>
                      handleChange("birth", formatToGMT7(date))
                    }
                  />

                  {/* Address */}
                  <Input
                    type="text"
                    label="Address"
                    value={form.address}
                    placeholder="Masukkan Alamat"
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-1">
                  <Input
                    type="number"
                    label="Action Commission"
                    value={form.action_commission}
                    placeholder="Masukkan Action Commission"
                    onChange={(e) =>
                      handleChange("action_commission", e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 space-x-3 text-end">
                  <Button
                    onClick={closeedit}
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

      <Transition appear show={isOpenPassword} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={closepassword}
          initialFocus={saveRefPassword}
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
                  Reset Password
                </DialogTitle>
                <Button
                  onClick={closepassword}
                  variant="flat"
                  isIcon
                  className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>

              <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-1">
                  <Input
                    type="password"
                    label="Password"
                    value={password}
                    placeholder="Masukkan Password Baru"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="mt-4 space-x-3 text-end">
                  <Button
                    onClick={closepassword}
                    variant="outlined"
                    type="button"
                    className="min-w-[7rem] rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    color="primary"
                    type="button"
                    ref={saveRefPassword}
                    className="min-w-[7rem] rounded-full none"
                  >
                    Reset
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
