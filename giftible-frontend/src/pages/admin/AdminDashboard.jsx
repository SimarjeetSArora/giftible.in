import React, { useState, useEffect } from "react";
import {
  Container, Grid, Card, CardContent, Typography, Button, Badge, Paper, Box, Stack
} from "@mui/material";
import { AccountBalanceWallet, GroupAdd, Inventory, BarChart, Category, People, ShoppingCart, Store, Receipt, Business, AttachMoney, VolunteerActivism   } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom";



// ✅ Import Charts
import SalesTrendsChart from "../../components/charts/dashboard/admin/SalesTrendsChart";
import TopNgosChart from "../../components/charts/dashboard/admin/TopNgosChart";
import PayoutTrendsChart from "../../components/charts/dashboard/admin/PayoutTrendsChart";
import TopCategoriesChart from "../../components/charts/dashboard/admin/TopCategoriesChart";


const AdminDashboard = () => {
  const theme = useTheme();

  // ✅ State for Dashboard Metrics
  const [usersCount, setUsersCount] = useState(0);
  const [ngosCount, setNgosCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0); // ✅ Add this line
  const [totalProducts, setTotalProducts] = useState(0); // ✅ Add this line
  const [totalCategories, setTotalCategories] = useState(0); // ✅ Add this line
  const [pendingOrders, setPendingOrders] = useState(0); // ✅ Add this line
  
  // ✅ Pending Counts
  const [pendingNGOs, setPendingNGOs] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);
  const [pendingCategories, setPendingCategories] = useState(0);
  

  const safePendingNGOs = typeof pendingNGOs === "number" ? pendingNGOs : 0;
  const safePendingProducts = typeof pendingProducts === "number" ? pendingProducts : 0;
  const safePendingPayouts = typeof pendingPayouts === "number" ? pendingPayouts : 0;
  const safePendingCategories = typeof pendingCategories === "number" ? pendingCategories : 0;


  // ✅ Recent Activities
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentNGOs, setRecentNGOs] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);
  
  // ✅ Charts Data
  const [salesTrends, setSalesTrends] = useState([]);
  const [topNgos, setTopNgos] = useState([]);
  const [payoutTrends, setPayoutTrends] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  


  const navigate = useNavigate();

  const handleNavigation = (path) => {
  navigate(path);
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axiosInstance.get("/dashboard/admin"); // ✅ Correct API

      // ✅ Store Count Metrics
      setUsersCount(data.total_users);
      setNgosCount(data.total_ngos);
      setTotalSales(data.total_sales);
      setTotalProfit(data.total_profit); // ✅ Profit Data
      setTotalOrders(data.total_orders);
      setTotalProducts(data.total_products);
      setTotalCategories(data.total_categories);
      setPendingOrders(data.pending_orders);

      // ✅ Store Pending Data
      setPendingNGOs(data.pending_ngos || 0);
      setPendingPayouts(data.pending_payouts || 0);
      setPendingProducts(data.pending_products || 0);
      setPendingCategories(data.pending_categories || 0);

      // ✅ Store Chart Data
      setSalesTrends(data.sales_trends || []);
      setTopNgos(data.top_ngos || []);
      setPayoutTrends(data.payout_trends || []);
      setTopCategories(data.top_categories || []);

      // ✅ Store Recent Activity Data
      setRecentOrders(data.recent_orders || []);
      setRecentNGOs(data.recent_ngos || []);
      setRecentPayouts(data.recent_payouts || []);

    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    }
  };


  

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* ✅ Key Metrics Cards */}


<Grid container spacing={3}>

  {/* ✅ Total Users */}
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
            <People sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">Total Users</Typography>
              <Typography variant="h5">{usersCount}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Grid>

  {/* ✅ Total Sales */}
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
            <BarChart sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">Total Sales</Typography>
              <Typography variant="h5">₹{totalSales.toLocaleString()}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Grid>

  {/* ✅ Total Products */}
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
            <Receipt sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">Total Orders</Typography>
              <Typography variant="h5">{totalOrders}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Grid>

  {/* ✅ Total NGOs */}
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
            <VolunteerActivism sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">Total NGOs</Typography>
              <Typography variant="h5">{ngosCount}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Grid>

  {/* ✅ Total Profit */}
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
            <AttachMoney sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">Total Profit</Typography>
              <Typography variant="h5">₹{totalProfit.toLocaleString()}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Grid>

  {/* ✅ Total Categories */}
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
            <Category sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">Total Categories</Typography>
              <Typography variant="h5">{totalCategories}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </Grid>

   {/* ✅ Pending Orders */}
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

