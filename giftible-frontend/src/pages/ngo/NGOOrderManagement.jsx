import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Snackbar,
  Alert,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import axiosInstance from "../../services/axiosInstance";
import API_BASE_URL from "../../config";
import { useTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; 
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // ✅ Calendar icon
import dayjs from "dayjs";
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

const NGOOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderItemId: null, reason: "" });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productList, setProductList] = useState([]);
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [totalPages, setTotalPages] = useState(1);


 // ✅ Reset to page 1 when filters change
// ✅ Reset to page 1 only when filters change
useEffect(() => {
  setCurrentPage(1);  // ✅ Reset to Page 1 when filters change
  fetchNGOOrders();   // ✅ Fetch updated data immediately
}, [searchQuery, statusFilter, startDate, endDate]);

useEffect(() => {
  fetchNGOOrders();  // ✅ Fetch new data when the page changes
}, [currentPage]);



  
const fetchNGOOrders = async () => {
  try {
    // ✅ Construct query parameters dynamically
    const params = {};
    if (currentPage) params.page = currentPage;
    if (itemsPerPage) params.page_size = itemsPerPage;
    if (searchQuery.trim()) params.search = searchQuery;
    if (startDate) params.start_date = dayjs(startDate).format("YYYY-MM-DD");
    if (endDate) params.end_date = dayjs(endDate).format("YYYY-MM-DD");
    if (statusFilter !== "All") params.status = statusFilter;

    console.log("🔍 Fetching NGO Orders with params:", JSON.stringify(params, null, 2));

    // ✅ Fetch order items + filtered products
    const response = await axiosInstance.get(`${API_BASE_URL}/orders/ngo`, { params });

    const ordersData = response.data.order_items || [];
    const productsData = response.data.products || [];

    setOrders(ordersData);
    setTotalPages(response.data.total_pages || 1);

    // ✅ Update filtered orders dynamically
    setFilteredOrders(
      ordersData.map((item) => ({
        ...item,
        orderId: item.order_id,
        orderDate: item.created_at,
      }))
    );

    // ✅ Update product list dynamically
    setProductList(productsData);

    setSnackbar({ open: true, message: "✅ Orders loaded successfully.", severity: "success" });

  } catch (error) {
    console.error("❌ Error fetching NGO orders:", error);
    setSnackbar({ open: true, message: "❌ Failed to load orders.", severity: "error" });
  }
};



  
  
