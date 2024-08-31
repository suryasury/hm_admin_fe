import React, { useEffect, useRef, useState } from "react";
import { Input } from "./input";

interface TimePickerProps {
  onTimeChange: (time: string) => void;
  value?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange, value }) => {
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Start with 12, then generate 01 through 11
  const hours = [
    "12",
    ...Array.from({ length: 11 }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    ),
  ];

  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const periods = ["AM", "PM"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      timePickerRef.current &&
      !timePickerRef.current.contains(event.target as Node)
    ) {
      if (hour !== "" && minute !== "" && period !== "") handleDone();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hour, minute, period]);

  useEffect(() => {
    if (value) {
      const [time, period] = value.split(" ");
      const [hour, minute] = time.split(":");
      setHour(hour);
      setMinute(minute);
      setPeriod(period);
    }
  }, [value]);

  const updateTime = (
    newHour: string,
    newMinute: string,
    newPeriod: string
  ) => {
    setHour(newHour);
    setMinute(newMinute);
    setPeriod(newPeriod);
  };

  const handleDone = () => {
    onTimeChange(`${hour}:${minute} ${period}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={timePickerRef}>
      <Input
        type="text"
        value={
          hour && minute && period
            ? `${hour}:${minute} ${period}`
            : "Select time"
        }
        readOnly
        onClick={toggleDropdown}
        className="p-2 border rounded-md w-32 bg-white shadow-sm cursor-pointer "
      />
      {isOpen && (
        <div className="absolute z-10 mt-2 flex flex-col space-y-2 bg-white border rounded-md shadow-lg p-2">
          <div className="flex space-x-2">
            <div className="overflow-y-auto max-h-48">
              {hours.map((hr) => (
                <div
                  key={hr}
                  onClick={() => updateTime(hr, minute, period)}
                  className={`p-2 cursor-pointer rounded-sm ${
                    hr === hour ? "bg-gray-200" : ""
                  } hover:bg-gray-100`}
                >
                  {hr}
                </div>
              ))}
            </div>
            <div className="overflow-y-auto max-h-48">
              {minutes.map((min) => (
                <div
                  key={min}
                  onClick={() => updateTime(hour, min, period)}
                  className={`p-2 cursor-pointer rounded-sm ${
                    min === minute ? "bg-gray-200" : ""
                  } hover:bg-gray-100`}
                >
                  {min}
                </div>
              ))}
            </div>
            <div className="overflow-y-auto max-h-48">
              {periods.map((per) => (
                <div
                  key={per}
                  onClick={() => updateTime(hour, minute, per)}
                  className={`p-2 cursor-pointer rounded-sm ${
                    per === period ? "bg-gray-200" : ""
                  } hover:bg-gray-100`}
                >
                  {per}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
