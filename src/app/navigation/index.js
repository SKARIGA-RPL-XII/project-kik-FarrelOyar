import { admins } from "./admin";
import { appointment } from "./appointment";
import { dashboards } from "./dashboards";
import { doctors } from "./doctor";
import { doctorappointment } from "./doctorappointment";
import { invoice } from "./invoice";
import { patients } from "./patients";

export const navigation = [
  dashboards,
  patients,
  doctors,
  admins,
  appointment,
  invoice,
  doctorappointment,
];

export { baseNavigation } from "./baseNavigation";
