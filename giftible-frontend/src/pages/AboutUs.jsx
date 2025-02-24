import React from "react";
import { Container, Typography, Box, Grid, Card, CardContent, Button } from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";

const teamMembers = [
  { name: "Simarjeet Singh Arora", role: "Founder & Developer", image: "/assets/team/simar.png" },
  { name: "Tanishq Pawar", role: "Founder", image: "/assets/team/tanishq.jpeg" },
];

const AboutUs = () => {
  const { mode } = useThemeContext();

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    sectionBackground: mode === "dark" ? "#2A2A2A" : "#F5F5F5",
    accent: "#F5B800",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
  };

  return (
    <Box sx={{ bgcolor: colors.background, color: colors.textPrimary }}>
      {/* 🌟 Hero Section */}
      <Box
        sx={{
          backgroundImage: "url('/assets/about/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: { xs: "250px", md: "400px" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Box sx={{ bgcolor: "rgba(0, 0, 0, 0.5)", width: "100%", height: "100%", position: "absolute" }} />
        <Typography
          variant="h3"
          fontWeight="bold"
          color="#FFFFFF"
          sx={{ position: "relative", zIndex: 1, textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
        >
          About Us
        </Typography>
      </Box>

      {/* 📝 Our Mission */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" mb={2} textAlign="center">
          Our Mission
        </Typography>
        <Typography variant="subtitle1" textAlign="center" maxWidth="800px" mx="auto" mb={4}>
          We aim to bridge the gap between compassionate donors and dedicated NGOs through our platform. Our mission is
          to empower communities, support NGOs, and bring transparency to charitable activities.
        </Typography>
        <Box sx={{ textAlign: "center" }}>
          <Button
            component={Link}
            to="/donate"
            variant="contained"
            sx={{
              bgcolor: colors.accent,
              color: "#1B1B1B",
              fontWeight: "bold",
              px: 5,
              py: 1.5,
              borderRadius: "30px",
              "&:hover": { bgcolor: "#E0A700" },
            }}
          >
            Donate Now
          </Button>
        </Box>
      </Container>

      {/* 🤝 How It Works */}
      <Box sx={{ bgcolor: colors.sectionBackground, py: 6 }}>
  <Container>
    <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
      How It Works
    </Typography>
    <Grid container spacing={4}>
      {[
        { title: "Discover NGOs", description: "Explore verified NGOs working on various causes." },
        { title: "Support Causes", description: "Donate or purchase products to support their missions." },
        { title: "Track Impact", description: "See how your contributions make a difference." },
      ].map(({ title, description }, index) => (
        <Grid item xs={12} md={4} key={index} sx={{ display: "flex" }}>
          <Card
            sx={{
              bgcolor: colors.cardBg,
              textAlign: "center",
              py: 4,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%", // Ensures cards fill available height
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>


      {/* 📈 Impact Stats */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
          Our Impact
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { value: "0+", label: "Products Sold" },
            { value: "0+", label: "NGOs Supported" },
            { value: "₹0+", label: "Raised" },
          ].map(({ value, label }, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" color={colors.accent}>
                  {value}
                </Typography>
                <Typography variant="subtitle1">{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 👨‍💼 Meet the Team */}
      <Box sx={{ bgcolor: colors.sectionBackground, py: 6 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
            Meet the Team
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map(({ name, role, image }) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <Card sx={{ textAlign: "center", py: 3, bgcolor: colors.cardBg }}>
                  <Box
                    component="img"
                    src={image}
                    alt={name}
                    sx={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      mb: 2,
                      mx: "auto",
                      boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {name}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 📣 Call to Action */}
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Ready to make a difference?
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          sx={{
            bgcolor: colors.accent,
            color: "#1B1B1B",
            fontWeight: "bold",
            px: 5,
            py: 1.5,
            borderRadius: "30px",
            "&:hover": { bgcolor: "#E0A700" },
          }}
        >
          Explore Products
        </Button>
      </Box>
    </Box>
  );
};

export default AboutUs;
