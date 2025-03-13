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
import { fetchAllUsers, deleteUser } from "../../../services/adminService";
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

const ManageUsers = () => {
    const theme = useTheme();
    const colors = getColors(theme.palette.mode);
    const navigate = useNavigate();
  
    const [users, setUsers] = useState([]); // ✅ Corrected state variable
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
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
      fetchUsers();
    }, [filter, startDate, endDate, page]);
  
    useEffect(() => {
      console.log("Updated Users state:", users);
    }, [users]);
  
    const fetchUsers = async () => {
        setLoading(true);
        try {
          const today = dayjs().format("YYYY-MM-DD");
          const finalEndDate = endDate ? endDate.format("YYYY-MM-DD") : today;
      
          const data = await fetchAllUsers({
            role: "user", // ✅ Ensure only regular users are fetched
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: finalEndDate,
            limit,
            offset: (page - 1) * limit,
          });
      
          console.log("Fetched Users:", data); // ✅ Ensure correct data is received
      
          if (Array.isArray(data)) {
            setUsers(data); // ✅ Set state directly if `data` is an array
          } else if (data.users && Array.isArray(data.users)) {
            setUsers(data.users); // ✅ Use `data.users` if it exists
          } else {
            setUsers([]); // ✅ Fallback to an empty array
          }
      
          setTotalPages(Math.ceil((data?.total || 1) / limit));
      
        } catch (error) {
          console.error("Error fetching Users:", error);
          setUsers([]);
          setTotalPages(1);
          setSnackbar({ open: true, message: error.message || "Error fetching users.", severity: "error" });
        }
        setLoading(false);
      };
      
      
  

  
  
  

    const handleDownloadPDF = () => {
        if (!users.length) {
          setSnackbar({ open: true, message: "No data available for export", severity: "warning" });
          return;
        }
      
        const doc = new jsPDF("l", "mm", "a4"); // ✅ A4 Landscape Format
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const logoUrl = "/assets/logo.png"; // ✅ Update Logo Path
      
        // ✅ Add Logo
        doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 10, 60, 20); // Centered Logo
      
        // ✅ Report Header
        doc.setFontSize(22);
        doc.setTextColor("#6A4C93"); // Dark Purple
        doc.text("User Report", pageWidth / 2, 40, { align: "center" });
      
        // ✅ Date
        const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        doc.setFontSize(12);
        doc.setTextColor("#333");
        doc.text(`Date: ${currentDate}`, 14, 50);
      
        // ✅ Table Headers for Users
        const tableColumn = [
          "User ID", "First Name", "Last Name", "Email", "Contact Number",
          "Email Verified", "Contact Verified", "Created At"
        ];
        const tableRows = [];
      
        // ✅ Add User Data
        users.forEach((user) => {
          tableRows.push([
            user.id,
            user.first_name,
            user.last_name,
            user.email,
            user.contact_number || "N/A",
            user.email_verified ? "Yes" : "No",
            user.contact_verified ? "Yes" : "No",
            user.created_at.split("T")[0], // ✅ Remove Time, Keep Date Only
          ]);
        });
      
        // ✅ Apply autoTable for Users
        autoTable(doc, {
          startY: 60,
          head: [tableColumn],
          body: tableRows,
          theme: "grid",
          styles: {
            fontSize: 10, // ✅ Readable Font Size
            cellPadding: 4, // ✅ Spacing
            overflow: "linebreak", // ✅ Word Wrapping
          },
          headStyles: {
            fillColor: "#6A4C93", // Purple Header
            textColor: "#FFFFFF",
            fontStyle: "bold",
            fontSize: 12,
          },
          columnStyles: {
            0: { cellWidth: 15 },  // User ID
            1: { cellWidth: 25 },  // First Name
            2: { cellWidth: 25 },  // Last Name
            3: { cellWidth: 50 },  // ✅ Email (Wider)
            4: { cellWidth: 35 },  // ✅ Contact Number (Wider)
            5: { cellWidth: 20 },  // Email Verified
            6: { cellWidth: 20 },  // Contact Verified
            7: { cellWidth: 25 },  // Role
            8: { cellWidth: 25 },  // Created At
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
      
        doc.save("Users_Report.pdf");
      
        setSnackbar({ open: true, message: "PDF report downloaded", severity: "success" });
      };
      

  
    // ✅ Function to download CSV
    const handleDownloadCSV = () => {
        if (!users.length) {
          setSnackbar({ open: true, message: "No data available for export", severity: "warning" });
          return;
        }
      
        const csvData = users.map(user => ({
          "User ID": user.id,
          "First Name": user.first_name,
          "Last Name": user.last_name,
          "Email": user.email,
          "Contact Number": user.contact_number || "N/A",
          "Email Verified": user.email_verified ? "Yes" : "No",
          "Contact Verified": user.contact_verified ? "Yes" : "No",
          "Created At": user.created_at.split("T")[0], // ✅ Keep Date Only
        }));
      
        const csvString = Papa.unparse(csvData);
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "Users_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      
        setSnackbar({ open: true, message: "CSV report downloaded", severity: "success" });
      };
      

  

      const handleEdit = (id) => {
        navigate(`/admin/edit/user/${id}`);  // ✅ Navigate to User Edit Page
      };
      
      const handleDelete = async () => {
        if (!selectedUser || !deletionReason.trim()) {
          setSnackbar({ open: true, message: "Please enter a reason for deletion.", severity: "warning" });
          return;
        }
      
        try {
          await deleteUser(selectedUser.id, deletionReason); // ✅ Use deleteUser instead of deleteNGO
          fetchUsers(); // ✅ Refresh Users List
          setDeleteDialogOpen(false);
          setSnackbar({ open: true, message: "User deleted successfully", severity: "success" });
        } catch (error) {
          setSnackbar({ open: true, message: error.message, severity: "error" });
        }
      };
      
      
      
  

      const filteredUsers = users.filter((user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.contact_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 2, fontWeight: "bold" }}>
        Manage Users
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search Users"
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
    <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>First Name</TableCell>
    <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Last Name</TableCell>
    <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Email</TableCell>
    <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Contact</TableCell>
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
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <TableRow
            key={user.id}
            sx={{ cursor: "pointer", "&:hover": { background: colors.secondary } }}
            onClick={() => navigate(`/admin/users/details/${user.id}`)} // ✅ Navigate to user details
          >
            <TableCell sx={{ color: colors.text }}>{user.first_name}</TableCell>
            <TableCell sx={{ color: colors.text }}>{user.last_name}</TableCell>
            <TableCell sx={{ color: colors.text }}>{user.email}</TableCell>
            <TableCell sx={{ color: colors.text }}>{user.contact_number}</TableCell>
            <TableCell>
              <Button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setDeleteDialogOpen(true); }}
                sx={{ background: "#F44336", color: "#FFFFFF", "&:hover": { background: "#D32F2F" } }}>
                <DeleteIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ color: colors.text }}>
            No Users found
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>


<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to delete User <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
    </Typography>
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
    <Button onClick={handleDelete} sx={{ color: "#FFFFFF", background: "#F44336" }}>
      Delete
    </Button>
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
    onChange={(event, value) => {
      setPage(value);
      fetchUsers(); // ✅ Fetch users when page changes
    }} 
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

export default ManageUsers;
