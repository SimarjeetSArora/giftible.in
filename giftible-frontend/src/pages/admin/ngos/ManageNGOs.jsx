import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { fetchAllNGOs, deleteNGO } from "../../../services/adminService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs"; // ✅ Ensure date formatting
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const ManageNGOs = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);
  const navigate = useNavigate();

  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [deletionReason, setDeletionReason] = useState(""); // ✅ Added Deletion Reason
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });


  const [page, setPage] = useState(1); // ✅ Track current page
  const [totalPages, setTotalPages] = useState(1); // ✅ Total page count
  const limit = 10; // ✅ Number of items per page


  const today = dayjs(); // Get today's date
  const thirtyDaysAgo = today.subtract(30, "day"); // 30 days before today
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);


  useEffect(() => {
    fetchNGOs();
  }, [filter, startDate, endDate, page]); // ✅ Page is now included in dependencies
  
  useEffect(() => {
    console.log("Updated NGOs state:", ngos); // ✅ Debugging log
  }, [ngos]);

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const today = dayjs().format("YYYY-MM-DD"); // ✅ Get today's date

      // ✅ Ensure endDate is today if not set
      const finalEndDate = endDate ? endDate.format("YYYY-MM-DD") : today;

      const data = await fetchAllNGOs(
        filter, 
        startDate.format("YYYY-MM-DD"), 
        finalEndDate,  // ✅ Includes today's NGOs
        limit, 
        (page - 1) * limit
      );

      console.log("Fetched NGOs:", data);
      setNgos(data || []);
      setTotalPages(Math.ceil((data?.total || 1) / limit)); 
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      setNgos([]);
      setTotalPages(1);
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
    setLoading(false);
};

  
  
  

  const handleDownloadPDF = () => {
    if (!ngos.length) {
      setSnackbar({ open: true, message: "No data available for export", severity: "warning" });
      return;
    }
  
    const doc = new jsPDF("l", "mm", "tabloid"); // ✅ Tabloid Size for Extra Width
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoUrl = "/assets/logo.png"; // ✅ Change to your logo path
  
    // ✅ Add Logo as Watermark
    doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 10, 60, 20); // Centered Logo
  
    // ✅ Add Report Header
    doc.setFontSize(22);
    doc.setTextColor("#6A4C93"); // Dark Purple
    doc.text("NGO Report", pageWidth / 2, 40, { align: "center" });
  
    // ✅ Add Date
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text(`Date: ${currentDate}`, 14, 50);
  
    // ✅ Table Headers
    const tableColumn = [
      "NGO ID", "NGO Name", "Account Holder", "Account Number", "IFSC Code",
      "Address", "City", "State", "Pincode", "First Name", "Last Name",
      "Email", "Contact Number", "Created At"
    ];
    const tableRows = [];
  
    // ✅ Add Table Data
    ngos.forEach((ngo) => {
      tableRows.push([
        ngo.id,
        ngo.ngo_name,
        ngo.account_holder_name || "N/A",
        ngo.account_number || "N/A",
        ngo.ifsc_code || "N/A",
        ngo.address || "N/A",
        ngo.city,
        ngo.state,
        ngo.pincode,
        ngo.first_name,
        ngo.last_name,
        ngo.email, // ✅ Fixed Email Wrapping
        ngo.contact_number, // ✅ Fixed Contact Number
        ngo.created_at.split("T")[0], // ✅ Remove Time, Keep Date Only
      ]);
    });
  
    // ✅ Apply autoTable with Final Fixes
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
        fillColor: "#6A4C93", // Purple Header
        textColor: "#FFFFFF",
        fontStyle: "bold",
        fontSize: 12, // ✅ Larger Header Text
      },
      columnStyles: {
        0: { cellWidth: 15 },  // NGO ID
        1: { cellWidth: 20 },  // NGO Name
        2: { cellWidth: 35 },  // Account Holder
        3: { cellWidth: 30 },  // Account Number
        4: { cellWidth: 25 },  // IFSC Code
        5: { cellWidth: 45 },  // ✅ Address (Wider)
        6: { cellWidth: 20 },  // City
        7: { cellWidth: 25 },  // State
        8: { cellWidth: 35 },  // First Name
        10: { cellWidth: 35 }, // Last Name
        11: { cellWidth: 45 }, // ✅ Email (Wider for Better Fit)
        12: { cellWidth: 25 }, // ✅ Contact Number (Wider)
        13: { cellWidth: 25 }, // ✅ Created At (Properly Fitting)
      },
      alternateRowStyles: {
        fillColor: "#F4F4F4", // Light Gray for Alternate Rows
      },
      margin: { top: 60, bottom: 20 },
      didDrawPage: (data) => {
        // ✅ Add Page Number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, pageWidth - 40, pageHeight - 10);
      },
    });
  
    doc.save("NGOs_Report.pdf");
  
    setSnackbar({ open: true, message: "PDF report downloaded", severity: "success" });
  };

  
  
  // ✅ Function to download CSV
  // ✅ Function to download CSV
