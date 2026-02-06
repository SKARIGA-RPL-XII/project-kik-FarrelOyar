// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
// import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import { PatientProvider } from "app/pages/patient/Provider";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: DynamicLayout,
      children: [
        {
          path: "settings",

          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },

    {
      Component: DynamicLayout,
      children: [
        {
          path: "patients",
          children: [
            {
              index: true,
              element: <Navigate to="/patients/list" />,
            },
            {
              path: "list",
              lazy: async () => {
                const { default: List } =
                  await import("app/pages/patient/list");

                return {
                  Component: () => (
                    <PatientProvider>
                      <List />
                    </PatientProvider>
                  ),
                };
              },
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
