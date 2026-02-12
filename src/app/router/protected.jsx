// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
// import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import { PatientProvider } from "app/pages/patient/Provider";
import { DoctorProvider } from "app/pages/doctor/Provider";
import { AdminProvider } from "app/pages/admin/Provider";
import { AppointmentProvider } from "app/pages/appointment/Provider";
import { InvoiceProvider } from "app/pages/invoice/Provider";
import RoleGuard from "middleware/RoleGuard";

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
                    <RoleGuard allowedRoles={["superadmin", "admin"]}>
                      <PatientProvider>
                        <List />
                      </PatientProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "add",
              lazy: async () => {
                const { default: AddPatient } =
                  await import("app/pages/patient/add");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin", "admin"]}>
                      <PatientProvider>
                        <AddPatient />
                      </PatientProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
          ],
        },
        {
          path: "doctors",
          children: [
            {
              index: true,
              element: <Navigate to="/doctors/list" />,
            },
            {
              path: "list",
              lazy: async () => {
                const { default: List } = await import("app/pages/doctor/list");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin"]}>
                      <DoctorProvider>
                        <List />
                      </DoctorProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "add",
              lazy: async () => {
                const { default: AddPatient } =
                  await import("app/pages/doctor/add");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin"]}>
                      <DoctorProvider>
                        <AddPatient />
                      </DoctorProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
          ],
        },
        {
          path: "admins",
          children: [
            {
              index: true,
              element: <Navigate to="/admins/list" />,
            },
            {
              path: "list",
              lazy: async () => {
                const { default: List } = await import("app/pages/admin/list");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin"]}>
                      <AdminProvider>
                        <List />
                      </AdminProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "add",
              lazy: async () => {
                const { default: AddAdmin } =
                  await import("app/pages/admin/add");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin"]}>
                      <AdminProvider>
                        <AddAdmin />
                      </AdminProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
          ],
        },
        {
          path: "appointment",
          children: [
            {
              index: true,
              element: <Navigate to="/appointment/list" />,
            },
            {
              path: "list",
              lazy: async () => {
                const { default: List } =
                  await import("app/pages/appointment/list");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin", "admin", "doctor"]}>
                      <AppointmentProvider>
                        <List />
                      </AppointmentProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "add",
              lazy: async () => {
                const { default: AddAdmin } =
                  await import("app/pages/appointment/add");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin", "admin"]}>
                      <AppointmentProvider>
                        <AddAdmin />
                      </AppointmentProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "tindakan",
              lazy: async () => {
                const { default: Tindakan } =
                  await import("app/pages/appointment/tindakan");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin", "doctor"]}>
                      <AppointmentProvider>
                        <Tindakan />
                      </AppointmentProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
          ],
        },
        {
          path: "invoice",
          children: [
            {
              index: true,
              element: <Navigate to="/invoice/list" />,
            },
            {
              path: "list",
              lazy: async () => {
                const { default: List } =
                  await import("app/pages/invoice/list");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin", "admin"]}>
                      <InvoiceProvider>
                        <List />
                      </InvoiceProvider>
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "detail",
              lazy: async () => {
                const { default: DetailInvoice } =
                  await import("app/pages/invoice/detail");

                return {
                  Component: () => (
                    <RoleGuard allowedRoles={["superadmin", "admin"]}>
                      <InvoiceProvider>
                        <DetailInvoice />
                      </InvoiceProvider>
                    </RoleGuard>
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
