-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 12, 2025 at 11:39 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `giftible`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `landmark` varchar(100) DEFAULT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `is_default` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `universal_user_id`, `full_name`, `contact_number`, `address_line`, `landmark`, `city`, `state`, `pincode`, `is_default`) VALUES
(2, 1, 'Simarjeet Singh Arora', '7566262222', '391, Navlakha, Loha Mandi, Sadhu Vaswani Nagar', '', 'Indore', 'Madhya Pradesh', '452001', 1),
(5, 14, 'Tanishq Pawar', '8602278300', '302, Nakoda Castle Apartment', 'near gumasta nagar power house', 'Indore', 'Madhya Pradesh', '452009', 0),
(6, 1, 'Simarjeet Singh Arora', '7566262222', '391, Navlakha, Loha Mandi, Sadhu Vaswani Nagar', '', 'Indore', 'Madhya Pradesh', '452001', 0);

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `universal_user_id`) VALUES
(1, 1),
(2, 14);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`) VALUES
(24, 1, 18, 2);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT NULL,
  `universal_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `is_approved`, `universal_user_id`) VALUES
(1, 'Fashion', 'Test Description', 1, 3),
(5, 'watches', 'string', 1, 3),
(14, 'Candles, Lighting & Soaps', 'Candles, Lighting & Soaps', 1, 13),
(15, 'Corporate Gifting', 'Corporate Gifting\n', 1, 13),
(16, 'Mobiles', 'test description', 1, 15),
(17, 'pc', 'rese', 0, 3);

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_percentage` float NOT NULL,
  `max_discount` float NOT NULL,
  `usage_limit` enum('one_time','one_per_day') NOT NULL,
  `minimum_order_amount` float NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `discount_percentage`, `max_discount`, `usage_limit`, `minimum_order_amount`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'SIMAR50', 50, 100, 'one_time', 200, 1, '2025-03-13 17:10:06', '2025-03-13 18:23:14'),
(2, 'GIFT60', 60, 120, 'one_time', 298, 1, '2025-03-13 17:14:39', '2025-03-13 18:02:15');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usages`
--

CREATE TABLE `coupon_usages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `used_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ngos`
--

CREATE TABLE `ngos` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL,
  `ngo_name` varchar(100) NOT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `account_number` varchar(20) NOT NULL,
  `ifsc_code` varchar(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(6) NOT NULL,
  `license` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ngos`
--

INSERT INTO `ngos` (`id`, `universal_user_id`, `ngo_name`, `account_holder_name`, `account_number`, `ifsc_code`, `address`, `city`, `state`, `pincode`, `license`, `logo`, `is_approved`, `created_at`, `updated_at`) VALUES
(1, 3, 'Simar NGO', 'Simarjeet Singh Arora', '21430100019375', 'FDRL002143', 'alakhdham nagar', 'indore', 'mp', '452012', '/uploads/ngos/1/license.pdf', '/uploads/ngos/1/logo.png', 1, '2025-03-06 07:06:57', '2025-03-13 11:09:14'),
(9, 13, 'Test NGO 1', 'Test User', '123', 'HDFC0000001', '302, Nakoda Castle Apartment', 'Indore', 'Madhya Pradesh', '452012', '/uploads/ngos/13/license.pdf', '/uploads/ngos/13/logo.png', 1, '2025-03-17 07:13:54', '2025-03-17 07:22:02'),
(10, 15, 'Sahyog', 'Simarjeet', '123', 'HDFC0000001', 'test address', 'Ujjain', 'Madhya Pradesh', '456010', '/uploads/ngos/15/license.pdf', '/uploads/ngos/15/logo.png', 1, '2025-03-17 09:30:16', '2025-03-17 09:34:11');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL,
  `total_amount` float NOT NULL,
  `address_id` int(11) NOT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `universal_user_id`, `total_amount`, `address_id`, `razorpay_order_id`, `payment_id`, `created_at`, `updated_at`) VALUES
(20, 14, 890, 5, 'order_Q7n2ljg8EDhbKF', 'pay_Q7n2x7Outu6q5h', '2025-03-17 08:22:50', '2025-03-17 08:22:50'),
(21, 1, 250, 6, 'order_Q7oauJwNM7XhHv', 'pay_Q7ob6e5JTQyndP', '2025-03-17 09:53:51', '2025-03-17 09:53:51'),
(22, 1, 330, 2, 'order_Q8AYOJUhNJwPbN', 'pay_Q8AZyAipUKnD61', '2025-03-18 07:24:19', '2025-03-18 07:24:19'),
(23, 1, 250, 2, 'order_QGV5ASPg4rprlB', 'pay_QGV5N5jOIJToQH', '2025-04-08 08:39:39', '2025-04-08 08:39:39');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` float NOT NULL,
  `status` enum('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `review_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `status`, `created_at`, `updated_at`, `cancellation_reason`, `review_id`) VALUES
