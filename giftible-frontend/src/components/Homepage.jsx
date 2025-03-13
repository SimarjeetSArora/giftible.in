import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import Slider from "react-slick";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchTopNGOs,
} from "../services/homeService";
import API_BASE_URL from "../config";

const recognitions = [
  "/assets/recognitions/csit.png",
  "/assets/recognitions/acropolis.png",
  "/assets/recognitions/sahyog.png",
];

const placeholderImage = "https://via.placeholder.com/150"; // Fallback image

const Homepage = () => {
  const { mode } = useThemeContext();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topNGOs, setTopNGOs] = useState([]);

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    sectionBackground: mode === "dark" ? "#2A2A2A" : "#F5F5F5",
    accent: "#F5B800",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
  };

  useEffect(() => {
    const loadData = async () => {
      setCategories(await fetchCategories());
      setFeaturedProducts(await fetchFeaturedProducts());
      setTopNGOs(await fetchTopNGOs());
    };
    loadData();
  }, []);

  const carouselSettings = {
    autoplay: true,
    autoplaySpeed: 4000,
    dots: true,
    infinite: true,
    arrows: false,
  };

  const ProductCard = ({ id, name, price, images }) => {
    const imageUrl = images?.length > 0 ? `${API_BASE_URL}/${images[0].image_url}` : placeholderImage;

    return (
      <Grid item xs={12} sm={6} md={3}>
        <Card
          component={Link}
          to={`/products/${id}`}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textDecoration: "none",
            bgcolor: "background.paper",
            textAlign: "center",
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: "12px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              transform: "scale(1.03)",
              transition: "0.3s",
            },
          }}
        >
          <CardMedia
            component="img"
            height="150"
            image={imageUrl}
            alt={name}
            sx={{
              objectFit: "cover",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          />
          <CardContent
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "100px",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={1}
              color="text.primary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </Typography>
            <Typography variant="subtitle1" color="secondary.main">
              ₹{price}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ bgcolor: colors.background, color: colors.textPrimary }}>
      {/* 🚀 Hero Section with Carousel */}
      <Slider {...carouselSettings}>
  {[
    {
      title: "Empower Change Through Your Purchases",
      cta: "Shop Now",
      image: "/assets/carousel/1.jpg",
      link: "/products", // Link to Products Page
    },
    {
      title: "Support NGOs by Buying Their Products",
      cta: "Explore Products",
      image: "/assets/carousel/2.jpg",
      link: "/ngos", // Link to NGOs Page
    },
    {
      title: "Join the Movement. Make a Difference.",
      cta: "Get Involved",
      image: "/assets/carousel/3.jpg",
      link: "/donate", // Link to Donate Page
    },
  ].map(({ title, cta, image, link }, index) => (
    <Box
      key={index}
      component={Link}
      to={link} // ✅ Added Link here
      sx={{
        textDecoration: "none",
        position: "relative",
        height: { xs: "250px", sm: "350px", md: "450px" },
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.9,
          transition: "opacity 0.3s ease",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          bgcolor: "rgba(0, 0, 0, 0.4)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#FFFFFF"
          mb={2}
          sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
        >
          {title}
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: colors.accent,
            color: "#1B1B1B",
            fontWeight: "bold",
            px: 4,
            py: 1,
            "&:hover": { bgcolor: "#E0A700" },
          }}
        >
          {cta}
        </Button>
      </Box>
    </Box>
  ))}
