import { HomeIcon } from "@heroicons/react/24/outline";
// import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";
import { User2Icon } from "lucide-react";

const ROOT_DASHBOARDS = "/patients";

const path = (root, item) => `${root}${item}`;

export const patients = {
  id: "patients",
  type: NAV_TYPE_ROOT,
  path: "/patients",
  title: "patients",
  transKey: "nav.patients.patients",
  Icon: User2Icon,
  childs: [
    {
      id: "patients.list",
      path: path(ROOT_DASHBOARDS, "/list"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.patients.list",
      Icon: HomeIcon,
    },
  ],
};
