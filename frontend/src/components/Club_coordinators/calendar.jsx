import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import styled, { ThemeProvider } from "styled-components";


const lightTheme = {
  background: "#f5f5f5",
  color: "#000",
};

const darkTheme = {
  background: "#181818",
  color: "#fff",
};

const CalendarContainer = styled.div`
  display: flex;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
`;

const CalendarContent = styled.div`
  flex: 2;
  padding-right: 20px;
`;

const ThemeToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const SwitchLabel = styled.span`
  margin-right: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.color};
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => (theme.color === "#fff" ? "#ccc" : "#444")};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 4px;
    bottom: 4px;
    background-color: ${({ theme }) => (theme.color === "#fff" ? "#fff" : "#333")};
    transition: 0.4s;
  }

  input:checked + & {
    background-color: #007bff;
  }

  input:checked + &::before {
    transform: translateX(16px);
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
  font-weight: bold;
  color: ${({ theme }) => theme.color};
`;

const DayCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  width: 50px;
  margin: 5px;
  border-radius: 10px;
  background-color: ${({ selected, theme }) => (selected ? "#007bff" : theme.background)};
  color: ${({ selected, theme }) => (selected ? "#fff" : theme.color)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => (theme.color === "#fff" ? "#555" : "#ddd")};
    transform: scale(1.1);
  }

  &.outside-month {
    color: ${({ theme }) => theme.color === "#fff" ? "#888" : "#bbb"};
    cursor: not-allowed;
  }
`;

const SidePanel = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  margin-left: 20px;
  display: ${({ show }) => (show ? "block" : "none")};
`;

const SidePanelHeader = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
`;

const SidePanelContent = styled.div`
  margin-bottom: 15px;
`;

const ClosePanelButton = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: #0056b3;
  }
`;

const EventModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  width: 300px;
`;

const ModalHeader = styled.h3`
  margin-bottom: 20px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.color === "#fff" ? "#ddd" : "#333"};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: #0056b3;
  }
`;

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [plans, setPlans] = useState({
    "2025-01-09": ["Meeting at 10 AM", "Doctor's Appointment at 3 PM"],
    "2025-01-15": ["Lunch with Friends", "Work on Project"],
  });
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState("");

  const theme = isDarkMode ? darkTheme : lightTheme;

  const renderHeader = () => {
    return (
      <CalendarHeader>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>{"<"}</button>
        <h3>{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>{">"}</button>
      </CalendarHeader>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return <DaysRow>{days.map((day, index) => <div key={index}>{day}</div>)}</DaysRow>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isOutsideMonth = !isSameMonth(day, currentMonth);
        days.push(
          <DayCell
            key={day}
            selected={isSameDay(day, selectedDate)}
            onClick={() => {
              if (!isOutsideMonth) {
                setSelectedDate(cloneDay);
                setShowModal(true);
              }
            }}
            className={isOutsideMonth ? "outside-month" : ""}
          >
            {format(day, "d")}
          </DayCell>
        );
        day = addDays(day, 1);
      }
      rows.push(<div style={{ display: "flex", justifyContent: "center" }}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderSidePanel = () => {
    if (!selectedDate) return null;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const scheduledPlans = plans[formattedDate] || [];

    return (
      <SidePanel show={selectedDate !== null}>
        <SidePanelHeader>Plans for {format(selectedDate, "MMMM dd, yyyy")}</SidePanelHeader>
        <SidePanelContent>
          {scheduledPlans.length > 0 ? (
            <ul>
              {scheduledPlans.map((plan, index) => (
                <li key={index}>{plan}</li>
              ))}
            </ul>
          ) : (
            <p>No plans scheduled.</p>
          )}
        </SidePanelContent>
        <ClosePanelButton onClick={() => setSelectedDate(null)}>Close</ClosePanelButton>
      </SidePanel>
    );
  };

  const handleEventSubmit = () => {
    if (newEvent.trim()) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
      // Add event only if it's not already there to prevent duplication
      setPlans((prevPlans) => {
        const updatedPlans = { ...prevPlans };
        if (!updatedPlans[formattedDate]) {
          updatedPlans[formattedDate] = [];
        }
        // Check if the event is already in the list to prevent duplicates
        if (!updatedPlans[formattedDate].includes(newEvent)) {
          updatedPlans[formattedDate].push(newEvent);
        }
        return updatedPlans;
      });
  
      // Reset the event input and close the modal
      setNewEvent("");
      setShowModal(false);
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CalendarContainer>
        <div>
          <ThemeToggleWrapper>
            <SwitchLabel>{isDarkMode ? "Dark Mode" : "Light Mode"}</SwitchLabel>
            <Switch>
              <SwitchInput type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
              <SwitchSlider />
            </Switch>
          </ThemeToggleWrapper>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
        {renderSidePanel()}

        {showModal && (
          <EventModal>
            <ModalHeader>Add Event for {format(selectedDate, "MMMM dd, yyyy")}</ModalHeader>
            <ModalInput
              type="text"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              placeholder="Enter event details"
            />
            <ModalButton onClick={handleEventSubmit}>Add Event</ModalButton>
          </EventModal>
        )}
      </CalendarContainer>
    </ThemeProvider>
  );
};

export default Calendar;
