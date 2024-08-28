import { Appointment } from "@/types";
import { format } from "date-fns";
import React from "react";

const PrintPrescription = React.forwardRef(
  (
    { appointmentDetails }: { appointmentDetails: Appointment },
    ref: React.Ref<HTMLDivElement>
  ) => {
    console.log(appointmentDetails);
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
          <h2 className="font-bold mt-4">Out Patient Prescription Form</h2>
        </div>

        <div className="mt-6">
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
                    appointmentDetails?.patient.dateOfBirth
                  ).getFullYear()
                }/ ${appointmentDetails?.patient?.gender}`}</span>
              </p>
              <p>
                Token:{" "}
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
                Doctor:{" "}
                <span className="font-bold uppercase">
                  {appointmentDetails?.doctor?.name}
                </span>
              </p>
              <p>
                Speciality:{" "}
                <span className="font-bold">
                  {appointmentDetails?.doctor?.speciality}
                </span>
              </p>
            </div>
          </div>

          <table className="w-full mt-6 border border-gray-600">
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
                <th className="border border-gray-600 p-2 text-left">Qty</th>
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
                      <td className="border border-gray-600 p-2">1</td>
                      <td className="border border-gray-600 p-2">
                        {prescription?.prescriptionRemarks}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>

          <div className="mt-4">
            <p className="text-center">** End Of Prescription **</p>
          </div>
        </div>
      </div>
    );
  }
);

export default PrintPrescription;
