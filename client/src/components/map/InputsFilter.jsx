import React, { useContext, useState } from "react";
// import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useMapContext } from "../../context/MapContext";

export default function InputsFilter() {
  const {
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    gender,
    setGender,
    setStepIndex,
  } = useMapContext();

  const handleApply = () => {
    // Format dates for the console or API
    //const start = startDateFilter.format("YYYY-MM-DD");
    //const end = endDateFilter ? endDateFilter.format("YYYY-MM-DD") : "Today";

    setStepIndex(0); // reset timeline to start
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 3,
          p: 2,
        }}
      >
        {/* Start Date */}
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            התחלה
          </Typography>
          <DatePicker
            value={startDateFilter}
            onChange={(val) => setStartDateFilter(val)}
            slotProps={{ textField: { size: "small", sx: { width: 170 } } }}
          />
        </Box>

        {/* End Date */}
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            עד
          </Typography>
          <DatePicker
            value={endDateFilter}
            onChange={(val) => setEndDateFilter(val)}
            slotProps={{ textField: { size: "small", sx: { width: 170 } } }}
          />
        </Box>

        {/* Gender Choice - Styled Pill */}
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            מגדר
          </Typography>
          <ToggleButtonGroup
            value={gender}
            exclusive
            onChange={(e, val) => val && setGender(val)}
            sx={{
              height: 40,
              border: "1px solid #ccc",
              borderRadius: "20px",
              "& .MuiToggleButton-root": {
                px: 2,
                border: "none",
                borderRadius: "20px",
                "&.Mui-selected": { bgcolor: "primary.main", color: "white" },
              },
            }}
          >
            <ToggleButton value="all">הכל</ToggleButton>
            <ToggleButton value="male">זכר</ToggleButton>
            <ToggleButton value="female">נקבה</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={handleApply}
          sx={{ height: 40, borderRadius: "20px" }}
        >
          סנן תוצאות
        </Button>
      </Box>
    </LocalizationProvider>
  );
}
