// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// // Local Imports
import { CopyableCell } from "components/shared/table/CopyableCell";
import {} from // ActiveCell,
// GenderCell,
// NameCell,
// BranchCell,
// MedicalHistoryCell,
"./rows";
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

export const columns = [
  columnHelper.display({
    id: "no",
    header: "#",
    cell: (info) => {
      const { page, limit } = info.table.options.meta.pagination;
      return (page - 1) * limit + info.row.index + 1;
    },
  }),

  // columnHelper.accessor("is_active", {
  //   id: "status",
  //   header: "Status",
  //   cell: ActiveCell,
  // }),

  // columnHelper.accessor((row) => row.identity_no, {
  //   id: "identity_no",
  //   header: "NIK/Passport",
  //   label: "Identity No",
  //   cell: (props) => {
  //     const val = props.getValue();
  //     return val ? <CopyableCell {...props} highlight /> : "-";
  //   },
  // }),

  columnHelper.accessor((row) => row.invoice_code, {
    id: "inv",
    header: "Inv",
    label: "inv",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.patient.name, {
    id: "patient",
    header: "Nama Pasien",
    label: "Name",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.doctor.name, {
    id: "doctor",
    header: "nama dokter",
    label: "nama dokter",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => formatDate(row.created_at), {
    id: "tanggal",
    header: "Tanggal",
    label: "Tanggal",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => formatTime(row.created_at), {
    id: "jam",
    header: "jam",
    label: "jam",
    cell: CopyableCell,
  }),

  columnHelper.accessor((row) => formatRupiah(row.total), {
    id: "total",
    header: "total",
    label: "total",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.payment_status, {
    id: "paymentstatus",
    header: "payment status",
    label: "payment status",
    cell: CopyableCell,
  }),
  // columnHelper.accessor((row) => row.doctor.name, {
  //   id: "dokter",
  //   header: "Dokter",
  //   label: "Dokter",
  //   cell: CopyableCell,
  // }),
  // columnHelper.accessor((row) => row.admin.name, {
  //   id: "admin",
  //   header: "Admin",
  //   label: "Admin",
  //   cell: CopyableCell,
  // }),
  // columnHelper.accessor((row) => row.appointment_date, {
  //   id: "date",
  //   header: "tanggal",
  //   label: "tanggal",
  //   cell: CopyableCell,
  // }),
  // columnHelper.accessor((row) => row.appointment_time, {
  //   id: "time",
  //   header: "jam",
  //   label: "jam",
  //   cell: CopyableCell,
  // }),
  // columnHelper.accessor((row) => row.notes, {
  //   id: "note",
  //   header: "Notes",
  //   label: "Notes",
  //   cell: CopyableCell,
  // }),

  // columnHelper.accessor((row) => row.phone_number, {
  //   id: "phone_number",
  //   header: "Nomor Telepon",
  //   label: "Phone",
  //   cell: (props) => <CopyableCell {...props} highlight />,
  // }),

  // columnHelper.accessor((row) => row.email, {
  //   id: "email",
  //   header: "Email",
  //   label: "Email",
  //   cell: (props) => <CopyableCell {...props} highlight />,
  // }),

  // columnHelper.accessor((row) => row.address, {
  //   id: "address",
  //   header: "Address",
  //   label: "Address",
  //   cell: (info) => info.getValue() || "-",
  // }),

  // columnHelper.accessor((row) => row.MapUsers, {
  //   id: "branches",
  //   header: "Cabang",
  //   label: "Branch",
  //   cell: BranchCell,
  // }),

  // columnHelper.accessor((row) => row.UserDetail, {
  //   id: "medical_history",
  //   header: "Medical History",
  //   label: "Medical History",
  //   cell: MedicalHistoryCell,
  // }),

  // === Actions ===
  columnHelper.display({
    id: "actions",
    header: "Actions",
    label: "Row Actions",
    cell: RowActions,
  }),
];
