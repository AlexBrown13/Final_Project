import React from "react";
import dayjs from "dayjs";
import { getUiStrings } from "../../config/uiStrings.js";
import { useDirection } from "../../context/useDirection.js";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Select,
  MenuItem,
  ListItemText,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useMapContext } from "../../context/MapContext";

export default function InputsFilter({ variant = "inline" }) {
  const isDrawer = variant === "drawer";
  const { locale } = useDirection();
  const s = getUiStrings(locale);
  const {
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    gender,
    setGender,
    setStepIndex,
    ages,
    setAges,
  } = useMapContext();

  const handleApply = () => {
    // Format dates for the console or API
    //const start = startDateFilter.format("YYYY-MM-DD");
    //const end = endDateFilter ? endDateFilter.format("YYYY-MM-DD") : "Today";
    const agesParam = ages.join(","); // "1,3,5"
    console.log("ages:", agesParam);
    setStepIndex(0); // reset timeline to start
  };

  const ageOptions = [
    { label: "0-12", value: 1 },
    { label: "13-17", value: 2 },
    { label: "18-24", value: 3 },
    { label: "25-39", value: 4 },
    { label: "40-120", value: 5 },
  ];

  const handleAgesChange = (event) => {
    const value = event.target.value;
    if (!Array.isArray(value)) return;

    if (value.includes("all")) {
      if (ages.length === ageOptions.length) {
        setAges([]);
      } else {
        setAges(ageOptions.map((opt) => opt.value));
      }
      return;
    }

    const nums = value
      .filter((v) => v !== "all")
      .map((v) => (typeof v === "number" ? v : Number(v)))
      .filter((v) => !Number.isNaN(v));
    setAges(nums);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isDrawer ? "column" : "row",
          flexWrap: isDrawer ? "nowrap" : "wrap",
          alignItems: isDrawer ? "stretch" : "flex-end",
          gap: 3,
          p: isDrawer ? 0 : 2,
          width: "100%",
        }}
      >
        {/* Start Date */}
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            {s.mapDateStartsLabel}
          </Typography>
          <DatePicker
            value={startDateFilter}
            onChange={(val) => setStartDateFilter(val)}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: isDrawer ? "100%" : 170 },
              },
            }}
          />
        </Box>

        {/* End Date */}
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            {s.mapDateEndsLabel}
          </Typography>
          <DatePicker
            value={endDateFilter}
            onChange={(val) => setEndDateFilter(val)}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: isDrawer ? "100%" : 170 },
              },
            }}
          />
        </Box>

        {/* Gender Choice - Styled Pill */}
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            {s.mapGenderLabel}
          </Typography>
          <ToggleButtonGroup
            value={gender}
            exclusive
            fullWidth={isDrawer}
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
            <ToggleButton value="all" sx={{ textTransform: "none" }}>
              {s.mapGenderBoth}
            </ToggleButton>
            <ToggleButton value="male" sx={{ textTransform: "none" }}>
              {s.mapGenderMale}
            </ToggleButton>
            <ToggleButton value="female" sx={{ textTransform: "none" }}>
              {s.mapGenderFemale}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ textTransform: "none" }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
          >
            {s.mapAgesLabel}
          </Typography>

          <Select
            multiple
            value={ages}
            onChange={handleAgesChange}
            renderValue={(selected) =>
              selected.length === 0
                ? s.mapAgesPlaceholder
                : selected
                    .map(
                      (val) => ageOptions.find((o) => o.value === val)?.label
                    )
                    .filter(Boolean)
                    .join(", ")
            }
            size="small"
            sx={{ width: isDrawer ? "100%" : 200 }}
            MenuProps={{
              disableScrollLock: true,
              sx: { zIndex: 4000 },
              slotProps: {
                paper: {
                  style: { maxHeight: 200 },
                },
              },
            }}
          >
            {/* Select All */}
            <MenuItem value="all">
              <Checkbox
                checked={ages.length === ageOptions.length}
                indeterminate={
                  ages.length > 0 && ages.length < ageOptions.length
                }
              />
              {/* <ListItemText primary="כל הגילאים" /> */}
              <ListItemText primary={s.mapAgesAllAges} />
            </MenuItem>

            {/* Options */}
            {ageOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Checkbox checked={ages.includes(opt.value)} />
                <ListItemText primary={opt.label} />
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={handleApply}
          fullWidth={isDrawer}
          sx={{ height: 40, borderRadius: "20px", textTransform: "none" }}
        >
          {s.mapApplyFilters}
        </Button>
      </Box>
    </LocalizationProvider>
  );
}
