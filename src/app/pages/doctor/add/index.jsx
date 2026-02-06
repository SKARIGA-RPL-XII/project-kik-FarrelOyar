import { useEffect, useState } from "react";

import { DatePicker } from "components/shared/form/Datepicker";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Select } from "components/ui";
import { useDoctorContext } from "../context";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function AddPatient() {
  const navigate = useNavigate();
  const { createDoctor } = useDoctorContext();

  const [submit, setSubmit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    gender: "male",
    phone: "",
    email: "",
    birth: "",
    address: "",
    password: "",
    action_commission: "",
  });

  // Handle input change
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  console.log(form);

  // Trigger create
  useEffect(() => {
    if (!submit) return;

    const sendData = async () => {
      try {
        const response = await createDoctor(form);

        if (response.success) {
          toast.success("Doctor berhasil ditambahkan");

          // Reset form
          setForm({
            name: "",
            gender: "male",
            phone: "",
            email: "",
            birth: "",
            address: "",
            password: "",
            action_commission: "",
          });
          navigate("/doctors/list");
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSubmit(false);
      }
    };

    sendData();
  }, [submit]);

  const formatToGMT7 = (date) => {
    if (!date) return "";

    const d = new Date(date);

    // Convert ke GMT+7
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const gmt7 = new Date(utc + 7 * 60 * 60000);

    const year = gmt7.getFullYear();
    const month = String(gmt7.getMonth() + 1).padStart(2, "0");
    const day = String(gmt7.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <Page title="Add Doctor">
      <div className="grid flex-1 grid-cols-1 place-content-start px-(--margin-x) py-6">
        <Card className="h-full w-full p-4 sm:px-5 2xl:mx-auto 2xl:max-w-5xl">
          <div className="w-full">
            <h1 className="dark:text-dark-50 text-lg font-medium text-gray-800">
              Add Doctor
            </h1>

            <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <Input
                type="text"
                label="Name"
                value={form.name}
                placeholder="Masukkan Nama Doctor"
                onChange={(e) => handleChange("name", e.target.value)}
              />

              {/* Gender */}
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>

              {/* Phone */}
              <Input
                type="number"
                label="Phone"
                value={form.phone}
                placeholder="Masukkan Nomor Telepon"
                onChange={(e) => handleChange("phone", e.target.value)}
              />

              {/* Email */}
              <Input
                type="email"
                label="Email"
                value={form.email}
                placeholder="Masukkan Email"
                onChange={(e) => handleChange("email", e.target.value)}
              />

              {/* Birth */}
              <DatePicker
                label="Date of Birth"
                placeholder="Date of Birth"
                value={form.birth}
                onChange={(date) => handleChange("birth", formatToGMT7(date))}
              />

              {/* Address */}
              <Input
                type="text"
                label="Address"
                value={form.address}
                placeholder="Masukkan Alamat"
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <Input
                type="text"
                label="Password"
                value={form.password}
                placeholder="Masukkan Password"
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <Input
                type="number"
                label="Action Commission"
                value={form.action_commission}
                placeholder="Masukkan Action Commission"
                onChange={(e) =>
                  handleChange("action_commission", e.target.value)
                }
              />
            </div>

            {/* Buttons */}
            <div className="mt-5 flex w-full justify-between">
              <Button
                color="error"
                onClick={() =>
                  setForm({
                    name: "",
                    gender: "male",
                    phone: "",
                    email: "",
                    birth: "",
                    address: "",
                    password: "",
                    action_commission: "",
                  })
                }
              >
                Reset
              </Button>

              <Button
                color="success"
                disabled={submit}
                onClick={() => setSubmit(true)}
              >
                {submit ? "Saving..." : "Create"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
