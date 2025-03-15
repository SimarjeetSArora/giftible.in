import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../../services/axiosInstance";
import Pagination from "@mui/material/Pagination";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";

// ✅ Get color theme based on mode
const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const AdminPayouts = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ngos, setNgos] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ngoId, setNgoId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // ✅ Added Status Filter

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchNGOs();
    fetchPayouts();
  }, [startDate, endDate, searchQuery, ngoId, page]);

  // ✅ Fetch NGOs
  const fetchNGOs = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/ngos?verified=true");
      setNgos([{ universal_user_id: "", ngo_name: "All NGOs" }, ...data]); // ✅ Add "All NGOs" option
    } catch (error) {
      console.error("Error fetching NGOs:", error);
    }
  };

  // ✅ Fetch Payout Data
  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        search_query: searchQuery || undefined,
        limit,
        offset: (page - 1) * limit,
        ngo_id: ngoId || undefined,
      };

      const { data } = await axiosInstance.get("/payouts/history", { params });
      setPayouts(data || []);
      setTotalPages(Math.ceil((data.total || 1) / limit));
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
    setLoading(false);
  };

  // ✅ Filter payouts on the frontend by status
  const filteredPayouts = payouts.filter((payout) => {
    if (statusFilter === "all") return true;
    return payout.status.toLowerCase() === statusFilter;
  });


  const handleDownloadPDF = () => {
    if (!payouts.length) {
      setSnackbar({ open: true, message: "No payout data available for export", severity: "warning" });
      return;
    }
  
    const doc = new jsPDF("l", "mm", "tabloid"); // ✅ Landscape for better fit
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoUrl = "/assets/logo.png"; // ✅ Change to your logo path
  
    // ✅ Add Logo as Watermark
    doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 10, 60, 20); // Centered Logo
  
    // ✅ Add Report Header
    doc.setFontSize(22);
    doc.setTextColor("#6A4C93"); // Dark Purple
    doc.text("Payout Report", pageWidth / 2, 40, { align: "center" });
  
    // ✅ Add Date
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text(`Date: ${currentDate}`, 14, 50);
  
    // ✅ Table Headers
    const tableColumn = [
      "Payout ID",
      "NGO Name",
      "Amount (₹)",
      "Status",
      "Created At",
      "Processed At",
    ];
    const tableRows = [];
  
    // ✅ Add Table Data
    payouts.forEach((item) => {
      tableRows.push([
        item.id,
        item.ngo_name || "N/A",
        `₹${item.amount.toLocaleString()}`, // ✅ Proper ₹ formatting
        item.status,
        item.created_at ? new Date(item.created_at).toLocaleString() : "N/A", // ✅ Format date-time
        item.processed_at ? new Date(item.processed_at).toLocaleString() : "N/A", // ✅ Format date-time
      ]);
    });
  
    // ✅ Add Grand Total Row
    const grandTotal = payouts.reduce((acc, item) => acc + (item.amount || 0), 0);
    tableRows.push(["", "Grand Total", `₹${grandTotal.toLocaleString()}`, "", "", ""]);
  
    // ✅ Apply autoTable with Proper Formatting
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 10, // ✅ Bigger Font for Readability
        cellPadding: 4, // ✅ More Padding for Spacing
        overflow: "linebreak", // ✅ Word Wrap for Long Text
      },
      headStyles: {
        fillColor: "#6A4C93", // ✅ Purple Header
        textColor: "#FFFFFF",
        fontStyle: "bold",
        fontSize: 12, // ✅ Larger Header Text
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Payout ID
        1: { cellWidth: 50 }, // NGO Name
        2: { cellWidth: 30 }, // Amount
        3: { cellWidth: 25 }, // Status
        4: { cellWidth: 50 }, // Created At
        5: { cellWidth: 50 }, // Processed At
      },
      alternateRowStyles: {
        fillColor: "#F4F4F4", // ✅ Light Gray for Alternate Rows
      },
      margin: { top: 60, bottom: 20 },
      didDrawPage: (data) => {
        // ✅ Add Page Number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, pageWidth - 40, pageHeight - 10);
      },
    });
  
    doc.save("Payouts_Report.pdf");
  
    setSnackbar({ open: true, message: "PDF report downloaded", severity: "success" });
  };
  
  

  // ✅ CSV Export
  const downloadCSV = () => {
    if (filteredPayouts.length === 0) {
      alert("No payouts data to export!");
      return;
    }

    const csvData = filteredPayouts.map((item) => ({
      "Payout ID": item.id,
      "NGO Name": item.ngo_name || "N/A",
      "Amount (₹)": item.amount,
      Status: item.status,
      "Created At": item.created_at,
      "Processed At": item.processed_at || "N/A",
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "payouts_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 3, fontWeight: "bold" }}>
        Payout History
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Search */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by NGO Name or Payout ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* NGO Filter */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>NGO</InputLabel>
            <Select value={ngoId} onChange={(e) => setNgoId(e.target.value)}>
              {ngos.map((ngo) => (
                <MenuItem key={ngo.universal_user_id} value={ngo.universal_user_id}>
                  {ngo.ngo_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
    </Grid>

    <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Search */}
        <Grid item xs={12} sm={2}>
          
      

                {/* Start Date Picker */}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Start Date"
        value={startDate ? dayjs(startDate) : null}
        onChange={(newValue) => {
          if (newValue && endDate && newValue.isAfter(dayjs(endDate))) {
            alert("⚠️ Start Date cannot be after End Date.");
          } else {
            setStartDate(newValue ? newValue.format("YYYY-MM-DD") : "");
          }
        }}
        disableFuture
        maxDate={endDate ? dayjs(endDate) : undefined}
        slots={{ openPickerIcon: CalendarTodayIcon }}
        sx={{ flex: 1 }} // ✅ Equal width
      />
    </LocalizationProvider>
    </Grid>
    <Grid item xs={12} sm={2}>
    {/* End Date Picker */}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="End Date"
        value={endDate ? dayjs(endDate) : null}
        onChange={(newValue) => {
          if (startDate && newValue && newValue.isBefore(dayjs(startDate))) {
            alert("⚠️ End Date cannot be before Start Date.");
          } else {
            setEndDate(newValue ? newValue.format("YYYY-MM-DD") : "");
          }
        }}
        disableFuture
        minDate={startDate ? dayjs(startDate) : undefined}
        slots={{ openPickerIcon: CalendarTodayIcon }}
        sx={{ flex: 1 }} // ✅ Equal width
      />
    </LocalizationProvider>
  </Grid>

        
      </Grid>

      {/* Payouts Table */}
      {loading ? (
        <CircularProgress sx={{ color: colors.accent }} />
      ) : filteredPayouts.length > 0 ? (
        <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
  <Table>
    <TableHead sx={{ background: colors.tableHeader }}>
      <TableRow>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Payout ID</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>NGO Name</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Amount (₹)</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Status</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Created At</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Processed At</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredPayouts.map((item) => (
        <TableRow key={item.id}>
          <TableCell sx={{ color: colors.text }}>{item.id}</TableCell>
          <TableCell sx={{ color: colors.text }}>{item.ngo_name || "N/A"}</TableCell>
          <TableCell sx={{ color: colors.text }}>₹{item.amount}</TableCell>
          <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>{item.status}</TableCell>
          <TableCell sx={{ color: colors.text }}>
            {dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}
          </TableCell>
          <TableCell sx={{ color: colors.text }}>
            {item.processed_at ? dayjs(item.processed_at).format("YYYY-MM-DD HH:mm:ss") : "N/A"}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

      ) : (
        <Typography>No payouts found</Typography>
      )}

      {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
            </Box>

      {/* Download CSV */}
        <Box display="flex" justifyContent="center" mt={3} gap={2}>
        <Button
          onClick={handleDownloadPDF}
          sx={{ background: colors.accent, color: "#FFFFFF", "&:hover": { background: "#F5A000" } }}
        >
          Download PDF
        </Button>
        
        <Button
          onClick={downloadCSV}
          sx={{ background: colors.secondary, color: "#FFFFFF", "&:hover": { background: "#4C3A93" } }}
        >
          Download CSV
        </Button>
      </Box>
    </Container>
  );
};

export default AdminPayouts;
