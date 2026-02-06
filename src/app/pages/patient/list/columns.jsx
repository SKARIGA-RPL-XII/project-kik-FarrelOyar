// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// // Local Imports
import { CopyableCell } from "components/shared/table/CopyableCell";
import { 
  // ActiveCell,
  GenderCell,
  // NameCell,
  // BranchCell,
  // MedicalHistoryCell,
} from "./rows";
// import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

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

  columnHelper.accessor((row) => row.name, {
    id: "full_name",
    header: "Nama",
    label: "Name",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.email, {
    id: "email",
    header: "Email",
    label: "Email",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.phone_number, {
    id: "phonenumber",
    header: "phone number",
    label: "phone number",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.gender, {
    id: "gender",
    header: "Gender",
    label: "Gender",
    cell: GenderCell,
  }),
  columnHelper.accessor((row) => row.address, {
    id: "address",
    header: "Address",
    label: "Address",
    cell: CopyableCell,
  }),
  columnHelper.accessor((row) => row.date_of_birth, {
    id: "date_of_birth",
    header: "date of birth",
    label: "date of birth",
    cell: CopyableCell,
  }),

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
  // columnHelper.display({
  //   id: "actions",
  //   header: "Actions",
  //   label: "Row Actions",
  //   cell: RowActions,
  // }),
];