(22, 20, 15, 1, 140, 'Delivered', '2025-03-17 08:22:50', '2025-03-17 02:54:30', NULL, NULL),
(23, 20, 16, 1, 150, 'Shipped', '2025-03-17 08:22:50', '2025-03-18 01:19:57', NULL, NULL),
(24, 20, 18, 1, 550, 'Cancelled', '2025-03-17 08:22:50', '2025-03-17 02:53:16', 'Product no longer needed', NULL),
(25, 21, 20, 2, 100, 'Delivered', '2025-03-17 09:53:51', '2025-03-17 04:29:15', NULL, NULL),
(26, 22, 15, 2, 140, 'Delivered', '2025-03-18 07:24:19', '2025-03-18 01:59:44', NULL, NULL),
(27, 23, 8, 2, 100, 'Pending', '2025-04-08 08:39:39', '2025-04-08 08:39:39', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`) VALUES
(1, 1, 'i95lW3IqBdE1FfY7hAYxokfBT8guFcY8', '2025-03-16 15:52:08'),
(2, 1, 'AexAXdfSay8Jf36YJ5PY959Ki7dCckRi', '2025-03-16 15:53:07'),
(3, 1, 'QIN4l8nhR2zRArL4hCJbss0ZjYI0O9cX', '2025-03-16 15:53:14');

-- --------------------------------------------------------

--
-- Table structure for table `payouts`
--

CREATE TABLE `payouts` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Completed','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payouts`
--

INSERT INTO `payouts` (`id`, `universal_user_id`, `amount`, `status`, `created_at`, `processed_at`) VALUES
(9, 15, 100.00, 'Completed', '2025-03-17 04:34:16', '2025-03-17 04:34:52'),
(10, 3, 100.00, 'Completed', '2025-03-18 01:28:57', '2025-03-18 01:32:06');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `price` float NOT NULL,
  `stock` int(11) NOT NULL,
  `is_approved` tinyint(1) DEFAULT NULL,
  `is_live` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `universal_user_id`, `category_id`, `name`, `description`, `price`, `stock`, `is_approved`, `is_live`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'Bag', 'Test Description', 100, 10, 1, 0, '2025-03-09 18:47:57', '2025-03-17 07:55:39'),
