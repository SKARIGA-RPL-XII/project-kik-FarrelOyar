import { DocumentTextIcon } from "@heroicons/react/24/outline";
// import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";

const ROOT_DASHBOARDS = "/invoice";

const path = (root, item) => `${root}${item}`;

export const invoice = {
  id: "invoice",
  type: NAV_TYPE_ROOT,
  path: "/invoice",
  title: "invoice",
  transKey: "nav.invoice.invoice",
  Icon: DocumentTextIcon,
  roles: ["superadmin", "admin"],
  childs: [
    {
      id: "invoice.list",
      path: path(ROOT_DASHBOARDS, "/list"),
      type: NAV_TYPE_ITEM,
      title: "List",
      transKey: "nav.invoice.list",
      Icon: DocumentTextIcon,
    },
  ],
};
