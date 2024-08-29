import { Appointment } from "@/types";
import { format } from "date-fns";
import React from "react";

const PrintPrescription = React.forwardRef(
  (
    { appointmentDetails }: { appointmentDetails: Appointment },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const getCombinedAddress = (details: Record<string, string>) => {
      const addressParts = [
        details.houseNumber,
        details.address1,
        details.address2,
        details.city,
        details.state,
      ].filter((part) => part);

      return addressParts.length > 0 ? addressParts.join(", ") : "";
    };
    return (
      <div ref={ref} className="p-10 bg-white text-black font-sans">
        <div className="text-center border-b border-gray-600 pb-5">
          <h1 className="text-xl font-bold uppercase">
            {appointmentDetails.hospital.name}
          </h1>
          <p>{`${getCombinedAddress(appointmentDetails?.hospital)} - ${
            appointmentDetails?.hospital?.pincode
          }`}</p>
          <p>
            PH:{" "}
            {`${appointmentDetails?.hospital?.isd_code} ${appointmentDetails?.hospital?.phoneNumber}`}
          </p>
          <h2 className="font-bold mt-1">Out Patient Prescription Form</h2>
        </div>
        <div className="mt-3">
          <div className="flex justify-between">
            <div className="space-y-1">
              <p>
                Patient Name:{" "}
                <span className="font-bold uppercase">
                  {appointmentDetails?.patient?.name}
                </span>
              </p>
              <p>
                Age / Sex:{" "}
                <span className="font-bold">{`${
                  new Date().getFullYear() -
                  new Date(
                    appointmentDetails?.patient.dateOfBirth,
                  ).getFullYear()
                } / ${appointmentDetails?.patient?.gender}`}</span>
              </p>
              <p>
                Email:{" "}
                <span className="font-bold">
                  {appointmentDetails?.patient.email}
                </span>
              </p>
              <p>
                Phone:{" "}
                <span className="font-bold">
                  {appointmentDetails?.patient.phoneNumber}
                </span>
              </p>
              <p>
                Token No:{" "}
                <span className="font-bold">
                  {appointmentDetails?.tokenNumber}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p>
                Date:{" "}
                <span className="font-bold">
                  {format(appointmentDetails?.appointmentDate, "dd-MMM-yyyy")}
                </span>
              </p>
              <p>
                Time:{" "}
                <span className="font-bold">
                  {appointmentDetails?.doctorSlots.slot.startTime}
                </span>
              </p>
              <p>
                Doctor:{" "}
                <span className="font-bold">
                  Dr. {appointmentDetails?.doctor.name || "NA"}
                </span>
              </p>
              <p>
                Speciality:{" "}
                <span className="font-bold uppercase">
                  {appointmentDetails?.doctor.speciality || "NA"}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p>
                Fever(°F):{" "}
                <span className="font-bold uppercase">
                  {appointmentDetails?.feverLevel || "NA"}
                </span>
              </p>
              <p>
                BP(mmHg):{" "}
                <span className="font-bold">
                  {appointmentDetails?.bloodPreassure || "NA"}
                </span>
              </p>
              <p>
                Pulse(BPM):{" "}
                <span className="font-bold">
                  {appointmentDetails?.pulse || "NA"}
                </span>
              </p>
              <p>
                weight(Kgs):{" "}
                <span className="font-bold uppercase">
                  {appointmentDetails?.patientWeight || "NA"}
                </span>
              </p>
            </div>
          </div>

          <table className="w-full mt-3 border border-gray-600">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-600 p-2 text-left">S/No</th>
                <th className="border border-gray-600 p-2 text-left text-sm">
                  Description Of Medicine
                </th>
                <th className="border border-gray-600 p-2 text-left">Days</th>
                <th className="border border-gray-600 p-2 text-left">
                  Frequency
                </th>
                <th className="border border-gray-600 p-2 text-left">
                  Food Relation
                </th>
                <th className="border border-gray-600 p-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointmentDetails.patientPrescription &&
                appointmentDetails.patientPrescription.map(
                  (prescription, index) => (
                    <tr>
                      <td className="border border-gray-600 p-2">
                        {index + 1}
                      </td>
                      <td className="border border-gray-600 p-2 uppercase">
                        {prescription?.medicationStock?.medicationName}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {prescription?.durationInDays}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {prescription?.timeOfDay.join(", ")}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {prescription.foodRelation}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {prescription?.prescriptionRemarks}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
          <div className="mt-3">
            <p>
              <span className="font-extrabold">Doctor Remarks:</span>{" "}
              {appointmentDetails?.doctorRemarks || "NA"}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-center">** End Of Prescription **</p>
          </div>
        </div>
      </div>
    );
  },
);

export default PrintPrescription;
