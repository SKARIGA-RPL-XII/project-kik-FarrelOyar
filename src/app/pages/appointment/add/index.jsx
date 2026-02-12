import { useEffect, useState } from "react";
import { DatePicker } from "components/shared/form/Datepicker";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Select } from "components/ui";
import { useAppointmentContext } from "../context";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";

export default function AddAppointment() {
  const navigate = useNavigate();
  const { createAppointment, getAllDoctors, getAllPatient } =
    useAppointmentContext();

  const { user } = useAuthContext();

  const [submit, setSubmit] = useState(false);
  const [loading, setLoading] = useState(true);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    admin_id: user.id,
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Ambil data pasien, dokter, admin dari context saat mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsData = await getAllPatient({});
        const doctorsData = await getAllDoctors({});

        setPatients(patientsData.data.data || []);
        setDoctors(doctorsData.data.data || []);
      } catch (err) {
        toast.error(err?.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(form);

  // Trigger create appointment
  useEffect(() => {
    if (!submit) return;

    const sendData = async () => {
      try {
        const response = await createAppointment(form);

        if (response.success) {
          toast.success("Appointment berhasil dibuat");

          setForm({
            patient_id: "",
            doctor_id: "",
            admin_id: "",
            appointment_date: "",
            appointment_time: "",
            notes: "",
          });

          navigate("/appointment/list");
        }
      } catch (err) {
        toast.error(err?.message || "Terjadi kesalahan");
      } finally {
        setSubmit(false);
      }
    };

    sendData();
  }, [submit]);

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toTimeString().slice(0, 5); // HH:mm
  };
  const formatToGMT7 = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const gmt7 = new Date(utc + 7 * 60 * 60000);
    const year = gmt7.getFullYear();
    const month = String(gmt7.getMonth() + 1).padStart(2, "0");
    const day = String(gmt7.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) return <Page title="Add Appointment">Loading...</Page>;

  return (
    <Page title="Add Appointment">
      <div className="grid flex-1 grid-cols-1 place-content-start px-(--margin-x) py-6">
        <Card className="h-full w-full p-4 sm:px-5 2xl:mx-auto 2xl:max-w-5xl">
          <h1 className="dark:text-dark-50 text-lg font-medium text-gray-800">
            Add Appointment
          </h1>

          <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Patient */}
            <Select
              label="Patient"
              value={form.patient_id}
              onChange={(e) => handleChange("patient_id", e.target.value)}
            >
              <option value="">Pilih Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>

            {/* Doctor */}
            <Select
              label="Doctor"
              value={form.doctor_id}
              onChange={(e) => handleChange("doctor_id", e.target.value)}
            >
              <option value="">Pilih Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            {/* Appointment Date */}
            <DatePicker
              label="Appointment Date"
              value={form.appointment_date}
              onChange={(date) =>
                handleChange("appointment_date", formatToGMT7(date))
              }
            />

            <DatePicker
              label="Appointment Time"
              value={form.appointment_time}
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
              }}
              onChange={(time) =>
                handleChange("appointment_time", formatTime(time))
              }
            />

            {/* Notes */}
            <Input
              type="text"
              label="Notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <div className="mt-5 flex w-full justify-between">
            <Button
              color="error"
              onClick={() =>
                setForm({
                  patient_id: "",
                  doctor_id: "",
                  admin_id: "",
                  appointment_date: "",
                  appointment_time: "",
                  notes: "",
                })
              }
            >
              Cancel
            </Button>

            <Button
              color="success"
              disabled={submit}
              onClick={() => setSubmit(true)}
            >
              {submit ? "Saving..." : "Create"}
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
