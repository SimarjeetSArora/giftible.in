import React, { useState, useEffect } from "react";
import {
  Container, Grid, Card, CardContent, Typography, Button, Paper, Box, Badge, Stack
} from "@mui/material";
import { AttachMoney, ShoppingCart, Inventory, Store, Receipt, AccountBalanceWallet, AddBox, BarChart, RocketLaunch, HourglassEmpty, MonetizationOn  } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

// ✅ Import Charts
import SalesTrendsChart from "../../components/charts/dashboard/ngo/NGOSalesTrendsChart";
import OrderTrendsChart from "../../components/charts/dashboard/ngo/OrderTrendsChart";
import TopProductsChart from "../../components/charts/dashboard/ngo/TopProductsChart";
import PayoutTrendsChart from "../../components/charts/dashboard/ngo/NGOPayoutTrendsChart";

const NGODashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // ✅ State for Dashboard Metrics
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [liveProducts, setLiveProducts] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);
  const [upcomingPayouts, setUpcomingPayouts] = useState(0);

  // ✅ Recent Activities
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentApprovals, setRecentApprovals] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);

  // ✅ Charts Data
  const [salesTrends, setSalesTrends] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [payoutTrends, setPayoutTrends] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axiosInstance.get("/dashboard/ngo"); // ✅ API for NGO Dashboard

      // ✅ Store Key Metrics
      setTotalProducts(data.total_products);
      setTotalOrders(data.total_orders);
      setTotalSales(data.total_sales);
      setTotalPayouts(data.total_payouts);
      setPendingOrders(data.pending_orders);
      setLiveProducts(data.live_products);
      setPendingProducts(data.pending_products);
      setUpcomingPayouts(data.upcoming_payouts);

      // ✅ Store Chart Data
      setSalesTrends(data.sales_trends || []);
      setOrderTrends(data.order_trends || []);
      setTopProducts(data.top_products || []);
      setPayoutTrends(data.payout_trends || []);

      // ✅ Store Recent Activity Data
      setRecentOrders(data.recent_orders || []);
      setRecentApprovals(data.recent_approvals || []);
      setRecentPayouts(data.recent_payouts || []);

    } catch (error) {
      console.error("Error fetching NGO dashboard metrics:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        NGO Dashboard
      </Typography>

     {/* ✅ Key Metrics Cards */}
<Grid container spacing={3}>
{/* ✅ Total Products */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/manage-users")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Store sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Total Products</Typography>
            <Typography variant="h5">{totalProducts}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

{/* ✅ Total Orders */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/sales")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", 
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Receipt sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Total Orders</Typography>
            <Typography variant="h5">{(totalOrders ?? 0).toLocaleString()}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

{/* ✅ Total Sales */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/products")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", // Royal Purple
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <BarChart sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Total Sales</Typography>
            <Typography variant="h5"> ₹{(totalSales ?? 0).toLocaleString()}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

{/* ✅ Total Payouts */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/orders/manage")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", // Jet Black
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AttachMoney sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Total Payouts</Typography>
            <Typography variant="h5">  ₹{(totalPayouts ?? 0).toLocaleString()}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

{/* ✅ Pending Orders */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/manage-ngos")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", // Royal Purple
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <ShoppingCart sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Pending Orders</Typography>
            <Typography variant="h5">{pendingOrders}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

{/* ✅ Live Products */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/sales")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", // Golden Yellow
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <RocketLaunch sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Live Products</Typography>
            <Typography variant="h5">{liveProducts}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

{/* ✅ Pending Products */}
<Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/categories/manage")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", // Royal Purple
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <HourglassEmpty sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Pending Products</Typography>
            <Typography variant="h5">{pendingProducts}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

 {/* ✅ Upcoming Payouts */}
 <Grid item xs={12} sm={6} md={3}>
  <Box onClick={() => handleNavigation("/admin/orders/manage")} sx={{ cursor: "pointer" }}>
    <Card sx={{
      backgroundColor: "#6A4C93", // Royal Purple
      color: "#fff",
      borderRadius: "16px",
      boxShadow: 4,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <MonetizationOn sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="subtitle1">Upcoming Payouts</Typography>
            <Typography variant="h5">₹{(upcomingPayouts ?? 0).toLocaleString()}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Box>
</Grid>

</Grid>

      {/* ✅ Graphs & Charts */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <SalesTrendsChart data={salesTrends} />
        </Grid>
        <Grid item xs={12} md={6}>
          <OrderTrendsChart data={orderTrends} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TopProductsChart data={topProducts} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PayoutTrendsChart data={payoutTrends} />
        </Grid>
      </Grid>

{/* ✅ Recent Activity Tables */}
<Grid container spacing={3} sx={{ mt: 4 }}>
  
  {/* ✅ Recent Orders */}
  <Grid item xs={12} md={4}>
  <Paper
    sx={{
      p: 3,
      height: "280px", // ✅ Uniform height
      display: "flex",
      flexDirection: "column",
      boxShadow: 2,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
      Recent Orders
    </Typography>
    <Box sx={{ overflowY: "auto", maxHeight: "220px", pr: 1 }}>
      {recentOrders.length > 0 ? (
        recentOrders.map((order) => (
          <Typography key={order.id} sx={{ fontSize: 14, mb: 1 }}>
            <strong>Order #{order.order_id ?? "N/A"}</strong> - {order.product_name ?? "Unknown Product"}
            <br />
            Price: ₹{(order.price ?? 0).toLocaleString()} x {order.quantity}
            <br />
            <strong>Total: ₹{(order.total_price ?? 0).toLocaleString()}</strong>  
            <br />
            Status: <strong>{order.status}</strong>
            <br />
            <small>{order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}</small>
          </Typography>
        ))
      ) : (
        <Typography color="textSecondary">No recent orders.</Typography>
      )}
    </Box>
  </Paper>
</Grid>


  {/* ✅ Recent Product Approvals */}
  <Grid item xs={12} md={4}>
  <Paper
    sx={{
      p: 3,
      height: "280px", // ✅ Uniform height
      display: "flex",
      flexDirection: "column",
      boxShadow: 2,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
      Recent Product Approvals
    </Typography>
    <Box sx={{ overflowY: "auto", maxHeight: "220px", pr: 1 }}>
      {recentApprovals.length > 0 ? (
        recentApprovals.map((product) => (
          <Typography key={product.id} sx={{ fontSize: 14, mb: 1 }}>
            <strong>{product.name ?? "Unnamed Product"}</strong> - ✅ Approved  
            <br />
            <small>
              {product.approved_at
                ? new Date(product.approved_at).toLocaleString()
                : "N/A"}
            </small>
          </Typography>
        ))
      ) : (
        <Typography color="textSecondary">No recent approvals.</Typography>
      )}
    </Box>
  </Paper>
</Grid>


  {/* ✅ Recent Payout Requests */}
  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        p: 3,
        height: "280px",
        display: "flex",
        flexDirection: "column",
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Recent Payouts
      </Typography>
      <Box sx={{ overflowY: "auto", maxHeight: "220px", pr: 1 }}> 
        {recentPayouts.length > 0 ? (
          recentPayouts.map((payout) => (
            <Typography key={payout.id} sx={{ fontSize: 14, mb: 1 }}>
              <strong>₹{payout.amount.toLocaleString()}</strong> - {payout.status}  
              <br />
              <small>{new Date(payout.date).toLocaleString()}</small>
            </Typography>
          ))
        ) : (
          <Typography color="textSecondary">No recent payouts.</Typography>
        )}
      </Box>
    </Paper>
  </Grid>

</Grid>




      {/* ✅ Quick Actions */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="contained" color="primary" startIcon={<AddBox />} onClick={() => navigate("/ngo/products/add")}>
            Add Product
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="contained" color="primary" startIcon={<Inventory />} onClick={() => navigate("/ngo/products")}>
            Manage Products
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="contained" color="primary" startIcon={<AccountBalanceWallet />} onClick={() => navigate("/ngo/payouts")}>
            Request Payout
          </Button>
        </Grid>
      </Grid>

    </Container>
  );
};

export default NGODashboard;
