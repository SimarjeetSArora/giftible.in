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
import { ArrowForwardIos } from "@mui/icons-material"; // ✅ Import the icon
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
      const categoryData = await fetchCategories();
      const featuredData = await fetchFeaturedProducts();
      const topNGOData = await fetchTopNGOs();
      
      setCategories(categoryData);
      setFeaturedProducts(featuredData);
      setTopNGOs(topNGOData.ngos || []); 
      setLoading(false); // ✅ Turn off loading state
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
    const imageUrl =
  images && images.length > 0 && images[0].image_url
    ? `${API_BASE_URL.replace(/\/$/, "")}/${images[0].image_url}`
    : placeholderImage;


    return (
<Grid item xs={12} sm={12} md={12} lg={12}> {/* ✅ Balanced Layout */}
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
      borderRadius: "16px", // ✅ Softer corners
      boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.15)", // ✅ Improved shadow
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
      },
    }}
  >
    <CardMedia
      component="img"
      height="280" // ✅ Bigger Image
      image={imageUrl}
      alt={name}
      sx={{
        objectFit: "cover",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
      }}
    />
    <CardContent
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2, // ✅ Added padding
        minHeight: "120px", // ✅ More spacing
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={1}
        color="text.secondary"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%", // ✅ Prevent overflow
        }}
      >
        {name}
      </Typography>
      <Typography
        variant="h7"
        fontWeight="bold"
        sx={{
          color: "#F5B800", // ✅ Highlighted price
          mt: 1,
        }}
      >
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




{/* Featured Products */}

<Container sx={{ py: 6 }}>
  {/* 🏷️ Section Header */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 4,
      px: { xs: 2, md: 0 },
    }}
  >
    <Typography
      variant="h4"
      fontWeight="bold"
      color="text.secondary"
      sx={{ letterSpacing: "1px" }}
    >
      Featured Products
    </Typography>

    {/* 🛒 View All Button */}
    <Button
      component={Link}
      to="/products"
      variant="contained"
      sx={{
        fontWeight: "bold",
        bgcolor: "#F5B800", // Primary accent color
        color: "#1B1B1B",
        px: 3,
        py: 1.2,
        borderRadius: "30px",
        display: "flex",
        alignItems: "center",
        gap: 1,
        "&:hover": {
          bgcolor: "#E0A700",
          transform: "scale(1.05)",
          transition: "all 0.3s ease",
        },
      }}
    >
      View All
      <ArrowForwardIos
        sx={{
          fontSize: "16px",
          transition: "transform 0.3s",
          "&:hover": { transform: "translateX(4px)" }, // 👈 Moves icon slightly on hover
        }}
      />
    </Button>
  </Box>

  {/* 🛍️ Products Grid (Static, No Scroll) */}
  <Grid container spacing={4} justifyContent="center">
  {featuredProducts
    .sort(() => Math.random() - 0.5) // ✅ Shuffle Products Randomly
    .slice(0, 4) // ✅ Show Only 4 Products
    .map((product) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}> {/* ✅ Bigger Cards */}
        <ProductCard {...product} />
      </Grid>
    ))}
</Grid>

</Container>



