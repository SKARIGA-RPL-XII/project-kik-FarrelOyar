import { HomeIcon } from "@heroicons/react/24/outline";
// import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";
import { NotebookPenIcon } from "lucide-react";

const ROOT_DASHBOARDS = "/appointment";

const path = (root, item) => `${root}${item}`;

export const appointment = {
  id: "appointment",
  type: NAV_TYPE_ROOT,
  path: "/appointment",
  title: "appointment",
  transKey: "nav.appointment.appointment",
  Icon: NotebookPenIcon,
  roles: ["superadmin", "admin"],
  childs: [
    {
      id: "appointment.list",
      path: path(ROOT_DASHBOARDS, "/list"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.appointment.list",
      Icon: HomeIcon,
    },
    {
      id: "appointment.add",
      path: path(ROOT_DASHBOARDS, "/add"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.appointment.add",
      Icon: HomeIcon,
    },
  ],
};
