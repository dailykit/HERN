import React, { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Flex } from "@dailykit/ui";
import { CalendarIcon } from "../../../Icons";
import { Wrapper } from "./styles";

export default function DateRange() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const onDatesChange = (updates) => {
    setDateRange(updates);
  };
  const CustomElement = forwardRef(({ value, onClick }, ref) => (
    <button className="select-dates" onClick={onClick} ref={ref}>
      <Flex
        container
        alignItems="center"
        justifyContent="space-between"
        padding="0.5rem"
      >
        <div>
          {console.log("DateRange", value)}
          <p className="head">DATES</p>
          <p>{value ? value : "Add dates"}</p>
        </div>
        <CalendarIcon size="16" color="#fff" />
      </Flex>
    </button>
  ));
  return (
    <Wrapper>
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={onDatesChange}
        customInput={<CustomElement />}
        wrapperClassName="date-picker-class"
      />
    </Wrapper>
  );
}
