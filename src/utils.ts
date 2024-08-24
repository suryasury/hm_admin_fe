/* eslint-disable @typescript-eslint/ban-ts-comment */

import { compareAsc, set, startOfToday } from "date-fns";
import { IUpdateDoctor } from "./types";

// Map RHF's dirtyFields over the `data` received by `handleSubmit` and return the changed subset of that data.
export function dirtyValues(
  dirtyFields: object | boolean,
  allValues: object
): object {
  // If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
  // "placeholders" for unchanged elements. `dirtyFields` is `true` for leaves.
  if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
  // Here, we have an object
  // @ts-ignore
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [
      key,
      // @ts-ignore
      dirtyValues(dirtyFields[key], allValues[key]),
    ])
  );
}

export const statusClasses: { [key: string]: string } = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  APPROVED: "bg-purple-100 text-purple-800",
};

export const replaceNullWithEmptyString = (
  obj: IUpdateDoctor["doctorDetails"]
): IUpdateDoctor["doctorDetails"] => {
  return Object.fromEntries(
    Object.entries(obj as { [s: string]: string }).map(([key, value]) => {
      if (value === null) {
        return [key, ""];
      } else if (typeof value === "object" && value !== null) {
        return [key, replaceNullWithEmptyString(value)];
      } else {
        return [key, value];
      }
    })
  );
};

/**
 * Checks if the end time is smaller than the start time.
 * @param startTime - Start time in 'HH:MM AM/PM' format.
 * @param endTime - End time in 'HH:MM AM/PM' format.
 * @returns True if end time is less than start time, otherwise false.
 */
export const isEndTimeSmallerThanStart = (
  startTime: string,
  endTime: string
): boolean => {
  if (!startTime || !endTime) {
    return false;
  }

  // Function to convert time string to Date object
  const timeStringToDate = (timeString: string): Date => {
    const [time, period] = timeString.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let adjustedHours = hours;
    if (period === "PM" && hours !== 12) {
      adjustedHours += 12;
    }
    if (period === "AM" && hours === 12) {
      adjustedHours = 0;
    }

    return set(startOfToday(), {
      hours: adjustedHours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });
  };

  // Convert time strings to Date objects
  const startDate = timeStringToDate(startTime);
  const endDate = timeStringToDate(endTime);

  // Return true if end time is smaller than start time
  return compareAsc(endDate, startDate) < 0;
};