{/* Donate Now */}

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

      <Box sx={{ bgcolor: colors.sectionBackground, py: 8 }}>
  <Container>
    {/* 🔹 Header Section */}
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 5, 
        px: { xs: 2, md: 0 } 
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        color="text.secondary"
        sx={{
          letterSpacing: "1px",
        }}
      >
        Top NGOs
      </Typography>
      
      <Button
        component={Link}
        to="/ngos"
        variant="contained"
        sx={{
          fontWeight: "bold",
          bgcolor: "#F5B800", // Primary accent color
          color: "#1B1B1B",
          px: 3,
          py: 1.2,
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          gap: 1, // ✅ Adds spacing between text and icon
          "&:hover": {
            bgcolor: "#E0A700",
            transform: "scale(1.05)",
            transition: "all 0.3s ease",
          },
        }}
      >
        View All <ArrowForwardIos sx={{ fontSize: "16px" }} /> {/* ✅ Added icon */}
      </Button>
    </Box>

    {/* 🔹 NGO Grid (One Static Row with 4 Random NGOs) */}
    <Grid container spacing={5} justifyContent="center">
  {topNGOs
    .sort(() => Math.random() - 0.5) // ✅ Shuffle NGOs Randomly
    .slice(0, 4) // ✅ Show Only 4 NGOs
    .map(({ id, ngo_name, logo, universal_user_id }) => {  // ✅ Ensure `universal_user_id` is included

      // ✅ Ensure Proper Image URL Handling
      const imageUrl = logo
        ? logo.startsWith("http") // ✅ If logo is already a full URL, use as is
          ? logo
          : `${API_BASE_URL.replace(/\/$/, "")}/${logo.replace(/^\//, "")}` // ✅ Ensure single `/`
        : "https://via.placeholder.com/150"; // ✅ Placeholder for missing logos

      return (
        <Grid item xs={12} sm={4} md={4} key={id} sx={{ textAlign: "center" }}>
          <Link to={`/products?ngo_ids=${universal_user_id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <Box
              component="img"
              src={imageUrl} // ✅ Correctly Calling Function
              alt={ngo_name}
              sx={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "50%", // ✅ Circular Logos
                mb: 2,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "180px",
                mx: "auto",
                color: "text.secondary",
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
  {/* 🔹 Header Section */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 5,
      px: { xs: 2, md: 0 },
    }}
  >
    <Typography
      variant="h4"
      fontWeight="bold"
      color="text.secondary"
      sx={{ letterSpacing: "1px" }}
    >
      Shop by Categories
    </Typography>

    <Button
      component={Link}
      to="/categories"
      variant="contained"
      sx={{
        fontWeight: "bold",
        bgcolor: "#F5B800", // Primary accent color
        color: "#1B1B1B",
        px: 3,
        py: 1.2,
        borderRadius: "30px",
        display: "flex",
        alignItems: "center",
        gap: 1,
        "&:hover": {
          bgcolor: "#E0A700",
          transform: "scale(1.05)",
          transition: "all 0.3s ease",
        },
      }}
    >
      View All <ArrowForwardIos sx={{ fontSize: "16px" }} />
    </Button>
  </Box>

  {/* 🔹 Static Row of 4 Random Categories */}
  <Grid container spacing={3} justifyContent="center">
    {categories
      .sort(() => Math.random() - 0.5) // ✅ Randomize Categories
      .slice(0, 4) // ✅ Show Only 4 Categories
      .map(({ id, name }) => (
        <Grid item xs={12} sm={6} md={3} key={id}>
          <Card
            component={Link}
            to={`/products?category_ids=${id}`}
            sx={{
              textDecoration: "none",
              bgcolor: "#FFFFFF", // Card Background
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <CardContent sx={{ py: 3 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: "text.secondary",
                  textTransform: "capitalize",
                  letterSpacing: "0.5px",
                }}
              >
                {name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
  </Grid>
</Container>



      {/* 🏆 Recognition Section */}
<Box sx={{ bgcolor: colors.sectionBackground, py: 8 }}>
  <Container>
    {/* 🔹 Section Title */}
    <Typography
      variant="h4"
      fontWeight="bold"
      textAlign="center"
      mb={5}
      sx={{
        letterSpacing: "1px",
        color: "text.secondary",
      }}
    >
      Recognized By
    </Typography>

    {/* 🔹 Recognition Logos Grid */}
    <Grid container spacing={4} justifyContent="center">
      {recognitions.map((logo, index) => (
        <Grid item xs={6} sm={4} md={4} key={index} sx={{ textAlign: "center" }}>
          <Box
            component="img"
            src={logo}
            alt={`Recognition ${index + 1}`}
            sx={{
              width: "120px", // ✅ Slightly larger size
              height: "120px",
              objectFit: "contain",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF", // ✅ White background for contrast
              padding: "12px", // ✅ Adds padding inside the box
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)", // ✅ Softer, premium shadow
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.25)",
              },
            }}
          />
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            mt={2}
            sx={{
              color: "text.secondary",
              letterSpacing: "0.5px",
              textTransform: "capitalize",
            }}
          >
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