</Grid>



      {/* ✅ Graphs & Charts Section */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
       {/* Sales Trends */}
       <Grid item xs={12} md={6}>
          <SalesTrendsChart data={salesTrends} />
        </Grid>

        {/* Top NGOs */}
        <Grid item xs={12} md={6}>
          <TopNgosChart data={topNgos} />
        </Grid>

        {/* Payout Trends */}
        <Grid item xs={12} md={6}>
          <PayoutTrendsChart data={payoutTrends} />
        </Grid>

        {/* Top Categories */}
        <Grid item xs={ 12} md={6}>
          <TopCategoriesChart data={topCategories} />
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
              <strong>#{order.id}</strong> - {order.first_name} {order.last_name}  
              <br />
              ₹{order.total_amount.toLocaleString()}  
              <br />
              <small>{new Date(order.created_at).toLocaleString()}</small>
            </Typography>
          ))
        ) : (
          <Typography color="textSecondary">No recent orders.</Typography>
        )}
      </Box>
    </Paper>
  </Grid>

  {/* ✅ Recent NGO Approvals */}
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
        Recent NGO Approvals
      </Typography>
      <Box sx={{ overflowY: "auto", maxHeight: "220px", pr: 1 }}> 
        {recentNGOs.length > 0 ? (
          recentNGOs.map((ngo) => (
            <Typography key={ngo.id} sx={{ fontSize: 14, mb: 1 }}>
              <strong>{ngo.name}</strong> ({ngo.ngo_name})  
              <br />
              <small>{new Date(ngo.created_at).toLocaleString()}</small>
            </Typography>
          ))
        ) : (
          <Typography color="textSecondary">No recent NGO approvals.</Typography>
        )}
      </Box>
    </Paper>
  </Grid>

  {/* ✅ Recent Payout Requests */}
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
      {/* ✅ Pending NGOs */}
      <Grid item xs={12} sm={3}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<GroupAdd />}
          onClick={() => navigate("/dashboard/admin/ngos")}
        >
          Pending NGOs
          <Badge
            badgeContent={safePendingNGOs}
            color="primary"
            sx={{ ml: 2, "& .MuiBadge-badge": { fontSize: "0.8rem", padding: "4px" } }}
          />
        </Button>
      </Grid>

      {/* ✅ Pending Products */}
      <Grid item xs={12} sm={3}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Inventory />}
          onClick={() => navigate("/admin/products/approve")}
        >
          Pending Products
          <Badge
            badgeContent={safePendingProducts}
            color="primary"
            sx={{ ml: 2, "& .MuiBadge-badge": { fontSize: "0.8rem", padding: "4px" } }}
          />
        </Button>
      </Grid>

      {/* ✅ Pending Categories */}
      <Grid item xs={12} sm={3}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Category />}
          onClick={() => navigate("/admin/categories")}
        >
          Pending Categories
          <Badge
            badgeContent={safePendingCategories}
            color="primary"
            sx={{ ml: 2, "& .MuiBadge-badge": { fontSize: "0.8rem", padding: "4px" } }}
          />
        </Button>
      </Grid>

      {/* ✅ Pending Payouts */}
      <Grid item xs={12} sm={3}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AccountBalanceWallet />}
          onClick={() => navigate("/admin/payouts/pending")}
        >
          Pending Payouts
          <Badge
            badgeContent={safePendingPayouts}
            color="primary"
            sx={{ ml: 2, "& .MuiBadge-badge": { fontSize: "0.8rem", padding: "4px" } }}
          />
        </Button>
      </Grid>
    </Grid>


    </Container>
  );
};

export default AdminDashboard;