</Slider>

      {/* 🛍️ Featured Products */}
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Featured Products
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            color="secondary"
            sx={{
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "primary.main",
                color: "secondary.main",
              },
            }}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </Grid>
      </Container>

      <Box
  sx={{
    mt: 8,
    py: 6,
    mb: 8, // ✅ Added bottom margin for spacing
    textAlign: "center",
    bgcolor: mode === "dark" ? "#2A2A2A" : "#F5F5F5",
    borderRadius: "16px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    mx: { xs: 2, md: 8 },
    px: { xs: 2, md: 6 },
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Subtle Background Decoration */}
  <Box
    sx={{
      position: "absolute",
      top: "-50px",
      right: "-50px",
      width: "200px",
      height: "200px",
      bgcolor: colors.accent,
      opacity: 0.2,
      borderRadius: "50%",
      zIndex: 0,
    }}
  />

  <Typography
    variant="h4"
    fontWeight="bold"
    mb={2}
    sx={{
      color: colors.textPrimary,
      zIndex: 1,
      position: "relative",
      textShadow: "1px 1px 4px rgba(0, 0, 0, 0.15)",
    }}
  >
    Want to make an even bigger impact?
  </Typography>

  <Typography
    variant="subtitle1"
    mb={4}
    sx={{
      color: mode === "dark" ? "#A8A8A8" : "#6A4C93",
      fontWeight: "medium",
      zIndex: 1,
      position: "relative",
    }}
  >
    Your support helps NGOs reach those who need it most.
  </Typography>

  <Button
    component={Link}
    to="/donate"
    variant="contained"
    size="large"
    sx={{
      fontWeight: "bold",
      px: 5,
      py: 1.8,
      fontSize: "1rem",
      bgcolor: colors.accent,
      color: "#1B1B1B",
      borderRadius: "30px",
      zIndex: 1,
      position: "relative",
      "&:hover": {
        bgcolor: "#E0A700",
        transform: "scale(1.05)",
        transition: "all 0.3s ease",
      },
    }}
  >
    Donate Now
  </Button>
</Box>


      {/* 🌟 Top NGOs */}

<Box sx={{ bgcolor: colors.sectionBackground, py: 6 }}>
  <Container>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center">
        Top NGOs
      </Typography>
      <Button
        component={Link}
        to="/ngos"
        variant="contained"
        color="secondary"
        sx={{
          fontWeight: "bold",
          "&:hover": {
            bgcolor: "primary.main",
            color: "secondary.main",
          },
        }}
      >
        View All
      </Button>
    </Box>

    <Grid container spacing={4} justifyContent="center">
      {topNGOs.map(({ id, ngo_name, logo }) => {
        const imageUrl = logo ? `${API_BASE_URL}${logo}` : "https://via.placeholder.com/150";

        return (
          <Grid item xs={6} sm={4} md={2} key={id} sx={{ textAlign: "center" }}>
            <Link to={`/ngos/${id}/products`} style={{ textDecoration: "none", color: "inherit" }}>
              <Box
                component="img"
                src={imageUrl}
                alt={ngo_name}
                sx={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  mb: 1,
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                  mx: "auto",
                }}
              >
                {ngo_name}
              </Typography>
            </Link>
          </Grid>
        );
      })}
    </Grid>
  </Container>
</Box>


      {/* 🗂️ Product Categories */}
      <Container sx={{ py: 6 }}>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
    <Typography variant="h4" fontWeight="bold" textAlign="center">
      Shop by Categories
    </Typography>
    <Button
      component={Link}
      to="/categories"  // Adjust the route if necessary
      variant="contained"
      color="secondary"
      sx={{
        fontWeight: "bold",
        "&:hover": {
          bgcolor: "primary.main",
          color: "secondary.main",
        },
      }}
    >
      View All
    </Button>
  </Box>

  <Grid container spacing={3}>
    {categories.map(({ id, name }) => (
      <Grid item xs={12} sm={6} md={3} key={id}>
        <Card
          sx={{
            bgcolor: colors.cardBg,
            textAlign: "center",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": { transform: "scale(1.03)", transition: "0.3s" },
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              {name}
            </Typography>
            <Button
              component={Link}
              to={`/categories/${id}`}
              sx={{ color: colors.accent, fontWeight: "bold" }}
            >
              Explore
            </Button>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
</Container>

      {/* 🏆 Recognition Section */}
      <Box sx={{ bgcolor: colors.sectionBackground, py: 6 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
            Recognized By
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {recognitions.map((logo, index) => (
              <Grid item xs={6} sm={4} md={2} key={index} sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src={logo}
                  alt={`Recognition ${index + 1}`}
                  sx={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    mb: 1,
                    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  {logo.split("/").pop().replace(".png", "").toUpperCase()}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