const handleDownloadPDF = () => {
  if (!filteredOrders.length) {
    setSnackbar({ open: true, message: "No orders available for export", severity: "warning" });
    return;
  }

  const doc = new jsPDF("l", "mm", "tabloid"); // ✅ Landscape Tabloid for Wider Table
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoUrl = "/assets/logo.png"; // ✅ Update with correct logo path

  // ✅ Add Logo as Watermark
  doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 10, 60, 20); // Centered Logo

  // ✅ Add Report Header
  doc.setFontSize(22);
  doc.setTextColor("#6A4C93"); // Purple
  doc.text("Order Report", pageWidth / 2, 40, { align: "center" });

  // ✅ Add Date
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  doc.setFontSize(12);
  doc.setTextColor("#333");
  doc.text(`Generated on: ${currentDate}`, 14, 50);

  // ✅ Table Headers
  const tableColumn = [
    "Order ID", "Order Item ID", "Product Name", "Quantity", "Price",
    "Status", "Order Date", "Created At", "Cancellation Reason"
  ];
  
  const tableRows = [];

  // ✅ Add Table Data
  filteredOrders.forEach((item) => {
    tableRows.push([
      item.orderId,
      item.id,
      item.product?.name || "Unknown Product",
      item.quantity,
      item.price?.toFixed(2) || "0.00",
      item.status,
      item.orderDate ? dayjs(item.orderDate).format("DD/MM/YYYY HH:mm") : "-",
      item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY HH:mm") : "-",
      item.cancellation_reason || "N/A"
    ]);
  });

  // ✅ Apply autoTable with Final Fixes
  autoTable(doc, {
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: "#6A4C93", // Purple Header
      textColor: "#FFFFFF",
      fontStyle: "bold",
      fontSize: 12,
    },
    columnStyles: {
      0: { cellWidth: 20 },  // Order ID
      1: { cellWidth: 25 },  // Order Item ID
      2: { cellWidth: 50 },  // Product Name
      3: { cellWidth: 20 },  // Quantity
      4: { cellWidth: 25 },  // Price
      5: { cellWidth: 30 },  // Status
      6: { cellWidth: 35 },  // Order Date
      7: { cellWidth: 35 },  // Created At
      8: { cellWidth: 50 },  // Cancellation Reason
    },
    alternateRowStyles: {
      fillColor: "#F4F4F4",
    },
    margin: { top: 60, bottom: 20 },
    didDrawPage: (data) => {
      // ✅ Add Page Number
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(`Page ${pageCount}`, pageWidth - 40, pageHeight - 10);
    },
  });

  doc.save("Orders_Report.pdf");

  setSnackbar({ open: true, message: "PDF report downloaded", severity: "success" });
};
  
    
    
    // ✅ Function to download CSV
    const handleDownloadCSV = () => {
      if (!filteredOrders.length) {
        setSnackbar({ open: true, message: "No orders available for export", severity: "warning" });
        return;
      }
    
      // ✅ Prepare Data for CSV
      const csvData = filteredOrders.map(item => ({
        "Order ID": item.orderId,
        "Order Item ID": item.id,
        "Product Name": item.product?.name || "Unknown Product",
        "Quantity": item.quantity,
        "Price (₹)": `₹${item.price?.toFixed(2) || "0.00"}`,
        "Status": item.status,
        "Order Date": item.orderDate ? dayjs(item.orderDate).format("DD/MM/YYYY HH:mm") : "-",
        "Created At": item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY HH:mm") : "-",
        "Cancellation Reason": item.cancellation_reason || "N/A"
      }));
    
      // ✅ Convert to CSV String
      const csvString = Papa.unparse(csvData);
    
      // ✅ Create & Download CSV File
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "Orders_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    
      setSnackbar({ open: true, message: "CSV report downloaded", severity: "success" });
    };
 

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Processing":
        return "info";
      case "Shipped":
        return "primary";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleStatusUpdate = async (orderItemId, newStatus) => {
    console.log(`🔍 Updating Order Item ID: ${orderItemId} to Status: ${newStatus}`);

    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/orders/ngo/order-item/${orderItemId}/update-status`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ API Response:", response.data);
      
      fetchNGOOrders();
      setSnackbar({ open: true, message: `✅ Order item updated to ${newStatus}`, severity: "success" });
    } catch (error) {
      console.error("❌ Error updating status:", error);
      if (error.response) {
        console.log("🔍 Error Response:", error.response.data);
      }
      setSnackbar({ open: true, message: "❌ Failed to update status.", severity: "error" });
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelDialog.reason.trim()) {
      setSnackbar({ open: true, message: "⚠️ Please provide a reason for cancellation.", severity: "warning" });
      return;
    }
  
    try {
      await axiosInstance.put(`${API_BASE_URL}/orders/cancel/${cancelDialog.orderItemId}`, {
        reason: cancelDialog.reason
      });
  
      fetchNGOOrders();
      setSnackbar({ open: true, message: "❌ Order item cancelled successfully.", severity: "error" });
  
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      setSnackbar({ open: true, message: "❌ Failed to cancel order.", severity: "error" });
  
    } finally {
      // ✅ Close dialog in all cases
      setCancelDialog({ open: false, orderItemId: null, reason: "" });
    }
  };
  
  


  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#6A4C93" }}>
        📦 NGO Order Management
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search Product"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      label="Start Date"
      value={startDate ? dayjs(startDate) : null}
      onChange={(newValue) => setStartDate(newValue ? newValue.format("YYYY-MM-DD") : "")}
      disableFuture // ✅ Prevent selecting future dates
      maxDate={endDate ? dayjs(endDate) : undefined} // ✅ Prevent selecting after end date
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.light",
          },
          "&:hover fieldset": {
            borderColor: "primary.main",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.dark",
          },
        },
      }}
      slots={{
        openPickerIcon: CalendarTodayIcon, // ✅ Custom Icon
      }}
    />
  </LocalizationProvider>

{/* End Date */}
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
      maxDate={dayjs()} // ✅ Prevent selecting future dates
      minDate={startDate ? dayjs(startDate) : undefined} // ✅ Prevent selecting before start date
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.light",
          },
          "&:hover fieldset": {
            borderColor: "primary.main",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.dark",
          },
        },
      }}
      slots={{
        openPickerIcon: CalendarTodayIcon, // ✅ Custom Icon
      }}
    />
  </LocalizationProvider>



      </Box>

      <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow sx={{ bgcolor: "#F5B800" }}>
        <TableCell>Order ID</TableCell>
        <TableCell>Order Item ID</TableCell>
        <TableCell>Product</TableCell>
        <TableCell>Quantity</TableCell>
        <TableCell>Price</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Cancellation Reason</TableCell>
        <TableCell>Created At</TableCell> {/* ✅ Added Column */}
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredOrders.length === 0 ? (
        <TableRow>
          <TableCell colSpan={9} align="center">No orders found.</TableCell>
        </TableRow>
      ) : (
        filteredOrders
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.orderId}</TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.product?.name || "Unknown Product"}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>₹{item.price?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>
                <Chip label={item.status} color={getStatusColor(item.status)} />
              </TableCell>
              <TableCell>
                {item.status === "Cancelled" ? (
                  <Tooltip title={item.cancellation_reason || "No reason provided"}>
                    <Typography noWrap>{item.cancellation_reason || "Not provided"}</Typography>
                  </Tooltip>
                ) : "-"}
              </TableCell>
              <TableCell>
                {item.orderDate ? dayjs(item.orderDate).format("DD/MM/YYYY") : "-"} {/* ✅ Format Date */}
              </TableCell>
              <TableCell>
                <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                  <Select
                    value={item.status}
                    onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                    disabled={item.status === "Delivered" || item.status === "Cancelled"}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Shipped">Shipped</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setCancelDialog({ open: true, orderItemId: item.id, reason: "" })}
                  disabled={item.status === "Shipped" || item.status === "Delivered" || item.status === "Cancelled"}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))
      )}
    </TableBody>
  </Table>
</TableContainer>

      <Box mt={3} display="flex" justifyContent="center">
  <Pagination
    count={totalPages}
    page={currentPage}
    onChange={(_, value) => setCurrentPage(value)}
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



      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, orderItemId: null, reason: "" })}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <TextField label="Cancellation Reason" fullWidth value={cancelDialog.reason} onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, orderItemId: null, reason: "" })}>Close</Button>
          <Button color="error" variant="contained" onClick={handleCancelOrder}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NGOOrderManagement;
