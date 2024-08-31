import { ISlot, ITimeSlot } from "@/types";
import { CloudSun, Moon, Sun } from "lucide-react";
import React from "react";

const getIconForPeriod = (period: string) => {
  switch (period) {
    case "Morning":
      return <Sun className="w-5 h-5 text-yellow-500" />;
    case "Afternoon":
      return <CloudSun className="w-5 h-5 text-orange-500" />;
    case "Evening":
      return <Moon className="w-5 h-5 text-blue-500" />;
    default:
      return null;
  }
};
interface AvailableSlotsProps {
  timeSlots: ITimeSlot;
  selectedSlot: ISlot | undefined;
  handleSlotClick: (slot: ISlot) => void;
  short?: boolean;
}
const AvailableSlots: React.FC<AvailableSlotsProps> = ({
  timeSlots,
  selectedSlot,
  handleSlotClick,
}) => {
  return (
    <div className="mt-4">
      <p className="text-md font-medium mb-2">Available Slots</p>
      <div className={`col-span-full grid grid-cols-3  md:grid-cols-7 gap-2`}>
        {Object.entries(timeSlots.slots).map(([period, slots]) =>
          slots.length > 0 ? (
            <React.Fragment key={period}>
              <div className="col-span-full flex items-center gap-4">
                {getIconForPeriod(period)}
                <h5 className="text-md font-semibold">{period}</h5>
              </div>
              <div className={`flex col-span-full flex-wrap  gap-2`}>
                {slots.map((slot: ISlot) => (
                  <div
                    key={slot.id}
                    className={`p-1.5  text-sm  rounded cursor-pointer border w-auto text-center ${
                      selectedSlot?.id === slot.id
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      handleSlotClick(slot);
                    }}
                  >
                    {`${slot.startTime} - ${slot.endTime}`}
                  </div>
                ))}
              </div>
              <div className="col-span-full">
                <hr className="border-t border-gray-200 my-2" />
              </div>
            </React.Fragment>
          ) : null
        )}
      </div>
    </div>
  );
};

export default AvailableSlots;
