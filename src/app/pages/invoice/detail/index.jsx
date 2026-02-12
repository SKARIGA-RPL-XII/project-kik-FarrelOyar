// Import Dependencies
import { useReactToPrint } from "react-to-print";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { useLocation } from "react-router";

// Local Imports
import { Page } from "components/shared/Page";
import { Button, Card } from "components/ui";
import { Table, THead, TBody, Th, Tr, Td } from "components/ui";

// ==========================
// HELPERS
// ==========================
const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ----------------------------------------------------------------------

export default function Invoice1() {
  const invoiceRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const { state } = useLocation();
  const InvoiceData = state?.tindakan;

  if (!InvoiceData) return null;

  /* ==========================
        CALCULATION
  ========================== */
  const tindakanTotal = InvoiceData.medical_records.reduce(
    (sum, m) => sum + Number(m.price || 0),
    0,
  );

  const obatTotal = InvoiceData.obat.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0,
  );

  const subTotal = tindakanTotal + obatTotal;

  const discountValue = (subTotal * Number(InvoiceData.discount || 0)) / 100;

  const grandTotal = subTotal - discountValue;

  return (
    <Page title="Invoice">
      <div className="grid w-full px-(--margin-x) pb-8">
        {/* HEADER ACTION */}
        <div className="flex items-center justify-between py-5">
          <h2 className="text-xl font-medium text-gray-700">Invoice</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="flat" isIcon>
              <PrinterIcon className="size-5" />
            </Button>
          </div>
        </div>

        {/* INVOICE BODY */}
        <Card ref={invoiceRef} className="flex flex-col px-6 py-10 sm:px-12">
          {/* HEADER */}
          <div className="flex flex-col justify-between sm:flex-row">
            <div>
              <h2 className="text-primary-600 text-2xl font-bold uppercase">
                MedSched
              </h2>
              {/* {InvoiceData} */}
              <p className="mt-2 text-sm">
                Jl. Kesehatan No. 123
                <br />
                Jakarta
                <br />
                Indonesia
              </p>
            </div>

            <div className="mt-4 text-right sm:mt-0">
              <h2 className="text-primary-600 text-2xl font-bold uppercase">
                Invoice
              </h2>
              <p className="mt-2 font-semibold">{InvoiceData.invoice_code}</p>
              <p className="font-semibold">
                {formatDate(InvoiceData.created_at)} •{" "}
                {formatTime(InvoiceData.created_at)}
              </p>
            </div>
          </div>

          <div className="my-6 h-px bg-gray-200" />

          {/* PATIENT */}
          <div className="flex flex-col justify-between sm:flex-row">
            <div>
              <p className="font-medium text-gray-600">Invoiced To:</p>
              <p className="font-semibold">{InvoiceData.patient.name}</p>
              <p>{InvoiceData.patient.phone_number}</p>
              <p>Gender: {InvoiceData.patient.gender}</p>
            </div>

            <div className="mt-4 text-right sm:mt-0">
              <p className="font-medium text-gray-600">Doctor:</p>
              <p className="font-semibold">{InvoiceData.doctor.name}</p>
            </div>
          </div>

          {/* ==========================
              TABEL TINDAKAN
          ========================== */}
          <h3 className="mt-10 mb-3 text-lg font-semibold">Tindakan Medis</h3>

          <Table zebra className="w-full">
            <THead>
              <Tr>
                <Th>#</Th>
                <Th>Diagnosis</Th>
                <Th>Deskripsi</Th>
                <Th className="text-end">Harga</Th>
              </Tr>
            </THead>
            <TBody>
              {InvoiceData.medical_records.map((m, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td className="font-medium">{m.diagnosis}</Td>
                  <Td>{m.descriptions}</Td>
                  <Td className="text-end font-semibold">
                    {formatRupiah(m.price)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          {/* ==========================
              TABEL OBAT
          ========================== */}
          <h3 className="mt-10 mb-3 text-lg font-semibold">Obat</h3>

          <Table zebra className="w-full">
            <THead>
              <Tr>
                <Th>#</Th>
                <Th>Nama Obat</Th>
                <Th className="text-end">Qty</Th>
                <Th className="text-end">Harga</Th>
                <Th className="text-end">Subtotal</Th>
              </Tr>
            </THead>
            <TBody>
              {InvoiceData.obat.map((o, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td className="font-medium">{o.name}</Td>
                  <Td className="text-end">{o.qty}</Td>
                  <Td className="text-end">{formatRupiah(o.price)}</Td>
                  <Td className="text-end font-semibold">
                    {formatRupiah(o.total)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <div className="my-6 h-px bg-gray-200" />

          {/* TOTAL */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(subTotal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>{InvoiceData.discount}%</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount Value</span>
                <span>- {formatRupiah(discountValue)}</span>
              </div>
              <div className="text-primary-600 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
