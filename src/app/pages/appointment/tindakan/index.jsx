import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Select } from "components/ui";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAppointmentContext } from "../context";

export default function Tindakan() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { Tindakan, getAllObat } = useAppointmentContext();

  const appointment = state?.tindakan;

  const [obatList, setObatList] = useState([]);
  const [submit, setSubmit] = useState(false);

  const [form, setForm] = useState({
    patient_id: appointment?.patient?.id,
    doctor_id: appointment?.doctor?.id,
    appointment_id: appointment?.id,
    discount: 0,
    obat: [],
    medical_records: [],
  });

  // redirect kalau refresh
  useEffect(() => {
    if (!appointment) navigate("/appointment/list");
  }, [appointment, navigate]);

  // ambil master obat
  useEffect(() => {
    const fetchObat = async () => {
      const res = await getAllObat({});
      setObatList(res?.data?.data || []);
    };
    fetchObat();
  }, []);

  console.log(appointment);

  /* ==========================
      MEDICAL RECORDS
  ========================== */
  const addMedical = () => {
    setForm((prev) => ({
      ...prev,
      medical_records: [
        ...prev.medical_records,
        { diagnosis: "", descriptions: "", price: "" },
      ],
    }));
  };

  const updateMedical = (i, key, value) => {
    const updated = [...form.medical_records];
    updated[i][key] = value;
    setForm({ ...form, medical_records: updated });
  };

  const removeMedical = (i) => {
    setForm({
      ...form,
      medical_records: form.medical_records.filter((_, idx) => idx !== i),
    });
  };

  /* ==========================
          OBAT
  ========================== */
  const addObat = () => {
    setForm((prev) => ({
      ...prev,
      obat: [...prev.obat, { obat_id: "", qty: 1 }],
    }));
  };

  const updateObat = (i, key, value) => {
    const updated = [...form.obat];
    updated[i][key] = value;
    setForm({ ...form, obat: updated });
  };

  const removeObat = (i) => {
    setForm({
      ...form,
      obat: form.obat.filter((_, idx) => idx !== i),
    });
  };

  /* ==========================
          SUBMIT
  ========================== */
  const handleSubmit = async () => {
    try {
      setSubmit(true);
      const validObat = form.obat.filter((o) => o.obat_id && Number(o.qty) > 0);

      const payload = {
        ...form,
        obat: validObat,
        discount: Number(form.discount),
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_id: Number(form.appointment_id),
      };

      const res = await Tindakan(payload);

      if (res.success) {
        toast.success("Tindakan berhasil & invoice dibuat");
        navigate("/appointment/list");
      }
    } catch (err) {
      toast.error(err?.message || "Gagal menyimpan tindakan");
    } finally {
      setSubmit(false);
    }
  };

  if (!appointment) return null;

  const getObatPrice = (obat_id) => {
    const obat = obatList.find((o) => o.id === obat_id);
    return obat ? obat.price : 0;
  };

  const getSubTotal = (obat_id, qty) => {
    return getObatPrice(obat_id) * qty;
  };

  // ==========================
  //   TOTAL CALCULATION
  // ==========================
  const totalMedical = form.medical_records.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );

  const totalObat = form.obat.reduce((sum, item) => {
    if (!item.obat_id || item.qty <= 0) return sum;
    return sum + getSubTotal(item.obat_id, item.qty);
  }, 0);

  const subTotal = totalMedical + totalObat;

  const discountValue = (subTotal * Number(form.discount || 0)) / 100;

  const grandTotal = subTotal - discountValue;

  return (
    <Page title="Tindakan Pasien">
      <div className="px-(--margin-x) py-6">
        <Card className="p-6 2xl:mx-auto 2xl:max-w-6xl">
          {/* HEADER */}
          <h1 className="text-xl font-semibold">
            🩺 Tindakan Pasien: {appointment.patient.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Dokter: {appointment.doctor.name} • Tanggal:{" "}
            {appointment.appointment_date} • Jam: {appointment.appointment_time}
          </p>

          <div className="my-6 h-px bg-gray-200" />

          {/* MEDICAL RECORD */}
          <h2 className="mt-8 mb-3 text-lg font-semibold">📝 Medical Record</h2>

          {form.medical_records.map((item, i) => (
            <Card key={i} className="mb-3 border p-4">
              <Input
                label="Diagnosis"
                value={item.diagnosis}
                onChange={(e) => updateMedical(i, "diagnosis", e.target.value)}
              />
              <Input
                label="Deskripsi"
                value={item.descriptions}
                onChange={(e) =>
                  updateMedical(i, "descriptions", e.target.value)
                }
              />
              <Input
                type="number"
                label="Harga"
                value={item.price}
                onChange={(e) =>
                  updateMedical(i, "price", Number(e.target.value))
                }
              />
              <Button
                color="error"
                className="mt-2"
                onClick={() => removeMedical(i)}
              >
                Hapus
              </Button>
            </Card>
          ))}

          <Button onClick={addMedical}>+ Tambah Tindakan</Button>
          <h2 className="mt-8 mb-3 text-lg font-semibold">💊 Obat</h2>

          {form.obat.map((item, i) => {
            const hargaSatuan = getObatPrice(item.obat_id);
            const subTotal = getSubTotal(item.obat_id, item.qty);

            return (
              <div
                key={i}
                className="mb-3 grid grid-cols-12 items-end gap-3 rounded-lg border p-4"
              >
                {/* Obat */}
                <div className="col-span-4">
                  <Select
                    label="Obat"
                    value={item.obat_id}
                    onChange={(e) =>
                      updateObat(i, "obat_id", Number(e.target.value))
                    }
                  >
                    <option value="">Pilih Obat</option>
                    {obatList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Harga */}
                <div className="col-span-3">
                  <Input label="Harga Satuan" value={hargaSatuan} disabled />
                </div>

                {/* Qty */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    label="Qty"
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      updateObat(i, "qty", Number(e.target.value))
                    }
                  />
                </div>

                {/* Subtotal */}
                <div className="col-span-2">
                  <Input label="Sub Total" value={subTotal} disabled />
                </div>

                {/* Action */}
                <div className="col-span-1">
                  <Button
                    color="error"
                    className="w-full"
                    onClick={() => removeObat(i)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            );
          })}

          <Button onClick={addObat}>+ Tambah Obat</Button>

          {/* SUMMARY */}
          <div className="mt-10 rounded-xl border bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">🧾 Ringkasan Biaya</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Tindakan</span>
                <span>Rp {totalMedical.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Obat</span>
                <span>Rp {totalObat.toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-medium">
                <span>Sub Total</span>
                <span>Rp {subTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="my-4 h-px bg-gray-300" />

            {/* DISCOUNT */}
            <Input
              type="number"
              label="Discount (%)"
              min={0}
              max={100}
              value={form.discount}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val < 0) val = 0;
                if (val > 100) val = 100;
                setForm({ ...form, discount: val });
              }}
            />

            <div className="mt-4 flex justify-between text-sm text-red-600">
              <span>Potongan</span>
              <span>- Rp {discountValue.toLocaleString()}</span>
            </div>

            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Total Bayar</span>
              <span>Rp {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* ACTION */}
          <div className="mt-10 flex justify-between">
            <Button color="error" onClick={() => navigate(-1)}>
              Cancel
            </Button>

            <Button color="success" disabled={submit} onClick={handleSubmit}>
              {submit ? "Processing..." : "Simpan Tindakan"}
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