(5, 3, 5, 'test', 'f', 50, 200, 1, 0, '2025-03-14 12:03:44', '2025-03-18 06:48:04'),
(6, 3, 5, 'Rolex', 'sd', 1000, 110, 1, 0, '2025-03-14 12:06:47', '2025-03-17 07:18:49'),
(8, 13, 14, 'Shot Glass Gel Candle', 'Beautiful, attractive, colourful and smokeless gel candle in 60ml shot glass.', 100, 8, 1, 1, '2025-03-17 07:30:45', '2025-04-08 08:39:39'),
(9, 13, 14, 'Mini Jar Candle Set', 'A pair of scented candles in 40ml glass bottles with a powder coated metal lid.', 125, 20, 1, 1, '2025-03-17 07:31:29', '2025-03-17 07:36:09'),
(10, 13, 14, 'Tea Light Candles', 'A dozen scented tea light candles.', 150, 5, 1, 0, '2025-03-17 07:32:09', '2025-03-17 07:36:12'),
(11, 13, 14, 'Hand Painted Diyas', 'A pair of clay diyas handpainted in festive co­lours.', 50, 10, 1, 1, '2025-03-17 07:32:58', '2025-03-17 07:36:13'),
(12, 13, 14, 'Tea Light Candle Holder', 'Hand polished and varnished wooden tealight holder with a pair of scented tealight candles.', 250, 15, 1, 0, '2025-03-17 07:33:48', '2025-03-17 07:52:31'),
(13, 13, 14, 'Handmade Soaps', 'High quality, skin friendly rose scented soaps that are handcrafted.', 100, 20, 0, 0, '2025-03-17 07:34:36', '2025-03-17 07:34:36'),
(14, 3, 15, 'Multi Purpose Pouch', 'This stylish and practical pouch features a vibrant digital/ screen print, perfect for storing your small items and keeping them organized. Made with high-quality materials, it combines functionality with a touch of art . Please contact us directly to request customization and order this product.', 180, 5, 0, 0, '2025-03-17 07:48:03', '2025-03-17 07:48:03'),
(15, 3, 15, 'Storage Pouch', 'This stylish and practical pouch features a vibrant digital/ screen print, perfect for storing your small items and keeping them organized. Made with high-quality materials, it combines functionality with a touch of art . Please contact us directly to request customization and order this product.', 140, 12, 1, 1, '2025-03-17 07:48:40', '2025-03-18 07:24:19'),
(16, 3, 15, 'Jute Key Chain', 'Crafted with love and attention to detail, our handmade key chain adds a personal touch to your everyday essentials. Its unique design ensures that no two are alike, making it a one-of-a-kind accessory.', 150, 19, 1, 1, '2025-03-17 07:49:24', '2025-03-17 08:22:50'),
(17, 3, 15, 'Beeded Keychain', 'Crafted with love and attention to detail, our handmade key chain adds a personal touch to your everyday essentials. Its unique design ensures that no two are alike, making it a one-of-a-kind accessory.', 120, 30, 0, 0, '2025-03-17 07:50:03', '2025-03-17 07:50:03'),
(18, 3, 15, 'Planner', 'This unique and functional planner is carefully handcrafted by talented special needs adults. Each page is thoughtfully designed and assembled with love and dedication, showcasing the artist’s creativity and skills.', 550, 50, 1, 1, '2025-03-17 07:50:42', '2025-03-17 08:23:16'),
(19, 3, 15, 'Cloth Bag', 'Customised branded gift bags, the perfect companion to anything in this catalogue.', 100, 25, 0, 0, '2025-03-17 07:51:57', '2025-03-17 07:51:57'),
(20, 15, 16, 'test mobile', 'test descr', 100, 8, 1, 1, '2025-03-17 09:48:29', '2025-03-17 09:53:51'),
(21, 3, 16, 'Samsung Phone', 'test', 1000, 16, 0, 0, '2025-03-18 06:44:15', '2025-03-18 06:44:15');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`) VALUES
(1, 1, 'uploads/products/1_Simarjeet_Passport_Size_Photograph (1).png'),
(2, 1, 'uploads/products/1_simar.png'),
(14, 5, 'uploads/products/5_IMG_20250304_120041641.jpg'),
(15, 5, 'uploads/products/5_IMG_20250304_120023695.jpg'),
(16, 5, 'uploads/products/5_IMG_20250304_120014439.jpg'),
(17, 5, 'uploads/products/5_IMG_20250304_120009251.jpg'),
(18, 6, 'uploads/products/6_logo_no-bg.webp'),
(21, 8, 'uploads/products/8_0W0A0623-360x360.jpg'),
(22, 9, 'uploads/products/9_Mini-Jar-Candle-1-360x360.jpg'),
(23, 10, 'uploads/products/10_Tea-Light-Candles-360x360.jpg'),
(24, 11, 'uploads/products/11_Handpainted-Diyas-360x360.jpg'),
(25, 12, 'uploads/products/12_Tea-Light-Candle-Holder-1-360x360.jpg'),
(26, 13, 'uploads/products/13_Handmade-Soaps-360x360.jpg'),
(27, 14, 'uploads/products/14_customized-pouch-3-360x360.jpeg'),
(28, 15, 'uploads/products/15_customized-pouch-1--360x360.jpeg'),
(29, 16, 'uploads/products/16_Jute-key-chain-scaled-360x360.jpeg'),
(30, 17, 'uploads/products/17_Beeded-keychain-scaled-360x360.jpeg'),
(31, 18, 'uploads/products/18_planner-2-360x360.jpeg'),
(32, 19, 'uploads/products/19_cloth-bags-with-branding-360x360.png'),
(33, 20, 'uploads/products/20_SCHEDULE.png'),
(34, 20, 'uploads/products/20_Screenshot 2023-08-27 134847.png'),
(35, 20, 'uploads/products/20_Screenshot 2023-08-27 140106.png'),
(36, 21, 'uploads/products/21_IMG_20250304_120041641.jpg'),
(37, 21, 'uploads/products/21_IMG_20250304_120023695.jpg'),
(38, 21, 'uploads/products/21_IMG_20250304_120014439.jpg'),
(39, 21, 'uploads/products/21_IMG_20250304_120009251.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `universal_user_id`, `token`, `expires_at`, `created_at`) VALUES
(3, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQxODQ5NjYxfQ.c4C0QSTX7JQlege6RdBtS7m8FE0KQUgKV1x9XuOrAD0', '2025-03-13 07:07:41', '2025-03-06 12:37:41'),
(13, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDIxNTI5Njd9.fJ02qrYPkZZYgif4qCCcsuTP7mZQTgGj2c7pg6d15fA', '2025-03-16 19:22:47', '2025-03-10 00:52:47'),
(15, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDIxNTUyMzV9.wPFqlpMr89SC7PAtN1SZ8CL8SD5Vw3HbxRwS-Hzyw7k', '2025-03-16 20:00:35', '2025-03-10 01:30:35'),
(16, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDIxNTcxNDd9.i_zyguttKFoYoo26FrLmbaLWwXdacaSiOxUNl_ghOJw', '2025-03-16 20:32:27', '2025-03-10 02:02:27'),
(17, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDIxNTcyODh9.-A2gGHKXL947PsIHv9qngbUPMDCcLiTcuLPBI8AI8_k', '2025-03-16 20:34:48', '2025-03-10 02:04:48'),
(23, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDIxNjA3NzJ9.BYxCGC4zAWf44G-GBEvL3AL0ROhR3bdM9JdNb7SzQH8', '2025-03-16 21:32:52', '2025-03-10 03:02:52'),
(24, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyMTYwNzkyfQ.6HTCCe1ufdC9FeXsYRIYsHm2KPepCKnMGnCZ4cI1cPo', '2025-03-16 21:33:12', '2025-03-10 03:03:12'),
(62, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDIyMDQ4MzZ9.QMl9CVBrqH6HlIUXfg-mzYCEpRvb7WuFdyvFrkDnOvo', '2025-03-17 09:47:16', '2025-03-10 15:17:16'),
(63, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyMjA0ODczfQ.sGwjy2SwQbL84CY0-GVnLJnyOnVK4VZ1o2DkT-VDvFY', '2025-03-17 09:47:53', '2025-03-10 15:17:53'),
(69, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyMjA3MDkwfQ.LrbU7mc2LN5s8ivPMoq7rGRHgxPJXGYOODurNIiK_vQ', '2025-03-17 10:24:50', '2025-03-10 15:54:50'),
(71, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI0MTI3NDF9.dCYw5LTZ-zoYAb4Skn2pOW9u2T59BhUVpMM2YfftVQ8', '2025-03-19 19:32:21', '2025-03-13 01:02:21'),
(74, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI0MTQ2Mzl9.h9ASarbNLKOs0ersi7nr52vSW3M8VuQqa2Ac6VADT0A', '2025-03-19 20:03:59', '2025-03-13 01:33:59'),
(75, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDE0NjYzfQ.sQ1kBwQZ0Nml_vVml0k1UTHfbr2OWnVzc76-lnkSqj4', '2025-03-19 20:04:23', '2025-03-13 01:34:23'),
(76, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDE1MzI3fQ.ykWrlEzy9h6LiNr65JMM2AGrbmCCXWPwuqprbluzCHM', '2025-03-19 20:15:27', '2025-03-13 01:45:27'),
(77, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDE1NDk0fQ.b8O0HTAUTP4LI8xHYEfkoBv75JgniYc1rRL9PiAoJQ0', '2025-03-19 20:18:14', '2025-03-13 01:48:14'),
(80, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDE4MDcwfQ.dBeFS38Vo-msdgP2k75g5SiPiezTIu5TiYHrc9UrN_g', '2025-03-19 21:01:10', '2025-03-13 02:31:10'),
(83, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDUzMzA4fQ.Yjc60G1zWzf_n8Q1sH3yqLgwodv3OJziAmmbnLHpzxk', '2025-03-20 06:48:28', '2025-03-13 12:18:28'),
(84, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDUzODIzfQ.KlmxN6e9q9IDvkf0yoMRys3l7qV0YADG51SoyvoHbAg', '2025-03-20 06:57:03', '2025-03-13 12:27:03'),
(89, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDYyNTUzfQ.egLr8tVkX3xVDIwDWPMGGPvs4PBimIFkFyLbfTyYtsw', '2025-03-20 09:22:33', '2025-03-13 14:52:33'),
(93, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDY3MTE0fQ.B9PVJGugAhNRKud2Y1HveDnAoj8xBDZJSbuj2KbiJxI', '2025-03-20 10:38:34', '2025-03-13 16:08:34'),
(99, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDc2NzM4fQ.P9-qN1jjubM_cMiVIgLxoV72JQUB5cUULc_8AI6TRGk', '2025-03-20 13:18:58', '2025-03-13 18:48:58'),
(101, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDc4NzM0fQ.Eoxo_yggw_xif4bv6ULer7eYyZ7mTaZmcV6xpK8b8RU', '2025-03-20 13:52:14', '2025-03-13 19:22:14'),
(102, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDc5NzYxfQ.Z1azU2hzi3pCM0KyF-c2LihfI9w3tdt8d9tOvQxHY4I', '2025-03-20 14:09:21', '2025-03-13 19:39:21'),
(103, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4MDMyMH0.mtTzRJEZISgSFcHePPctpil95VQbRfqQv_2aByuIh14', '2025-03-20 14:18:40', '2025-03-13 19:48:40'),
(104, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDgwMzM4fQ.Gr5zN5chVof34jneDA9ic2K1spagfYGPwdG8Xa7imX0', '2025-03-20 14:18:58', '2025-03-13 19:48:58'),
(105, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4MDY4NH0.5TheGCeaoomaewNucOIesUndmvTmQuOVxUNiL6yCWwA', '2025-03-20 14:24:44', '2025-03-13 19:54:44'),
(106, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDgwODMwfQ._7dzAGPXvtjq2ZHAMZ_sR6gbBiwXO6WxmzWXXBu6_ms', '2025-03-20 14:27:10', '2025-03-13 19:57:10'),
(107, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4MDg0MH0.Gy0kUKnFpgJpE8nsucQeDkFKzZhvRJswTdheIM1_DY4', '2025-03-20 14:27:20', '2025-03-13 19:57:20'),
(108, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDgxMjA0fQ.r2oQrfX83Qx7666j6mxAFH6bJK2D38Den71XmPErHOQ', '2025-03-20 14:33:24', '2025-03-13 20:03:24'),
(109, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4MTQxNn0._P-KjR8rwGAbkqijb8bGQFMDhyY-nSWhPN5Rpe-oPJg', '2025-03-20 14:36:56', '2025-03-13 20:06:56'),
(110, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDgxNDc3fQ.vAeM-BONMOBpH8kEEa_yGQKuJDdrj822sa02-oC8hU0', '2025-03-20 14:37:57', '2025-03-13 20:07:57'),
(111, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4MTYwNH0.FKem5l_uXMqRJIczYjz5_2LHeQ6dJEZmeza9RHc83dc', '2025-03-20 14:40:04', '2025-03-13 20:10:04'),
(112, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDgxNzU3fQ.DZS3C0kqGhq858fM4cbYQ_Xv1VkkfEDDYin4wb_I9_U', '2025-03-20 14:42:37', '2025-03-13 20:12:37'),
(113, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4MjA0MX0.exhQZPxsjIeHrMXUmPUtbFBXcd59VG_kXOPCDPA4Wgw', '2025-03-20 14:47:21', '2025-03-13 20:17:21'),
(115, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDg2MjQ5fQ.DbcJew1m_YRDcNLB_MJXkRlgV4SeKdY-v5qSMforedk', '2025-03-20 15:57:29', '2025-03-13 21:27:29'),
(118, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDg3Mzc4fQ.KfJ84wdBAiFeRv2TljSRe__bUCTWoO0Egqodnwj8Yqc', '2025-03-20 16:16:18', '2025-03-13 21:46:18'),
(119, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDg4MzcwfQ.pDoSbhE11sDGXqFIc7qx-ETTjIWzsX960gGprTCKKW4', '2025-03-20 16:32:50', '2025-03-13 22:02:50'),
(120, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDg4Mzg0fQ.NgUEUYigLhEhcv3LfNjr31o0fqwcp-bVQI05_goV00k', '2025-03-20 16:33:04', '2025-03-13 22:03:04'),
(121, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjQ4ODcxMX0._7GmaOeahvpy6iO5C2An_ZkPrzZc8_jvMPucTz3xkwU', '2025-03-20 16:38:31', '2025-03-13 22:08:31'),
(126, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDk2MTk3fQ.w-iIBzNTkkCOqJt1cKxZFudLfwBbQLMD4xXjtj4KvsE', '2025-03-20 18:43:17', '2025-03-14 00:13:17'),
(127, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDk2ODQyfQ.9YKq-SMyL40WiojpnbZUklZfIIMtcM2y1h5DmREWOzo', '2025-03-20 18:54:02', '2025-03-14 00:24:02'),
(128, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNDk2OTYyfQ.J7eibG7Lkv3kkE-3tOPLIEjXKOlXuDcLC9-uewqwJaQ', '2025-03-20 18:56:02', '2025-03-14 00:26:02'),
(132, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNTAzODg0fQ.jW-xi92osF3ckp2-sGDwII0KmoBOtAASWUv6Khb6HSM', '2025-03-20 20:51:24', '2025-03-14 02:21:24'),
(134, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNTA2MDU5fQ.pHrALwMEG7_hKtRtpoH-xQzszMoPgBw8jJulUIRsLQA', '2025-03-20 21:27:39', '2025-03-14 02:57:39'),
(136, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI1MDcyMjF9.sGqpqo2YiJ36P3H-lY9W4IabV7NXt3qAQCPcF8mAGGg', '2025-03-20 21:47:01', '2025-03-14 03:17:01'),
(139, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNTM4OTI2fQ.tjcM67pPdtg1AhkXH-xj5yfRguPeayN70n-KKqC0JVg', '2025-03-21 06:35:26', '2025-03-14 12:05:26'),
(140, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNTQwMzk5fQ.l4_2EBJsqXrqisDvVygi_-sOFA-rgNTDAvp_maBQv6Q', '2025-03-21 06:59:59', '2025-03-14 12:29:59'),
(147, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNTQ3Nzc4fQ.FemShARPwJSV8qB6lm3RFmexJjpUXQHP9lC24gLnLzs', '2025-03-21 09:02:58', '2025-03-14 14:32:58'),
(152, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjU1MjM4Mn0.c2VKnUozz2wC03WuBjS02GU8QFPAmbjkI9PZ77AqpBs', '2025-03-21 10:19:42', '2025-03-14 15:49:42'),
(154, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjU1NTMyNX0.ZOKJ7_e69IlzyoPlLLe2BGIDGI1ZGtwb1yug-UnNgso', '2025-03-21 11:08:45', '2025-03-14 16:38:45'),
(164, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjU1ODkzMH0.YSq9rRKeYxd-o4obxepNVdlHG2FTMVUBhU-T30Yvxk0', '2025-03-21 12:08:50', '2025-03-14 17:38:50'),
(184, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2MzQxMTZ9.COCAX7Uo6wz8Jy_VN97YL0foSt70pi-tm-bbghT-_lw', '2025-03-22 09:01:56', '2025-03-15 14:31:56'),
(186, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2MzYyMDR9.WG1ZljlevuTLqVL2qpiiaF2HcS2IB8uTWQOkaPR_1P4', '2025-03-22 09:36:44', '2025-03-15 15:06:44'),
(188, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjYzNzcwNn0.cnJojaOpwQTzY6rX5e4-lJ1MBwDpKF2KJxky7Ic1JdY', '2025-03-22 10:01:46', '2025-03-15 15:31:46'),
(191, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjYzOTc5MX0.Z_HOPUAkHRPO4_ponVgDDy3A_4hZcdP2wECN6yHoD4A', '2025-03-22 10:36:31', '2025-03-15 16:06:31'),
(193, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NDE5MDZ9.KnOfTI24xqEGlG9jatDAmqHjQ9GATdpCvvHYE3aclkU', '2025-03-22 11:11:46', '2025-03-15 16:41:46'),
(194, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY0MjAzMX0.LwAgZetgYKNmbucVH-fwX6G40pPjNt9209gx_2GrbPU', '2025-03-22 11:13:51', '2025-03-15 16:43:51'),
(195, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NDI3ODR9.VC8XejpOrDyUiVRlEipR_gBNRaC68hCzdlZ3GZm2ktw', '2025-03-22 11:26:24', '2025-03-15 16:56:24'),
(196, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY0MjgxMX0.H49F5t_UFJ-tpEav6MMjr5zEScAlduX4Cipml9UE8bY', '2025-03-22 11:26:51', '2025-03-15 16:56:51'),
(200, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY0ODgwMn0.yTSA3JGpa1Qw5PYE71nVXsVnLXNXkL4-Qnziw6lQGcY', '2025-03-22 13:06:42', '2025-03-15 18:36:42'),
(205, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjU0NTQyfQ.2ljszTMTEfmJ3nf-GLYCp5Svru5Je8Pheb2TrLW9Cio', '2025-03-22 14:42:22', '2025-03-15 20:12:22'),
(206, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NTQ1NjF9.VujyO6sbkC1WSlvV1N7jM6qYXbcxvEhgk0NBGkPC8TE', '2025-03-22 14:42:41', '2025-03-15 20:12:41'),
(207, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY1NDU4Mn0.r72Jrb24rU6sRqhO7abfnWzTRuSQeRDgtGRjnSMFavU', '2025-03-22 14:43:02', '2025-03-15 20:13:02'),
(208, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjU1MDE5fQ.ESPIG5tsiAtCu_rncMGeo0qLT4137OBOHz5SpIZVSuw', '2025-03-22 14:50:19', '2025-03-15 20:20:19'),
(213, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NTc0MDJ9._oWD2HvL8eOT-SpFp0S2B75fM0yUN9vD9ED0owd7fUE', '2025-03-22 15:30:02', '2025-03-15 21:00:02'),
(216, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NjI3Nzl9.2N03TB65nP6uujgZ8trrU4rcIr0CqUQDGyGgLIRYtNU', '2025-03-22 16:59:39', '2025-03-15 22:29:39'),
(217, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY2Mjc5N30.ifgD2AXunsiSzFs1oOjDr2cEfQWPZvo7pkeeAnDEhyc', '2025-03-22 16:59:57', '2025-03-15 22:29:57'),
(218, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjYyODI4fQ.tlR05Cs7_rtEod0Wi4QnYb12KMWsVzyZTJHD5JOi9_o', '2025-03-22 17:00:28', '2025-03-15 22:30:28'),
(219, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjYzMDcxfQ.EoNH6KO23y3TqmVTqGZJfovjv_evCnjqV9Gifk0YlW8', '2025-03-22 17:04:31', '2025-03-15 22:34:31'),
(220, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NjMxMzd9.wX35Xchg1GdMdycD-raWAFm5zhEdk-LKUwM7C2JdZYs', '2025-03-22 17:05:37', '2025-03-15 22:35:37'),
(221, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY2MzE1NX0.z0H7JqEs4QqCJm2NoaZ9_AUQrcgVliDeMzJEBmQ9XFs', '2025-03-22 17:05:55', '2025-03-15 22:35:55'),
(222, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjYzMjM2fQ.qoKaTwwUj93VIYeVhOgqJyu23dj9Dglmbe0ZW5wIx0w', '2025-03-22 17:07:16', '2025-03-15 22:37:16'),
(223, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI2NjMzMzF9.s7Oi6o4BVSeX5i28cX2P5MhUaROY-suMLi1CL9Tvq-Q', '2025-03-22 17:08:51', '2025-03-15 22:38:51'),
(224, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjYzMzUxfQ.X_eUwcJOjxhjCpuTPWUtSiV6hsoGIy5Ix0ys_j-JMec', '2025-03-22 17:09:11', '2025-03-15 22:39:11'),
(225, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjY0MTkzfQ.AIuU6bU91jDk163X3Y0cxeCKsoZ2sOO0VtbYzfBmCvU', '2025-03-22 17:23:13', '2025-03-15 22:53:13'),
(226, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjY0NTI4fQ.IWqk5tKOFRg0estIAKqW4wMYr6pxC950G5DNJJ8nL8Y', '2025-03-22 17:28:48', '2025-03-15 22:58:48'),
(227, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY2NDg2Mn0.ClRgiRy4iQoikEKom16OLOCjh2VL3PbfDTdG2L936ms', '2025-03-22 17:34:22', '2025-03-15 23:04:22'),
(228, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjY0ODgxfQ.siemn1kCjXE3xPqX9Z0Do_kcycUCVYUUAOtV9_zZuQ4', '2025-03-22 17:34:41', '2025-03-15 23:04:41'),
(233, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjY4NTYzfQ.aNDTdJRqfPZNayPzlw2D5fxj0-b1GjkfLVbRmGkovl0', '2025-03-22 18:36:03', '2025-03-16 00:06:03'),
(234, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY2ODU5MH0.2aSNN4QUMogjbQErQZOzZb7Ll7C29o-4ddQ5pneIJCs', '2025-03-22 18:36:30', '2025-03-16 00:06:30'),
(235, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjY4OTQ0fQ.bVsfWrC-kDXRRXMhKLN6ncUHnTnyHDp237kIomx0Apw', '2025-03-22 18:42:24', '2025-03-16 00:12:24'),
(236, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY2OTAxMn0.KbM4yi_0srcqxvCLg90LtWw38TMuxGvY2IdAnLZHM4w', '2025-03-22 18:43:32', '2025-03-16 00:13:32'),
(239, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjcwMTA0fQ.AhcZB-6HnT6yKNDgVK5B9DYp0PQg9C704Uomlh98X0Q', '2025-03-22 19:01:44', '2025-03-16 00:31:44'),
(242, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjcyOTEzfQ.ZT1kZeRAh5NmpryA8m2oRor8Fm6O3-XwJeKxpJ8VGZM', '2025-03-22 19:48:33', '2025-03-16 01:18:33'),
(243, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY3MzQxNH0.4m1aXcn6pShIR5UIzuvUkoUT8kWLWHDqu7K6cfNKv7c', '2025-03-22 19:56:54', '2025-03-16 01:26:54'),
(244, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjczNTQ2fQ.89WNoRHKHiUQLc4CCFRWtKI1vfRH-ispsNZ3HQUuET4', '2025-03-22 19:59:06', '2025-03-16 01:29:06'),
(248, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjY3Njk4M30.U79jm38hQOBFt_0K_suRk4zm7or0zljwSRrc1JzVZ54', '2025-03-22 20:56:23', '2025-03-16 02:26:23'),
(250, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNjc4NzEyfQ.x7NDWim94eqyzmA-aCnD_gAQRVPTO4njXSB9xWxzllo', '2025-03-22 21:25:12', '2025-03-16 02:55:12'),
(255, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjcyNjA5M30.XTUoH68nGsz_6K16pIbhcGcEE-RAoEreMR-_xHDj7oE', '2025-03-23 10:34:53', '2025-03-16 16:04:53'),
(256, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzI2MTE5fQ.3CQODtNVXoHJ6FSxR8VpACqjJ8m4izCP3bA-0-1mpsk', '2025-03-23 10:35:19', '2025-03-16 16:05:19'),
(257, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzI2MTc0fQ.OISejAzWV942P5H7S6r5-CKBBGOyBOBsLj6yxQoqMB0', '2025-03-23 10:36:14', '2025-03-16 16:06:14'),
(259, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI3MjkxOTZ9.5-9rCUZVHU-mBKdprg8NC2TrwzjMD-vbKsbQ5NF5kKw', '2025-03-23 11:26:36', '2025-03-16 16:56:36'),
(260, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzI5MjEzfQ.Db6prUrQ9o_51SDIBSX-3dl07A75AS8dQDP9fex9pL0', '2025-03-23 11:26:53', '2025-03-16 16:56:53'),
(261, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzMxMDgxfQ.WRQY1wEoiwmIVur0Wv3GcDh1b-Euo0rYxmcrM3qXQKE', '2025-03-23 11:58:01', '2025-03-16 17:28:01'),
(263, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzMzNTk0fQ.rw1ANBb3s1UJvG3Z8N49dko9vXZyGS-Aq6KLTczSgU0', '2025-03-23 12:39:54', '2025-03-16 18:09:54'),
(272, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjczNzk0NH0.QKoy5xlpAQyjoxKlATA-PAHvDv7WJV9e1KDAL-sn1HQ', '2025-03-23 13:52:24', '2025-03-16 19:22:24'),
(274, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0MjczOTgwMn0.fLTO4i5fhe0RRMLkOyBiD-S2aV2s53ImjX3ocOTaBH0', '2025-03-23 14:23:22', '2025-03-16 19:53:22'),
(286, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0Mjc0ODY5Nn0.lIfBscC1SLQNRkEwEWXTpFon0OP8vf13aVloWvK6c7Y', '2025-03-23 16:51:36', '2025-03-16 22:21:36'),
(287, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzQ5MzA1fQ._10Pqhma8G0_mMdnMst242wHGkekJ-XSoIzwgKpP37Q', '2025-03-23 17:01:45', '2025-03-16 22:31:45'),
(288, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0Mjc0OTMyOH0.2a0Ip9OMW8JUzsQa7sLvmuyvc1PMBaHKukKei1mxUUc', '2025-03-23 17:02:08', '2025-03-16 22:32:08'),
(290, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI3NTM1NjR9._qgxS_thUf8HuJr8TWl9eD7ughDmGcXf3ERDa7IRzQs', '2025-03-23 18:12:44', '2025-03-16 23:42:44'),
(291, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0Mjc1MzU4NH0.P9aTfE0r3Ez8U_n7J0zroMTLh7zINWm_U3DFzhd6F4s', '2025-03-23 18:13:04', '2025-03-16 23:43:04'),
(293, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0Mjc1NTQ5Mn0.ECLpNPiKFO0DMu8KUpjNcvm_9ctmkRuB1lTvNfbeB4I', '2025-03-23 18:44:52', '2025-03-17 00:14:52'),
(298, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0Mjc2MDU3MX0.bZj2yHNZ5yRJs0oiraW2QlObNdCHJRdmwYD3a4AQZvI', '2025-03-23 20:09:31', '2025-03-17 01:39:31'),
(299, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzYwNTkxfQ.mKtmExy0QgisgshKIXHFQU6YhOIgTQMUivrkXrMi84I', '2025-03-23 20:09:51', '2025-03-17 01:39:51'),
(304, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzY0MjQwfQ.Jn4qz52EoksIRY-PDAjVc4gh81m5iHo2NaxHpngnU38', '2025-03-23 21:10:40', '2025-03-17 02:40:40'),
(307, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6Im5nbyIsImV4cCI6MTc0Mjc2NjA5Mn0.6tpGA91CrbHgDr5z5DzWRtlZnqObmPz9xERIzAaOD88', '2025-03-23 21:41:32', '2025-03-17 03:11:32'),
(308, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI3NjYxMjR9.myWX4tMAUMrfr26WclPUKduOzvfrrcjnpupy-svH1Cw', '2025-03-23 21:42:04', '2025-03-17 03:12:04'),
(311, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzY2ODI2fQ.QDmfevcIFYcbCrflvuFI6OIofu_4jajWtAn5cTLDqz0', '2025-03-23 21:53:46', '2025-03-17 03:23:46'),
(314, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI3Njg4MzV9.BJvh9ZWftPzHl5SFInWq_Fj0H8fjJT4JEtSjVOb8wEY', '2025-03-23 22:27:15', '2025-03-17 03:57:15'),
(315, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzY4OTc0fQ.wZccuuyIm0s0Y7FdUN8obg57fuQ-S44DyjYJfaI5Z2c', '2025-03-23 22:29:34', '2025-03-17 03:59:34'),
(317, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI3NjkxMzJ9.-wCOD5ZODrAqtnPae8DROIvgpj_gpx9uYp8xF5ZxzgE', '2025-03-23 22:32:12', '2025-03-17 04:02:12'),
(321, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQyNzcyMjQ0fQ.1AokoJpAQrHBvPUyXVYTaT_KE-Xl6ETfyCgXkHsEf2A', '2025-03-23 23:24:04', '2025-03-17 04:54:04'),
(324, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI3NzQyODB9.kd5yfRHDyE_jDPZVeh_ShDCJFRnJBtEqT8WjFnm8wu0', '2025-03-23 23:58:00', '2025-03-17 05:28:00'),
(340, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNCIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzQyODAzMjczfQ.FODF9RgpV_1qh2leKT8mKV1M_mHfBQ-fUOFlJHTczvU', '2025-03-24 08:01:13', '2025-03-17 13:31:13'),
(362, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDI4ODc4MDd9.R7yeyWgm3E5pxpNtPUlUVZ6uC4sBD5lKmhIq-12KhXc', '2025-03-25 07:30:07', '2025-03-18 13:00:07'),
(369, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NDQ2OTc5MDl9.WtGUlkSRAUlUgCrk92bmjMvWWTVI_mc-RxOH5wgPFMs', '2025-04-15 06:18:29', '2025-04-08 11:48:29');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `universal_user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `order_item_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `universal_user_id`, `product_id`, `order_item_id`, `rating`, `comment`, `created_at`) VALUES
(6, 14, 15, 22, 3, 'Nice Product', '2025-03-17 08:25:07'),
(7, 1, 20, 25, 3, 'test', '2025-03-17 09:59:52'),
(8, 1, 15, 26, 3, 'tyg', '2025-03-18 07:30:35');

-- --------------------------------------------------------

--
-- Table structure for table `universal_users`
--

CREATE TABLE `universal_users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','ngo','admin') NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT NULL,
  `contact_verified` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `universal_users`
