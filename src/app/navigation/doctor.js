import { HomeIcon } from "@heroicons/react/24/outline";
// import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";
import {  UserPlus } from "lucide-react";

const ROOT_DASHBOARDS = "/doctors";

const path = (root, item) => `${root}${item}`;

export const doctors = {
  id: "doctors",
  type: NAV_TYPE_ROOT,
  path: "/doctors",
  title: "doctors",
  transKey: "nav.doctors.doctors",
  Icon: UserPlus,
  childs: [
    {
      id: "doctors.list",
      path: path(ROOT_DASHBOARDS, "/list"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.doctors.list",
      Icon: HomeIcon,
    },
    {
      id: "doctors.add",
      path: path(ROOT_DASHBOARDS, "/add"),
      type: NAV_TYPE_ITEM,
      title: "Add",
      transKey: "nav.doctors.add",
      Icon: HomeIcon,
    },
  ],
};
