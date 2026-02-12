import { HomeIcon } from "@heroicons/react/24/outline";
// import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";
import {  User } from "lucide-react";

const ROOT_DASHBOARDS = "/admins";

const path = (root, item) => `${root}${item}`;

export const admins = {
  id: "admins",
  type: NAV_TYPE_ROOT,
  path: "/admins",
  title: "admins",
  transKey: "nav.admins.admins",
  Icon: User,
  roles: ["superadmin"],

  childs: [
    {
      id: "admins.list",
      path: path(ROOT_DASHBOARDS, "/list"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.admins.list",
      Icon: HomeIcon,
    },
    {
      id: "admins.add",
      path: path(ROOT_DASHBOARDS, "/add"),
      type: NAV_TYPE_ITEM,
      title: "Add",
      transKey: "nav.admins.add",
      Icon: HomeIcon,
    },
  ],
};