const handleDownloadCSV = () => {
  if (!ngos.length) {
    setSnackbar({ open: true, message: "No data available for export", severity: "warning" });
    return;
  }

  const csvData = ngos.map(ngo => ({
    "NGO ID": ngo.id,
    "NGO Name": ngo.ngo_name,
    "Account Holder": ngo.account_holder_name || "N/A",
    "Account Number": ngo.account_number || "N/A",
    "IFSC Code": ngo.ifsc_code || "N/A",
    "Address": ngo.address || "N/A",
    "City": ngo.city,
    "State": ngo.state,
    "Pincode": ngo.pincode,
    "First Name": ngo.first_name,
    "Last Name": ngo.last_name,
    "Email": ngo.email,
    "Contact Number": ngo.contact_number,
    "Created At": ngo.created_at.split("T")[0], // ✅ Remove Time, Keep Date Only
  }));

  const csvString = Papa.unparse(csvData);

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "NGOs_Report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setSnackbar({ open: true, message: "CSV report downloaded", severity: "success" });
};

  

  const handleEdit = (id) => {
    navigate(`/admin/edit/ngo/${id}`);  // ✅ Pass the NGO ID dynamically
  };
  

  const handleDelete = async () => {
    if (!selectedNgo || !deletionReason.trim()) {
      setSnackbar({ open: true, message: "Please enter a reason for deletion.", severity: "warning" });
      return;
    }
  
    try {
      await deleteNGO(selectedNgo.id, deletionReason);
      fetchNGOs();
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: "NGO deleted successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };
  

  const filteredNGOs = ngos.filter(
    (ngo) =>
      ngo.ngo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 2, fontWeight: "bold" }}>
        Manage NGOs
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search NGOs"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            background: colors.cardBackground,
            color: colors.text,
            "& input": { color: colors.text },
            "& label": { color: colors.text },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: colors.secondary },
              "&:hover fieldset": { borderColor: colors.accent },
              "&.Mui-focused fieldset": { borderColor: colors.accent },
            },
          }}
        />

        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            background: colors.cardBackground,
            color: colors.text,
            "& .MuiSelect-icon": { color: colors.text },
          }}
        >
          <MenuItem value="all">All NGOs</MenuItem>
          <MenuItem value="verified">Verified NGOs</MenuItem>
          <MenuItem value="unverified">Unverified NGOs</MenuItem>
        </Select>
      </Box>


      <LocalizationProvider dateAdapter={AdapterDayjs}>
  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
    {/* Start Date Picker */}
    <DatePicker
      label="Start Date"
      value={startDate}
      onChange={(newValue) => {
        if (newValue.isAfter(dayjs())) {
          setSnackbar({ open: true, message: "Start date cannot be in the future", severity: "warning" });
        } else {
          setStartDate(newValue);
          if (endDate.isBefore(newValue)) {
            setEndDate(newValue); // ✅ Auto-adjust endDate
          }
        }
      }}
      maxDate={dayjs()} // ✅ Prevent future dates
      renderInput={(params) => <TextField {...params} sx={{ flex: 1, background: colors.cardBackground }} />}
    />

    {/* End Date Picker */}
    <DatePicker
  label="End Date"
  value={endDate}
  onChange={(newValue) => {
    if (newValue.isBefore(startDate)) {
      setSnackbar({ open: true, message: "End date cannot be before start date", severity: "warning" });
    } else {
      setEndDate(newValue);
    }
  }}
  minDate={startDate} // ✅ Allows selecting from `startDate`
  maxDate={dayjs()} // ✅ Includes today's NGOs
  renderInput={(params) => <TextField {...params} sx={{ flex: 1, background: colors.cardBackground }} />}
/>

  </Box>
</LocalizationProvider>






      <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
        <Table>
          <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>NGO Name</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>City</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress sx={{ color: colors.accent }} />
                </TableCell>
              </TableRow>
            ) : filteredNGOs.length > 0 ? (
              filteredNGOs.map((ngo) => (
                <TableRow
                  key={ngo.id}
                  sx={{ cursor: "pointer", "&:hover": { background: colors.secondary } }}
                  onClick={() => navigate(`/admin/ngos/details/${ngo.id}`)}
                >
                  <TableCell sx={{ color: colors.text }}>{ngo.ngo_name}</TableCell>
                  <TableCell sx={{ color: colors.text }}>{ngo.email}</TableCell>
                  <TableCell sx={{ color: colors.text }}>{ngo.city}</TableCell>
                  <TableCell sx={{ color: ngo.is_approved ? "#4CAF50" : "#F44336", fontWeight: "bold" }}>
                    {ngo.is_approved ? "Verified" : "Unverified"}
                  </TableCell>
                  <TableCell>
                    <Button onClick={(e) => { e.stopPropagation(); handleEdit(ngo.id); }}
                      sx={{ background: colors.accent, color: "#6A4C93", "&:hover": { background: "#F5A000" }, mr: 1 }}>
                      <EditIcon />
                    </Button>
                    <Button onClick={(e) => { e.stopPropagation(); setSelectedNgo(ngo); setDeleteDialogOpen(true); }}
                      sx={{ background: "#F44336", color: "#FFFFFF", "&:hover": { background: "#D32F2F" } }}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: colors.text }}>
                  No NGOs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete NGO <strong>{selectedNgo?.ngo_name}</strong>?</Typography>
          <TextField
            fullWidth
            label="Reason for Deletion"
            variant="outlined"
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} sx={{ color: "#FFFFFF", background: "#F44336" }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>

            {/* Pagination */}
<Box display="flex" justifyContent="center" mt={3}>
  <Pagination 
    count={totalPages} 
    page={page} 
    onChange={(event, value) => setPage(value)} 
    color="primary" 
  />
</Box>

<Box display="flex" justifyContent="center" mt={3} gap={2}>
  <Button
    onClick={handleDownloadPDF}
    sx={{ background: colors.accent, color: "#FFFFFF", "&:hover": { background: "#F5A000" } }}
  >
    Download PDF
  </Button>
  
  <Button
    onClick={handleDownloadCSV}
    sx={{ background: colors.secondary, color: "#FFFFFF", "&:hover": { background: "#4C3A93" } }}
  >
    Download CSV
  </Button>
</Box>





    </Container>
  );
};

export default ManageNGOs;
