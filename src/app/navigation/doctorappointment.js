import { HomeIcon } from "@heroicons/react/24/outline";
// import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";
import { NotebookPenIcon } from "lucide-react";

const ROOT_DASHBOARDS = "/appointment";

const path = (root, item) => `${root}${item}`;

export const doctorappointment = {
  id: "doctorappointment",
  type: NAV_TYPE_ROOT,
  path: "/doctorappointment",
  title: "appointment",
  transKey: "nav.appointment.appointment",
  Icon: NotebookPenIcon,
  roles: ["doctor"],
  childs: [
    {
      id: "doctorappointment.list",
      path: path(ROOT_DASHBOARDS, "/list"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.appointment.list",
      Icon: HomeIcon,
    },
    
  ],
};