--

INSERT INTO `universal_users` (`id`, `first_name`, `last_name`, `contact_number`, `email`, `password`, `role`, `created_at`, `updated_at`, `email_verified`, `contact_verified`) VALUES
(1, 'Simarjeet', 'Singh Arora', '7566262222', 'simarjeetsingharora15@gmail.com', '$2b$12$HC3/IVJMZJJOEXp1uHbTIeiG/SAo6zs.AVo4V30LcTB/OCMVMVKV.', 'user', '2025-03-06 06:59:16', '2025-03-16 15:25:41', 1, 1),
(2, 'Simarjeet', 'Singh Arora', '9981045796', 'simarjeetsingharora37@gmail.com', '$2b$12$IEgxyaoZ58Z6Imt902doDOQMlcqHyhmLBmm/CidrB27p87lGeZ2U2', 'admin', '2025-03-06 07:00:53', '2025-03-06 07:01:28', 1, 1),
(3, 'Simarjeet', 'Singh Arora', '7566269346', 'simarjeetsinghtv@gmail.com', '$2b$12$XP8j3KaRpzA9WmQZaYFoVuSUeWa/euQ36FeVLMqqgJ6N/92TuSZO6', 'ngo', '2025-03-06 07:06:53', '2025-03-06 07:07:20', 1, 1),
(13, 'Test ', 'User', '8602278300', 'test@ngo.com', '$2b$12$NOUi07NX7GRVB7EFPQ97oOK2./21VGqsJjU1psJ49IRMNqF7hR3nu', 'ngo', '2025-03-17 07:13:47', '2025-03-17 07:15:49', 1, 1),
(14, 'Tanishq', 'Pawar', '9826609400', 'tanishqpawar220371@acropolis.in', '$2b$12$OS8bZxM3e4ullrKlEy0VP.DSprhTF5aQEyYui3PYN0AOFWbRpginS', 'user', '2025-03-17 07:56:32', '2025-03-17 07:57:00', 1, 0),
(15, 'Simarjeet', 'Singh', '9826687066', 'shilpabhalerao@acropolis.in', '$2b$12$Kq2idn9os2fobu9w9cBM0uqiDJKIKhKWvpGSWN3BV7Bvv/ge58n4e', 'ngo', '2025-03-17 09:30:11', '2025-03-17 09:31:50', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(15, 1, 15, '2025-03-17 09:56:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `universal_user_id` (`universal_user_id`),
  ADD KEY `ix_addresses_id` (`id`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `universal_user_id` (`universal_user_id`),
  ADD KEY `ix_carts_id` (`id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ix_cart_items_id` (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `universal_user_id` (`universal_user_id`),
  ADD KEY `ix_categories_id` (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `ix_coupons_id` (`id`);

--
-- Indexes for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `_user_coupon_uc` (`user_id`,`coupon_id`),
  ADD KEY `coupon_id` (`coupon_id`),
  ADD KEY `ix_coupon_usages_id` (`id`);

--
-- Indexes for table `ngos`
--
ALTER TABLE `ngos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ngo_name` (`ngo_name`),
  ADD KEY `universal_user_id` (`universal_user_id`),
  ADD KEY `ix_ngos_id` (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `ix_orders_id` (`id`),
  ADD KEY `fk_orders_universal_user` (`universal_user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `review_id` (`review_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ix_order_items_id` (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_password_reset_tokens_token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_password_reset_tokens_id` (`id`);

--
-- Indexes for table `payouts`
--
ALTER TABLE `payouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `universal_user_id` (`universal_user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `universal_user_id` (`universal_user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `ix_products_id` (`id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ix_product_images_id` (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `universal_user_id` (`universal_user_id`),
  ADD KEY `ix_refresh_tokens_id` (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_item_id` (`order_item_id`),
  ADD KEY `ix_reviews_id` (`id`),
  ADD KEY `idx_reviews_product` (`product_id`),
  ADD KEY `idx_reviews_user` (`universal_user_id`);

--
-- Indexes for table `universal_users`
--
ALTER TABLE `universal_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `contact_number` (`contact_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ix_universal_users_id` (`id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ix_wishlist_id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ngos`
--
ALTER TABLE `ngos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payouts`
--
ALTER TABLE `payouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=376;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `universal_users`
--
ALTER TABLE `universal_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD CONSTRAINT `coupon_usages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `universal_users` (`id`),
  ADD CONSTRAINT `coupon_usages_ibfk_2` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`);

--
-- Constraints for table `ngos`
--
ALTER TABLE `ngos`
  ADD CONSTRAINT `ngos_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_universal_user` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payouts`
--
ALTER TABLE `payouts`
  ADD CONSTRAINT `payouts_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`universal_user_id`) REFERENCES `universal_users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`);

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `universal_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
