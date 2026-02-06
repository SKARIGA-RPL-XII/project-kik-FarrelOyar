import {
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  UserIcon,
  // LockClosedIcon,
  PhoneIcon,
  PlusIcon,
  ChatBubbleBottomCenterIcon,
  ChevronUpDownIcon,
  BanknotesIcon,
  AdjustmentsHorizontalIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useState, useEffect, useRef, Fragment } from "react";
import PropTypes from "prop-types";

import { ConfirmModal } from "components/shared/ConfirmModal";
import {
  Button,
  Card,
  Input,
  Textarea,
  InputErrorMsg,
  Upload,
  Switch,
  Select,
} from "components/ui";
import { usePatientContext } from "../context";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useDisclosure } from "hooks";
import { Controller, useForm } from "react-hook-form";
import { PhoneDialCode } from "../add/components/PhoneDialCode";
import { FileItemSquare } from "components/shared/form/FileItemSquare";
import SelectReact from "react-select";
import { toast } from "sonner";
import { useAuthContext } from "app/contexts/auth/context";
import { IdentificationIcon } from "@heroicons/react/20/solid";
import { DatePicker } from "components/shared/form/Datepicker";

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
  const { user } = useAuthContext();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const {
    updatePatient,
    destroyPatient,
    getAllDepositPatient,
    storeDepositPatient,
    // AllBranches,
    branches,
    GetAllBranches,
  } = usePatientContext();

  // const [branches, setBranches] = useState([]);

  // useEffect(() => {
  //   (async () => {
  //     const payload = {};
  //     const res = await AllBranches(payload);
  //     if (res?.success) setBranches(res.data.data);
  //   })();
  // }, [AllBranches]); // fix dependency warning

  const options = branches.map((b) => ({
    value: b.branchs_id,
    label: b.name,
  }));

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRows = useCallback(async () => {
    setConfirmDeleteLoading(true);
    const res = await destroyPatient(row.original.user_id);
    if (res.success) {
      table.options.meta?.reloadTable();
      setDeleteSuccess(true);
    } else {
      setDeleteError(true);
    }
    setConfirmDeleteLoading(false);
  }, [row, table, destroyPatient]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  const [isOpenEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const applyRefEdit = useRef(null);

  const openEditWithFetch = async () => {
    await GetAllBranches(); // hit API sekali + cache
    openEditModal();
  };

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  const [file, setFile] = useState();
  const uploadRef = useRef();

  const handleRemove = (e) => {
    e.stopPropagation();
    uploadRef.current.value = "";
    setFile(null);
  };

  const openEditModal = () => {
    reset({
      fullName: row.original.full_name,
      email: row.original.email,
      phone_number: row.original.phone_number,
      address: row.original.address,
      date_of_birth: row.original.date_of_birth || "",

      dialCode: "+62",
      branch_ids: row.original.MapUsers?.map((m) => m.Branch.branchs_id) || [],
    });

    setFile(null);
    setMedicalHistory(initialMedicalHistory);
    openEdit();
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
  };
  const handleCloseEdit = () => {
    reset({
      fullName: row.original.full_name,
      email: row.original.email,
      phone_number: row.original.phone_number,
      address: row.original.address,
      dialCode: "+62",
      date_of_birth: row.original.date_of_birth || "",

      branch_ids: row.original.MapUsers?.map((m) => m.Branch.branchs_id) || [],
      identity_no: row.original.identity_no, // ✅ tambahkan ini
    });

    setFile(null);
    setMedicalHistory(initialMedicalHistory);
    closeEdit();
  };

  const onUpdate = async (data) => {
    const isAllEmpty = medicalHistory.every(
      (item) => !item.key.trim() && !item.value.trim(),
    );

    if (isAllEmpty) {
      toast.error("At least 1 medical history is required");
      return;
    }

    const formData = new FormData();
    formData.append("id", row.original.user_id);
    formData.append("code", row.original.user_code);
    formData.append("status", data.status);
    formData.append("title", data.title);
    formData.append("full_name", data.fullName);
    formData.append("phone_number", data.phone_number);
    formData.append("email", data.email);
    formData.append("gender", data.gender);
    formData.append("address", data.address);
    formData.append("identity_no", data.identity_no);
    formData.append("date_of_birth", data.date_of_birth);

    if (data.password) formData.append("password", data.password);
    if (file) formData.append("profile_picture", file);
    if (data.branch_ids?.length) {
      data.branch_ids.forEach((id) => formData.append("branch_ids[]", id));
    }

    const mhObj = {};
    medicalHistory.forEach((item) => {
      if (item.key) mhObj[item.key] = item.value;
    });
    formData.append("medical_history", JSON.stringify(mhObj));

    const result = await updatePatient(formData);
    if (result.success) {
      closeEdit();
      table.options.meta?.reloadTable();
    }
  };

  // convert medical history JSON -> array
  const initialMedicalHistory = row.original.UserDetail?.medical_history
    ? Object.entries(JSON.parse(row.original.UserDetail.medical_history)).map(
        ([key, value]) => ({ key, value }),
      )
    : [];
  const [medicalHistory, setMedicalHistory] = useState(initialMedicalHistory);

  const updateMedicalRow = (idx, field, value) => {
    const newHistory = [...medicalHistory];
    newHistory[idx][field] = value;
    setMedicalHistory(newHistory);
  };

  const addMedicalRow = () => {
    setMedicalHistory([...medicalHistory, { key: "", value: "" }]);
  };

  const removeMedicalRow = (index) => {
    if (medicalHistory.length === 1) {
      // minimal 1 row wajib ada
      toast.error("At least 1 medical history is required");
      return;
    }
    const copy = [...medicalHistory];
    copy.splice(index, 1);
    setMedicalHistory(copy);
  };

  const [isOpenDeposit, { open: openDeposit, close: closeDeposit }] =
    useDisclosure(false);

  const openDepositModal = () => {
    setFile(null);
    setMedicalHistory(initialMedicalHistory);
    openDeposit();
  };

  const handleCloseDeposit = () => {
    setFile(null);
    setMedicalHistory(initialMedicalHistory);
    closeDeposit();
  };

  const [depositHistory, setDepositHistory] = useState([]);
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  useEffect(() => {
    if (!isOpenDeposit) return; // hanya ambil data ketika modal dibuka
    (async () => {
      setLoadingDeposit(true);
      const payload = { user_id: row.original.user_id };
      const res = await getAllDepositPatient(payload);
      if (res?.success) {
        setDepositHistory(res.data.data || []);
      }
      setLoadingDeposit(false);
    })();
  }, [isOpenDeposit, row.original.user_id, getAllDepositPatient]);

  return (
    <>
      <div className="flex justify-center">
        <Button
          variant="flat"
          isIcon
          className="size-7 rounded-full"
          onClick={openDepositModal}
          data-tooltip
          data-tooltip-content={`Deposit`}
        >
          <BanknotesIcon className="size-4.5" />
        </Button>
        <Button
          variant="flat"
          isIcon
          className="size-7 rounded-full"
          onClick={openEditWithFetch} // buka modal + reset form
        >
          <PencilIcon className="size-4.5" />
        </Button>
        {user.roles[0].roles_id == 1 && (
          <Button
            onClick={openModal}
            color="error"
            variant="flat"
            isIcon
            className="size-7 rounded-full"
          >
            <TrashIcon className="size-4.5" />
          </Button>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmModal
        show={deleteModalOpen}
        onClose={handleCloseDelete}
        messages={confirmMessages}
        onOk={handleDeleteRows}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />

      {/* Edit Modal */}
      <Transition appear show={isOpenEdit} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={handleCloseEdit}
          initialFocus={applyRefEdit}
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

          <DialogPanel className="scrollbar-sm dark:bg-dark-700 relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300">
            <form onSubmit={handleSubmit(onUpdate)}>
              <div className="mt-4 px-4 sm:px-12">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-50 text-lg text-gray-800"
                >
                  Edit User {row.original.full_name}
                </DialogTitle>
                <Card className="h-full max-h-[70vh] w-full overflow-y-auto p-4 sm:px-5 2xl:mx-auto 2xl:max-w-5xl">
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="w-1/2 sm:col-span-2">
                      <Switch
                        defaultChecked={row.original.is_active}
                        variant="outlined"
                        label="Inactive/Active"
                        {...register("status")}
                      />
                    </div>
                    <div className="w-1/2 sm:col-span-2">
                      <Select
                        className="rounded-xl"
                        label="Select Title"
                        prefix={
                          <ChatBubbleBottomCenterIcon className="w-1/2" />
                        }
                        suffix={<ChevronUpDownIcon className="w-1/2" />}
                        defaultValue={row.original.title}
                        data={[
                          { value: "", label: "" },
                          { value: "Mr.", label: "Mr." },
                          { value: "Mrs", label: "Mrs" },
                          { value: "Ms.", label: "Ms." },
                          { value: "Miss", label: "Miss" },
                        ]}
                        {...register("title")}
                      />
                    </div>
                    {/* Full Name */}
                    <div className="flex flex-col">
                      <Input
                        placeholder="Enter First Name"
                        label="Full name"
                        className="rounded-xl"
                        prefix={<UserIcon className="size-4.5" />}
                        defaultValue={row.original.full_name}
                        {...register("fullName", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Full name too short",
                          },
                        })}
                        error={Boolean(errors?.fullName)}
                      />
                      <InputErrorMsg when={errors?.fullName}>
                        {errors?.fullName?.message}
                      </InputErrorMsg>
                    </div>
                    <div className="flex flex-col">
                      <Input
                        placeholder="Enter NIK / Passport"
                        label="NIK / PASSPORT"
                        className="rounded-xl"
                        prefix={<IdentificationIcon className="size-4.5" />}
                        defaultValue={row.original.identity_no}
                        {...register("identity_no", {
                          required: "NIK / Passport is required",
                          minLength: {
                            value: 5,
                            message: "NIK / Passport too short",
                          },
                        })}
                        error={Boolean(errors?.identity_no)}
                      />
                      <InputErrorMsg when={errors?.identity_no}>
                        {errors?.identity_no?.message}
                      </InputErrorMsg>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                      <Input
                        placeholder="Enter Email"
                        label="Email"
                        className="rounded-xl"
                        prefix={<EnvelopeIcon className="size-4.5" />}
                        defaultValue={row.original.email}
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email",
                          },
                        })}
                        error={Boolean(errors?.email)}
                      />
                      <InputErrorMsg when={errors?.email}>
                        {errors?.email?.message}
                      </InputErrorMsg>
                    </div>

                    {/* Password */}
                    {/* <div className="flex flex-col ">
                      <Input
                        placeholder="Enter Password"
                        label="Password"
                        type="password"
                        className="rounded-xl"
                        prefix={<LockClosedIcon className="size-4.5" />}
                        {...register("password", {
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        error={Boolean(errors?.password)}
                      />
                      <InputErrorMsg when={errors?.password}>
                        {errors?.password?.message}
                      </InputErrorMsg>
                    </div> */}

                    {/* Phone */}
                    <div className="flex flex-col">
                      <span className="dark:text-dark-200 mb-1.5 text-sm font-medium text-gray-700">
                        Phone Number
                      </span>
                      <div className="flex -space-x-px">
                        <Controller
                          name="dialCode"
                          control={control}
                          defaultValue="+62"
                          rules={{ required: "Dial code is required" }}
                          render={({ field }) => (
                            <PhoneDialCode
                              {...field}
                              error={Boolean(errors?.dialCode)}
                            />
                          )}
                        />
                        <Input
                          defaultValue={row.original.phone_number}
                          {...register("phone_number", {
                            required: "Phone number is required",
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Invalid phone number",
                            },
                          })}
                          error={Boolean(errors?.phone_number)}
                          placeholder="Phone number"
                          classNames={{
                            root: "flex-1",
                            input:
                              "hover:z-1 focus:z-1 ltr:rounded-l-none rtl:rounded-r-none",
                          }}
                          prefix={<PhoneIcon className="size-4.5" />}
                          onKeyDown={(e) => {
                            if (
                              [
                                "Backspace",
                                "Tab",
                                "ArrowLeft",
                                "ArrowRight",
                                "Delete",
                              ].includes(e.key)
                            )
                              return;
                            if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                          }}
                        />
                      </div>
                      <InputErrorMsg
                        when={errors?.dialCode || errors?.phone_number}
                      >
                        {errors?.dialCode?.message ||
                          errors?.phone_number?.message}
                      </InputErrorMsg>
                    </div>

                    <div className="flex flex-col">
                      <Controller
                        name="date_of_birth"
                        control={control}
                        rules={{ required: "Date of Birth is required" }}
                        render={({ field }) => (
                          <DatePicker
                            label="Date of Birth"
                            placeholder="yyyy-mm-dd"
                            value={field.value || ""}
                            onChange={(date) => {
                              if (!date) {
                                field.onChange("");
                                return;
                              }

                              // ✅ kalau sudah string → simpan langsung
                              if (typeof date === "string") {
                                field.onChange(date);
                                return;
                              }

                              // ✅ kalau Date → convert lokal
                              const d = new Date(date);

                              const y = d.getFullYear();
                              const m = String(d.getMonth() + 1).padStart(
                                2,
                                "0",
                              );
                              const da = String(d.getDate()).padStart(2, "0");

                              field.onChange(`${y}-${m}-${da}`);
                            }}
                          />
                        )}
                      />
                    </div>
                    {/* Upload Profile Picture */}
                    <div className="flex flex-col">
                      <span className="dark:text-dark-200 mb-2 text-sm text-gray-700">
                        Profile Picture
                      </span>
                      <Upload
                        onChange={setFile}
                        ref={uploadRef}
                        accept="image/*"
                      >
                        {({ ...props }) =>
                          file ? (
                            <FileItemSquare
                              handleRemove={handleRemove}
                              file={file}
                            />
                          ) : (
                            <Button
                              unstyled
                              className="hover:border-primary-500 hover:text-primary-500 dark:border-dark-400 dark:text-dark-300 dark:hover:border-primary-500 dark:hover:text-primary-500 flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400"
                              {...props}
                            >
                              <PlusIcon className="size-8 stroke-2" />
                            </Button>
                          )
                        }
                      </Upload>
                      <p className="dark:text-dark-300 mt-1 text-xs text-gray-400">
                        Allowed formats: JPG, PNG, max 2MB
                      </p>
                    </div>

                    {/* Address */}
                  </div>
                  <div className="flex flex-col">
                    <Textarea
                      className="rounded-xl sm:col-span-2"
                      placeholder="Enter address"
                      label="Address"
                      rows="5"
                      defaultValue={row.original.address}
                      {...register("address", {
                        required: "Address is required",
                      })}
                      error={Boolean(errors?.address)}
                    />
                    <InputErrorMsg when={errors?.address}>
                      {errors?.address?.message}
                    </InputErrorMsg>
                  </div>

                  {/* Branches */}
                  <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />
                  <h5 className="text-md dark:text-dark-50 mb-3 font-medium text-gray-800">
                    Assign Branch
                  </h5>
                  <Controller
                    name="branch_ids"
                    control={control}
                    defaultValue={
                      row.original.MapUsers?.map((m) => m.Branch.branchs_id) ||
                      []
                    }
                    rules={{ required: "Select at least one branch" }}
                    render={({ field }) => (
                      <SelectReact
                        {...field}
                        isMulti
                        options={options}
                        placeholder="Select branches..."
                        value={options.filter((opt) =>
                          field.value.includes(opt.value),
                        )}
                        onChange={(selected) =>
                          field.onChange(selected.map((opt) => opt.value))
                        }
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "42px",
                            borderRadius: "0.5rem",
                            borderColor: state.isFocused
                              ? "var(--color-primary-600)"
                              : "var(--color-gray-300)",
                            backgroundColor: "var(--color-bg)", // ikut light/dark
                            boxShadow: state.isFocused
                              ? "0 0 0 1px var(--color-primary-600)"
                              : "none",
                            "&:hover": { borderColor: "var(--color-gray-400)" },
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 50,
                            borderRadius: "0.5rem",
                            backgroundColor: "var(--color-bg)", // ikut dark/light
                          }),
                          option: (base, state) => {
                            const isDarkMode =
                              document.documentElement.classList.contains(
                                "dark",
                              );

                            const baseBg = isDarkMode ? "#1f2937" : "#ffffff"; // dark: gray-800, light: white
                            const hoverBg = isDarkMode
                              ? "#374151"
                              : "var(--color-primary-100)"; // dark: gray-700, light: primary-100
                            const textColor = isDarkMode
                              ? "#f9fafb"
                              : "#111827"; // dark: gray-50, light: gray-900

                            return {
                              ...base,
                              backgroundColor: state.isSelected
                                ? "var(--color-primary-600)"
                                : state.isFocused
                                  ? hoverBg
                                  : baseBg,
                              color: state.isSelected ? "#fff" : textColor,
                              cursor: "pointer",
                              transition: "background-color 0.15s ease",
                            };
                          },

                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "var(--color-primary-100)",
                            color: "var(--color-primary-700)",
                            borderRadius: "0.25rem",
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "var(--color-primary-700)",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "var(--color-primary-700)",
                            "&:hover": {
                              backgroundColor: "var(--color-primary-200)",
                              color: "var(--color-primary-900)",
                            },
                          }),
                        }}
                      />
                    )}
                  />

                  <InputErrorMsg when={errors?.branch_ids}>
                    {errors?.branch_ids?.message}
                  </InputErrorMsg>

                  {/* Medical History */}
                  <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />
                  <h5 className="text-md dark:text-dark-50 mb-3 font-medium text-gray-800">
                    Medical History
                  </h5>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2">Key</th>
                        <th className="px-3 py-2">Value</th>
                        <th className="px-3 py-2">
                          <Button
                            type="button"
                            variant="outlined"
                            className="mt-3 rounded-full"
                            onClick={addMedicalRow}
                          >
                            +
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalHistory.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="Key"
                              value={row.key}
                              onChange={(e) =>
                                updateMedicalRow(idx, "key", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="Value"
                              value={row.value}
                              onChange={(e) =>
                                updateMedicalRow(idx, "value", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button
                              color="error"
                              size="sm"
                              variant="flat"
                              onClick={() => removeMedicalRow(idx)}
                              disabled={medicalHistory.length === 1}
                            >
                              <TrashIcon className="size-4.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
              <hr className="dark:border-dark-500 my-4 mt-16 h-px border-gray-200" />
              <div className="space-x-3 px-3 pb-3 text-end">
                <Button
                  onClick={handleCloseEdit}
                  variant="outlined"
                  className="min-w-[7rem] rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  ref={applyRefEdit}
                  className="min-w-[7rem] rounded-full"
                >
                  Apply
                </Button>
              </div>
            </form>
          </DialogPanel>
        </Dialog>
      </Transition>

      {/* Deposit Modal */}
      <Transition appear show={isOpenDeposit} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={handleCloseDeposit}
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

          <DialogPanel className="scrollbar-sm dark:bg-dark-700 relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300">
            <div className="mt-4 px-4 sm:px-12">
              <DialogTitle
                as="h3"
                className="dark:text-dark-50 mb-3 text-lg text-gray-800"
              >
                Deposit — {row.original.full_name}
              </DialogTitle>
              <Card className="h-full max-h-[75vh] w-full overflow-y-auto p-4 sm:px-5 2xl:mx-auto 2xl:max-w-4xl">
                {/* 🧾 Form Penambahan / Pengurangan Deposit */}
                <div className="dark:bg-dark-700 dark:border-dark-600 mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <h4 className="text-md dark:text-dark-50 mb-4 font-semibold text-gray-800">
                    Add / Subtract Deposit
                  </h4>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const payload = {
                        id: row.original.user_id,
                        user_id: user.user_id,
                        type: formData.get("type"),
                        payment_amount: Number(formData.get("payment_amount")),
                        payment_channel_id: Number(
                          formData.get("payment_channel_id"),
                        ),
                        status: "CONFIRMED",
                        note: formData.get("note"),
                      };

                      const result = await storeDepositPatient(payload);
                      if (result.success) {
                        e.target.reset();
                        handleCloseDeposit();
                      }
                    }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                  >
                    {/* Type */}
                    <div className="flex flex-col">
                      <Select
                        label="Type"
                        className="rounded-xl"
                        prefix={
                          <AdjustmentsHorizontalIcon className="size-4.5" />
                        }
                        suffix={<ChevronUpDownIcon className="size-4.5" />}
                        name="type"
                        required
                        data={[
                          { value: "", label: "Select Type" },
                          { value: "ADDITION", label: "Addition (+)" },
                          { value: "SUBTRACTION", label: "Subtraction (−)" },
                        ]}
                      />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">
                      <Input
                        type="number"
                        name="payment_amount"
                        label="Amount"
                        placeholder="Enter amount"
                        prefix={<BanknotesIcon className="size-4.5" />}
                        min="0"
                        required
                        className="rounded-xl"
                      />
                    </div>

                    {/* Payment Channel */}
                    <div className="flex flex-col">
                      <Select
                        label="Payment Channel"
                        className="rounded-xl"
                        prefix={<CreditCardIcon className="size-4.5" />}
                        suffix={<ChevronUpDownIcon className="size-4.5" />}
                        name="payment_channel_id"
                        required
                        data={[
                          { value: "", label: "Select Channel" },
                          { value: "1", label: "Cash" },
                          // { value: "2", label: "Deposit" },
                          { value: "3", label: "Deposit" },
                          { value: "8", label: "Transfer" },
                        ]}
                      />
                    </div>

                    {/* Note */}
                    <div className="flex flex-col sm:col-span-2">
                      <Textarea
                        name="note"
                        rows="2"
                        label="Note"
                        placeholder="Optional note..."
                        className="rounded-xl"
                      />
                    </div>

                    {/* Action Button */}
                    <div className="mt-2 flex justify-end sm:col-span-2">
                      <Button
                        type="submit"
                        color="primary"
                        className="rounded-full px-6"
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                </div>

                {loadingDeposit ? (
                  <div className="flex items-center justify-center py-10 text-gray-500">
                    Loading deposit history...
                  </div>
                ) : !depositHistory?.length ? (
                  <div className="flex items-center justify-center py-10 text-gray-400">
                    No deposit record found
                  </div>
                ) : (
                  <>
                    {/* 🧾 Info Pasien dan Saldo */}
                    {depositHistory.map((deposit) => (
                      <div key={deposit.deposit_id} className="mb-6">
                        <div className="dark:bg-dark-700 dark:border-dark-600 rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div>
                              <span className="dark:text-dark-300 block text-gray-500">
                                Patient Name
                              </span>
                              <span className="dark:text-dark-50 font-semibold text-gray-800">
                                {deposit.user?.full_name}
                              </span>
                            </div>
                            <div>
                              <span className="dark:text-dark-300 block text-gray-500">
                                Email
                              </span>
                              <span className="dark:text-dark-50 text-gray-800">
                                {deposit.user?.email}
                              </span>
                            </div>
                            <div>
                              <span className="dark:text-dark-300 block text-gray-500">
                                Balance Before
                              </span>
                              <span className="dark:text-dark-100 font-medium text-gray-700">
                                Rp{" "}
                                {Number(
                                  deposit.amount_before || 0,
                                ).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div>
                              <span className="dark:text-dark-300 block text-gray-500">
                                Current Balance
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                Rp{" "}
                                {Number(deposit.amount || 0).toLocaleString(
                                  "id-ID",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 📜 Detail Transaksi */}
                        <div className="mt-5">
                          <h4 className="text-md dark:text-dark-50 mb-2 font-semibold text-gray-800">
                            Deposit History
                          </h4>

                          <div className="dark:border-dark-600 overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr className="dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-700">
                                  <th className="px-3 py-2 text-left">Date</th>
                                  <th className="px-3 py-2 text-left">
                                    Method
                                  </th>
                                  <th className="px-3 py-2 text-right">
                                    Amount
                                  </th>
                                  <th className="px-3 py-2 text-left">Type</th>
                                  <th className="px-3 py-2 text-left">
                                    Status
                                  </th>
                                  <th className="px-3 py-2 text-left">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {deposit.deposit_details?.map((detail, idx) => (
                                  <tr
                                    key={detail.deposit_details_id || idx}
                                    className="dark:border-dark-500 dark:hover:bg-dark-600 border-b border-gray-200 hover:bg-gray-50"
                                  >
                                    <td className="px-3 py-2">
                                      {new Date(
                                        detail.created_at,
                                      ).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-3 py-2">
                                      {detail.deposit_method}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right ${
                                        detail.type === "SUBTRACTION"
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {detail.type === "SUBTRACTION"
                                        ? "- "
                                        : "+ "}
                                      Rp{" "}
                                      {Number(detail.amount).toLocaleString(
                                        "id-ID",
                                      )}
                                    </td>
                                    <td className="px-3 py-2">{detail.type}</td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                          detail.status === "CONFIRMED"
                                            ? "bg-green-100 text-green-700"
                                            : detail.status === "PENDING"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {detail.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      {detail.notes || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Card>
              <div className="my-6 text-end">
                <Button
                  onClick={handleCloseDeposit}
                  variant="outlined"
                  className="min-w-[7rem] rounded-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </Transition>
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
