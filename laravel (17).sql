-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 01:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laravel`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `source_type` varchar(50) NOT NULL,
  `source_id` bigint(20) UNSIGNED NOT NULL,
  `entry_type` varchar(50) NOT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `due_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `payment_status` varchar(30) NOT NULL DEFAULT 'unpaid',
  `transaction_date` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `warehouse_id`, `brand_id`, `source_type`, `source_id`, `entry_type`, `reference`, `total_amount`, `paid_amount`, `due_amount`, `payment_status`, `transaction_date`, `note`, `meta`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 'purchase', 1, 'purchase_payable', 'p_o_001', 45.00, 0.00, 45.00, 'unpaid', '2026-07-02', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-18 03:47:53', '2026-07-01 23:46:42'),
(2, 2, 2, 'purchase', 2, 'purchase_payable', 'p_o_005', 30.00, 0.00, 30.00, 'unpaid', '2026-07-02', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-18 03:48:13', '2026-07-02 01:07:03'),
(3, 2, 2, 'sell', 1, 'sell_receivable', 'p_o_001', 45.00, 0.00, 45.00, 'unpaid', '2026-07-02', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-06-18 03:52:56', '2026-07-01 23:45:29'),
(4, 2, 2, 'sell', 2, 'sell_receivable', 'p_o_005', 30.00, 0.00, 30.00, 'unpaid', '2026-07-02', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-06-18 03:57:28', '2026-07-02 01:05:58'),
(5, 5, 2, 'retail_sale', 1, 'retail_receivable', 'RET-FEC1BA60', 30.00, 30.00, 0.00, 'paid', '2026-06-18', NULL, '{\"payment_method\":\"cash\",\"sold_by\":6}', '2026-06-18 05:00:57', '2026-06-18 05:00:57'),
(6, 2, 2, 'purchase', 3, 'purchase_payable', '258963', 30.00, 0.00, 30.00, 'unpaid', '2026-07-02', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-18 05:21:08', '2026-07-02 01:12:02'),
(7, 2, 2, 'sell', 3, 'sell_receivable', '258963', 30.00, 0.00, 30.00, 'unpaid', '2026-07-02', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-06-18 05:21:29', '2026-07-02 01:10:59'),
(8, 2, 2, 'retail_sale', 2, 'retail_receivable', 'RET-19229A5E', 150.00, 150.00, 0.00, 'paid', '2026-06-24', NULL, '{\"payment_method\":\"cash\",\"sold_by\":2}', '2026-06-24 04:31:03', '2026-06-24 04:31:03'),
(9, 2, 2, 'retail_sale', 3, 'retail_receivable', 'RET-5743CBDF', 30.00, 30.00, 0.00, 'paid', '2026-06-24', NULL, '{\"payment_method\":\"cash\",\"sold_by\":2}', '2026-06-24 04:46:49', '2026-06-24 04:46:49'),
(10, 2, 2, 'purchase', 4, 'purchase_payable', 'po-005', 45.00, 0.00, 45.00, 'unpaid', '2026-07-04', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-27 16:18:13', '2026-07-03 22:08:08'),
(11, 2, 2, 'sell', 4, 'sell_receivable', 'po-005', 45.00, 0.00, 45.00, 'unpaid', '2026-07-04', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-06-27 16:19:15', '2026-07-03 22:06:27'),
(12, 2, 2, 'purchase', 5, 'purchase_payable', '258963-pooiu90900', 45.00, 0.00, 45.00, 'unpaid', '2026-07-04', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-28 00:19:59', '2026-07-04 01:34:59'),
(13, 2, 3, 'purchase', 6, 'purchase_payable', 'po-multi-order', 120.00, 0.00, 120.00, 'unpaid', '2026-07-05', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-28 00:20:07', '2026-07-04 22:27:38'),
(14, 2, 3, 'purchase', 7, 'purchase_payable', 'po-multi-order-065', 200.00, 0.00, 200.00, 'unpaid', '2026-07-05', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-06-28 00:22:51', '2026-07-05 00:30:21'),
(15, 2, 2, 'sell', 5, 'sell_receivable', '258963-pooiu90900', 45.00, 0.00, 45.00, 'unpaid', '2026-07-04', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-06-28 00:23:41', '2026-07-04 01:32:13'),
(16, 2, 2, 'retail_sale', 4, 'retail_receivable', 'RET-43370B48', 30.00, 30.00, 0.00, 'paid', '2026-06-28', NULL, '{\"payment_method\":\"cash\",\"sold_by\":2}', '2026-06-28 01:47:47', '2026-06-28 01:47:47'),
(17, 2, 2, 'retail_sale', 5, 'retail_receivable', 'RET-BEABE692', 30.00, 30.00, 0.00, 'paid', '2026-06-28', NULL, '{\"payment_method\":\"cash\",\"sold_by\":2}', '2026-06-28 02:46:36', '2026-06-28 02:46:36'),
(18, 2, 3, 'purchase', 8, 'purchase_payable', 'po-multi-order-3444', 0.00, 0.00, 0.00, 'unpaid', '2026-07-05', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-07-01 06:50:46', '2026-07-05 03:23:44'),
(19, 2, 3, 'sell', 6, 'sell_receivable', 'po-multi-order', 60.00, 0.00, 60.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-07-01 06:52:00', '2026-07-04 22:24:12'),
(20, 2, 2, 'purchase', 9, 'purchase_payable', 'aserqaaaaa', 0.00, 0.00, 0.00, 'unpaid', '2026-07-05', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-07-01 06:58:57', '2026-07-05 03:58:16'),
(21, 2, 3, 'sell', 7, 'sell_receivable', 'po-multi-order', 60.00, 0.00, 60.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":3}', '2026-07-01 06:59:21', '2026-07-04 22:24:12'),
(22, 2, 2, 'purchase', 10, 'purchase_payable', 'apsdpfosds', 0.00, 0.00, 0.00, 'unpaid', '2026-07-05', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-07-01 07:22:23', '2026-07-05 04:06:59'),
(23, 2, 3, 'sell', 8, 'sell_receivable', 'po-multi-order-065', 40.00, 0.00, 40.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-07-01 07:22:45', '2026-07-05 00:26:27'),
(24, 2, 3, 'sell', 9, 'sell_receivable', 'po-multi-order-065', 40.00, 0.00, 40.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":3}', '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(25, 2, 3, 'sell', 10, 'sell_receivable', 'po-multi-order-065', 40.00, 0.00, 40.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":4}', '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(26, 2, 3, 'sell', 11, 'sell_receivable', 'po-multi-order-065', 40.00, 0.00, 40.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":5}', '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(27, 2, 3, 'sell', 12, 'sell_receivable', 'po-multi-order-065', 40.00, 0.00, 40.00, 'unpaid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":6}', '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(28, 2, 3, 'recurring_payment', 1, 'purchase_payment', 'po-multi-order-065', 200.00, 200.00, 0.00, 'paid', '2026-07-05', NULL, '{\"purchase_id\":7,\"purchase_payment_status\":\"paid\",\"purchase_due_amount\":0,\"frequency\":\"manual\"}', '2026-07-05 01:38:34', '2026-07-05 01:38:34'),
(29, 2, 3, 'sell', 13, 'sell_receivable', 'po-multi-order-3444', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(30, 2, 3, 'sell', 14, 'sell_receivable', 'po-multi-order-3444', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":3}', '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(31, 2, 3, 'sell', 15, 'sell_receivable', 'po-multi-order-3444', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":4}', '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(32, 2, 3, 'sell', 16, 'sell_receivable', 'po-multi-order-3444', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":5}', '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(33, 2, 3, 'sell', 17, 'sell_receivable', 'po-multi-order-3444', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":6}', '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(34, 2, 2, 'sell', 18, 'sell_receivable', 'aserqaaaaa', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":9}', '2026-07-05 03:57:14', '2026-07-05 03:57:14'),
(35, 2, 2, 'sell', 19, 'sell_receivable', 'apsdpfosds', 0.00, 0.00, 0.00, 'paid', '2026-07-05', NULL, '{\"sold_to\":5,\"product_id\":9}', '2026-07-05 04:03:43', '2026-07-05 04:03:43'),
(36, 2, 2, 'purchase', 11, 'purchase_payable', 'po-0094-009', 0.00, 0.00, 0.00, 'unpaid', '2026-07-06', NULL, '{\"purchase_to\":5,\"purchase_status\":\"received\"}', '2026-07-05 23:05:21', '2026-07-05 23:38:45'),
(37, 2, 2, 'sell', 20, 'sell_receivable', 'po-0094-009', 0.00, 0.00, 0.00, 'paid', '2026-07-06', NULL, '{\"sold_to\":5,\"product_id\":1}', '2026-07-05 23:10:03', '2026-07-05 23:10:03');

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `batch_uuid` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(1, 'style', 'created', 'App\\Models\\Style', 'created', 4, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Test Product 001\",\"description\":null,\"fabric_id\":3,\"gender_id\":1,\"warehouse_id\":2,\"season_id\":1,\"cover_image\":\"uploads\\/products\\/bChRcEnKvkeCcEAiAugQZA4fPUdXjz3xMTltd6TB.webp\",\"gallery_images\":[]}}', NULL, '2026-05-26 00:35:15', '2026-05-26 00:35:15'),
(2, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Test Product 001\",\"available_stock\":0,\"description\":null,\"color_id\":5,\"fabric_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE001-780-M-BLACK\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/bChRcEnKvkeCcEAiAugQZA4fPUdXjz3xMTltd6TB.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 00:35:15', '2026-05-26 00:35:15'),
(3, 'product', 'created', 'App\\Models\\Product', 'created', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Test Product 001\",\"available_stock\":0,\"description\":null,\"color_id\":4,\"fabric_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE001-780-M-BLUE\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/bChRcEnKvkeCcEAiAugQZA4fPUdXjz3xMTltd6TB.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 00:44:46', '2026-05-26 00:44:46'),
(4, 'Category', 'created', 'App\\Models\\Category', 'created', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"T-Shirt\"}}', NULL, '2026-05-26 01:06:18', '2026-05-26 01:06:18'),
(5, 'Category', 'updated', 'App\\Models\\Category', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"T-Shirt\"},\"old\":{\"name\":\"Hoodie\"}}', NULL, '2026-05-26 01:06:51', '2026-05-26 01:06:51'),
(6, 'Category', 'updated', 'App\\Models\\Category', 'updated', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Under Shirt\"},\"old\":{\"name\":\"T-Shirt\"}}', NULL, '2026-05-26 01:07:03', '2026-05-26 01:07:03'),
(7, 'Category', 'created', 'App\\Models\\Category', 'created', 3, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Hoodie\"}}', NULL, '2026-05-26 01:07:16', '2026-05-26 01:07:16'),
(8, 'Category', 'created', 'App\\Models\\Category', 'created', 4, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Sweat Shirt\"}}', NULL, '2026-05-26 01:07:24', '2026-05-26 01:07:24'),
(9, 'Category', 'created', 'App\\Models\\Category', 'created', 5, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Jacket\"}}', NULL, '2026-05-26 01:07:56', '2026-05-26 01:07:56'),
(10, 'Category', 'created', 'App\\Models\\Category', 'created', 6, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Vest\"}}', NULL, '2026-05-26 01:08:06', '2026-05-26 01:08:06'),
(11, 'Category', 'created', 'App\\Models\\Category', 'created', 7, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Shorts\"}}', NULL, '2026-05-26 01:08:16', '2026-05-26 01:08:16'),
(12, 'Category', 'created', 'App\\Models\\Category', 'created', 8, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Joggers\"}}', NULL, '2026-05-26 01:08:27', '2026-05-26 01:08:27'),
(13, 'Category', 'created', 'App\\Models\\Category', 'created', 9, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Tank Tops\"}}', NULL, '2026-05-26 01:11:10', '2026-05-26 01:11:10'),
(14, 'style', 'updated', 'App\\Models\\Style', 'updated', 4, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\"},\"old\":{\"name\":\"Test Product 001\",\"cover_image\":\"uploads\\/products\\/bChRcEnKvkeCcEAiAugQZA4fPUdXjz3xMTltd6TB.webp\"}}', NULL, '2026-05-26 01:17:42', '2026-05-26 01:17:42'),
(15, 'product', 'updated', 'App\\Models\\Product', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\"},\"old\":{\"name\":\"Test Product 001\",\"cover_image\":\"uploads\\/products\\/bChRcEnKvkeCcEAiAugQZA4fPUdXjz3xMTltd6TB.webp\"}}', NULL, '2026-05-26 01:17:42', '2026-05-26 01:17:42'),
(16, 'product', 'updated', 'App\\Models\\Product', 'updated', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\"},\"old\":{\"name\":\"Test Product 001\",\"cover_image\":\"uploads\\/products\\/bChRcEnKvkeCcEAiAugQZA4fPUdXjz3xMTltd6TB.webp\"}}', NULL, '2026-05-26 01:17:42', '2026-05-26 01:17:42'),
(17, 'color', 'deleted', 'App\\Models\\Color', 'deleted', 6, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"Smoky Heather\",\"color_code\":\"SMKHT\"}}', NULL, '2026-05-26 01:21:41', '2026-05-26 01:21:41'),
(18, 'color', 'deleted', 'App\\Models\\Color', 'deleted', 3, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"Red\",\"color_code\":\"red\"}}', NULL, '2026-05-26 01:21:43', '2026-05-26 01:21:43'),
(19, 'color', 'deleted', 'App\\Models\\Color', 'deleted', 4, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"Blue\",\"color_code\":\"blue\"}}', NULL, '2026-05-26 01:21:46', '2026-05-26 01:21:46'),
(20, 'color', 'deleted', 'App\\Models\\Color', 'deleted', 5, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"Black\",\"color_code\":\"black\"}}', NULL, '2026-05-26 01:21:48', '2026-05-26 01:21:48'),
(21, 'color', 'created', 'App\\Models\\Color', 'created', 7, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Mountain Blue\",\"color_code\":null}}', NULL, '2026-05-26 01:21:57', '2026-05-26 01:21:57'),
(22, 'color', 'created', 'App\\Models\\Color', 'created', 8, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Gray\",\"color_code\":null}}', NULL, '2026-05-26 01:23:56', '2026-05-26 01:23:56'),
(23, 'color', 'created', 'App\\Models\\Color', 'created', 9, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Black\",\"color_code\":null}}', NULL, '2026-05-26 01:27:37', '2026-05-26 01:27:37'),
(24, 'color', 'created', 'App\\Models\\Color', 'created', 10, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"White\",\"color_code\":null}}', NULL, '2026-05-26 01:27:55', '2026-05-26 01:27:55'),
(25, 'product', 'created', 'App\\Models\\Product', 'created', 3, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"available_stock\":0,\"description\":null,\"color_id\":7,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"STYLE001-780-L-COLOR7\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 01:32:21', '2026-05-26 01:32:21'),
(26, 'product', 'created', 'App\\Models\\Product', 'created', 4, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"STYLE001-780-L-COLOR8\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 01:32:21', '2026-05-26 01:32:21'),
(27, 'product', 'created', 'App\\Models\\Product', 'created', 5, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"STYLE001-780-L-COLOR9\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 01:32:21', '2026-05-26 01:32:21'),
(28, 'product', 'created', 'App\\Models\\Product', 'created', 6, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"available_stock\":0,\"description\":null,\"color_id\":10,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"STYLE001-780-L-COLOR10\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 01:32:21', '2026-05-26 01:32:21'),
(29, 'product', 'deleted', 'App\\Models\\Product', 'deleted', 2, 'App\\Models\\User', 5, '{\"old\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"available_stock\":0,\"description\":null,\"color_id\":4,\"fabric_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE001-780-M-BLUE\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 01:32:39', '2026-05-26 01:32:39'),
(30, 'product', 'deleted', 'App\\Models\\Product', 'deleted', 1, 'App\\Models\\User', 5, '{\"old\":{\"brand_id\":4,\"category_id\":1,\"style_id\":4,\"style_number\":\"style 001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts with zipped pocket \\u2013 Slim Fit\",\"available_stock\":0,\"description\":null,\"color_id\":5,\"fabric_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE001-780-M-BLACK\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/iNmlJwL3QcYTq3DOyRG5c0MKJfPs0A3UrErXYwmD.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-05-26 01:32:43', '2026-05-26 01:32:43'),
(31, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 00:57:01', '2026-06-06 00:57:01'),
(32, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"POST\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 00:57:22', '2026-06-06 00:57:22'),
(33, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 00:57:22', '2026-06-06 00:57:22'),
(34, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 11, 'App\\Models\\User', 4, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-06 01:14:54', '2026-06-06 01:14:54'),
(35, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 02:46:49', '2026-06-06 02:46:49'),
(36, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 02:46:55', '2026-06-06 02:46:55'),
(37, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\\/1\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 02:46:56', '2026-06-06 02:46:56'),
(38, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 02:57:56', '2026-06-06 02:57:56'),
(39, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:21:07', '2026-06-06 03:21:07'),
(40, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"POST\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:21:18', '2026-06-06 03:21:18'),
(41, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:21:18', '2026-06-06 03:21:18'),
(42, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:57:01', '2026-06-06 03:57:01'),
(43, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:57:03', '2026-06-06 03:57:03'),
(44, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:57:04', '2026-06-06 03:57:04'),
(45, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"PUT\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:57:10', '2026-06-06 03:57:10'),
(46, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-06 03:57:11', '2026-06-06 03:57:11'),
(47, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 15, 'App\\Models\\User', 4, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"STYLE001-780-L-COLOR8\",\"STYLE001-780-L-COLOR8\",\"STYLE001-780-L-COLOR8\",\"STYLE001-780-L-COLOR8\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-06 03:58:41', '2026-06-06 03:58:41'),
(48, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-17 23:05:12', '2026-06-17 23:05:12'),
(49, 'style', 'deleted', 'App\\Models\\Style', 'deleted', 3, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"Admin\"}}', NULL, '2026-06-17 23:15:40', '2026-06-17 23:15:40'),
(50, 'style', 'deleted', 'App\\Models\\Style', 'deleted', 2, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"asdfsdfsd\"}}', NULL, '2026-06-17 23:15:44', '2026-06-17 23:15:44'),
(51, 'style', 'deleted', 'App\\Models\\Style', 'deleted', 1, 'App\\Models\\User', 5, '{\"old\":{\"name\":\"Test 002\"}}', NULL, '2026-06-17 23:15:46', '2026-06-17 23:15:46'),
(52, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":2,\"category_id\":5,\"style_number\":\"wb001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Test Product 001\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"WB001-780-M-COLOR8\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/IiEQfJ9nPCJblLIZwt21qpgnb6ljz7Z0fOkVZbrR.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-17 23:37:37', '2026-06-17 23:37:37'),
(53, 'product', 'created', 'App\\Models\\Product', 'created', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"112\",\"hs_number\":\"asdfasdfasdfasdf\",\"ref_number\":\"yh11780\",\"name\":\"Admin\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"size_id\":2,\"gender_id\":1,\"barCode\":\"112-780-S-COLOR8\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/WnVxLOI3rxPygLJZy91cuvclwaZHT4vlFWZ3IxNI.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-17 23:48:45', '2026-06-17 23:48:45'),
(54, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":2,\"quantity\":200,\"purchase_price\":30,\"selling_price\":30,\"line_total\":6000}],\"subtotal\":\"6000.00\",\"total_amount\":\"6000.00\",\"paid_amount\":\"2000.00\",\"due_amount\":\"4000.00\",\"payment_status\":\"partial\",\"payment_method\":\"bank\",\"po_number\":\"258963\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 00:03:04', '2026-06-18 00:03:04'),
(55, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-18 00:06:05', '2026-06-18 00:06:05'),
(56, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"products\":[{\"product_id\":2,\"quantity\":200,\"purchase_price\":3,\"selling_price\":3,\"line_total\":600}],\"subtotal\":\"600.00\",\"total_amount\":\"600.00\",\"paid_amount\":\"20.00\",\"due_amount\":\"580.00\"},\"old\":{\"products\":[{\"product_id\":2,\"quantity\":200,\"purchase_price\":30,\"selling_price\":30,\"line_total\":6000}],\"subtotal\":\"6000.00\",\"total_amount\":\"6000.00\",\"paid_amount\":\"2000.00\",\"due_amount\":\"4000.00\"}}', NULL, '2026-06-18 00:06:51', '2026-06-18 00:06:51'),
(57, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 00:07:16', '2026-06-18 00:07:16'),
(58, 'sell', 'created', 'App\\Models\\Sell', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":1,\"selling_from\":2,\"sold_to\":5,\"product_id\":2,\"quantity\":200,\"po_number\":\"258963\",\"purchase_price\":\"3.00\",\"selling_price\":\"3.00\",\"status\":\"approved\"}}', NULL, '2026-06-18 00:07:16', '2026-06-18 00:07:16'),
(59, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"sfgsfgfwer323432\",\"p_o_number\":\"1\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 00:07:52', '2026-06-18 00:07:52'),
(60, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":17,\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"stocks\":20,\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]}}', NULL, '2026-06-18 00:08:08', '2026-06-18 00:08:08'),
(61, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-18 00:08:08', '2026-06-18 00:08:08'),
(62, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-18 00:08:30', '2026-06-18 00:08:30'),
(63, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-06-18 00:08:55', '2026-06-18 00:08:55'),
(64, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":3,\"buying_price\":\"3.00\",\"selling_price\":\"3.00\",\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"stocks\":0,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-18 00:09:06', '2026-06-18 00:09:06'),
(65, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-06-18T06:09:06.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 00:09:06', '2026-06-18 00:09:06'),
(66, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":3,\"products\":[{\"product_id\":2,\"quantity\":5,\"purchase_price\":30,\"selling_price\":30,\"line_total\":150}],\"subtotal\":\"150.00\",\"total_amount\":\"150.00\",\"paid_amount\":\"30.00\",\"due_amount\":\"120.00\",\"payment_status\":\"partial\",\"payment_method\":\"bank\",\"po_number\":\"p_o_001\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 00:10:15', '2026-06-18 00:10:15'),
(67, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":2,\"quantity\":3,\"purchase_price\":30,\"selling_price\":30,\"line_total\":90}],\"subtotal\":\"90.00\",\"total_amount\":\"90.00\",\"paid_amount\":\"30.00\",\"due_amount\":\"60.00\",\"payment_status\":\"partial\",\"payment_method\":\"bank\",\"po_number\":\"sdfsdf32432\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 00:34:11', '2026-06-18 00:34:11'),
(68, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 00:34:31', '2026-06-18 00:34:31'),
(69, 'sell', 'created', 'App\\Models\\Sell', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":3,\"selling_from\":2,\"sold_to\":5,\"product_id\":2,\"quantity\":3,\"po_number\":\"sdfsdf32432\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-18 00:34:31', '2026-06-18 00:34:31'),
(70, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"sfgsfgf\",\"p_o_number\":\"3\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 00:34:39', '2026-06-18 00:34:39'),
(71, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":14,\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"stocks\":17,\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]}}', NULL, '2026-06-18 00:35:15', '2026-06-18 00:35:15'),
(72, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-18 00:35:15', '2026-06-18 00:35:15'),
(73, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-18 00:35:25', '2026-06-18 00:35:25'),
(74, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-06-18 00:36:01', '2026-06-18 00:36:01'),
(75, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":6,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]},\"old\":{\"stocks\":3,\"buying_price\":\"3.00\",\"selling_price\":\"3.00\",\"barcode\":[\"112-780-S-COLOR8\",\"112-780-S-COLOR8\",\"112-780-S-COLOR8\"]}}', NULL, '2026-06-18 00:36:11', '2026-06-18 00:36:11'),
(76, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-06-18T06:36:11.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 00:36:11', '2026-06-18 00:36:11'),
(77, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-18 01:34:21', '2026-06-18 01:34:21'),
(78, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Test one\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"112-780-M-COLOR9\",\"warehouse_id\":2,\"cover_image\":\"uploads\\/products\\/n5MdfgiTDbtk6Lzpd4b4ibR03AIXLEfnXYYn9EWl.webp\",\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-18 01:50:48', '2026-06-18 01:50:48'),
(79, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Test one\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":4,\"gender_id\":2,\"barCode\":\"112-780-L-COLOR9\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-18 01:55:35', '2026-06-18 01:55:35'),
(80, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Admin\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":4,\"gender_id\":2,\"barCode\":\"112-780-L-COLOR9\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-18 01:58:37', '2026-06-18 01:58:37'),
(81, 'product', 'created', 'App\\Models\\Product', 'created', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Admin\",\"available_stock\":0,\"description\":null,\"color_id\":7,\"fabric_id\":3,\"size_id\":4,\"gender_id\":2,\"barCode\":\"112-780-L-COLOR7\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-18 02:44:31', '2026-06-18 02:44:31'),
(82, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":10,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-18 02:47:54', '2026-06-18 02:47:54'),
(83, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"selling_price\":\"30.00\"},\"old\":{\"selling_price\":\"0.00\"}}', NULL, '2026-06-18 02:47:59', '2026-06-18 02:47:59'),
(84, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":5,\"purchase_price\":30,\"selling_price\":30,\"line_total\":150}],\"subtotal\":\"150.00\",\"total_amount\":\"150.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"150.00\",\"payment_status\":\"unpaid\",\"payment_method\":\"bank\",\"po_number\":\"p_o_001\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 03:00:43', '2026-06-18 03:00:43'),
(85, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 03:01:44', '2026-06-18 03:01:44'),
(86, 'sell', 'created', 'App\\Models\\Sell', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":1,\"selling_from\":2,\"sold_to\":5,\"product_id\":1,\"quantity\":5,\"po_number\":\"p_o_001\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-18 03:01:44', '2026-06-18 03:01:44'),
(87, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"sfgsfgfwer323432\",\"p_o_number\":\"1\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 03:01:50', '2026-06-18 03:01:50'),
(88, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"000000\",\"p_o_number\":\"1\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 03:03:58', '2026-06-18 03:03:58'),
(89, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"po_number\":\"p_o_009\"},\"old\":{\"po_number\":\"p_o_001\"}}', NULL, '2026-06-18 03:04:10', '2026-06-18 03:04:10'),
(90, 'sell', 'updated', 'App\\Models\\Sell', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"po_number\":\"p_o_009\"},\"old\":{\"po_number\":\"p_o_001\"}}', NULL, '2026-06-18 03:04:10', '2026-06-18 03:04:10'),
(91, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Admin\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"112-780-L-COLOR9\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":2}}', NULL, '2026-06-18 03:10:25', '2026-06-18 03:10:25'),
(92, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-18 03:14:15', '2026-06-18 03:14:15'),
(93, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"selling_price\":\"30.00\"},\"old\":{\"selling_price\":\"0.00\"}}', NULL, '2026-06-18 03:14:20', '2026-06-18 03:14:20'),
(94, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":20,\"purchase_price\":30,\"selling_price\":30,\"line_total\":600}],\"subtotal\":\"600.00\",\"total_amount\":\"600.00\",\"paid_amount\":\"100.00\",\"due_amount\":\"500.00\",\"payment_status\":\"partial\",\"payment_method\":\"bank\",\"po_number\":\"p_o_001\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 03:15:28', '2026-06-18 03:15:28'),
(95, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 03:17:06', '2026-06-18 03:17:06'),
(96, 'sell', 'updated', 'App\\Models\\Sell', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":20,\"po_number\":\"p_o_001\"},\"old\":{\"quantity\":5,\"po_number\":\"p_o_009\"}}', NULL, '2026-06-18 03:17:06', '2026-06-18 03:17:06'),
(97, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"sfgsfgf\",\"p_o_number\":\"1\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 03:17:12', '2026-06-18 03:17:12'),
(98, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":19,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":20,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:25:13', '2026-06-18 03:25:13'),
(99, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":1,\"product_code\":[\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-18 03:25:14', '2026-06-18 03:25:14'),
(100, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":11,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":19,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:26:47', '2026-06-18 03:26:47'),
(101, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":9,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":1,\"product_code\":[\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:26:47', '2026-06-18 03:26:47'),
(102, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":10,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":11,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:26:51', '2026-06-18 03:26:51'),
(103, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":10,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":9,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:26:51', '2026-06-18 03:26:51'),
(104, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"products\":[{\"product_id\":1,\"quantity\":10,\"purchase_price\":30,\"selling_price\":30,\"line_total\":300}],\"subtotal\":\"300.00\",\"total_amount\":\"300.00\",\"due_amount\":\"200.00\"},\"old\":{\"products\":[{\"product_id\":1,\"quantity\":20,\"purchase_price\":30,\"selling_price\":30,\"line_total\":600}],\"subtotal\":\"600.00\",\"total_amount\":\"600.00\",\"due_amount\":\"500.00\"}}', NULL, '2026-06-18 03:27:14', '2026-06-18 03:27:14'),
(105, 'sell', 'updated', 'App\\Models\\Sell', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":10},\"old\":{\"quantity\":20}}', NULL, '2026-06-18 03:27:14', '2026-06-18 03:27:14'),
(106, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-18 03:27:23', '2026-06-18 03:27:23'),
(107, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-06-18 03:30:42', '2026-06-18 03:30:42'),
(108, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":10,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-18 03:30:49', '2026-06-18 03:30:49'),
(109, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-06-18T09:30:49.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 03:30:49', '2026-06-18 03:30:49'),
(110, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":3,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Admin\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"112-780-L-COLOR9\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-18 03:44:48', '2026-06-18 03:44:48'),
(111, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-18 03:45:30', '2026-06-18 03:45:30'),
(112, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"stocks\":25,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"barcode\":[]}}', NULL, '2026-06-18 03:46:02', '2026-06-18 03:46:02'),
(113, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":5,\"purchase_price\":30,\"selling_price\":30,\"line_total\":150}],\"subtotal\":\"150.00\",\"total_amount\":\"150.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"150.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"ar1971ci\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 03:47:53', '2026-06-18 03:47:53'),
(114, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":3,\"products\":[{\"product_id\":1,\"quantity\":5,\"purchase_price\":30,\"selling_price\":30,\"line_total\":150}],\"subtotal\":\"150.00\",\"total_amount\":\"150.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"150.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"arviveranor\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 03:48:13', '2026-06-18 03:48:13'),
(115, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 03:52:56', '2026-06-18 03:52:56'),
(116, 'sell', 'created', 'App\\Models\\Sell', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":2,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":1,\"quantity\":5,\"po_number\":\"arviveranor\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-18 03:52:56', '2026-06-18 03:52:56'),
(117, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 001\",\"p_o_number\":\"2\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 03:54:31', '2026-06-18 03:54:31'),
(118, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":25,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:54:49', '2026-06-18 03:54:49'),
(119, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":5,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-18 03:54:49', '2026-06-18 03:54:49'),
(120, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 002\",\"p_o_number\":\"1\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 03:55:08', '2026-06-18 03:55:08'),
(121, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":15,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":20,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 03:55:19', '2026-06-18 03:55:19'),
(122, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":5,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-18 03:55:19', '2026-06-18 03:55:19'),
(123, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-18 03:57:24', '2026-06-18 03:57:24'),
(124, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 03:57:28', '2026-06-18 03:57:28'),
(125, 'sell', 'created', 'App\\Models\\Sell', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":1,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":5,\"po_number\":\"ar1971ci\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-18 03:57:28', '2026-06-18 03:57:28'),
(126, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-18 03:58:05', '2026-06-18 03:58:05'),
(127, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-06-18 03:59:56', '2026-06-18 03:59:56'),
(128, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":5,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-18 04:00:04', '2026-06-18 04:00:04');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(129, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-06-18T10:00:04.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 04:00:04', '2026-06-18 04:00:04'),
(130, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-06-18 04:01:40', '2026-06-18 04:01:40'),
(131, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":5,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-18 04:01:52', '2026-06-18 04:01:52'),
(132, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-06-18T10:01:52.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 04:01:52', '2026-06-18 04:01:52'),
(133, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":5,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 05:00:57', '2026-06-18 05:00:57'),
(134, 'retailSale', 'created', 'App\\Models\\RetailSale', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"reference_number\":\"RET-FEC1BA60\",\"warehouse_id\":5,\"brand_id\":2,\"sold_by\":6,\"items\":[{\"stock_id\":4,\"product_id\":1,\"product_name\":\"Admin\",\"barcode\":\"112-780-L-COLOR9\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}],\"total_amount\":\"30.00\",\"payment_method\":\"cash\",\"note\":null}}', NULL, '2026-06-18 05:00:57', '2026-06-18 05:00:57'),
(135, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}],\"subtotal\":\"60.00\",\"total_amount\":\"60.00\",\"paid_amount\":\"60.00\",\"due_amount\":\"0.00\",\"payment_status\":\"paid\",\"payment_method\":\"bank\",\"po_number\":\"9632588\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null}}', NULL, '2026-06-18 05:21:08', '2026-06-18 05:21:08'),
(136, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-18 05:21:29', '2026-06-18 05:21:29'),
(137, 'sell', 'created', 'App\\Models\\Sell', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":3,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":2,\"po_number\":\"9632588\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-18 05:21:29', '2026-06-18 05:21:29'),
(138, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"ssdfc234242342\",\"p_o_number\":\"3\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 05:21:48', '2026-06-18 05:21:48'),
(139, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":12,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":15,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 05:21:55', '2026-06-18 05:21:55'),
(140, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-18 05:21:55', '2026-06-18 05:21:55'),
(141, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-18 05:22:00', '2026-06-18 05:22:00'),
(142, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-06-18T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-06-18 05:22:23', '2026-06-18 05:22:23'),
(143, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":7,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":4,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-18 05:22:29', '2026-06-18 05:22:29'),
(144, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-06-18T11:22:29.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-18 05:22:29', '2026-06-18 05:22:29'),
(145, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}],\"subtotal\":\"60.00\",\"total_amount\":\"60.00\",\"paid_amount\":\"60.00\",\"due_amount\":\"0.00\",\"payment_status\":\"paid\",\"payment_method\":\"bank\",\"po_number\":\"p_o_001\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-24 00:50:34', '2026-06-24 00:50:34'),
(146, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 00:50:51', '2026-06-24 00:50:51'),
(147, 'sell', 'created', 'App\\Models\\Sell', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":1,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":2,\"po_number\":\"p_o_001\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-24 00:50:51', '2026-06-24 00:50:51'),
(148, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-24 00:50:51', '2026-06-24 00:50:51'),
(149, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 00:54:28', '2026-06-24 00:54:28'),
(150, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 00:54:54', '2026-06-24 00:54:54'),
(151, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 00:56:01', '2026-06-24 00:56:01'),
(152, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 00:56:40', '2026-06-24 00:56:40'),
(153, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 00:59:12', '2026-06-24 00:59:12'),
(154, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 00:59:50', '2026-06-24 00:59:50'),
(155, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 01:00:11', '2026-06-24 01:00:11'),
(156, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 01:00:24', '2026-06-24 01:00:24'),
(157, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 01:01:40', '2026-06-24 01:01:40'),
(158, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 01:01:49', '2026-06-24 01:01:49'),
(159, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 01:22:13', '2026-06-24 01:22:13'),
(160, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 01:25:36', '2026-06-24 01:25:36'),
(161, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 01:59:55', '2026-06-24 01:59:55'),
(162, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 02:00:08', '2026-06-24 02:00:08'),
(163, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\"},\"old\":{\"quickbooks_sync_status\":\"failed\"}}', NULL, '2026-06-24 02:00:08', '2026-06-24 02:00:08'),
(164, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"status\":\"pending\"},\"old\":{\"status\":\"approved\"}}', NULL, '2026-06-24 02:00:56', '2026-06-24 02:00:56'),
(165, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-24 02:01:22', '2026-06-24 02:01:22'),
(166, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":7,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":12,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-24 04:31:02', '2026-06-24 04:31:02'),
(167, 'retailSale', 'created', 'App\\Models\\RetailSale', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"reference_number\":\"RET-19229A5E\",\"warehouse_id\":2,\"brand_id\":2,\"sold_by\":2,\"items\":[{\"stock_id\":1,\"product_id\":1,\"product_name\":\"Admin\",\"barcode\":\"112-780-L-COLOR9\",\"quantity\":5,\"unit_price\":30,\"cartoon_id\":null,\"total\":150}],\"total_amount\":\"150.00\",\"payment_method\":\"cash\",\"note\":null}}', NULL, '2026-06-24 04:31:03', '2026-06-24 04:31:03'),
(168, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 2, NULL, NULL, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-24 04:37:02', '2026-06-24 04:37:02'),
(169, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 1, NULL, NULL, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-24 04:37:02', '2026-06-24 04:37:02'),
(170, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":6,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":7,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-24 04:46:49', '2026-06-24 04:46:49'),
(171, 'retailSale', 'created', 'App\\Models\\RetailSale', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"reference_number\":\"RET-5743CBDF\",\"warehouse_id\":2,\"brand_id\":2,\"sold_by\":2,\"items\":[{\"stock_id\":1,\"product_id\":1,\"product_name\":\"Admin\",\"barcode\":\"112-780-L-COLOR9\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}],\"total_amount\":\"30.00\",\"payment_method\":\"cash\",\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-24 04:46:49', '2026-06-24 04:46:49'),
(172, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-24 04:46:49', '2026-06-24 04:46:49'),
(173, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"30.00\"},\"old\":{\"buying_price\":\"0.00\"}}', NULL, '2026-06-25 05:50:33', '2026-06-25 05:50:33'),
(174, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}],\"subtotal\":\"60.00\",\"total_amount\":\"60.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"60.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po32424344444444\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-25 06:54:20', '2026-06-25 06:54:20'),
(175, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-25 06:54:41', '2026-06-25 06:54:41'),
(176, 'sell', 'created', 'App\\Models\\Sell', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":2,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":2,\"po_number\":\"po32424344444444\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-25 06:54:41', '2026-06-25 06:54:41'),
(177, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-25 06:54:41', '2026-06-25 06:54:41'),
(178, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 1971\",\"p_o_number\":\"2\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-25 06:54:51', '2026-06-25 06:54:51'),
(179, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":5,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":6,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-25 06:55:05', '2026-06-25 06:55:05'),
(180, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":1,\"product_code\":[\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-25 06:55:05', '2026-06-25 06:55:05'),
(181, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":5,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-25 06:55:10', '2026-06-25 06:55:10'),
(182, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":1,\"product_code\":[\"112-780-L-COLOR9\"]}}', NULL, '2026-06-25 06:55:10', '2026-06-25 06:55:10'),
(183, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 3, 'App\\Models\\User', 4, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":4,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}],\"subtotal\":\"60.00\",\"total_amount\":\"60.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"60.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-002345678\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-25 17:05:55', '2026-06-25 17:05:55'),
(184, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-25 17:06:39', '2026-06-25 17:06:39'),
(185, 'sell', 'created', 'App\\Models\\Sell', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":\"3\",\"selling_from\":\"2\",\"sold_to\":\"4\",\"brand_id\":\"2\",\"product_id\":\"1\",\"quantity\":2,\"po_number\":\"po-002345678\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-25 17:06:39', '2026-06-25 17:06:39'),
(186, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-25 17:06:39', '2026-06-25 17:06:39'),
(187, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon00152-1971\",\"p_o_number\":\"3\",\"quantity\":\"0\",\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":\"2\",\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-25 17:06:55', '2026-06-25 17:06:55'),
(188, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":3,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":4,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-25 17:07:15', '2026-06-25 17:07:15'),
(189, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":\"1\",\"product_code\":[\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":\"0\",\"product_code\":null}}', NULL, '2026-06-25 17:07:15', '2026-06-25 17:07:15'),
(190, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":2,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"stocks\":3,\"barcode\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]}}', NULL, '2026-06-25 17:07:21', '2026-06-25 17:07:21'),
(191, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":\"2\",\"product_code\":[\"112-780-L-COLOR9\",\"112-780-L-COLOR9\"]},\"old\":{\"quantity\":\"1\",\"product_code\":[\"112-780-L-COLOR9\"]}}', NULL, '2026-06-25 17:07:21', '2026-06-25 17:07:21'),
(192, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-25T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-25 17:07:40', '2026-06-25 17:07:40'),
(193, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":9,\"purchase_price\":30,\"selling_price\":30,\"line_total\":270}],\"subtotal\":\"270.00\",\"total_amount\":\"270.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"270.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-00987\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-27 16:18:13', '2026-06-27 16:18:13'),
(194, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-27 16:19:15', '2026-06-27 16:19:15'),
(195, 'sell', 'created', 'App\\Models\\Sell', 'created', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":\"4\",\"selling_from\":\"2\",\"sold_to\":\"5\",\"brand_id\":\"2\",\"product_id\":\"1\",\"quantity\":9,\"po_number\":\"po-00987\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-27 16:19:15', '2026-06-27 16:19:15'),
(196, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_last_error\":\"QuickBooks is not connected.\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-27 16:19:15', '2026-06-27 16:19:15'),
(197, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"success\",\"quickbooks_synced_at\":\"2026-06-27T12:39:03.000000Z\",\"quickbooks_txn_id\":\"17\",\"quickbooks_last_error\":null},\"old\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":\"QuickBooks is not connected.\"}}', NULL, '2026-06-27 16:39:03', '2026-06-27 16:39:03'),
(198, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"success\",\"quickbooks_synced_at\":\"2026-06-27T12:39:05.000000Z\",\"quickbooks_txn_id\":\"18\",\"quickbooks_last_error\":null},\"old\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":\"QuickBooks is not connected.\"}}', NULL, '2026-06-27 16:39:05', '2026-06-27 16:39:05'),
(199, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"success\",\"quickbooks_synced_at\":\"2026-06-27T12:39:06.000000Z\",\"quickbooks_txn_id\":\"19\",\"quickbooks_last_error\":null},\"old\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":\"QuickBooks is not connected.\"}}', NULL, '2026-06-27 16:39:06', '2026-06-27 16:39:06'),
(200, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"success\",\"quickbooks_synced_at\":\"2026-06-27T12:39:08.000000Z\",\"quickbooks_txn_id\":\"20\",\"quickbooks_last_error\":null},\"old\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":\"QuickBooks is not connected.\"}}', NULL, '2026-06-27 16:39:08', '2026-06-27 16:39:08'),
(201, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"success\",\"quickbooks_synced_at\":\"2026-06-27T12:39:12.000000Z\",\"quickbooks_txn_id\":\"21\",\"quickbooks_last_error\":null},\"old\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":\"QuickBooks is not connected.\"}}', NULL, '2026-06-27 16:39:12', '2026-06-27 16:39:12'),
(202, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"success\",\"quickbooks_synced_at\":\"2026-06-27T12:39:14.000000Z\",\"quickbooks_txn_id\":\"22\",\"quickbooks_last_error\":null},\"old\":{\"quickbooks_sync_status\":\"pending_connection\",\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":\"QuickBooks is not connected.\"}}', NULL, '2026-06-27 16:39:14', '2026-06-27 16:39:14'),
(203, 'product', 'updated', 'App\\Models\\Product', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"MEN\'S PUFFER VEST\"},\"old\":{\"name\":\"Admin\"}}', NULL, '2026-06-27 16:44:03', '2026-06-27 16:44:03'),
(204, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/activity-logs\",\"ip\":\"118.179.5.122\"}', NULL, '2026-06-27 17:03:05', '2026-06-27 17:03:05'),
(205, 'product', 'created', 'App\\Models\\Product', 'created', 2, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"8\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-L-COLOR8\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(206, 'product', 'created', 'App\\Models\\Product', 'created', 3, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"8\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-M-COLOR8\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(207, 'product', 'created', 'App\\Models\\Product', 'created', 4, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"8\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-S-COLOR8\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(208, 'product', 'created', 'App\\Models\\Product', 'created', 5, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"8\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XL-COLOR8\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(209, 'product', 'created', 'App\\Models\\Product', 'created', 6, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"8\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XXL-COLOR8\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(210, 'product', 'created', 'App\\Models\\Product', 'created', 7, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(211, 'product', 'created', 'App\\Models\\Product', 'created', 8, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(212, 'product', 'created', 'App\\Models\\Product', 'created', 9, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(213, 'product', 'created', 'App\\Models\\Product', 'created', 10, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(214, 'product', 'created', 'App\\Models\\Product', 'created', 11, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(215, 'product', 'created', 'App\\Models\\Product', 'created', 12, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-L-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(216, 'product', 'created', 'App\\Models\\Product', 'created', 13, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-M-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(217, 'product', 'created', 'App\\Models\\Product', 'created', 14, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-S-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(218, 'product', 'created', 'App\\Models\\Product', 'created', 15, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(219, 'product', 'created', 'App\\Models\\Product', 'created', 16, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XXL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(220, 'product', 'created', 'App\\Models\\Product', 'created', 17, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-L-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(221, 'product', 'created', 'App\\Models\\Product', 'created', 18, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-M-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(222, 'product', 'created', 'App\\Models\\Product', 'created', 19, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-S-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(223, 'product', 'created', 'App\\Models\\Product', 'created', 20, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(224, 'product', 'created', 'App\\Models\\Product', 'created', 21, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"7\",\"style_number\":\"Style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE001-780-XXL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:47:55', '2026-06-28 07:47:55'),
(225, 'Category', 'created', 'App\\Models\\Category', 'created', 10, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Polo Shirt\"}}', NULL, '2026-06-28 07:49:54', '2026-06-28 07:49:54'),
(226, 'color', 'created', 'App\\Models\\Color', 'created', 11, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Taupe\",\"color_code\":null}}', NULL, '2026-06-28 07:51:11', '2026-06-28 07:51:11'),
(227, 'product', 'created', 'App\\Models\\Product', 'created', 22, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-L-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(228, 'product', 'created', 'App\\Models\\Product', 'created', 23, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-M-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(229, 'product', 'created', 'App\\Models\\Product', 'created', 24, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-S-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(230, 'product', 'created', 'App\\Models\\Product', 'created', 25, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(231, 'product', 'created', 'App\\Models\\Product', 'created', 26, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XXL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(232, 'product', 'created', 'App\\Models\\Product', 'created', 27, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-L-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(233, 'product', 'created', 'App\\Models\\Product', 'created', 28, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-M-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(234, 'product', 'created', 'App\\Models\\Product', 'created', 29, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-S-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(235, 'product', 'created', 'App\\Models\\Product', 'created', 30, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(236, 'product', 'created', 'App\\Models\\Product', 'created', 31, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XXL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(237, 'product', 'created', 'App\\Models\\Product', 'created', 32, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(238, 'product', 'created', 'App\\Models\\Product', 'created', 33, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(239, 'product', 'created', 'App\\Models\\Product', 'created', 34, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(240, 'product', 'created', 'App\\Models\\Product', 'created', 35, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(241, 'product', 'created', 'App\\Models\\Product', 'created', 36, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(242, 'product', 'created', 'App\\Models\\Product', 'created', 37, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-L-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(243, 'product', 'created', 'App\\Models\\Product', 'created', 38, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-M-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(244, 'product', 'created', 'App\\Models\\Product', 'created', 39, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-S-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(245, 'product', 'created', 'App\\Models\\Product', 'created', 40, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31'),
(246, 'product', 'created', 'App\\Models\\Product', 'created', 41, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"10\",\"style_number\":\"Style-002\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Polo Shirt\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE002-780-XXL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:53:31', '2026-06-28 07:53:31');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(247, 'product', 'created', 'App\\Models\\Product', 'created', 42, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-L-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(248, 'product', 'created', 'App\\Models\\Product', 'created', 43, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-M-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(249, 'product', 'created', 'App\\Models\\Product', 'created', 44, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-S-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(250, 'product', 'created', 'App\\Models\\Product', 'created', 45, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(251, 'product', 'created', 'App\\Models\\Product', 'created', 46, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XXL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(252, 'product', 'created', 'App\\Models\\Product', 'created', 47, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-L-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(253, 'product', 'created', 'App\\Models\\Product', 'created', 48, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-M-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(254, 'product', 'created', 'App\\Models\\Product', 'created', 49, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-S-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(255, 'product', 'created', 'App\\Models\\Product', 'created', 50, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(256, 'product', 'created', 'App\\Models\\Product', 'created', 51, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XXL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(257, 'product', 'created', 'App\\Models\\Product', 'created', 52, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(258, 'product', 'created', 'App\\Models\\Product', 'created', 53, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(259, 'product', 'created', 'App\\Models\\Product', 'created', 54, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(260, 'product', 'created', 'App\\Models\\Product', 'created', 55, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(261, 'product', 'created', 'App\\Models\\Product', 'created', 56, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(262, 'product', 'created', 'App\\Models\\Product', 'created', 57, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-L-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(263, 'product', 'created', 'App\\Models\\Product', 'created', 58, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-M-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(264, 'product', 'created', 'App\\Models\\Product', 'created', 59, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-S-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(265, 'product', 'created', 'App\\Models\\Product', 'created', 60, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(266, 'product', 'created', 'App\\Models\\Product', 'created', 61, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"9\",\"style_number\":\"Style-003\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Classic Tank Tops for Men\'s\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE003-780-XXL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"2\"}}', NULL, '2026-06-28 07:56:00', '2026-06-28 07:56:00'),
(267, 'color', 'created', 'App\\Models\\Color', 'created', 12, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Orange\",\"color_code\":null}}', NULL, '2026-06-28 07:58:00', '2026-06-28 07:58:00'),
(268, 'color', 'created', 'App\\Models\\Color', 'created', 13, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Olive Green\",\"color_code\":null}}', NULL, '2026-06-28 07:59:59', '2026-06-28 07:59:59'),
(269, 'color', 'created', 'App\\Models\\Color', 'created', 14, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Navy\",\"color_code\":null}}', NULL, '2026-06-28 08:00:14', '2026-06-28 08:00:14'),
(270, 'product', 'created', 'App\\Models\\Product', 'created', 62, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"13\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-L-COLOR13\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(271, 'product', 'created', 'App\\Models\\Product', 'created', 63, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"13\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-M-COLOR13\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(272, 'product', 'created', 'App\\Models\\Product', 'created', 64, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"13\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-S-COLOR13\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(273, 'product', 'created', 'App\\Models\\Product', 'created', 65, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"13\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XL-COLOR13\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(274, 'product', 'created', 'App\\Models\\Product', 'created', 66, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"13\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XXL-COLOR13\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(275, 'product', 'created', 'App\\Models\\Product', 'created', 67, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"12\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-L-COLOR12\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(276, 'product', 'created', 'App\\Models\\Product', 'created', 68, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"12\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-M-COLOR12\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(277, 'product', 'created', 'App\\Models\\Product', 'created', 69, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"12\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-S-COLOR12\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(278, 'product', 'created', 'App\\Models\\Product', 'created', 70, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"12\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XL-COLOR12\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(279, 'product', 'created', 'App\\Models\\Product', 'created', 71, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"12\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XXL-COLOR12\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(280, 'product', 'created', 'App\\Models\\Product', 'created', 72, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"14\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-L-COLOR14\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(281, 'product', 'created', 'App\\Models\\Product', 'created', 73, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"14\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-M-COLOR14\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(282, 'product', 'created', 'App\\Models\\Product', 'created', 74, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"14\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-S-COLOR14\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(283, 'product', 'created', 'App\\Models\\Product', 'created', 75, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"14\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XL-COLOR14\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(284, 'product', 'created', 'App\\Models\\Product', 'created', 76, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"14\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XXL-COLOR14\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(285, 'product', 'created', 'App\\Models\\Product', 'created', 77, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(286, 'product', 'created', 'App\\Models\\Product', 'created', 78, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(287, 'product', 'created', 'App\\Models\\Product', 'created', 79, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(288, 'product', 'created', 'App\\Models\\Product', 'created', 80, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(289, 'product', 'created', 'App\\Models\\Product', 'created', 81, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"6\",\"style_number\":\"Style-004\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE004-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:04:38', '2026-06-28 08:04:38'),
(290, 'product', 'created', 'App\\Models\\Product', 'created', 82, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-L-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(291, 'product', 'created', 'App\\Models\\Product', 'created', 83, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-M-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(292, 'product', 'created', 'App\\Models\\Product', 'created', 84, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-S-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(293, 'product', 'created', 'App\\Models\\Product', 'created', 85, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(294, 'product', 'created', 'App\\Models\\Product', 'created', 86, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XXL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(295, 'product', 'created', 'App\\Models\\Product', 'created', 87, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(296, 'product', 'created', 'App\\Models\\Product', 'created', 88, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(297, 'product', 'created', 'App\\Models\\Product', 'created', 89, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(298, 'product', 'created', 'App\\Models\\Product', 'created', 90, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(299, 'product', 'created', 'App\\Models\\Product', 'created', 91, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(300, 'product', 'created', 'App\\Models\\Product', 'created', 92, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-L-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(301, 'product', 'created', 'App\\Models\\Product', 'created', 93, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-M-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(302, 'product', 'created', 'App\\Models\\Product', 'created', 94, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-S-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(303, 'product', 'created', 'App\\Models\\Product', 'created', 95, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(304, 'product', 'created', 'App\\Models\\Product', 'created', 96, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XXL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(305, 'product', 'created', 'App\\Models\\Product', 'created', 97, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-L-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(306, 'product', 'created', 'App\\Models\\Product', 'created', 98, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-M-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(307, 'product', 'created', 'App\\Models\\Product', 'created', 99, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-S-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(308, 'product', 'created', 'App\\Models\\Product', 'created', 100, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(309, 'product', 'created', 'App\\Models\\Product', 'created', 101, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"8\",\"style_number\":\"Style-005\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MENS Regular JOGGER\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE005-780-XXL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:06:41', '2026-06-28 08:06:41'),
(310, 'product', 'created', 'App\\Models\\Product', 'created', 102, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-L-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(311, 'product', 'created', 'App\\Models\\Product', 'created', 103, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-M-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(312, 'product', 'created', 'App\\Models\\Product', 'created', 104, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-S-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(313, 'product', 'created', 'App\\Models\\Product', 'created', 105, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(314, 'product', 'created', 'App\\Models\\Product', 'created', 106, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XXL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(315, 'product', 'created', 'App\\Models\\Product', 'created', 107, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(316, 'product', 'created', 'App\\Models\\Product', 'created', 108, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(317, 'product', 'created', 'App\\Models\\Product', 'created', 109, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(318, 'product', 'created', 'App\\Models\\Product', 'created', 110, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(319, 'product', 'created', 'App\\Models\\Product', 'created', 111, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(320, 'product', 'created', 'App\\Models\\Product', 'created', 112, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-L-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(321, 'product', 'created', 'App\\Models\\Product', 'created', 113, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-M-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(322, 'product', 'created', 'App\\Models\\Product', 'created', 114, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-S-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(323, 'product', 'created', 'App\\Models\\Product', 'created', 115, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(324, 'product', 'created', 'App\\Models\\Product', 'created', 116, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XXL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(325, 'product', 'created', 'App\\Models\\Product', 'created', 117, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-L-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(326, 'product', 'created', 'App\\Models\\Product', 'created', 118, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-M-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(327, 'product', 'created', 'App\\Models\\Product', 'created', 119, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-S-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(328, 'product', 'created', 'App\\Models\\Product', 'created', 120, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(329, 'product', 'created', 'App\\Models\\Product', 'created', 121, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"5\",\"style_number\":\"Style-006\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Quarter-zip Jacket\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE006-780-XXL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:08:40', '2026-06-28 08:08:40'),
(330, 'product', 'created', 'App\\Models\\Product', 'created', 122, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-L-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(331, 'product', 'created', 'App\\Models\\Product', 'created', 123, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-M-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(332, 'product', 'created', 'App\\Models\\Product', 'created', 124, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-S-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(333, 'product', 'created', 'App\\Models\\Product', 'created', 125, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(334, 'product', 'created', 'App\\Models\\Product', 'created', 126, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"9\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XXL-COLOR9\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(335, 'product', 'created', 'App\\Models\\Product', 'created', 127, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-L-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(336, 'product', 'created', 'App\\Models\\Product', 'created', 128, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-M-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(337, 'product', 'created', 'App\\Models\\Product', 'created', 129, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-S-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(338, 'product', 'created', 'App\\Models\\Product', 'created', 130, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(339, 'product', 'created', 'App\\Models\\Product', 'created', 131, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"7\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XXL-COLOR7\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(340, 'product', 'created', 'App\\Models\\Product', 'created', 132, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-L-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(341, 'product', 'created', 'App\\Models\\Product', 'created', 133, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-M-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(342, 'product', 'created', 'App\\Models\\Product', 'created', 134, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-S-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(343, 'product', 'created', 'App\\Models\\Product', 'created', 135, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(344, 'product', 'created', 'App\\Models\\Product', 'created', 136, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"10\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XXL-COLOR10\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(345, 'product', 'created', 'App\\Models\\Product', 'created', 137, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"4\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-L-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(346, 'product', 'created', 'App\\Models\\Product', 'created', 138, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"3\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-M-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(347, 'product', 'created', 'App\\Models\\Product', 'created', 139, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"2\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-S-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(348, 'product', 'created', 'App\\Models\\Product', 'created', 140, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"5\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(349, 'product', 'created', 'App\\Models\\Product', 'created', 141, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":\"3\",\"style_number\":\"Style-007\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Regular Kangaroo Pocket Hoodie\",\"available_stock\":0,\"description\":null,\"color_id\":\"11\",\"fabric_id\":\"3\",\"size_id\":\"6\",\"gender_id\":\"1\",\"barCode\":\"STYLE007-780-XXL-COLOR11\",\"warehouse_id\":\"2\",\"cover_image\":null,\"gallery_images\":[],\"season_id\":\"1\"}}', NULL, '2026-06-28 08:12:02', '2026-06-28 08:12:02'),
(350, 'product', 'deleted', 'App\\Models\\Product', 'deleted', 1, 'App\\Models\\User', 5, '{\"old\":{\"category_id\":3,\"style_number\":\"112\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"MEN\'S PUFFER VEST\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"size_id\":4,\"gender_id\":1,\"barCode\":\"112-780-L-COLOR9\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-06-27 22:38:37', '2026-06-27 22:38:37'),
(351, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 112, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"25.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:39:38', '2026-06-27 23:39:38'),
(352, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 119, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"25.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:39:42', '2026-06-27 23:39:42'),
(353, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 126, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"25.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:39:49', '2026-06-27 23:39:49'),
(354, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 133, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"25.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:39:55', '2026-06-27 23:39:55'),
(355, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 140, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"25.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:40:02', '2026-06-27 23:40:02'),
(356, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:40:55', '2026-06-27 23:40:55'),
(357, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 118, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:40:55', '2026-06-27 23:40:55'),
(358, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 125, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:40:55', '2026-06-27 23:40:55'),
(359, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 132, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:40:56', '2026-06-27 23:40:56'),
(360, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 139, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-06-27 23:40:57', '2026-06-27 23:40:57'),
(361, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"barcode\":[]}}', NULL, '2026-06-27 23:42:22', '2026-06-27 23:42:22'),
(362, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 112, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":12,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"barcode\":[]}}', NULL, '2026-06-27 23:42:42', '2026-06-27 23:42:42'),
(363, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":17,\"quantity\":10,\"purchase_price\":30,\"selling_price\":30,\"line_total\":300}],\"subtotal\":\"300.00\",\"total_amount\":\"300.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"300.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"p_o_001996\",\"expected_delivery_date\":\"2026-06-10\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 00:19:59', '2026-06-28 00:19:59'),
(364, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":17,\"quantity\":10,\"purchase_price\":30,\"selling_price\":30,\"line_total\":300}],\"subtotal\":\"300.00\",\"total_amount\":\"300.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"300.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"p_o_001996\",\"expected_delivery_date\":\"2026-06-10\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 00:20:07', '2026-06-28 00:20:07'),
(365, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":17,\"quantity\":10,\"purchase_price\":30,\"selling_price\":30,\"line_total\":300}],\"subtotal\":\"300.00\",\"total_amount\":\"300.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"300.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"p_o_001996\",\"expected_delivery_date\":\"2026-06-10T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 00:22:51', '2026-06-28 00:22:51'),
(366, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"rejected\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-28 00:23:33', '2026-06-28 00:23:33'),
(367, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"rejected\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-28 00:23:36', '2026-06-28 00:23:36'),
(368, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-06-28 00:23:41', '2026-06-28 00:23:41'),
(369, 'sell', 'created', 'App\\Models\\Sell', 'created', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":17,\"quantity\":10,\"po_number\":\"p_o_001996\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-06-28 00:23:41', '2026-06-28 00:23:41'),
(370, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 00:23:42', '2026-06-28 00:23:42'),
(371, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 001-001996\",\"p_o_number\":\"7\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-06-28 00:24:29', '2026-06-28 00:24:29'),
(372, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":14,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-06-28 00:26:53', '2026-06-28 00:26:53'),
(373, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":1,\"product_code\":[\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-06-28 00:26:53', '2026-06-28 00:26:53'),
(374, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":5,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":14,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-06-28 00:27:13', '2026-06-28 00:27:13'),
(375, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":10,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":1,\"product_code\":[\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-06-28 00:27:13', '2026-06-28 00:27:13'),
(376, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-06-28T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-06-28 00:28:13', '2026-06-28 00:28:13'),
(377, 'color', 'updated', 'App\\Models\\Color', 'updated', 9, 'App\\Models\\User', 5, '{\"attributes\":{\"name\":\"Black Beauty\"},\"old\":{\"name\":\"Black\"}}', NULL, '2026-06-28 01:17:50', '2026-06-28 01:17:50'),
(378, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 41, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-28 01:42:04', '2026-06-28 01:42:04'),
(379, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 41, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\"},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\"}}', NULL, '2026-06-28 01:42:13', '2026-06-28 01:42:13'),
(380, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 41, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":3,\"barcode\":[\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\"]},\"old\":{\"stocks\":4,\"barcode\":[\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\",\"STYLE001-780-L-COLOR7\"]}}', NULL, '2026-06-28 01:47:47', '2026-06-28 01:47:47'),
(381, 'retailSale', 'created', 'App\\Models\\RetailSale', 'created', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"reference_number\":\"RET-43370B48\",\"warehouse_id\":2,\"brand_id\":2,\"sold_by\":2,\"items\":[{\"stock_id\":41,\"product_id\":7,\"product_name\":\"Athletic Shorts\",\"barcode\":\"STYLE001-780-L-COLOR7\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}],\"total_amount\":\"30.00\",\"payment_method\":\"cash\",\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 01:47:47', '2026-06-28 01:47:47'),
(382, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 01:47:47', '2026-06-28 01:47:47'),
(383, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-28 02:30:21', '2026-06-28 02:30:21'),
(384, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-28 02:30:24', '2026-06-28 02:30:24'),
(385, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 496, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":5,\"barcode\":[\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-06-28 02:45:47', '2026-06-28 02:45:47'),
(386, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 496, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"20.00\",\"selling_price\":\"30.00\"},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\"}}', NULL, '2026-06-28 02:45:54', '2026-06-28 02:45:54'),
(387, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 496, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\"]},\"old\":{\"stocks\":5,\"barcode\":[\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\",\"STYLE004-780-L-COLOR14\"]}}', NULL, '2026-06-28 02:46:36', '2026-06-28 02:46:36'),
(388, 'retailSale', 'created', 'App\\Models\\RetailSale', 'created', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"reference_number\":\"RET-BEABE692\",\"warehouse_id\":2,\"brand_id\":2,\"sold_by\":2,\"items\":[{\"stock_id\":496,\"product_id\":72,\"product_name\":\"MEN\'S PUFFER VEST\",\"barcode\":\"STYLE004-780-L-COLOR14\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}],\"total_amount\":\"30.00\",\"payment_method\":\"cash\",\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 02:46:36', '2026-06-28 02:46:36'),
(389, 'retailSale', 'updated', 'App\\Models\\RetailSale', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-06-28 02:46:36', '2026-06-28 02:46:36'),
(390, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-28 04:57:54', '2026-06-28 04:57:54'),
(391, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"POST\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-28 04:58:08', '2026-06-28 04:58:08'),
(392, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/access-keys\",\"ip\":\"127.0.0.1\"}', NULL, '2026-06-28 04:58:08', '2026-06-28 04:58:08'),
(393, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:15:08', '2026-07-01 01:15:08'),
(394, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:15:10', '2026-07-01 01:15:10'),
(395, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:15:11', '2026-07-01 01:15:11'),
(396, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:49:20', '2026-07-01 01:49:20'),
(397, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:49:23', '2026-07-01 01:49:23'),
(398, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:49:23', '2026-07-01 01:49:23'),
(399, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"PUT\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:49:29', '2026-07-01 01:49:29'),
(400, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:49:30', '2026-07-01 01:49:30'),
(401, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:50:10', '2026-07-01 01:50:10'),
(402, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:50:11', '2026-07-01 01:50:11'),
(403, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:50:12', '2026-07-01 01:50:12'),
(404, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:53:45', '2026-07-01 01:53:45'),
(405, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:53:45', '2026-07-01 01:53:45'),
(406, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"PUT\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:53:56', '2026-07-01 01:53:56'),
(407, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 01:53:58', '2026-07-01 01:53:58'),
(408, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 06:49:53', '2026-07-01 06:49:53'),
(409, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 06:49:55', '2026-07-01 06:49:55'),
(410, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 06:49:55', '2026-07-01 06:49:55'),
(411, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"PUT\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 06:50:05', '2026-07-01 06:50:05'),
(412, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-01 06:50:05', '2026-07-01 06:50:05'),
(413, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":17,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}],\"subtotal\":\"60.00\",\"total_amount\":\"60.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"60.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"96325889999999999999999999999999999999999999999\",\"expected_delivery_date\":\"2026-07-21T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 06:50:46', '2026-07-01 06:50:46'),
(414, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-01 06:52:00', '2026-07-01 06:52:00'),
(415, 'sell', 'created', 'App\\Models\\Sell', 'created', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":8,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":17,\"quantity\":2,\"po_number\":\"96325889999999999999999999999999999999999999999\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-07-01 06:52:00', '2026-07-01 06:52:00'),
(416, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 06:52:01', '2026-07-01 06:52:01'),
(417, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 00199999999999999999999\",\"p_o_number\":\"8\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 06:52:09', '2026-07-01 06:52:09'),
(418, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":3,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":5,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:53:00', '2026-07-01 06:53:00'),
(419, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-01 06:53:00', '2026-07-01 06:53:00'),
(420, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-01T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-01 06:53:11', '2026-07-01 06:53:11'),
(421, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-01T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-01 06:53:41', '2026-07-01 06:53:41'),
(422, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":5,\"buying_price\":\"30.00\",\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":3,\"buying_price\":\"15.00\",\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:53:48', '2026-07-01 06:53:48'),
(423, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-01T12:53:48.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 06:53:48', '2026-07-01 06:53:48'),
(424, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":10,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:58:02', '2026-07-01 06:58:02'),
(425, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":12,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":5,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:58:02', '2026-07-01 06:58:02'),
(426, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 9, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":17,\"quantity\":3,\"purchase_price\":30,\"selling_price\":30,\"line_total\":90}],\"subtotal\":\"90.00\",\"total_amount\":\"90.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"90.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"Po32133333333333333333333333333333333333333333333333\",\"expected_delivery_date\":\"2026-07-22T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 06:58:57', '2026-07-01 06:58:57'),
(427, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-01 06:59:21', '2026-07-01 06:59:21'),
(428, 'sell', 'created', 'App\\Models\\Sell', 'created', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":9,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":17,\"quantity\":3,\"po_number\":\"Po32133333333333333333333333333333333333333333333333\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-07-01 06:59:21', '2026-07-01 06:59:21'),
(429, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 06:59:22', '2026-07-01 06:59:22'),
(430, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 00987\",\"p_o_number\":\"9\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 06:59:31', '2026-07-01 06:59:31'),
(431, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":10,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":12,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:59:42', '2026-07-01 06:59:42'),
(432, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-01 06:59:42', '2026-07-01 06:59:42'),
(433, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":9,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":10,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:59:55', '2026-07-01 06:59:55'),
(434, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 06:59:55', '2026-07-01 06:59:55'),
(435, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-01T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-01 07:00:03', '2026-07-01 07:00:03'),
(436, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-01T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-01 07:00:31', '2026-07-01 07:00:31'),
(437, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 116, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":3,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":0,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-07-01 07:00:38', '2026-07-01 07:00:38'),
(438, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-01T13:00:38.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 07:00:38', '2026-07-01 07:00:38'),
(439, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":17,\"quantity\":3,\"purchase_price\":30,\"selling_price\":30,\"line_total\":90}],\"subtotal\":\"90.00\",\"total_amount\":\"90.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"90.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"76655555555555556666-77777777777\",\"expected_delivery_date\":\"2026-07-21T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 07:22:23', '2026-07-01 07:22:23'),
(440, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-01 07:22:45', '2026-07-01 07:22:45'),
(441, 'sell', 'created', 'App\\Models\\Sell', 'created', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":10,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":17,\"quantity\":3,\"po_number\":\"76655555555555556666-77777777777\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-07-01 07:22:45', '2026-07-01 07:22:45'),
(442, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 07:22:45', '2026-07-01 07:22:45'),
(443, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"666666666666666666666666666666666666666666\",\"p_o_number\":\"10\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 07:23:15', '2026-07-01 07:23:15'),
(444, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 111, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":6,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":9,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 07:23:24', '2026-07-01 07:23:24'),
(445, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-01 07:23:24', '2026-07-01 07:23:24'),
(446, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-01T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-01 07:23:45', '2026-07-01 07:23:45'),
(447, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-01T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-01 07:23:48', '2026-07-01 07:23:48'),
(448, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 116, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":6,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]},\"old\":{\"stocks\":3,\"barcode\":[\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\",\"STYLE001-780-L-COLOR9\"]}}', NULL, '2026-07-01 07:23:54', '2026-07-01 07:23:54'),
(449, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-01T13:23:54.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 07:23:54', '2026-07-01 07:23:54'),
(450, 'product', 'created', 'App\\Models\\Product', 'created', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"brand_id\":2,\"size_id\":4,\"gender_id\":1,\"barCode\":\"STYLE001-780-L-Black-Beauty\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-01 23:42:16', '2026-07-01 23:42:16'),
(451, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"10.00\",\"selling_price\":\"15.00\",\"barcode\":[]},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-07-01 23:42:58', '2026-07-01 23:42:58'),
(452, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":0,\"barcode\":[]}}', NULL, '2026-07-01 23:43:16', '2026-07-01 23:43:16'),
(453, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":3,\"purchase_price\":15,\"selling_price\":15,\"line_total\":45}],\"subtotal\":\"45.00\",\"total_amount\":\"45.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"45.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"p_o_001\",\"expected_delivery_date\":\"2026-07-22T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 23:44:53', '2026-07-01 23:44:53'),
(454, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-01 23:45:29', '2026-07-01 23:45:29'),
(455, 'sell', 'created', 'App\\Models\\Sell', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":1,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":3,\"po_number\":\"p_o_001\",\"purchase_price\":\"15.00\",\"selling_price\":\"15.00\",\"status\":\"approved\"}}', NULL, '2026-07-01 23:45:29', '2026-07-01 23:45:29'),
(456, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-01 23:45:30', '2026-07-01 23:45:30'),
(457, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 001\",\"p_o_number\":\"1\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 23:45:35', '2026-07-01 23:45:35'),
(458, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-01 23:45:45', '2026-07-01 23:45:45');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(459, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-01 23:45:45', '2026-07-01 23:45:45'),
(460, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":17,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-01 23:46:00', '2026-07-01 23:46:00'),
(461, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-01 23:46:00', '2026-07-01 23:46:00'),
(462, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-02T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-01 23:46:20', '2026-07-01 23:46:20'),
(463, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-02T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-01 23:46:42', '2026-07-01 23:46:42'),
(464, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":3,\"buying_price\":\"15.00\",\"selling_price\":\"15.00\",\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":0,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":null}}', NULL, '2026-07-01 23:46:48', '2026-07-01 23:46:48'),
(465, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 1, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-02T05:46:48.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-01 23:46:48', '2026-07-01 23:46:48'),
(466, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-02 01:02:23', '2026-07-02 01:02:23'),
(467, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-02 01:02:28', '2026-07-02 01:02:28'),
(468, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-02 01:02:28', '2026-07-02 01:02:28'),
(469, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"PUT\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-02 01:03:16', '2026-07-02 01:03:16'),
(470, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-02 01:03:17', '2026-07-02 01:03:17'),
(471, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":15,\"selling_price\":15,\"line_total\":30}],\"subtotal\":\"30.00\",\"total_amount\":\"30.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"30.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"p_o_005\",\"expected_delivery_date\":\"2026-07-22T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-02 01:05:42', '2026-07-02 01:05:42'),
(472, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-02 01:05:58', '2026-07-02 01:05:58'),
(473, 'sell', 'created', 'App\\Models\\Sell', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":2,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":2,\"po_number\":\"p_o_005\",\"purchase_price\":\"15.00\",\"selling_price\":\"15.00\",\"status\":\"approved\"}}', NULL, '2026-07-02 01:05:58', '2026-07-02 01:05:58'),
(474, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-02 01:05:59', '2026-07-02 01:05:59'),
(475, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 001\",\"p_o_number\":\"2\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-02 01:06:12', '2026-07-02 01:06:12'),
(476, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":17,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-02 01:06:20', '2026-07-02 01:06:20'),
(477, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-02 01:06:20', '2026-07-02 01:06:20'),
(478, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-02T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-02 01:06:35', '2026-07-02 01:06:35'),
(479, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-02T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-02 01:07:03', '2026-07-02 01:07:03'),
(480, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 0012\"},\"old\":{\"cartoon_number\":\"cartoon 001\"}}', NULL, '2026-07-02 01:07:40', '2026-07-02 01:07:40'),
(481, 'stock', 'created', 'App\\Models\\Stock', 'created', 9, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":1,\"stocks\":2,\"buying_price\":\"15.00\",\"selling_price\":\"15.00\",\"warehouse_id\":5,\"brand_id\":2,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-02 01:08:10', '2026-07-02 01:08:10'),
(482, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 2, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-02T07:08:10.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-02 01:08:10', '2026-07-02 01:08:10'),
(483, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":15,\"selling_price\":15,\"line_total\":30}],\"subtotal\":\"30.00\",\"total_amount\":\"30.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"30.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"258963\",\"expected_delivery_date\":\"2026-07-22T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-02 01:10:32', '2026-07-02 01:10:32'),
(484, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-02 01:10:59', '2026-07-02 01:10:59'),
(485, 'sell', 'created', 'App\\Models\\Sell', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":3,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":2,\"po_number\":\"258963\",\"purchase_price\":\"15.00\",\"selling_price\":\"15.00\",\"status\":\"approved\"}}', NULL, '2026-07-02 01:10:59', '2026-07-02 01:10:59'),
(486, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-02 01:10:59', '2026-07-02 01:10:59'),
(487, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 0013\",\"p_o_number\":\"3\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-02 01:11:05', '2026-07-02 01:11:05'),
(488, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":13,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-02 01:11:31', '2026-07-02 01:11:31'),
(489, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-02 01:11:31', '2026-07-02 01:11:31'),
(490, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-02T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-02 01:11:44', '2026-07-02 01:11:44'),
(491, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-02T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-02 01:12:02', '2026-07-02 01:12:02'),
(492, 'stock', 'created', 'App\\Models\\Stock', 'created', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":1,\"stocks\":2,\"buying_price\":\"15.00\",\"selling_price\":\"15.00\",\"warehouse_id\":5,\"brand_id\":2,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-02 01:12:07', '2026-07-02 01:12:07'),
(493, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 3, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-02T07:12:07.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-02 01:12:07', '2026-07-02 01:12:07'),
(494, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":3,\"purchase_price\":15,\"selling_price\":15,\"line_total\":45}],\"subtotal\":\"45.00\",\"total_amount\":\"45.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"45.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-005\",\"expected_delivery_date\":\"2026-07-24T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-03 22:05:44', '2026-07-03 22:05:44'),
(495, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-03 22:06:27', '2026-07-03 22:06:27'),
(496, 'sell', 'created', 'App\\Models\\Sell', 'created', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":4,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":3,\"po_number\":\"po-005\",\"purchase_price\":\"15.00\",\"selling_price\":\"15.00\",\"status\":\"approved\"}}', NULL, '2026-07-03 22:06:27', '2026-07-03 22:06:27'),
(497, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-03 22:06:28', '2026-07-03 22:06:28'),
(498, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon-005\",\"p_o_number\":\"4\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-03 22:06:38', '2026-07-03 22:06:38'),
(499, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":10,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":13,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-03 22:07:35', '2026-07-03 22:07:35'),
(500, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-03 22:07:35', '2026-07-03 22:07:35'),
(501, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-04T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-03 22:07:43', '2026-07-03 22:07:43'),
(502, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-04T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-03 22:08:08', '2026-07-03 22:08:08'),
(503, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":5,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":2,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-03 22:08:14', '2026-07-03 22:08:14'),
(504, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-04T04:08:14.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-03 22:08:14', '2026-07-03 22:08:14'),
(505, 'product', 'created', 'App\\Models\\Product', 'created', 2, 'App\\Models\\User', 2, '{\"attributes\":{\"category_id\":1,\"style_number\":\"style0093\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"T-shirt\",\"available_stock\":0,\"description\":null,\"color_id\":14,\"fabric_id\":3,\"brand_id\":2,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE0093-780-M-Navy\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":2}}', NULL, '2026-07-04 00:51:03', '2026-07-04 00:51:03'),
(506, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 12, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":10,\"barcode\":[\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-04 01:12:13', '2026-07-04 01:12:13'),
(507, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 12, 'App\\Models\\User', 2, '{\"attributes\":{\"buying_price\":\"15.00\",\"selling_price\":\"30.00\"},\"old\":{\"buying_price\":\"0.00\",\"selling_price\":\"0.00\"}}', NULL, '2026-07-04 01:12:38', '2026-07-04 01:12:38'),
(508, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 12, 'App\\Models\\User', 2, '{\"attributes\":{\"selling_price\":\"15.00\"},\"old\":{\"selling_price\":\"30.00\"}}', NULL, '2026-07-04 01:13:47', '2026-07-04 01:13:47'),
(509, 'warehouse', 'created', 'App\\Models\\WareHouse', 'created', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"country_id\":2,\"state_id\":3,\"name\":\"Production\",\"fulladress\":\"gazipur\"}}', NULL, '2026-07-04 01:25:42', '2026-07-04 01:25:42'),
(510, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":3,\"purchase_price\":15,\"selling_price\":15,\"line_total\":45}],\"subtotal\":\"45.00\",\"total_amount\":\"45.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"45.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"258963-pooiu90900\",\"expected_delivery_date\":\"2026-07-24T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-04 01:31:35', '2026-07-04 01:31:35'),
(511, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-04 01:32:13', '2026-07-04 01:32:13'),
(512, 'sell', 'created', 'App\\Models\\Sell', 'created', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":5,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":3,\"po_number\":\"258963-pooiu90900\",\"purchase_price\":\"15.00\",\"selling_price\":\"15.00\",\"status\":\"approved\"}}', NULL, '2026-07-04 01:32:13', '2026-07-04 01:32:13'),
(513, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-04 01:32:14', '2026-07-04 01:32:14'),
(514, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 9875453653213216546\",\"p_o_number\":\"5\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-04 01:32:25', '2026-07-04 01:32:25'),
(515, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":7,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":10,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-04 01:33:08', '2026-07-04 01:33:08'),
(516, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-04 01:33:08', '2026-07-04 01:33:08'),
(517, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 5, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-04T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-04 01:33:52', '2026-07-04 01:33:52'),
(518, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-04T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-04 01:34:59', '2026-07-04 01:34:59'),
(519, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":8,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":5,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-04 01:35:39', '2026-07-04 01:35:39'),
(520, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-04T07:35:39.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-04 01:35:39', '2026-07-04 01:35:39'),
(521, 'product', 'updated', 'App\\Models\\Product', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"brand_id\":3},\"old\":{\"brand_id\":2}}', NULL, '2026-07-04 22:19:43', '2026-07-04 22:19:43'),
(522, 'product', 'created', 'App\\Models\\Product', 'created', 3, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":5,\"style_number\":\"style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"brand_id\":3,\"size_id\":2,\"gender_id\":1,\"barCode\":\"STYLE001-780-S-Black-Beauty\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-04 22:19:43', '2026-07-04 22:19:43'),
(523, 'color', 'updated', 'App\\Models\\Color', 'updated', 9, 'App\\Models\\User', 5, '{\"attributes\":{\"color_code\":\"BLKBT\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-04 22:20:09', '2026-07-04 22:20:09'),
(524, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":13,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-04 22:21:50', '2026-07-04 22:21:50'),
(525, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 13, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-04 22:22:26', '2026-07-04 22:22:26'),
(526, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":3,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60},{\"product_id\":3,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}],\"subtotal\":\"120.00\",\"total_amount\":\"120.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"120.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-multi-order\",\"expected_delivery_date\":\"2026-07-25T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-04 22:23:44', '2026-07-04 22:23:44'),
(527, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-04 22:24:12', '2026-07-04 22:24:12'),
(528, 'sell', 'created', 'App\\Models\\Sell', 'created', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":6,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":1,\"quantity\":2,\"po_number\":\"po-multi-order\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-07-04 22:24:12', '2026-07-04 22:24:12'),
(529, 'sell', 'created', 'App\\Models\\Sell', 'created', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":6,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":3,\"quantity\":2,\"po_number\":\"po-multi-order\",\"purchase_price\":\"30.00\",\"selling_price\":\"30.00\",\"status\":\"approved\"}}', NULL, '2026-07-04 22:24:12', '2026-07-04 22:24:12'),
(530, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-04 22:24:12', '2026-07-04 22:24:12'),
(531, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon-multi-order\",\"p_o_number\":\"6\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-04 22:24:23', '2026-07-04 22:24:23'),
(532, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":11,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":13,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-04 22:24:48', '2026-07-04 22:24:48'),
(533, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-04 22:24:48', '2026-07-04 22:24:48'),
(534, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 13, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":13,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-04 22:25:20', '2026-07-04 22:25:20'),
(535, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":4,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"quantity\":2,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-04 22:25:20', '2026-07-04 22:25:20'),
(536, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 6, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-04 22:27:11', '2026-07-04 22:27:11'),
(537, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-04 22:27:38', '2026-07-04 22:27:38'),
(538, 'stock', 'created', 'App\\Models\\Stock', 'created', 14, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":1,\"stocks\":2,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-04 22:27:45', '2026-07-04 22:27:45'),
(539, 'stock', 'created', 'App\\Models\\Stock', 'created', 15, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":3,\"stocks\":2,\"buying_price\":\"30.00\",\"selling_price\":\"30.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-04 22:27:45', '2026-07-04 22:27:45'),
(540, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-05T04:27:45.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-04 22:27:45', '2026-07-04 22:27:45'),
(541, 'product', 'created', 'App\\Models\\Product', 'created', 4, 'App\\Models\\User', 6, '{\"attributes\":{\"category_id\":5,\"style_number\":\"style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"brand_id\":3,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE001-780-M-Black-Beauty\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(542, 'product', 'created', 'App\\Models\\Product', 'created', 5, 'App\\Models\\User', 6, '{\"attributes\":{\"category_id\":5,\"style_number\":\"style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"brand_id\":3,\"size_id\":5,\"gender_id\":1,\"barCode\":\"STYLE001-780-XL-Black-Beauty\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(543, 'product', 'created', 'App\\Models\\Product', 'created', 6, 'App\\Models\\User', 6, '{\"attributes\":{\"category_id\":5,\"style_number\":\"style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Athletic Shorts\",\"available_stock\":0,\"description\":null,\"color_id\":9,\"fabric_id\":3,\"brand_id\":3,\"size_id\":6,\"gender_id\":1,\"barCode\":\"STYLE001-780-XXL-Black-Beauty\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(544, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 16, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-05 00:19:56', '2026-07-05 00:19:56'),
(545, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 17, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":22,\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-05 00:20:28', '2026-07-05 00:20:28'),
(546, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 18, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-05 00:20:54', '2026-07-05 00:20:54'),
(547, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":11,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-05 00:21:36', '2026-07-05 00:21:36'),
(548, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 13, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"stocks\":13,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-05 00:21:53', '2026-07-05 00:21:53'),
(549, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":3,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":3,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":4,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":5,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":6,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40}],\"subtotal\":\"200.00\",\"total_amount\":\"200.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"200.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-multi-order-065\",\"expected_delivery_date\":\"2026-07-25T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 00:25:56', '2026-07-05 00:25:56'),
(550, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(551, 'sell', 'created', 'App\\Models\\Sell', 'created', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":1,\"quantity\":2,\"po_number\":\"po-multi-order-065\",\"purchase_price\":\"20.00\",\"selling_price\":\"20.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(552, 'sell', 'created', 'App\\Models\\Sell', 'created', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":3,\"quantity\":2,\"po_number\":\"po-multi-order-065\",\"purchase_price\":\"20.00\",\"selling_price\":\"20.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(553, 'sell', 'created', 'App\\Models\\Sell', 'created', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":4,\"quantity\":2,\"po_number\":\"po-multi-order-065\",\"purchase_price\":\"20.00\",\"selling_price\":\"20.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(554, 'sell', 'created', 'App\\Models\\Sell', 'created', 11, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":5,\"quantity\":2,\"po_number\":\"po-multi-order-065\",\"purchase_price\":\"20.00\",\"selling_price\":\"20.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(555, 'sell', 'created', 'App\\Models\\Sell', 'created', 12, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":6,\"quantity\":2,\"po_number\":\"po-multi-order-065\",\"purchase_price\":\"20.00\",\"selling_price\":\"20.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 00:26:27', '2026-07-05 00:26:27'),
(556, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 00:26:28', '2026-07-05 00:26:28'),
(557, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"carton-multi-order-065\",\"p_o_number\":\"7\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 00:26:50', '2026-07-05 00:26:50'),
(558, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-05 00:28:06', '2026-07-05 00:28:06');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(559, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 13, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-05 00:28:06', '2026-07-05 00:28:06'),
(560, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 16, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]},\"old\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]}}', NULL, '2026-07-05 00:28:06', '2026-07-05 00:28:06'),
(561, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 17, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":19,\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]},\"old\":{\"stocks\":22,\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]}}', NULL, '2026-07-05 00:28:06', '2026-07-05 00:28:06'),
(562, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 18, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]},\"old\":{\"stocks\":20,\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]}}', NULL, '2026-07-05 00:28:06', '2026-07-05 00:28:06'),
(563, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":11,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-05 00:28:06', '2026-07-05 00:28:06'),
(564, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-05 00:29:43', '2026-07-05 00:29:43'),
(565, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-05 00:30:21', '2026-07-05 00:30:21'),
(566, 'stock', 'created', 'App\\Models\\Stock', 'created', 19, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":1,\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-05 00:30:38', '2026-07-05 00:30:38'),
(567, 'stock', 'created', 'App\\Models\\Stock', 'created', 20, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":3,\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-05 00:30:38', '2026-07-05 00:30:38'),
(568, 'stock', 'created', 'App\\Models\\Stock', 'created', 21, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":4,\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]}}', NULL, '2026-07-05 00:30:38', '2026-07-05 00:30:38'),
(569, 'stock', 'created', 'App\\Models\\Stock', 'created', 22, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":5,\"stocks\":3,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]}}', NULL, '2026-07-05 00:30:38', '2026-07-05 00:30:38'),
(570, 'stock', 'created', 'App\\Models\\Stock', 'created', 23, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":6,\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"warehouse_id\":5,\"brand_id\":3,\"cartoon_id\":null,\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]}}', NULL, '2026-07-05 00:30:38', '2026-07-05 00:30:38'),
(571, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-05T06:30:38.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 00:30:38', '2026-07-05 00:30:38'),
(572, 'color', 'updated', 'App\\Models\\Color', 'updated', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"gry\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:03', '2026-07-05 01:06:03'),
(573, 'color', 'updated', 'App\\Models\\Color', 'updated', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"mtnble\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:13', '2026-07-05 01:06:13'),
(574, 'color', 'updated', 'App\\Models\\Color', 'updated', 14, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"nvy\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:22', '2026-07-05 01:06:22'),
(575, 'color', 'updated', 'App\\Models\\Color', 'updated', 13, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"olign\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:32', '2026-07-05 01:06:32'),
(576, 'color', 'updated', 'App\\Models\\Color', 'updated', 12, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"ong\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:37', '2026-07-05 01:06:37'),
(577, 'color', 'updated', 'App\\Models\\Color', 'updated', 12, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"orng\"},\"old\":{\"color_code\":\"ong\"}}', NULL, '2026-07-05 01:06:44', '2026-07-05 01:06:44'),
(578, 'color', 'updated', 'App\\Models\\Color', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"tpe\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:53', '2026-07-05 01:06:53'),
(579, 'color', 'updated', 'App\\Models\\Color', 'updated', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"color_code\":\"wht\"},\"old\":{\"color_code\":null}}', NULL, '2026-07-05 01:06:59', '2026-07-05 01:06:59'),
(580, 'product', 'created', 'App\\Models\\Product', 'created', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"category_id\":5,\"style_number\":\"style001\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Sweat Jacket Full-Zip\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"brand_id\":2,\"size_id\":3,\"gender_id\":1,\"barCode\":\"STYLE001-780-gry-M\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":2}}', NULL, '2026-07-05 01:33:56', '2026-07-05 01:33:56'),
(581, 'product', 'updated', 'App\\Models\\Product', 'updated', 7, 'App\\Models\\User', 6, '{\"attributes\":{\"style_number\":\"style0013\",\"barCode\":\"STYLE0013-780-gry-M\"},\"old\":{\"style_number\":\"style001\",\"barCode\":\"STYLE001-780-gry-M\"}}', NULL, '2026-07-05 01:34:12', '2026-07-05 01:34:12'),
(582, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 24, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":1,\"barcode\":[\"STYLE0013-780-gry-M\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-05 01:35:00', '2026-07-05 01:35:00'),
(583, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 7, 'App\\Models\\User', 2, '{\"attributes\":{\"paid_amount\":\"200.00\",\"due_amount\":\"0.00\",\"payment_status\":\"paid\"},\"old\":{\"paid_amount\":\"0.00\",\"due_amount\":\"200.00\",\"payment_status\":\"unpaid\"}}', NULL, '2026-07-05 01:38:34', '2026-07-05 01:38:34'),
(584, 'recurring_payment', 'created', 'App\\Models\\RecurringPayment', 'created', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":7,\"account_id\":null,\"warehouse_id\":2,\"amount\":\"200.00\",\"frequency\":\"manual\",\"paid_on\":\"2026-07-05T00:00:00.000000Z\",\"next_due_date\":null,\"status\":\"completed\",\"note\":null,\"meta\":null}}', NULL, '2026-07-05 01:38:34', '2026-07-05 01:38:34'),
(585, 'recurring_payment', 'updated', 'App\\Models\\RecurringPayment', 'updated', 1, 'App\\Models\\User', 2, '{\"attributes\":{\"account_id\":28},\"old\":{\"account_id\":null}}', NULL, '2026-07-05 01:38:34', '2026-07-05 01:38:34'),
(586, 'product', 'created', 'App\\Models\\Product', 'created', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"category_id\":8,\"style_number\":\"style009\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Sweat Jacket Full-Zip\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"brand_id\":2,\"size_id\":4,\"gender_id\":2,\"barCode\":\"STYLE-780-gry-L\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-05 02:41:08', '2026-07-05 02:41:08'),
(587, 'product', 'deleted', 'App\\Models\\Product', 'deleted', 8, 'App\\Models\\User', 2, '{\"old\":{\"category_id\":8,\"style_number\":\"style009\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"Sweat Jacket Full-Zip\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"brand_id\":2,\"size_id\":4,\"gender_id\":2,\"barCode\":\"STYLE-780-gry-L\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-05 02:42:29', '2026-07-05 02:42:29'),
(588, 'product', 'deleted', 'App\\Models\\Product', 'deleted', 2, 'App\\Models\\User', 2, '{\"old\":{\"category_id\":1,\"style_number\":\"style0093\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"T-shirt\",\"available_stock\":0,\"description\":null,\"color_id\":14,\"fabric_id\":3,\"brand_id\":2,\"size_id\":3,\"gender_id\":1,\"barCode\":\"www\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":2}}', NULL, '2026-07-05 02:42:32', '2026-07-05 02:42:32'),
(589, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":3,\"products\":[{\"product_id\":1,\"quantity\":10,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":3,\"quantity\":5,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":4,\"quantity\":10,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":5,\"quantity\":10,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":6,\"quantity\":5,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}],\"subtotal\":\"0.00\",\"total_amount\":\"0.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"0.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-multi-order-3444\",\"expected_delivery_date\":\"2026-07-25T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 03:19:21', '2026-07-05 03:19:21'),
(590, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(591, 'sell', 'created', 'App\\Models\\Sell', 'created', 13, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":8,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":1,\"quantity\":10,\"po_number\":\"po-multi-order-3444\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(592, 'sell', 'created', 'App\\Models\\Sell', 'created', 14, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":8,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":3,\"quantity\":5,\"po_number\":\"po-multi-order-3444\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(593, 'sell', 'created', 'App\\Models\\Sell', 'created', 15, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":8,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":4,\"quantity\":10,\"po_number\":\"po-multi-order-3444\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(594, 'sell', 'created', 'App\\Models\\Sell', 'created', 16, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":8,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":5,\"quantity\":10,\"po_number\":\"po-multi-order-3444\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(595, 'sell', 'created', 'App\\Models\\Sell', 'created', 17, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":8,\"selling_from\":2,\"sold_to\":5,\"brand_id\":3,\"product_id\":6,\"quantity\":5,\"po_number\":\"po-multi-order-3444\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 03:19:46', '2026-07-05 03:19:46'),
(596, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 03:19:47', '2026-07-05 03:19:47'),
(597, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"multi-order-carton\",\"p_o_number\":\"8\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 03:20:01', '2026-07-05 03:20:01'),
(598, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"carton2-oder po\",\"p_o_number\":\"8\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 03:21:00', '2026-07-05 03:21:00'),
(599, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":14,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-05 03:21:18', '2026-07-05 03:21:18'),
(600, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":4,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-05 03:21:18', '2026-07-05 03:21:18'),
(601, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 13, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":16,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-05 03:21:34', '2026-07-05 03:21:34'),
(602, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":6,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"quantity\":4,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-05 03:21:34', '2026-07-05 03:21:34'),
(603, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 16, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":14,\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]},\"old\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]}}', NULL, '2026-07-05 03:21:48', '2026-07-05 03:21:48'),
(604, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":10,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]},\"old\":{\"quantity\":6,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-05 03:21:48', '2026-07-05 03:21:48'),
(605, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 17, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":15,\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]},\"old\":{\"stocks\":19,\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]}}', NULL, '2026-07-05 03:22:02', '2026-07-05 03:22:02'),
(606, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":14,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]},\"old\":{\"quantity\":10,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]}}', NULL, '2026-07-05 03:22:02', '2026-07-05 03:22:02'),
(607, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 18, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":16,\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]},\"old\":{\"stocks\":18,\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]}}', NULL, '2026-07-05 03:22:16', '2026-07-05 03:22:16'),
(608, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":16,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]},\"old\":{\"quantity\":14,\"product_code\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]}}', NULL, '2026-07-05 03:22:16', '2026-07-05 03:22:16'),
(609, 'carton', 'deleted', 'App\\Models\\Cartoon', 'deleted', 9, 'App\\Models\\User', 2, '{\"old\":{\"cartoon_number\":\"carton2-oder po\",\"p_o_number\":\"8\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 03:22:27', '2026-07-05 03:22:27'),
(610, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-05 03:22:51', '2026-07-05 03:22:51'),
(611, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-05 03:23:44', '2026-07-05 03:23:44'),
(612, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 19, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":6,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]},\"old\":{\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"barcode\":[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]}}', NULL, '2026-07-05 03:23:53', '2026-07-05 03:23:53'),
(613, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 20, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":4,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]},\"old\":{\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"barcode\":[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]}}', NULL, '2026-07-05 03:23:53', '2026-07-05 03:23:53'),
(614, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 21, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":6,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]},\"old\":{\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"barcode\":[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]}}', NULL, '2026-07-05 03:23:53', '2026-07-05 03:23:53'),
(615, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 22, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":7,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]},\"old\":{\"stocks\":3,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"barcode\":[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]}}', NULL, '2026-07-05 03:23:53', '2026-07-05 03:23:53'),
(616, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 23, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":4,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]},\"old\":{\"stocks\":2,\"buying_price\":\"20.00\",\"selling_price\":\"20.00\",\"barcode\":[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]}}', NULL, '2026-07-05 03:23:53', '2026-07-05 03:23:53'),
(617, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 8, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-05T09:23:53.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 03:23:53', '2026-07-05 03:23:53'),
(618, 'fabric', 'updated', 'App\\Models\\Fabric', 'updated', 1, 'App\\Models\\User', 5, '{\"attributes\":{\"ref_number\":null},\"old\":{\"ref_number\":\"dsfasdf\"}}', NULL, '2026-07-05 03:48:52', '2026-07-05 03:48:52'),
(619, 'product', 'created', 'App\\Models\\Product', 'created', 9, 'App\\Models\\User', 5, '{\"attributes\":{\"category_id\":8,\"style_number\":\"test\",\"hs_number\":null,\"ref_number\":\"yh11780\",\"name\":\"demo Product\",\"available_stock\":0,\"description\":null,\"color_id\":8,\"fabric_id\":3,\"brand_id\":2,\"size_id\":3,\"gender_id\":1,\"barCode\":\"TEST-780-gry-M\",\"warehouse_id\":2,\"cover_image\":null,\"gallery_images\":[],\"season_id\":1}}', NULL, '2026-07-05 03:55:04', '2026-07-05 03:55:04'),
(620, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 26, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":5,\"barcode\":[\"www\",\"www\",\"www\",\"www\",\"www\"]},\"old\":{\"stocks\":0,\"barcode\":null}}', NULL, '2026-07-05 03:56:15', '2026-07-05 03:56:15'),
(621, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 9, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":9,\"quantity\":2,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}],\"subtotal\":\"0.00\",\"total_amount\":\"0.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"0.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"aserqaaaaa\",\"expected_delivery_date\":\"2026-07-25T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 03:56:58', '2026-07-05 03:56:58'),
(622, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-05 03:57:14', '2026-07-05 03:57:14'),
(623, 'sell', 'created', 'App\\Models\\Sell', 'created', 18, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":9,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":9,\"quantity\":2,\"po_number\":\"aserqaaaaa\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 03:57:14', '2026-07-05 03:57:14'),
(624, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 03:57:15', '2026-07-05 03:57:15'),
(625, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"weeeeee\",\"p_o_number\":\"9\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 03:57:20', '2026-07-05 03:57:20'),
(626, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 26, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":2,\"barcode\":[\"www\",\"www\"]},\"old\":{\"stocks\":5,\"barcode\":[\"www\",\"www\",\"www\",\"www\",\"www\"]}}', NULL, '2026-07-05 03:57:45', '2026-07-05 03:57:45'),
(627, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"www\",\"www\",\"www\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-05 03:57:45', '2026-07-05 03:57:45'),
(628, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 26, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":3,\"barcode\":[\"www\",\"www\",\"www\"]},\"old\":{\"stocks\":2,\"barcode\":[\"www\",\"www\"]}}', NULL, '2026-07-05 03:57:49', '2026-07-05 03:57:49'),
(629, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"www\",\"www\"]},\"old\":{\"quantity\":3,\"product_code\":[\"www\",\"www\",\"www\"]}}', NULL, '2026-07-05 03:57:49', '2026-07-05 03:57:49'),
(630, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-05 03:58:13', '2026-07-05 03:58:13'),
(631, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 9, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-05 03:58:16', '2026-07-05 03:58:16'),
(632, 'stock', 'created', 'App\\Models\\Stock', 'created', 27, 'App\\Models\\User', 6, '{\"attributes\":{\"product_id\":9,\"stocks\":2,\"buying_price\":\"0.00\",\"selling_price\":\"0.00\",\"warehouse_id\":5,\"brand_id\":2,\"cartoon_id\":null,\"barcode\":[\"www\",\"www\"]}}', NULL, '2026-07-05 03:58:24', '2026-07-05 03:58:24'),
(633, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-05T09:58:24.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 03:58:24', '2026-07-05 03:58:24'),
(634, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":9,\"quantity\":2,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}],\"subtotal\":\"0.00\",\"total_amount\":\"0.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"0.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"apsdpfosds\",\"expected_delivery_date\":\"2026-07-25T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 04:03:09', '2026-07-05 04:03:09'),
(635, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-05 04:03:43', '2026-07-05 04:03:43'),
(636, 'sell', 'created', 'App\\Models\\Sell', 'created', 19, 'App\\Models\\User', 2, '{\"attributes\":{\"purchase_id\":10,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":9,\"quantity\":2,\"po_number\":\"apsdpfosds\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 04:03:43', '2026-07-05 04:03:43'),
(637, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 04:03:44', '2026-07-05 04:03:44'),
(638, 'carton', 'created', 'App\\Models\\Cartoon', 'created', 11, 'App\\Models\\User', 2, '{\"attributes\":{\"cartoon_number\":\"cartoon 001-9977777\",\"p_o_number\":\"10\",\"quantity\":0,\"product_code\":null,\"rack_id\":null,\"rack_row_id\":null,\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 04:03:53', '2026-07-05 04:03:53'),
(639, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 26, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":6,\"barcode\":[\"www\",\"www\",\"www\",\"original\",\"original\",\"original\"]},\"old\":{\"stocks\":3,\"barcode\":[\"www\",\"www\",\"www\"]}}', NULL, '2026-07-05 04:05:50', '2026-07-05 04:05:50'),
(640, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 26, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":4,\"barcode\":[\"www\",\"www\",\"www\",\"original\"]},\"old\":{\"stocks\":6,\"barcode\":[\"www\",\"www\",\"www\",\"original\",\"original\",\"original\"]}}', NULL, '2026-07-05 04:05:59', '2026-07-05 04:05:59'),
(641, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 11, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":2,\"product_code\":[\"original\",\"original\"]},\"old\":{\"quantity\":0,\"product_code\":null}}', NULL, '2026-07-05 04:05:59', '2026-07-05 04:05:59'),
(642, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 26, 'App\\Models\\User', 2, '{\"attributes\":{\"stocks\":3,\"barcode\":[\"www\",\"www\",\"www\"]},\"old\":{\"stocks\":4,\"barcode\":[\"www\",\"www\",\"www\",\"original\"]}}', NULL, '2026-07-05 04:06:10', '2026-07-05 04:06:10'),
(643, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 11, 'App\\Models\\User', 2, '{\"attributes\":{\"quantity\":3,\"product_code\":[\"original\",\"original\",\"original\"]},\"old\":{\"quantity\":2,\"product_code\":[\"original\",\"original\"]}}', NULL, '2026-07-05 04:06:10', '2026-07-05 04:06:10'),
(644, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 2, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-05 04:06:30', '2026-07-05 04:06:30'),
(645, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 10, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-05T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-05 04:06:59', '2026-07-05 04:06:59'),
(646, 'stock', 'updated', 'App\\Models\\Stock', 'updated', 27, 'App\\Models\\User', 6, '{\"attributes\":{\"stocks\":5,\"barcode\":[\"www\",\"www\",\"original\",\"original\",\"original\"]},\"old\":{\"stocks\":2,\"barcode\":[\"www\",\"www\"]}}', NULL, '2026-07-05 04:07:17', '2026-07-05 04:07:17'),
(647, 'carton', 'updated', 'App\\Models\\Cartoon', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"warehouse_id\":5,\"received_to_stock_at\":\"2026-07-05T10:07:17.000000Z\",\"received_to_stock_by\":6},\"old\":{\"warehouse_id\":2,\"received_to_stock_at\":null,\"received_to_stock_by\":null}}', NULL, '2026-07-05 04:07:17', '2026-07-05 04:07:17'),
(648, 'purchase', 'created', 'App\\Models\\Purchase', 'created', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_form\":2,\"purchase_to\":5,\"brand_id\":2,\"products\":[{\"product_id\":1,\"quantity\":2,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}],\"subtotal\":\"0.00\",\"total_amount\":\"0.00\",\"paid_amount\":\"0.00\",\"due_amount\":\"0.00\",\"payment_status\":\"unpaid\",\"payment_method\":null,\"po_number\":\"po-0094-009\",\"expected_delivery_date\":\"2026-07-26T00:00:00.000000Z\",\"status\":\"pending\",\"shipping_date\":null,\"received_date\":null,\"note\":null,\"quickbooks_sync_status\":null,\"quickbooks_synced_at\":null,\"quickbooks_txn_id\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 23:05:21', '2026-07-05 23:05:21'),
(649, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"approved\"},\"old\":{\"status\":\"pending\"}}', NULL, '2026-07-05 23:10:03', '2026-07-05 23:10:03'),
(650, 'sell', 'created', 'App\\Models\\Sell', 'created', 20, 'App\\Models\\User', 6, '{\"attributes\":{\"purchase_id\":11,\"selling_from\":2,\"sold_to\":5,\"brand_id\":2,\"product_id\":1,\"quantity\":2,\"po_number\":\"po-0094-009\",\"purchase_price\":\"0.00\",\"selling_price\":\"0.00\",\"status\":\"approved\"}}', NULL, '2026-07-05 23:10:03', '2026-07-05 23:10:03'),
(651, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"quickbooks_sync_status\":\"failed\",\"quickbooks_last_error\":\"cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https:\\/\\/curl.haxx.se\\/libcurl\\/c\\/libcurl-errors.html) for https:\\/\\/oauth.platform.intuit.com\\/oauth2\\/v1\\/tokens\\/bearer\"},\"old\":{\"quickbooks_sync_status\":null,\"quickbooks_last_error\":null}}', NULL, '2026-07-05 23:10:04', '2026-07-05 23:10:04'),
(652, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"shipped\",\"shipping_date\":\"2026-07-06T00:00:00.000000Z\"},\"old\":{\"status\":\"approved\",\"shipping_date\":null}}', NULL, '2026-07-05 23:38:17', '2026-07-05 23:38:17'),
(653, 'purchase', 'updated', 'App\\Models\\Purchase', 'updated', 11, 'App\\Models\\User', 6, '{\"attributes\":{\"status\":\"received\",\"received_date\":\"2026-07-06T00:00:00.000000Z\"},\"old\":{\"status\":\"shipped\",\"received_date\":null}}', NULL, '2026-07-05 23:38:45', '2026-07-05 23:38:45'),
(654, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-05 23:40:31', '2026-07-05 23:40:31'),
(655, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-05 23:40:34', '2026-07-05 23:40:34'),
(656, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/permissions\\/by-category\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-05 23:40:34', '2026-07-05 23:40:34'),
(657, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"PUT\",\"path\":\"api\\/roles\\/3\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-05 23:41:59', '2026-07-05 23:41:59'),
(658, 'super-admin-access', 'Super admin route accessed', NULL, 'access', NULL, 'App\\Models\\User', 5, '{\"method\":\"GET\",\"path\":\"api\\/roles\",\"ip\":\"127.0.0.1\"}', NULL, '2026-07-05 23:42:00', '2026-07-05 23:42:00');

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sanctum_token_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `abilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`abilities`)),
  `warehouse_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`warehouse_ids`)),
  `key_preview` varchar(100) DEFAULT NULL,
  `api_key_encrypted` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_keys`
--

INSERT INTO `api_keys` (`id`, `sanctum_token_id`, `user_id`, `created_by`, `name`, `abilities`, `warehouse_ids`, `key_preview`, `api_key_encrypted`, `last_used_at`, `expires_at`, `revoked_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 16, 4, 5, 'Canada Warehouse stock', '[\"stocks:read\",\"warehouse:4\"]', '[4]', '16|xwMWH***************************************0c3c', 'eyJpdiI6Ik5FSHE2R3E2ajBXM1RIbGh1MTUyS0E9PSIsInZhbHVlIjoiMWxHcEcrbHUwMnNPTFppQmQxZmYvTU10aklmM21ZTmFtaGd6dGpzUWFvQUtzc2o0YjBkWGQ3L1dMUjFnaGNPV2xPSFhaTG14aExVL1QzYUxXRG1LVUE9PSIsIm1hYyI6ImMwOGUxNTBhNTdiNmE1ZTY0N2JhODc1YTg1YjE2MzFlOTg1MjhiOTBhMTFmM2JlOWI1MjdiZWZkZTNhMDIyZWYiLCJ0YWciOiIifQ==', NULL, '2026-06-15 20:59:00', NULL, 1, '2026-06-06 00:57:22', '2026-06-06 00:57:22'),
(2, 17, 4, 5, 'asdfdfsdf', '[\"stocks:read\",\"warehouse:4\"]', '[4]', '17|rsHAa***************************************3507', 'eyJpdiI6IlRXNHlwOTFQY25Mbi9NelN5SXJXVkE9PSIsInZhbHVlIjoib3BuSklRWjBqRHBodUxSdHB3RHhRcEJSbEhVaVZRSFdWVVZGRStQeHNKTFN2bTRFSnFxemVNbk82b3JPYWhJSXRqSU13a3BYbCtFanBRZ2ZydVYrdGc9PSIsIm1hYyI6ImVkMmExNGI3ZTYzMWZiMDEwNjRlMGU1MzRjZDBlYTRkOTVlYWMzMzI3NjJmYjFiNTI3MzI0YWYzNmIwNGI2YzMiLCJ0YWciOiIifQ==', '2026-06-06 04:12:45', '2026-06-19 09:21:00', NULL, 1, '2026-06-06 03:21:18', '2026-06-06 04:12:45'),
(3, 18, 6, 5, 'sdfsd', '[\"stocks:read\",\"warehouse:5\"]', '[5]', '18|Kj66v***************************************4aca', 'eyJpdiI6IldZR3BRNmdJK0cySFFqemlxUmNseFE9PSIsInZhbHVlIjoiKzhIS1N0cFdSWWN1bi9XZDMvYjVSK0ZhRDcxU3E1YXBhU0R0WWpqRElsa1N2STcrNHgzWUtGOVlzODR5KzdCSGFoT3NJRjhlT0wybWRHTmlxMlRqNnc9PSIsIm1hYyI6IjhhNGE5NjBiMTNjZTNhOGJlMWU4YTFmNjZmNjQzN2NjOGFlNTgwM2JlYjVlNTk4OTE5YmNkOGE3MDdjOTUyYzkiLCJ0YWciOiIifQ==', NULL, NULL, NULL, 1, '2026-06-28 04:58:08', '2026-06-28 04:58:08');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, '1971co', '2026-04-26 06:40:26', '2026-05-25 23:01:05', NULL),
(3, 'Viveren', '2026-05-18 23:38:18', '2026-05-18 23:38:18', NULL),
(4, 'Timeless', '2026-05-18 23:38:27', '2026-05-18 23:38:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1783316623),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1783316623;', 1783316623);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cartoons`
--

CREATE TABLE `cartoons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cartoon_number` varchar(255) NOT NULL,
  `p_o_number` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `product_code` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_code`)),
  `rack_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rack_row_id` bigint(20) UNSIGNED DEFAULT NULL,
  `warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `received_to_stock_at` timestamp NULL DEFAULT NULL,
  `received_to_stock_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cartoons`
--

INSERT INTO `cartoons` (`id`, `cartoon_number`, `p_o_number`, `quantity`, `product_code`, `rack_id`, `rack_row_id`, `warehouse_id`, `received_to_stock_at`, `received_to_stock_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'cartoon 001', '1', 3, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', NULL, NULL, 5, '2026-07-01 23:46:48', 6, '2026-07-01 23:45:35', '2026-07-01 23:46:48', NULL),
(2, 'cartoon 0012', '2', 2, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', NULL, NULL, 5, '2026-07-02 01:08:10', 6, '2026-07-02 01:06:12', '2026-07-02 01:08:10', NULL),
(3, 'cartoon 0013', '3', 2, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', NULL, NULL, 5, '2026-07-02 01:12:07', 6, '2026-07-02 01:11:05', '2026-07-02 01:12:07', NULL),
(4, 'cartoon-005', '4', 3, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', NULL, NULL, 5, '2026-07-03 22:08:14', 6, '2026-07-03 22:06:38', '2026-07-03 22:08:14', NULL),
(5, 'cartoon 9875453653213216546', '5', 3, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', NULL, NULL, 5, '2026-07-04 01:35:39', 6, '2026-07-04 01:32:25', '2026-07-04 01:35:39', NULL),
(6, 'cartoon-multi-order', '6', 4, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]', NULL, NULL, 5, '2026-07-04 22:27:45', 6, '2026-07-04 22:24:23', '2026-07-04 22:27:45', NULL),
(7, 'carton-multi-order-065', '7', 11, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]', NULL, NULL, 5, '2026-07-05 00:30:38', 6, '2026-07-05 00:26:50', '2026-07-05 00:30:38', NULL),
(8, 'multi-order-carton', '8', 16, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]', NULL, NULL, 5, '2026-07-05 03:23:53', 6, '2026-07-05 03:20:01', '2026-07-05 03:23:53', NULL),
(9, 'carton2-oder po', '8', 0, NULL, NULL, NULL, 2, NULL, NULL, '2026-07-05 03:21:00', '2026-07-05 03:22:27', '2026-07-05 03:22:27'),
(10, 'weeeeee', '9', 2, '[\"www\",\"www\"]', NULL, NULL, 5, '2026-07-05 03:58:24', 6, '2026-07-05 03:57:20', '2026-07-05 03:58:24', NULL),
(11, 'cartoon 001-9977777', '10', 3, '[\"original\",\"original\",\"original\"]', NULL, NULL, 5, '2026-07-05 04:07:17', 6, '2026-07-05 04:03:53', '2026-07-05 04:07:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'T-Shirt', '2026-05-10 02:09:09', '2026-05-26 01:06:51'),
(2, 'Under Shirt', '2026-05-26 01:06:18', '2026-05-26 01:07:03'),
(3, 'Hoodie', '2026-05-26 01:07:16', '2026-05-26 01:07:16'),
(4, 'Sweat Shirt', '2026-05-26 01:07:24', '2026-05-26 01:07:24'),
(5, 'Jacket', '2026-05-26 01:07:56', '2026-05-26 01:07:56'),
(6, 'Vest', '2026-05-26 01:08:06', '2026-05-26 01:08:06'),
(7, 'Shorts', '2026-05-26 01:08:16', '2026-05-26 01:08:16'),
(8, 'Joggers', '2026-05-26 01:08:27', '2026-05-26 01:08:27'),
(9, 'Tank Tops', '2026-05-26 01:11:10', '2026-05-26 01:11:10'),
(10, 'Polo Shirt', '2026-06-28 07:49:54', '2026-06-28 07:49:54');

-- --------------------------------------------------------

--
-- Table structure for table `colors`
--

CREATE TABLE `colors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `color_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `colors`
--

INSERT INTO `colors` (`id`, `name`, `color_code`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'Red', 'red', '2026-04-27 22:17:15', '2026-05-26 01:21:43', '2026-05-26 01:21:43'),
(4, 'Blue', 'blue', '2026-04-27 22:17:21', '2026-05-26 01:21:46', '2026-05-26 01:21:46'),
(5, 'Black', 'black', '2026-04-27 22:17:30', '2026-05-26 01:21:48', '2026-05-26 01:21:48'),
(6, 'Smoky Heather', 'SMKHT', '2026-05-10 02:59:06', '2026-05-26 01:21:41', '2026-05-26 01:21:41'),
(7, 'Mountain Blue', 'mtnble', '2026-05-26 01:21:57', '2026-07-05 01:06:13', NULL),
(8, 'Gray', 'gry', '2026-05-26 01:23:56', '2026-07-05 01:06:03', NULL),
(9, 'Black Beauty', 'BLKBT', '2026-05-26 01:27:37', '2026-07-04 22:20:09', NULL),
(10, 'White', 'wht', '2026-05-26 01:27:55', '2026-07-05 01:06:59', NULL),
(11, 'Taupe', 'tpe', '2026-06-28 07:51:11', '2026-07-05 01:06:53', NULL),
(12, 'Orange', 'orng', '2026-06-28 07:58:00', '2026-07-05 01:06:44', NULL),
(13, 'Olive Green', 'olign', '2026-06-28 07:59:59', '2026-07-05 01:06:32', NULL),
(14, 'Navy', 'nvy', '2026-06-28 08:00:14', '2026-07-05 01:06:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(2) NOT NULL,
  `currency_code` varchar(3) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `name`, `code`, `currency_code`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'Bangladesh', 'BD', 'BDT', '2026-04-24 23:46:22', '2026-04-25 05:22:19', NULL),
(4, 'Canadas', 'CA', 'CAD', '2026-04-25 02:33:56', '2026-05-25 23:09:06', NULL),
(5, 'United States of America', 'US', 'USD', '2026-05-07 06:19:07', '2026-05-07 06:19:07', NULL),
(6, 'asdfasdfsda', 'SD', 'DSA', '2026-05-09 03:17:53', '2026-05-09 03:58:35', '2026-05-09 03:58:35'),
(7, 'Test', 'TT', 'TTT', '2026-05-25 22:53:12', '2026-05-25 23:02:26', '2026-05-25 23:02:26');

-- --------------------------------------------------------

--
-- Table structure for table `fabrics`
--

CREATE TABLE `fabrics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `composition` varchar(200) DEFAULT NULL,
  `construction` varchar(200) DEFAULT NULL,
  `ref_number` varchar(100) DEFAULT NULL,
  `gsm` decimal(8,2) DEFAULT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fabrics`
--

INSERT INTO `fabrics` (`id`, `name`, `type`, `composition`, `construction`, `ref_number`, `gsm`, `supplier_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Gabadin update', 'teat', '<p>sdfasd</p>', 'asdfsdf', NULL, 234.00, 1, '2026-04-27 00:26:19', '2026-07-05 03:48:52', NULL),
(3, 'knit', 'single jersey', '<p>100%cottom</p>', '40X40', 'yh11780', 180.00, 1, '2026-05-10 03:52:48', '2026-05-10 03:52:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_24_082423_create_personal_access_tokens_table', 2),
(5, '2026_04_25_000003_create_countries_table', 2),
(6, '2026_04_25_064920_create_states_table', 3),
(7, '2026_04_25_103705_create_ware_houses_table', 4),
(8, '2026_04_25_210000_create_warehouses_table', 5),
(9, '2026_04_25_220000_add_warehouse_id_to_users_table', 6),
(10, '2026_04_25_230000_create_roles_and_permissions_tables', 7),
(11, '2026_04_26_000000_change_warehouse_to_json_add_roles_to_users', 8),
(12, '2026_04_26_010000_create_products_for_table', 9),
(13, '2026_04_26_010100_add_manage_products_for_permission', 9),
(14, '2026_04_26_020000_change_products_for_age_limit_to_string', 10),
(15, '2026_04_26_072754_create_racks_table', 11),
(16, '2026_04_26_080000_add_manage_rack_permission', 12),
(17, '2026_04_26_090000_create_rack_rows_table', 12),
(18, '2026_04_26_090100_add_manage_rack_row_permission', 12),
(19, '2026_04_26_112857_create_brands_table', 13),
(20, '2026_04_27_040822_create_colors_table', 14),
(21, '2026_04_27_052503_create_fabrics_table', 15),
(22, '2026_04_27_063537_create_sizes_table', 16),
(26, '2026_04_27_082657_create_products_table', 17),
(27, '2026_04_27_120000_add_manage_product_permission', 18),
(28, '2026_04_27_130000_add_product_images_to_products_table', 19),
(29, '2026_04_29_052926_create_cartoons_table', 20),
(30, '2026_04_30_050000_add_available_stock_to_products_table', 21),
(31, '2026_04_30_120000_create_stocks_table', 22),
(32, '2026_04_30_130000_create_purchases_table', 23),
(33, '2026_04_30_210000_create_sells_table', 24),
(34, '2026_04_30_220000_add_purchase_id_to_sells_table', 25),
(35, '2026_05_02_120000_change_stocks_barcode_to_json', 26),
(36, '2026_05_04_000000_change_purchases_products_to_json', 27),
(37, '2026_05_04_120000_fix_sells_unique_for_purchase_products', 28),
(38, '2026_05_05_044109_create_seasons_table', 29),
(39, '2026_05_05_061032_update_products_table', 30),
(40, '2026_05_05_000001_add_fields_to_fabrics_table', 31),
(41, '2026_05_05_080604_create_suppliers_table', 32),
(42, '2026_05_05_100000_add_supplier_id_to_fabrics_table', 33),
(43, '2026_05_05_110000_add_ref_number_to_products_table', 34),
(45, '2026_05_09_063453_update_cartoons_table_add_p_o', 35),
(46, '2026_05_09_072236_update_cartoon_table_add_quantity', 35),
(47, '2026_05_09_090000_add_product_code_to_cartoons_table', 36),
(48, '2026_05_09_100000_add_soft_deletes_to_all_tables', 37),
(49, '2026_05_09_120000_add_rack_columns_to_cartoons_table', 38),
(50, '2026_05_09_130000_add_warehouse_id_to_cartoons_table', 39),
(51, '2026_05_09_140000_remove_ref_number_unique_from_products_table', 40),
(52, '2026_05_09_150000_add_note_to_purchases_table', 41),
(53, '2026_05_10_120000_add_hs_number_to_products_table', 42),
(54, '2026_05_10_130000_create_categories_table', 43),
(55, '2026_05_10_140000_add_category_id_to_products_table', 44),
(56, '2026_05_10_150000_add_color_code_to_colors_table', 45),
(57, '2026_05_11_120000_add_shipping_and_received_dates_to_purchases_table', 46),
(58, '2026_05_11_200000_create_retail_sales_table', 47),
(63, '2026_05_12_052310_create_heroes_table', 48),
(64, '2026_05_17_120000_create_api_keys_table', 49),
(65, '2026_05_18_120000_add_buying_and_selling_price_to_stocks_table', 50),
(66, '2026_05_19_000000_add_granular_permissions', 51),
(67, '2026_05_19_120000_add_received_to_stock_columns_to_cartoons_table', 52),
(68, '2026_05_23_180000_add_totals_and_payment_fields_to_purchases_table', 53),
(69, '2026_05_23_190000_create_accounts_table', 54),
(70, '2026_05_23_191000_create_recurring_payments_table', 54),
(71, '2026_05_23_192000_create_received_cartoon_issues_table', 55),
(72, '2026_05_26_043549_create_activity_log_table', 56),
(73, '2026_05_26_043550_add_event_column_to_activity_log_table', 56),
(74, '2026_05_26_043551_add_batch_uuid_column_to_activity_log_table', 56),
(75, '2026_05_26_120100_create_styles_table_and_link_products', 57),
(76, '2026_05_26_130000_simplify_styles_table_to_name_only', 58),
(77, '2026_06_18_053840_remove_brand_id_from_products_table', 59),
(78, '2026_06_18_054953_add_brand_id_to_purchases_table', 60),
(79, '2026_06_18_120500_create_warehouse_brand_table', 61),
(80, '2026_06_18_123000_add_brand_id_to_stocks_table', 62),
(81, '2026_06_18_180500_add_brand_id_to_accounts_retail_sales_and_sells_tables', 63),
(82, '2026_06_18_210000_create_quickbook_connections_table', 64),
(83, '2026_06_18_210100_create_quickbook_sync_logs_table', 64),
(84, '2026_06_24_050115_create_quickbooks__tokens_table', 65),
(85, '2026_06_24_120500_add_quickbooks_sync_columns_to_purchases_table', 66),
(86, '2026_06_24_130000_add_quickbooks_sync_columns_to_retail_sales_table', 67),
(87, '2026_06_27_050330_create_remote_orders_table', 68),
(88, '2026_06_27_160500_add_courier_company_to_remote_orders_table', 69),
(89, '2026_06_27_201500_add_courier_api_status_to_remote_orders_table', 70),
(90, '2026_06_28_060110_add_expected_order_date', 71),
(91, '2026_07_01_040638_create_shiping_times_table', 72),
(92, '2026_07_01_150000_add_shipments_permissions', 73),
(93, '2026_07_02_130000_create_product_brand_table', 74),
(94, '2026_07_02_053534_add_brand_id_to_products_table', 75),
(97, '2026_07_06_052224_tmp_check_packing_list', 77),
(98, '2026_07_06_000000_add_packing_list_to_purchases_table', 78);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `slug`, `category`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'View Dashboard', 'view-dashboard', 'general', '2026-04-25 06:11:36', '2026-04-25 06:11:36', NULL),
(2, 'Manage Warehouse', 'manage-warehouses', 'general', '2026-04-25 06:11:36', '2026-04-25 06:11:36', NULL),
(5, 'Manage Users', 'manage-users', 'general', '2026-04-25 06:11:36', '2026-04-25 06:11:36', NULL),
(6, 'Manage Roles', 'manage-roles', 'general', '2026-04-25 06:11:36', '2026-04-25 06:11:36', NULL),
(8, 'Manage Storage', 'manage-storage', 'general', '2026-04-26 03:14:19', '2026-04-26 03:14:19', NULL),
(10, 'Manage Production', 'manage-Production', 'general', NULL, NULL, NULL),
(17, 'Manage Packaging', 'manage-packaging', 'general', NULL, NULL, NULL),
(18, 'Create Countries', 'create-countries', 'countries', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(19, 'Read Countries', 'read-countries', 'countries', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(20, 'Update Countries', 'update-countries', 'countries', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(21, 'Delete Countries', 'delete-countries', 'countries', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(22, 'Create States', 'create-states', 'states', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(23, 'Read States', 'read-states', 'states', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(24, 'Update States', 'update-states', 'states', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(25, 'Delete States', 'delete-states', 'states', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(26, 'Create Warehouses', 'create-warehouses', 'warehouses', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(27, 'Read Warehouses', 'read-warehouses', 'warehouses', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(28, 'Update Warehouses', 'update-warehouses', 'warehouses', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(29, 'Delete Warehouses', 'delete-warehouses', 'warehouses', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(30, 'Create Users', 'create-users', 'users', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(31, 'Read Users', 'read-users', 'users', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(32, 'Update Users', 'update-users', 'users', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(33, 'Delete Users', 'delete-users', 'users', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(34, 'Create Roles', 'create-roles', 'roles', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(35, 'Read Roles', 'read-roles', 'roles', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(36, 'Update Roles', 'update-roles', 'roles', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(37, 'Delete Roles', 'delete-roles', 'roles', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(38, 'Create Products', 'create-products', 'products', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(39, 'Read Products', 'read-products', 'products', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(40, 'Update Products', 'update-products', 'products', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(41, 'Delete Products', 'delete-products', 'products', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(42, 'Create Stocks', 'create-stocks', 'stocks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(43, 'Read Stocks', 'read-stocks', 'stocks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(44, 'Update Stocks', 'update-stocks', 'stocks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(45, 'Delete Stocks', 'delete-stocks', 'stocks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(46, 'Create Purchases', 'create-purchases', 'purchases', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(47, 'Read Purchases', 'read-purchases', 'purchases', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(48, 'Update Purchases', 'update-purchases', 'purchases', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(49, 'Delete Purchases', 'delete-purchases', 'purchases', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(50, 'Create Sales', 'create-sales', 'sales', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(51, 'Read Sales', 'read-sales', 'sales', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(52, 'Update Sales', 'update-sales', 'sales', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(53, 'Delete Sales', 'delete-sales', 'sales', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(54, 'Create Brands', 'create-brands', 'brands', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(55, 'Read Brands', 'read-brands', 'brands', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(56, 'Update Brands', 'update-brands', 'brands', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(57, 'Delete Brands', 'delete-brands', 'brands', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(58, 'Create Categories', 'create-categories', 'categories', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(59, 'Read Categories', 'read-categories', 'categories', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(60, 'Update Categories', 'update-categories', 'categories', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(61, 'Delete Categories', 'delete-categories', 'categories', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(62, 'Create Colors', 'create-colors', 'colors', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(63, 'Read Colors', 'read-colors', 'colors', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(64, 'Update Colors', 'update-colors', 'colors', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(65, 'Delete Colors', 'delete-colors', 'colors', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(66, 'Create Fabrics', 'create-fabrics', 'fabrics', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(67, 'Read Fabrics', 'read-fabrics', 'fabrics', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(68, 'Update Fabrics', 'update-fabrics', 'fabrics', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(69, 'Delete Fabrics', 'delete-fabrics', 'fabrics', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(70, 'Create Suppliers', 'create-suppliers', 'suppliers', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(71, 'Read Suppliers', 'read-suppliers', 'suppliers', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(72, 'Update Suppliers', 'update-suppliers', 'suppliers', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(73, 'Delete Suppliers', 'delete-suppliers', 'suppliers', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(74, 'Create Seasons', 'create-seasons', 'seasons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(75, 'Read Seasons', 'read-seasons', 'seasons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(76, 'Update Seasons', 'update-seasons', 'seasons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(77, 'Delete Seasons', 'delete-seasons', 'seasons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(78, 'Create Sizes', 'create-sizes', 'sizes', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(79, 'Read Sizes', 'read-sizes', 'sizes', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(80, 'Update Sizes', 'update-sizes', 'sizes', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(81, 'Delete Sizes', 'delete-sizes', 'sizes', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(82, 'Create Racks', 'create-racks', 'racks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(83, 'Read Racks', 'read-racks', 'racks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(84, 'Update Racks', 'update-racks', 'racks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(85, 'Delete Racks', 'delete-racks', 'racks', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(86, 'Create Cartoons', 'create-cartoons', 'cartoons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(87, 'Read Cartoons', 'read-cartoons', 'cartoons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(88, 'Update Cartoons', 'update-cartoons', 'cartoons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(89, 'Delete Cartoons', 'delete-cartoons', 'cartoons', '2026-05-18 22:47:07', '2026-05-18 22:47:07', NULL),
(90, 'Create Shipments', 'create-shipments', 'shipments', '2026-07-01 01:52:52', '2026-07-01 01:52:52', NULL),
(91, 'Read Shipments', 'read-shipments', 'shipments', '2026-07-01 01:52:52', '2026-07-01 01:52:52', NULL),
(92, 'Update Shipments', 'update-shipments', 'shipments', '2026-07-01 01:52:52', '2026-07-01 01:52:52', NULL),
(93, 'Delete Shipments', 'delete-shipments', 'shipments', '2026-07-01 01:52:52', '2026-07-01 01:52:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_role`
--

INSERT INTO `permission_role` (`id`, `permission_id`, `role_id`, `created_at`, `updated_at`) VALUES
(2, 2, 1, NULL, NULL),
(3, 6, 1, NULL, NULL),
(4, 5, 1, NULL, NULL),
(5, 1, 1, NULL, NULL),
(8, 8, 1, '2026-04-26 03:14:19', '2026-04-26 03:14:19'),
(15, 1, 3, NULL, NULL),
(16, 5, 3, NULL, NULL),
(20, 8, 3, NULL, NULL),
(21, 2, 3, NULL, NULL),
(23, 17, 3, NULL, NULL),
(24, 54, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(25, 86, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(26, 58, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(27, 62, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(28, 18, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(29, 66, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(30, 38, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(31, 46, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(32, 82, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(33, 34, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(34, 50, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(35, 74, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(36, 78, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(37, 22, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(38, 42, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(39, 70, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(40, 30, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(41, 26, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(42, 57, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(43, 89, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(44, 61, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(45, 65, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(46, 21, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(47, 69, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(48, 41, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(49, 49, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(50, 85, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(51, 37, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(52, 53, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(53, 77, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(54, 81, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(55, 25, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(56, 45, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(57, 73, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(58, 33, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(59, 29, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(60, 17, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(61, 10, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(62, 55, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(63, 87, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(64, 59, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(65, 63, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(66, 19, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(67, 67, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(68, 39, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(69, 47, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(70, 83, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(71, 35, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(72, 51, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(73, 75, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(74, 79, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(75, 23, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(76, 43, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(77, 71, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(78, 31, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(79, 27, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(80, 56, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(81, 88, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(82, 60, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(83, 64, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(84, 20, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(85, 68, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(86, 40, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(87, 48, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(88, 84, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(89, 36, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(90, 52, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(91, 76, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(92, 80, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(93, 24, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(94, 44, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(95, 72, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(96, 32, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(97, 28, 1, '2026-05-18 22:47:07', '2026-05-18 22:47:07'),
(102, 42, 3, NULL, NULL),
(103, 43, 3, NULL, NULL),
(104, 44, 3, NULL, NULL),
(105, 45, 3, NULL, NULL),
(107, 47, 3, NULL, NULL),
(110, 46, 3, NULL, NULL),
(111, 48, 3, NULL, NULL),
(112, 49, 3, NULL, NULL),
(114, 86, 3, NULL, NULL),
(115, 87, 3, NULL, NULL),
(116, 88, 3, NULL, NULL),
(117, 89, 3, NULL, NULL),
(118, 83, 3, NULL, NULL),
(119, 84, 3, NULL, NULL),
(120, 82, 3, NULL, NULL),
(121, 85, 3, NULL, NULL),
(122, 50, 3, NULL, NULL),
(123, 51, 3, NULL, NULL),
(124, 52, 3, NULL, NULL),
(125, 53, 3, NULL, NULL),
(127, 90, 1, '2026-07-01 01:52:52', '2026-07-01 01:52:52'),
(128, 93, 1, '2026-07-01 01:52:52', '2026-07-01 01:52:52'),
(129, 91, 1, '2026-07-01 01:52:52', '2026-07-01 01:52:52'),
(130, 92, 1, '2026-07-01 01:52:52', '2026-07-01 01:52:52'),
(135, 39, 3, NULL, NULL),
(136, 27, 3, NULL, NULL),
(151, 31, 3, NULL, NULL),
(160, 55, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 4, 'qqqssss', '499ca1088dcdfa8a3f583da14503e460de51a247015dc5a0492fd4daa8efccae', '[\"stocks:read\",\"warehouse:4\"]', NULL, '2026-05-12 08:44:00', '2026-05-17 00:42:25', '2026-05-17 00:42:25'),
(3, 'App\\Models\\User', 4, 'asdfasdfasdf', '72a41896f679a4b059687f757da592f4a8396574d9c10fe52c6f6bfa5639f875', '[\"stocks:read\",\"warehouse:4\"]', NULL, '2026-05-12 11:52:00', '2026-05-17 00:47:05', '2026-05-17 00:47:05'),
(4, 'App\\Models\\User', 4, 'Timeless Canada Key', '812499d56752205669ef4a838dc901c01b5338f33d1afb9e04b435545fa560be', '[\"stocks:read\",\"warehouse:4\"]', '2026-05-17 01:44:53', NULL, '2026-05-17 01:37:21', '2026-05-17 01:44:53'),
(5, 'App\\Models\\User', 2, 'timeless canada key', '1f5f508bd608d4288590e77ed45a3a8b4ac3dd2e2ec01651e321a2b2574731f5', '[\"stocks:read\",\"warehouse:2\"]', '2026-05-17 01:44:03', NULL, '2026-05-17 01:42:56', '2026-05-17 01:44:03'),
(6, 'App\\Models\\User', 4, 'Timeless Canada Key', '8b241491976db6e884cb4570d810df0166e3b8149412ecdd3db6b66f3d17eb19', '[\"stocks:read\",\"warehouse:4\"]', '2026-05-17 02:16:58', NULL, '2026-05-17 01:45:26', '2026-05-17 02:16:58'),
(9, 'App\\Models\\User', 2, 'Timeless', '647463cc56d18e8dfe422b5b2717f5b39d6824c1bf0171bb112f24bb3c81bb98', '[\"stocks:read\",\"warehouse:2\"]', NULL, '2026-05-17 08:18:00', '2026-05-17 02:18:48', '2026-05-17 02:18:48'),
(10, 'App\\Models\\User', 2, 'Timeless', '5bf510f7ccbf40837d29b2934b031dbd0380125326ed3b37fef781a45c6db827', '[\"stocks:read\",\"warehouse:2\"]', '2026-05-17 02:21:04', '2026-05-17 08:19:00', '2026-05-17 02:19:28', '2026-05-17 02:21:04'),
(11, 'App\\Models\\User', 4, 'Timeless', 'c15f855f9a329f41a6cb99e450a22363955c9818292098d721876d28d0110eca', '[\"stocks:read\",\"warehouse:4\"]', '2026-05-17 02:39:28', '2026-05-17 08:22:00', '2026-05-17 02:22:37', '2026-05-17 02:39:28'),
(13, 'App\\Models\\User', 4, 'Timeless', '3a3e2972f70c1557051496151926ebd17cfd198928001bad1337ffec347d758a', '[\"stocks:read\",\"warehouse:4\"]', '2026-05-18 03:56:49', '2026-05-18 04:58:00', '2026-05-17 22:58:55', '2026-05-18 03:56:49'),
(14, 'App\\Models\\User', 4, 'Timeless', '203454f26645d695ffb9c5a87ae47e5f4df22fb2e1b6016eb5567fbf803f7861', '[\"stocks:read\",\"warehouse:4\"]', '2026-05-18 06:50:36', '2026-05-18 11:15:00', '2026-05-18 05:15:15', '2026-05-18 06:50:36'),
(15, 'App\\Models\\User', 4, 'Timeless', '1bc7dc96988ce0ab7354d8e5a02497fdd1c7131b4a93f8db7acdffd6d56fede5', '[\"stocks:read\",\"warehouse:4\"]', '2026-05-20 04:52:53', '2026-05-20 08:32:00', '2026-05-20 02:32:41', '2026-05-20 04:52:53'),
(16, 'App\\Models\\User', 4, 'Canada Warehouse stock', '01f3aa5990e45bbf6632f0a3e920f63a5940820e90df638126547f1790526f5f', '[\"stocks:read\",\"warehouse:4\"]', NULL, '2026-06-15 20:59:00', '2026-06-06 00:57:22', '2026-06-06 00:57:22'),
(17, 'App\\Models\\User', 4, 'asdfdfsdf', 'cdbfd9e2f5239cce60ae79a57d048a842a97d41f6076a338aed127811f1d1116', '[\"stocks:read\",\"warehouse:4\"]', '2026-06-06 04:12:45', '2026-06-19 09:21:00', '2026-06-06 03:21:18', '2026-06-06 04:12:45'),
(18, 'App\\Models\\User', 6, 'sdfsd', 'fe86d0a8fa363e8409444d3d09b19a74c70f5c950dc4e7e78d86f3939448c56e', '[\"stocks:read\",\"warehouse:5\"]', NULL, NULL, '2026-06-28 04:58:08', '2026-06-28 04:58:08');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `style_id` bigint(20) UNSIGNED DEFAULT NULL,
  `style_number` varchar(255) DEFAULT NULL,
  `hs_number` varchar(100) DEFAULT NULL,
  `ref_number` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `available_stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `color_id` int(11) DEFAULT NULL,
  `fabric_id` int(11) DEFAULT NULL,
  `size_id` int(11) DEFAULT NULL,
  `gender_id` int(11) DEFAULT NULL,
  `barCode` varchar(255) DEFAULT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `gallery_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_images`)),
  `stock` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `season_id` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `style_id`, `style_number`, `hs_number`, `ref_number`, `name`, `available_stock`, `description`, `color_id`, `fabric_id`, `size_id`, `gender_id`, `barCode`, `warehouse_id`, `brand_id`, `cover_image`, `gallery_images`, `stock`, `created_at`, `updated_at`, `season_id`, `deleted_at`) VALUES
(1, 5, NULL, 'style001', NULL, 'yh11780', 'Athletic Shorts', 0, NULL, 9, 3, 4, 1, 'STYLE001-780-L-Black-Beauty', 2, 3, NULL, '[]', 0, '2026-07-01 23:42:16', '2026-07-04 22:19:43', 1, NULL),
(2, 1, NULL, 'style0093', NULL, 'yh11780', 'T-shirt', 0, NULL, 14, 3, 3, 1, 'www', 2, 2, NULL, '[]', 0, '2026-07-04 00:51:03', '2026-07-05 02:42:32', 2, '2026-07-05 02:42:32'),
(3, 5, NULL, 'style001', NULL, 'yh11780', 'Athletic Shorts', 0, NULL, 9, 3, 2, 1, 'STYLE001-780-S-Black-Beauty', 2, 3, NULL, '[]', 0, '2026-07-04 22:19:43', '2026-07-04 22:19:43', 1, NULL),
(4, 5, NULL, 'style001', NULL, 'yh11780', 'Athletic Shorts', 0, NULL, 9, 3, 3, 1, 'STYLE001-780-M-Black-Beauty', 2, 3, NULL, '[]', 0, '2026-07-05 00:16:51', '2026-07-05 00:16:51', 1, NULL),
(5, 5, NULL, 'style001', NULL, 'yh11780', 'Athletic Shorts', 0, NULL, 9, 3, 5, 1, 'STYLE001-780-XL-Black-Beauty', 2, 3, NULL, '[]', 0, '2026-07-05 00:16:51', '2026-07-05 00:16:51', 1, NULL),
(6, 5, NULL, 'style001', NULL, 'yh11780', 'Athletic Shorts', 0, NULL, 9, 3, 6, 1, 'STYLE001-780-XXL-Black-Beauty', 2, 3, NULL, '[]', 0, '2026-07-05 00:16:51', '2026-07-05 00:16:51', 1, NULL),
(7, 5, NULL, 'style0013', NULL, 'yh11780', 'Sweat Jacket Full-Zip', 0, NULL, 8, 3, 3, 1, 'STYLE0013-780-gry-M', 2, 2, NULL, '[]', 0, '2026-07-05 01:33:56', '2026-07-05 01:34:12', 2, NULL),
(8, 8, NULL, 'style009', NULL, 'yh11780', 'Sweat Jacket Full-Zip', 0, NULL, 8, 3, 4, 2, 'STYLE-780-gry-L', 2, 2, NULL, '[]', 0, '2026-07-05 02:41:08', '2026-07-05 02:42:29', 1, '2026-07-05 02:42:29'),
(9, 8, NULL, 'test', NULL, 'yh11780', 'demo Product', 0, NULL, 8, 3, 3, 1, 'original', 2, 2, NULL, '[]', 0, '2026-07-05 03:55:04', '2026-07-05 03:55:04', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products_for`
--

CREATE TABLE `products_for` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `age_limit` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products_for`
--

INSERT INTO `products_for` (`id`, `name`, `age_limit`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Man', '22-45', '2026-04-27 22:15:30', '2026-05-25 23:58:35', NULL),
(2, 'Woman', '20-45', '2026-05-25 23:58:46', '2026-05-25 23:58:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_brand`
--

CREATE TABLE `product_brand` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_brand`
--

INSERT INTO `product_brand` (`product_id`, `brand_id`, `created_at`, `updated_at`) VALUES
(1, 3, '2026-07-02 01:08:28', '2026-07-02 01:08:28'),
(2, 2, '2026-07-04 00:51:03', '2026-07-04 00:51:03'),
(3, 3, '2026-07-04 22:19:43', '2026-07-04 22:19:43'),
(4, 3, '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(5, 3, '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(6, 3, '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(7, 2, '2026-07-05 01:33:56', '2026-07-05 01:33:56'),
(8, 2, '2026-07-05 02:41:08', '2026-07-05 02:41:08'),
(9, 2, '2026-07-05 03:55:04', '2026-07-05 03:55:04');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_form` bigint(20) UNSIGNED NOT NULL,
  `purchase_to` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`products`)),
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `due_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `payment_status` varchar(30) NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `po_number` varchar(100) NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `shipping_date` date DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `packing_list_path` varchar(2048) DEFAULT NULL,
  `packing_list_generated_at` datetime DEFAULT NULL,
  `quickbooks_sync_status` varchar(30) DEFAULT NULL,
  `quickbooks_synced_at` timestamp NULL DEFAULT NULL,
  `quickbooks_txn_id` varchar(255) DEFAULT NULL,
  `quickbooks_last_error` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `purchase_form`, `purchase_to`, `brand_id`, `products`, `subtotal`, `total_amount`, `paid_amount`, `due_amount`, `payment_status`, `payment_method`, `po_number`, `expected_delivery_date`, `status`, `shipping_date`, `received_date`, `note`, `packing_list_path`, `packing_list_generated_at`, `quickbooks_sync_status`, `quickbooks_synced_at`, `quickbooks_txn_id`, `quickbooks_last_error`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 2, 5, 2, '[{\"product_id\":1,\"quantity\":3,\"purchase_price\":15,\"selling_price\":15,\"line_total\":45}]', 45.00, 45.00, 0.00, 45.00, 'unpaid', NULL, 'p_o_001', '2026-07-22', 'received', '2026-07-02', '2026-07-02', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-01 23:44:53', '2026-07-01 23:46:42', NULL),
(2, 2, 5, 2, '[{\"product_id\":1,\"quantity\":2,\"purchase_price\":15,\"selling_price\":15,\"line_total\":30}]', 30.00, 30.00, 0.00, 30.00, 'unpaid', NULL, 'p_o_005', '2026-07-22', 'received', '2026-07-02', '2026-07-02', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-02 01:05:42', '2026-07-02 01:07:03', NULL),
(3, 2, 5, 2, '[{\"product_id\":1,\"quantity\":2,\"purchase_price\":15,\"selling_price\":15,\"line_total\":30}]', 30.00, 30.00, 0.00, 30.00, 'unpaid', NULL, '258963', '2026-07-22', 'received', '2026-07-02', '2026-07-02', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-02 01:10:32', '2026-07-02 01:12:02', NULL),
(4, 2, 5, 2, '[{\"product_id\":1,\"quantity\":3,\"purchase_price\":15,\"selling_price\":15,\"line_total\":45}]', 45.00, 45.00, 0.00, 45.00, 'unpaid', NULL, 'po-005', '2026-07-24', 'received', '2026-07-04', '2026-07-04', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-03 22:05:44', '2026-07-03 22:08:08', NULL),
(5, 2, 5, 2, '[{\"product_id\":1,\"quantity\":3,\"purchase_price\":15,\"selling_price\":15,\"line_total\":45}]', 45.00, 45.00, 0.00, 45.00, 'unpaid', NULL, '258963-pooiu90900', '2026-07-24', 'received', '2026-07-04', '2026-07-04', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-04 01:31:35', '2026-07-04 01:34:59', NULL),
(6, 2, 5, 3, '[{\"product_id\":1,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60},{\"product_id\":3,\"quantity\":2,\"purchase_price\":30,\"selling_price\":30,\"line_total\":60}]', 120.00, 120.00, 0.00, 120.00, 'unpaid', NULL, 'po-multi-order', '2026-07-25', 'received', '2026-07-05', '2026-07-05', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-04 22:23:44', '2026-07-04 22:27:38', NULL),
(7, 2, 5, 3, '[{\"product_id\":1,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":3,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":4,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":5,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40},{\"product_id\":6,\"quantity\":2,\"purchase_price\":20,\"selling_price\":20,\"line_total\":40}]', 200.00, 200.00, 200.00, 0.00, 'paid', NULL, 'po-multi-order-065', '2026-07-25', 'received', '2026-07-05', '2026-07-05', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-05 00:25:56', '2026-07-05 01:38:34', NULL),
(8, 2, 5, 3, '[{\"product_id\":1,\"quantity\":10,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":3,\"quantity\":5,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":4,\"quantity\":10,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":5,\"quantity\":10,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0},{\"product_id\":6,\"quantity\":5,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}]', 0.00, 0.00, 0.00, 0.00, 'unpaid', NULL, 'po-multi-order-3444', '2026-07-25', 'received', '2026-07-05', '2026-07-05', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-05 03:19:21', '2026-07-05 03:23:44', NULL),
(9, 2, 5, 2, '[{\"product_id\":9,\"quantity\":2,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}]', 0.00, 0.00, 0.00, 0.00, 'unpaid', NULL, 'aserqaaaaa', '2026-07-25', 'received', '2026-07-05', '2026-07-05', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-05 03:56:58', '2026-07-05 03:58:16', NULL),
(10, 2, 5, 2, '[{\"product_id\":9,\"quantity\":2,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}]', 0.00, 0.00, 0.00, 0.00, 'unpaid', NULL, 'apsdpfosds', '2026-07-25', 'received', '2026-07-05', '2026-07-05', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-05 04:03:08', '2026-07-05 04:06:59', NULL),
(11, 2, 5, 2, '[{\"product_id\":1,\"quantity\":2,\"purchase_price\":0,\"selling_price\":0,\"line_total\":0}]', 0.00, 0.00, 0.00, 0.00, 'unpaid', NULL, 'po-0094-009', '2026-07-26', 'received', '2026-07-06', '2026-07-06', NULL, NULL, NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-07-05 23:05:21', '2026-07-05 23:38:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `quickbooks__tokens`
--

CREATE TABLE `quickbooks__tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `realm_id` varchar(255) NOT NULL,
  `access_token` text NOT NULL,
  `refresh_token` text NOT NULL,
  `access_token_expires_at` datetime NOT NULL,
  `refresh_token_expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quickbooks__tokens`
--

INSERT INTO `quickbooks__tokens` (`id`, `realm_id`, `access_token`, `refresh_token`, `access_token_expires_at`, `refresh_token_expires_at`, `created_at`, `updated_at`) VALUES
(1, '9341457328589991', 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..s5StDy-oYX49AkDqQctcNA.-5fCX_ZOno4eLGQa9GVfbP2ak4NEIMRmEn0WyR7PMwtTudrz4V8TYcOVXZRW2MMjs6Rygy9jKovMHuYSBBsdBsOV6r7oG1nps2bU3Li8vEDvNzi_bQH9StScemiK6wKozKFOgfkyW0lTx-yFtyaF1tsxwbmuIsVgLDH3eaLjhd5DoRQTKJZwNoKBZbOLfaoPumhozx33eu6FlfbAEhG6ouO6F_uXsGYHlCMOe6n7uOIhsdwnIQsJagG1kyFxGx78bW_MsXnFul8s5KZNNYQDKJlVy_GOsn8C2_hi1IMKgddEG8abgMeEbU8pdiXyQWEoorBhWofCpP3xfxfXbCBA4UJVnn3v_XZ0lbypjAqc9iCRfu_0NXVKs4E7CCqt1XUvP2O8dLWz8vmdssRyalahMzjZb35D9yL791Rvl0HsMyL36PVEkmo6APswXlPMpq3LfHarqw2P0AE0gx8GHjTyktrEio6oUq_U6AtVEj9ei-0.BmUfGFZBxleW7rknpcPMTA', 'RT1-155-H0-1791290342egft8hdyufp2rkoyvp0x', '2026-06-27 13:39:02', '2026-10-06 12:39:02', '2026-06-27 16:39:02', '2026-06-27 16:39:02');

-- --------------------------------------------------------

--
-- Table structure for table `racks`
--

CREATE TABLE `racks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `racks`
--

INSERT INTO `racks` (`id`, `name`, `warehouse_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '101', 2, '2026-04-26 02:16:32', '2026-04-26 02:16:32', NULL),
(2, '1102', 4, '2026-05-10 05:22:56', '2026-05-10 05:22:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rack_rows`
--

CREATE TABLE `rack_rows` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rack_id` bigint(20) UNSIGNED NOT NULL,
  `row_number` varchar(50) NOT NULL,
  `code` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rack_rows`
--

INSERT INTO `rack_rows` (`id`, `rack_id`, `row_number`, `code`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, '1', '1A', '2026-04-26 03:17:32', '2026-04-26 03:17:32', NULL),
(2, 2, '1A', '11A', '2026-05-10 06:56:52', '2026-05-10 06:56:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `received_cartoon_issues`
--

CREATE TABLE `received_cartoon_issues` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `cartoon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `concern_warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `raised_by` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recurring_payments`
--

CREATE TABLE `recurring_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `frequency` varchar(30) NOT NULL DEFAULT 'manual',
  `paid_on` date DEFAULT NULL,
  `next_due_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recurring_payments`
--

INSERT INTO `recurring_payments` (`id`, `purchase_id`, `account_id`, `warehouse_id`, `amount`, `frequency`, `paid_on`, `next_due_date`, `status`, `note`, `meta`, `created_at`, `updated_at`) VALUES
(1, 7, 28, 2, 200.00, 'manual', '2026-07-05', NULL, 'completed', NULL, NULL, '2026-07-05 01:38:34', '2026-07-05 01:38:34');

-- --------------------------------------------------------

--
-- Table structure for table `remote_orders`
--

CREATE TABLE `remote_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `remote_id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) DEFAULT NULL,
  `courier_company` varchar(255) DEFAULT NULL,
  `courier_api_connected` tinyint(1) DEFAULT NULL,
  `courier_api_checked_at` timestamp NULL DEFAULT NULL,
  `courier_api_message` varchar(1000) DEFAULT NULL,
  `raw_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`raw_payload`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `remote_orders`
--

INSERT INTO `remote_orders` (`id`, `remote_id`, `order_number`, `customer_name`, `total`, `status`, `courier_company`, `courier_api_connected`, `courier_api_checked_at`, `courier_api_message`, `raw_payload`, `created_at`, `updated_at`) VALUES
(1, 1, 'ORD-20260625054250-3152', 'Aziz Hoque', 44.99, 'approved', NULL, NULL, NULL, NULL, '{\"id\":1,\"order_number\":\"ORD-20260625054250-3152\",\"status\":\"approved\",\"first_name\":\"Aziz\",\"last_name\":\"Hoque\",\"email\":\"aziz@newatlantic.biz\",\"phone\":\"14809074155\",\"address_line_1\":\"104,Green Road\",\"address_line_2\":\"104,Green Road\",\"city\":\"BOLTON\",\"state\":\"MA\",\"postal_code\":\"01740\",\"country\":\"United States\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::3::4\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-uUIg2pYhXt.jpg\",\"selectedColor\":\"3\",\"selectedSize\":\"4\",\"color\":\"3\",\"size\":\"4\",\"color_variant\":{\"name\":\"3\"},\"size_variant\":{\"size\":\"4\"}}],\"subtotal\":44.99,\"shipping\":0,\"total\":44.99,\"courier_service\":null,\"courier_company\":null,\"courier_reference\":null,\"courier_sync_status\":null,\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-25T05:42:50.000000Z\",\"updated_at\":\"2026-06-25T06:00:52.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(2, 2, 'ORD-20260625055827-5133', 'Aziz Hoque', 44.99, 'approved', NULL, NULL, NULL, NULL, '{\"id\":2,\"order_number\":\"ORD-20260625055827-5133\",\"status\":\"approved\",\"first_name\":\"Aziz\",\"last_name\":\"Hoque\",\"email\":\"aziz@newatlantic.biz\",\"phone\":\"14809074155\",\"address_line_1\":\"104,Green Road\",\"address_line_2\":\"104,Green Road\",\"city\":\"BOLTON\",\"state\":\"MA\",\"postal_code\":\"01740\",\"country\":\"United States\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":0,\"total\":44.99,\"courier_service\":null,\"courier_company\":null,\"courier_reference\":null,\"courier_sync_status\":null,\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-25T05:58:27.000000Z\",\"updated_at\":\"2026-06-25T06:00:52.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(3, 3, 'ORD-20260625060552-7974', 'Developer Test Order', 44.99, 'processing', NULL, NULL, NULL, NULL, '{\"id\":3,\"order_number\":\"ORD-20260625060552-7974\",\"status\":\"processing\",\"first_name\":\"Developer Test\",\"last_name\":\"Order\",\"email\":\"test@gmail.com\",\"phone\":\"+8801680752193\",\"address_line_1\":\"Test address\",\"address_line_2\":null,\"city\":\"New york\",\"state\":\"NY\",\"postal_code\":\"1001\",\"country\":\"United States\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":0,\"total\":44.99,\"courier_service\":null,\"courier_company\":null,\"courier_reference\":null,\"courier_sync_status\":null,\"ups_tracking_number\":null,\"shipstation_order_id\":\"343793595\",\"created_at\":\"2026-06-25T06:05:52.000000Z\",\"updated_at\":\"2026-06-25T06:14:39.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(4, 4, 'ORD-20260625063225-6861', 'Demo Order', 53.98, 'processing', NULL, NULL, NULL, NULL, '{\"id\":4,\"order_number\":\"ORD-20260625063225-6861\",\"status\":\"processing\",\"first_name\":\"Demo\",\"last_name\":\"Order\",\"email\":\"demoroder@gmail.com\",\"phone\":\"+8801680752193\",\"address_line_1\":\"123 Innovation Way\",\"address_line_2\":null,\"city\":\"San Jose\",\"state\":\"CA\",\"postal_code\":\"95112\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Orange::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-AohEhlED0R.jpg\",\"selectedColor\":\"Orange\",\"selectedSize\":\"L\",\"color\":\"Orange\",\"size\":\"L\",\"color_variant\":{\"name\":\"Orange\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":8.99,\"total\":53.98,\"courier_service\":null,\"courier_company\":null,\"courier_reference\":null,\"courier_sync_status\":null,\"ups_tracking_number\":null,\"shipstation_order_id\":\"343803957\",\"created_at\":\"2026-06-25T06:32:25.000000Z\",\"updated_at\":\"2026-06-25T06:32:50.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(5, 5, 'ORD-20260625072250-3017', 'Aziz Hoque', 28.98, 'approved', 'UPS', NULL, NULL, NULL, '{\"id\":5,\"order_number\":\"ORD-20260625072250-3017\",\"status\":\"approved\",\"first_name\":\"Aziz\",\"last_name\":\"Hoque\",\"email\":\"aziz@newatlantic.biz\",\"phone\":\"14809074155\",\"address_line_1\":\"104,Green Road\",\"address_line_2\":\"104,Green Road\",\"city\":\"BOLTON\",\"state\":\"MA\",\"postal_code\":\"01740\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"4::Taupe::M\",\"productId\":\"4\",\"name\":\"Classic Polo Shirt\",\"priceValue\":19.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260622124400-Cy6KsX1tQO.jpg\",\"selectedColor\":\"Taupe\",\"selectedSize\":\"M\",\"color\":\"Taupe\",\"size\":\"M\",\"color_variant\":{\"name\":\"Taupe\"},\"size_variant\":{\"size\":\"M\"}}],\"subtotal\":19.99,\"shipping\":8.99,\"total\":28.98,\"courier_service\":\"ups\",\"courier_company\":\"UPS\",\"courier_reference\":null,\"courier_sync_status\":\"failed\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-25T07:22:50.000000Z\",\"updated_at\":\"2026-06-25T07:45:09.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(6, 6, 'ORD-20260625075359-3384', 'Dev Test', 28.98, 'processing', 'ShipStation', NULL, NULL, NULL, '{\"id\":6,\"order_number\":\"ORD-20260625075359-3384\",\"status\":\"processing\",\"first_name\":\"Dev\",\"last_name\":\"Test\",\"email\":\"test@gmail.com\",\"phone\":\"+8801871769835\",\"address_line_1\":\"test address\",\"address_line_2\":\"test address\",\"city\":\"BOLTON\",\"state\":\"MA\",\"postal_code\":\"01740\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"4::Mountain Blue::M\",\"productId\":\"4\",\"name\":\"Classic Polo Shirt\",\"priceValue\":19.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260622124400-dTjijuKtZL.jpg\",\"selectedColor\":\"Mountain Blue\",\"selectedSize\":\"M\",\"color\":\"Mountain Blue\",\"size\":\"M\",\"color_variant\":{\"name\":\"Mountain Blue\"},\"size_variant\":{\"size\":\"M\"}}],\"subtotal\":19.99,\"shipping\":8.99,\"total\":28.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":\"343845336\",\"courier_sync_status\":\"synced\",\"ups_tracking_number\":null,\"shipstation_order_id\":\"343845336\",\"created_at\":\"2026-06-25T07:53:59.000000Z\",\"updated_at\":\"2026-06-25T07:54:21.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(7, 7, 'ORD-20260625075553-1329', 'dev test', 53.98, 'processing', 'UPS', NULL, NULL, NULL, '{\"id\":7,\"order_number\":\"ORD-20260625075553-1329\",\"status\":\"processing\",\"first_name\":\"dev\",\"last_name\":\"test\",\"email\":\"test@gmail.com\",\"phone\":\"+880179102863\",\"address_line_1\":\"test address\",\"address_line_2\":\"test address\",\"city\":\"BOLTON\",\"state\":\"MA\",\"postal_code\":\"01740\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":8.99,\"total\":53.98,\"courier_service\":\"ups\",\"courier_company\":\"UPS\",\"courier_reference\":\"1Z2Y79K50305424029\",\"courier_sync_status\":\"synced\",\"ups_tracking_number\":\"1Z2Y79K50305424029\",\"shipstation_order_id\":null,\"created_at\":\"2026-06-25T07:55:53.000000Z\",\"updated_at\":\"2026-06-25T07:56:20.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(8, 8, 'ORD-20260625080540-9989', 'Test Again', 53.98, 'approved', 'ShipStation', NULL, NULL, NULL, '{\"id\":8,\"order_number\":\"ORD-20260625080540-9989\",\"status\":\"approved\",\"first_name\":\"Test\",\"last_name\":\"Again\",\"email\":\"test@gmail.com\",\"phone\":\"+8801680752193\",\"address_line_1\":\"test address\",\"address_line_2\":\"test Address\",\"city\":\"BOLTON\",\"state\":\"MA\",\"postal_code\":\"01740\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":8.99,\"total\":53.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":\"343850542\",\"courier_sync_status\":\"synced\",\"ups_tracking_number\":null,\"shipstation_order_id\":\"343850542\",\"created_at\":\"2026-06-25T08:05:40.000000Z\",\"updated_at\":\"2026-06-25T08:05:43.000000Z\"}', '2026-06-26 23:50:44', '2026-06-28 01:24:13'),
(9, 9, 'ORD-20260627065854-1824', 'Shifat E Rasul Ullash', 53.98, 'approved', 'ShipStation', NULL, NULL, NULL, '{\"id\":9,\"order_number\":\"ORD-20260627065854-1824\",\"status\":\"approved\",\"first_name\":\"Shifat E Rasul\",\"last_name\":\"Ullash\",\"email\":\"shifat@gmail.com\",\"phone\":\"+8801791028673\",\"address_line_1\":\"Mohakhali dhaka\",\"address_line_2\":null,\"city\":\"Dhaka\",\"state\":\"Dhaka\",\"postal_code\":\"1215\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":8.99,\"total\":53.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":null,\"courier_sync_status\":\"pending\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-27T06:58:54.000000Z\",\"updated_at\":\"2026-06-27T06:58:54.000000Z\"}', '2026-06-27 00:59:02', '2026-06-28 01:24:13'),
(10, 10, 'ORD-20260627072747-5173', 'nasima Akhter Ripa', 53.98, 'approved', 'ShipStation', 1, '2026-06-27 05:26:33', NULL, '{\"id\":10,\"order_number\":\"ORD-20260627072747-5173\",\"status\":\"approved\",\"first_name\":\"nasima Akhter\",\"last_name\":\"Ripa\",\"email\":\"ripa@gmail.com\",\"phone\":\"+8801620576173\",\"address_line_1\":\"MOhakhali\",\"address_line_2\":null,\"city\":\"dhaka\",\"state\":\"Dhaka\",\"postal_code\":\"1215\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":8.99,\"total\":53.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":null,\"courier_sync_status\":\"pending\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-27T07:27:47.000000Z\",\"updated_at\":\"2026-06-27T07:27:47.000000Z\"}', '2026-06-27 01:28:24', '2026-06-28 01:24:13'),
(11, 11, 'ORD-20260628072402-0026', 'Shifat E Rasul', 24.98, 'approved', 'ShipStation', NULL, NULL, NULL, '{\"id\":11,\"order_number\":\"ORD-20260628072402-0026\",\"status\":\"approved\",\"first_name\":\"Shifat E\",\"last_name\":\"Rasul\",\"email\":\"developer@gmail.com\",\"phone\":\"+8801791028673\",\"address_line_1\":\"Mohakhali\",\"address_line_2\":null,\"city\":\"dhaka\",\"state\":\"dhaka\",\"postal_code\":\"1215\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"1::Black Beauty::L\",\"productId\":\"1\",\"name\":\"Athletic Shorts\",\"priceValue\":15.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260622121200-tFO2P7DxTs.jpg\",\"selectedColor\":\"Black Beauty\",\"selectedSize\":\"L\",\"color\":\"Black Beauty\",\"size\":\"L\",\"color_variant\":{\"name\":\"Black Beauty\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":15.99,\"shipping\":8.99,\"total\":24.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":null,\"courier_sync_status\":\"pending\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-28T07:24:02.000000Z\",\"updated_at\":\"2026-06-28T07:24:02.000000Z\"}', '2026-06-27 17:01:47', '2026-06-28 01:24:13'),
(12, 12, 'ORD-20260628074316-1489', 'Shfiat E Rasul', 24.98, 'approved', 'ShipStation', 1, '2026-06-28 01:47:51', NULL, '{\"id\":12,\"order_number\":\"ORD-20260628074316-1489\",\"status\":\"approved\",\"first_name\":\"Shfiat E\",\"last_name\":\"Rasul\",\"email\":\"shifat@gamil.com\",\"phone\":\"+8801680752193\",\"address_line_1\":\"asdfads\",\"address_line_2\":\"sdfds\",\"city\":\"sd\",\"state\":\"dfs\",\"postal_code\":\"1215\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"1::Mountain Blue::L\",\"productId\":\"1\",\"name\":\"Athletic Shorts\",\"priceValue\":15.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260622121200-R4sYapIgsu.jpg\",\"selectedColor\":\"Mountain Blue\",\"selectedSize\":\"L\",\"color\":\"Mountain Blue\",\"size\":\"L\",\"color_variant\":{\"name\":\"Mountain Blue\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":15.99,\"shipping\":8.99,\"total\":24.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":null,\"courier_sync_status\":\"pending\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-28T07:43:16.000000Z\",\"updated_at\":\"2026-06-28T07:43:16.000000Z\"}', '2026-06-28 01:43:25', '2026-06-28 02:36:00'),
(13, 13, 'ORD-20260628083419-5002', 'fasdf sdfsd', 53.98, 'approved', 'ShipStation', NULL, NULL, NULL, '{\"id\":13,\"order_number\":\"ORD-20260628083419-5002\",\"status\":\"approved\",\"first_name\":\"fasdf\",\"last_name\":\"sdfsd\",\"email\":\"shifaterasul@gmail.com\",\"phone\":\"6564546\",\"address_line_1\":\"asdfsdf\",\"address_line_2\":null,\"city\":\"sdf\",\"state\":\"sd\",\"postal_code\":\"10255\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"11::Navy::L\",\"productId\":\"11\",\"name\":\"MEN\'S PUFFER VEST\",\"priceValue\":44.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260623053203-xX7MEzGZYf.jpg\",\"selectedColor\":\"Navy\",\"selectedSize\":\"L\",\"color\":\"Navy\",\"size\":\"L\",\"color_variant\":{\"name\":\"Navy\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":44.99,\"shipping\":8.99,\"total\":53.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":null,\"courier_sync_status\":\"pending\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-28T08:34:19.000000Z\",\"updated_at\":\"2026-06-28T08:34:19.000000Z\"}', '2026-06-28 02:36:00', '2026-06-28 02:36:00'),
(14, 14, 'ORD-20260628090459-2362', 'asdfsdf sdfsdf', 18.98, 'approved', 'ShipStation', NULL, NULL, NULL, '{\"id\":14,\"order_number\":\"ORD-20260628090459-2362\",\"status\":\"approved\",\"first_name\":\"asdfsdf\",\"last_name\":\"sdfsdf\",\"email\":\"sfa@gmail.com\",\"phone\":\"46464646\",\"address_line_1\":\"adfasd\",\"address_line_2\":\"s\",\"city\":\"sds\",\"state\":\"ds\",\"postal_code\":\"sd456\",\"country\":\"US\",\"notes\":null,\"items_count\":1,\"items\":[{\"lineId\":\"6::Bright White::L\",\"productId\":\"6\",\"name\":\"Under shirt round neck\",\"priceValue\":9.99,\"quantity\":1,\"image\":\"\\/uploads\\/products\\/gallery\\/20260622130123-aWvorM6yX5.jpg\",\"selectedColor\":\"Bright White\",\"selectedSize\":\"L\",\"color\":\"Bright White\",\"size\":\"L\",\"color_variant\":{\"name\":\"Bright White\"},\"size_variant\":{\"size\":\"L\"}}],\"subtotal\":9.99,\"shipping\":8.99,\"total\":18.98,\"courier_service\":\"shipstation\",\"courier_company\":\"ShipStation\",\"courier_reference\":null,\"courier_sync_status\":\"pending\",\"ups_tracking_number\":null,\"shipstation_order_id\":null,\"created_at\":\"2026-06-28T09:04:59.000000Z\",\"updated_at\":\"2026-06-28T09:04:59.000000Z\"}', '2026-06-28 03:05:38', '2026-06-28 03:05:38');

-- --------------------------------------------------------

--
-- Table structure for table `retail_sales`
--

CREATE TABLE `retail_sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sold_by` bigint(20) UNSIGNED NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL DEFAULT 'cash',
  `note` text DEFAULT NULL,
  `quickbooks_sync_status` varchar(30) DEFAULT NULL,
  `quickbooks_synced_at` timestamp NULL DEFAULT NULL,
  `quickbooks_txn_id` varchar(255) DEFAULT NULL,
  `quickbooks_last_error` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `retail_sales`
--

INSERT INTO `retail_sales` (`id`, `reference_number`, `warehouse_id`, `brand_id`, `sold_by`, `items`, `total_amount`, `payment_method`, `note`, `quickbooks_sync_status`, `quickbooks_synced_at`, `quickbooks_txn_id`, `quickbooks_last_error`, `created_at`, `updated_at`) VALUES
(1, 'RET-FEC1BA60', 5, 2, 6, '[{\"stock_id\":4,\"product_id\":1,\"product_name\":\"Admin\",\"barcode\":\"112-780-L-COLOR9\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}]', 30.00, 'cash', NULL, 'success', '2026-06-27 16:39:14', '22', NULL, '2026-06-18 05:00:57', '2026-06-27 16:39:14'),
(2, 'RET-19229A5E', 2, 2, 2, '[{\"stock_id\":1,\"product_id\":1,\"product_name\":\"Admin\",\"barcode\":\"112-780-L-COLOR9\",\"quantity\":5,\"unit_price\":30,\"cartoon_id\":null,\"total\":150}]', 150.00, 'cash', NULL, 'success', '2026-06-27 16:39:12', '21', NULL, '2026-06-24 04:31:03', '2026-06-27 16:39:12'),
(3, 'RET-5743CBDF', 2, 2, 2, '[{\"stock_id\":1,\"product_id\":1,\"product_name\":\"Admin\",\"barcode\":\"112-780-L-COLOR9\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}]', 30.00, 'cash', NULL, 'success', '2026-06-27 16:39:08', '20', NULL, '2026-06-24 04:46:49', '2026-06-27 16:39:08'),
(4, 'RET-43370B48', 2, 2, 2, '[{\"stock_id\":41,\"product_id\":7,\"product_name\":\"Athletic Shorts\",\"barcode\":\"STYLE001-780-L-COLOR7\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}]', 30.00, 'cash', NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-06-28 01:47:47', '2026-06-28 01:47:47'),
(5, 'RET-BEABE692', 2, 2, 2, '[{\"stock_id\":496,\"product_id\":72,\"product_name\":\"MEN\'S PUFFER VEST\",\"barcode\":\"STYLE004-780-L-COLOR14\",\"quantity\":1,\"unit_price\":30,\"cartoon_id\":null,\"total\":30}]', 30.00, 'cash', NULL, 'failed', NULL, NULL, 'cURL error 60: SSL certificate problem: self-signed certificate in certificate chain (see https://curl.haxx.se/libcurl/c/libcurl-errors.html) for https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', '2026-06-28 02:46:36', '2026-06-28 02:46:36');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Super Admin', 'super-admin', '2026-04-25 06:11:36', '2026-04-25 06:11:36', NULL),
(3, 'Admin', 'admin', '2026-04-25 10:14:58', '2026-04-25 10:14:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_user`
--

CREATE TABLE `role_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_user`
--

INSERT INTO `role_user` (`id`, `role_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-04-25 06:11:36', '2026-04-25 06:11:36'),
(2, 3, 2, NULL, NULL),
(3, 3, 3, NULL, NULL),
(4, 3, 4, NULL, NULL),
(5, 1, 5, NULL, NULL),
(6, 3, 6, NULL, NULL),
(7, 3, 7, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `seasons`
--

CREATE TABLE `seasons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seasons`
--

INSERT INTO `seasons` (`id`, `name`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Winter', '2026-05-04 23:35:50', '2026-05-04 23:38:31', NULL),
(2, 'Summer', '2026-05-26 00:00:35', '2026-05-26 00:00:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sells`
--

CREATE TABLE `sells` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED DEFAULT NULL,
  `selling_from` bigint(20) UNSIGNED NOT NULL,
  `sold_to` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `po_number` varchar(100) NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sells`
--

INSERT INTO `sells` (`id`, `purchase_id`, `selling_from`, `sold_to`, `brand_id`, `product_id`, `quantity`, `po_number`, `purchase_price`, `selling_price`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 2, 5, 2, 1, 3, 'p_o_001', 15.00, 15.00, 'approved', '2026-07-01 23:45:29', '2026-07-01 23:45:29', NULL),
(2, 2, 2, 5, 2, 1, 2, 'p_o_005', 15.00, 15.00, 'approved', '2026-07-02 01:05:58', '2026-07-02 01:05:58', NULL),
(3, 3, 2, 5, 2, 1, 2, '258963', 15.00, 15.00, 'approved', '2026-07-02 01:10:59', '2026-07-02 01:10:59', NULL),
(4, 4, 2, 5, 2, 1, 3, 'po-005', 15.00, 15.00, 'approved', '2026-07-03 22:06:27', '2026-07-03 22:06:27', NULL),
(5, 5, 2, 5, 2, 1, 3, '258963-pooiu90900', 15.00, 15.00, 'approved', '2026-07-04 01:32:13', '2026-07-04 01:32:13', NULL),
(6, 6, 2, 5, 3, 1, 2, 'po-multi-order', 30.00, 30.00, 'approved', '2026-07-04 22:24:12', '2026-07-04 22:24:12', NULL),
(7, 6, 2, 5, 3, 3, 2, 'po-multi-order', 30.00, 30.00, 'approved', '2026-07-04 22:24:12', '2026-07-04 22:24:12', NULL),
(8, 7, 2, 5, 3, 1, 2, 'po-multi-order-065', 20.00, 20.00, 'approved', '2026-07-05 00:26:27', '2026-07-05 00:26:27', NULL),
(9, 7, 2, 5, 3, 3, 2, 'po-multi-order-065', 20.00, 20.00, 'approved', '2026-07-05 00:26:27', '2026-07-05 00:26:27', NULL),
(10, 7, 2, 5, 3, 4, 2, 'po-multi-order-065', 20.00, 20.00, 'approved', '2026-07-05 00:26:27', '2026-07-05 00:26:27', NULL),
(11, 7, 2, 5, 3, 5, 2, 'po-multi-order-065', 20.00, 20.00, 'approved', '2026-07-05 00:26:27', '2026-07-05 00:26:27', NULL),
(12, 7, 2, 5, 3, 6, 2, 'po-multi-order-065', 20.00, 20.00, 'approved', '2026-07-05 00:26:27', '2026-07-05 00:26:27', NULL),
(13, 8, 2, 5, 3, 1, 10, 'po-multi-order-3444', 0.00, 0.00, 'approved', '2026-07-05 03:19:46', '2026-07-05 03:19:46', NULL),
(14, 8, 2, 5, 3, 3, 5, 'po-multi-order-3444', 0.00, 0.00, 'approved', '2026-07-05 03:19:46', '2026-07-05 03:19:46', NULL),
(15, 8, 2, 5, 3, 4, 10, 'po-multi-order-3444', 0.00, 0.00, 'approved', '2026-07-05 03:19:46', '2026-07-05 03:19:46', NULL),
(16, 8, 2, 5, 3, 5, 10, 'po-multi-order-3444', 0.00, 0.00, 'approved', '2026-07-05 03:19:46', '2026-07-05 03:19:46', NULL),
(17, 8, 2, 5, 3, 6, 5, 'po-multi-order-3444', 0.00, 0.00, 'approved', '2026-07-05 03:19:46', '2026-07-05 03:19:46', NULL),
(18, 9, 2, 5, 2, 9, 2, 'aserqaaaaa', 0.00, 0.00, 'approved', '2026-07-05 03:57:14', '2026-07-05 03:57:14', NULL),
(19, 10, 2, 5, 2, 9, 2, 'apsdpfosds', 0.00, 0.00, 'approved', '2026-07-05 04:03:43', '2026-07-05 04:03:43', NULL),
(20, 11, 2, 5, 2, 1, 2, 'po-0094-009', 0.00, 0.00, 'approved', '2026-07-05 23:10:03', '2026-07-05 23:10:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('twwoywgz03GJpYIwI9Ml27MpKJL6dACIn4wLe1ZS', 6, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJMV2ZBcktNakl1dkdFdTJDRjMwU2RQZmVtNnBxVHdFdFFkUGJwU2FKIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6Nn0=', 1783316566);

-- --------------------------------------------------------

--
-- Table structure for table `shiping_times`
--

CREATE TABLE `shiping_times` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shipping_time` varchar(255) NOT NULL,
  `production_time` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shiping_times`
--

INSERT INTO `shiping_times` (`id`, `shipping_time`, `production_time`, `created_at`, `updated_at`) VALUES
(1, '20', '15', '2026-07-01 00:52:53', '2026-07-01 02:42:24');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `size` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`id`, `size`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'S', '2026-04-27 04:02:15', '2026-04-27 04:02:15', NULL),
(3, 'M', '2026-04-27 06:13:46', '2026-04-27 06:13:46', NULL),
(4, 'L', '2026-04-27 06:14:01', '2026-04-27 06:14:01', NULL),
(5, 'XL', '2026-04-27 06:14:16', '2026-04-27 06:14:16', NULL),
(6, 'XXL', '2026-04-27 06:14:27', '2026-04-27 06:14:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `country_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `country_id`, `name`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 2, 'Dhaka', '2026-04-25 02:34:10', '2026-04-25 02:34:10', NULL),
(4, 4, 'Alberta', '2026-04-25 02:34:20', '2026-05-07 06:18:27', NULL),
(6, 5, 'New York', '2026-04-30 03:08:51', '2026-05-07 06:19:54', NULL),
(7, 4, 'asdfasdf', '2026-05-09 04:32:48', '2026-05-09 04:33:38', '2026-05-09 04:33:38');

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stocks` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `buying_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cartoon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `barcode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`barcode`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`id`, `product_id`, `stocks`, `buying_price`, `selling_price`, `warehouse_id`, `brand_id`, `cartoon_id`, `barcode`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 7, 10.00, 15.00, 2, 2, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-01 23:42:16', '2026-07-04 22:19:43', '2026-07-04 22:19:43'),
(2, 1, 0, 0.00, 0.00, 2, 3, NULL, NULL, '2026-07-01 23:42:16', '2026-07-02 00:48:24', '2026-07-02 00:48:24'),
(3, 1, 0, 0.00, 0.00, 2, 4, NULL, NULL, '2026-07-01 23:42:16', '2026-07-02 00:47:59', '2026-07-02 00:47:59'),
(4, 1, 0, 0.00, 0.00, 3, NULL, NULL, NULL, '2026-07-01 23:42:16', '2026-07-02 00:47:59', '2026-07-02 00:47:59'),
(5, 1, 0, 0.00, 0.00, 4, 4, NULL, NULL, '2026-07-01 23:42:16', '2026-07-02 00:47:59', '2026-07-02 00:47:59'),
(6, 1, 3, 15.00, 15.00, 5, 2, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-01 23:42:16', '2026-07-02 00:47:59', '2026-07-02 00:47:59'),
(7, 1, 0, 0.00, 0.00, 5, 3, NULL, NULL, '2026-07-01 23:42:16', '2026-07-02 00:47:59', '2026-07-02 00:47:59'),
(8, 1, 0, 0.00, 0.00, 2, 4, NULL, NULL, '2026-07-02 00:48:24', '2026-07-04 22:19:43', '2026-07-04 22:19:43'),
(9, 1, 2, 15.00, 15.00, 5, 2, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-02 01:08:10', '2026-07-02 01:08:28', '2026-07-02 01:08:28'),
(10, 1, 14, 0.00, 0.00, 2, 3, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-02 01:08:28', '2026-07-05 03:21:18', NULL),
(11, 1, 8, 15.00, 15.00, 5, 2, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-02 01:12:07', '2026-07-04 22:19:43', '2026-07-04 22:19:43'),
(12, 2, 10, 15.00, 15.00, 2, 2, NULL, '[\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\",\"www\"]', '2026-07-04 00:51:03', '2026-07-04 01:13:47', NULL),
(13, 3, 16, 0.00, 0.00, 2, 3, NULL, '[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]', '2026-07-04 22:19:43', '2026-07-05 03:21:34', NULL),
(14, 1, 2, 30.00, 30.00, 5, 3, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-04 22:27:45', '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(15, 3, 2, 30.00, 30.00, 5, 3, NULL, '[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]', '2026-07-04 22:27:45', '2026-07-05 00:16:51', '2026-07-05 00:16:51'),
(16, 4, 14, 0.00, 0.00, 2, 3, NULL, '[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]', '2026-07-05 00:16:51', '2026-07-05 03:21:48', NULL),
(17, 5, 15, 0.00, 0.00, 2, 3, NULL, '[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]', '2026-07-05 00:16:51', '2026-07-05 03:22:02', NULL),
(18, 6, 16, 0.00, 0.00, 2, 3, NULL, '[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]', '2026-07-05 00:16:51', '2026-07-05 03:22:16', NULL),
(19, 1, 6, 0.00, 0.00, 5, 3, NULL, '[\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\",\"STYLE001-780-L-Black-Beauty\"]', '2026-07-05 00:30:38', '2026-07-05 03:23:53', NULL),
(20, 3, 4, 0.00, 0.00, 5, 3, NULL, '[\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\",\"STYLE001-780-S-Black-Beauty\"]', '2026-07-05 00:30:38', '2026-07-05 03:23:53', NULL),
(21, 4, 6, 0.00, 0.00, 5, 3, NULL, '[\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\",\"STYLE001-780-M-Black-Beauty\"]', '2026-07-05 00:30:38', '2026-07-05 03:23:53', NULL),
(22, 5, 7, 0.00, 0.00, 5, 3, NULL, '[\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\",\"STYLE001-780-XL-Black-Beauty\"]', '2026-07-05 00:30:38', '2026-07-05 03:23:53', NULL),
(23, 6, 4, 0.00, 0.00, 5, 3, NULL, '[\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\",\"STYLE001-780-XXL-Black-Beauty\"]', '2026-07-05 00:30:38', '2026-07-05 03:23:53', NULL),
(24, 7, 1, 0.00, 0.00, 2, 2, NULL, '[\"STYLE0013-780-gry-M\"]', '2026-07-05 01:33:56', '2026-07-05 01:35:00', NULL),
(25, 8, 0, 0.00, 0.00, 2, 2, NULL, NULL, '2026-07-05 02:41:08', '2026-07-05 02:41:08', NULL),
(26, 9, 3, 0.00, 0.00, 2, 2, NULL, '[\"www\",\"www\",\"www\"]', '2026-07-05 03:55:04', '2026-07-05 04:06:10', NULL),
(27, 9, 5, 0.00, 0.00, 5, 2, NULL, '[\"www\",\"www\",\"original\",\"original\",\"original\"]', '2026-07-05 03:58:24', '2026-07-05 04:07:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `styles`
--

CREATE TABLE `styles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `styles`
--

INSERT INTO `styles` (`id`, `name`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Test 002', '2026-05-23 01:13:09', '2026-06-17 23:15:46', '2026-06-17 23:15:46'),
(2, 'asdfsdfsd', '2026-05-25 06:55:46', '2026-06-17 23:15:44', '2026-06-17 23:15:44'),
(3, 'Admin', '2026-05-25 22:44:48', '2026-06-17 23:15:40', '2026-06-17 23:15:40'),
(4, 'Athletic Shorts with zipped pocket – Slim Fit', '2026-05-26 00:35:15', '2026-05-26 01:17:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `trade_license` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `company_name`, `phone`, `email`, `address`, `trade_license`, `contact_person`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Shifat E Rasul ullash', 'sdfsdfsdf', '+8801871769835', 'shifaterasulbd@gmail.com', 'sdfdsfdsf', NULL, 'sdfsdfsd', 'active', '2026-05-05 04:52:30', '2026-05-05 04:52:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`warehouse_ids`)),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `warehouse_ids`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '[]', 'Supper Admin', 'login-test@example.com', NULL, '$2y$12$k5XK/clJYTYHD9dS752ORe2vSNnHv25pqM9fllX9U3Y8yvQb0hxx6', NULL, '2026-04-24 02:32:32', '2026-05-06 22:38:20', NULL),
(2, '[2]', 'Arbella Warehouse', 'arbellawarehouse@gmail.com', NULL, '$2y$12$YSu7lABUveSZxwakEygjbeF17ggLmIekTTmeqtCkvPumOmDiGPjAO', NULL, '2026-04-25 06:06:53', '2026-05-09 22:16:32', NULL),
(3, '[3]', 'Avant Warehouse', 'avantwarehouse@gmail.com', NULL, '$2y$12$nYZ7IPSG7Uw33Au/nEDTzugxmjHqSNWWIanwbKnE9ilXSWFxoFgTy', NULL, '2026-04-26 03:32:25', '2026-05-09 05:27:33', NULL),
(4, '[4]', 'Canada Warehouse', 'canadawarehouse@gmail.com', NULL, '$2y$12$9zfaCIP7BdJHkGJ4WX.xpOff6evXnmvBf3ze3ZGDSoo10BY5y8Nuq', NULL, '2026-04-30 03:09:46', '2026-05-09 05:24:44', NULL),
(5, '[]', 'Supper Admin', 'superadmin@gmail.com', NULL, '$2y$12$xjHIF7h1UKm3raSpGlpAa.TZToYTOgX9TibRtcTBZ8vFlpDkyQFou', NULL, '2026-05-04 22:11:41', '2026-05-04 22:11:41', NULL),
(6, '[5]', 'America Warehouse', 'usawarehouse@gmail.com', NULL, '$2y$12$/aBg/eIc0/d4AJnynQhBxek8cSykWr1Y/lIXfrmyoei5Y46RRwTre', NULL, '2026-05-09 05:40:05', '2026-05-09 05:40:05', NULL),
(7, '[5]', 'test user', 'test@gmail.com', NULL, '$2y$12$729ES5Mndwy20a/01.xC2OBo9R0.sIVCKCIDwfwy.HHqkVHuBOj0y', NULL, '2026-05-19 11:30:51', '2026-05-19 11:30:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `state_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `fulladress` varchar(600) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `country_id`, `state_id`, `name`, `fulladress`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 2, 3, 'Arbella Warehouse', 'Gulshan 1 Dhaka', '2026-04-25 05:55:01', '2026-05-07 06:17:31', NULL),
(3, 2, 3, 'Avant Warehouse', 'Dhaka', '2026-04-25 23:38:53', '2026-05-07 06:17:53', NULL),
(4, 4, 4, 'Canada Warehouse', 'Canada', '2026-04-30 03:09:14', '2026-05-07 06:19:33', NULL),
(5, 5, 6, 'America Warehouse', 'New york', '2026-05-07 06:20:18', '2026-05-07 06:20:18', NULL),
(6, 2, 3, 'Production', 'gazipur', '2026-07-04 01:25:42', '2026-07-04 01:25:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_brand`
--

CREATE TABLE `warehouse_brand` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouse_brand`
--

INSERT INTO `warehouse_brand` (`id`, `warehouse_id`, `brand_id`, `created_at`, `updated_at`) VALUES
(1, 5, 2, NULL, NULL),
(2, 5, 3, NULL, NULL),
(3, 4, 4, NULL, NULL),
(4, 2, 2, NULL, NULL),
(5, 2, 4, NULL, NULL),
(6, 2, 3, NULL, NULL),
(7, 6, 2, NULL, NULL),
(8, 6, 3, NULL, NULL),
(9, 6, 4, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_source_entry_unique` (`source_type`,`source_id`,`entry_type`),
  ADD KEY `accounts_warehouse_id_entry_type_index` (`warehouse_id`,`entry_type`),
  ADD KEY `accounts_source_type_source_id_index` (`source_type`,`source_id`),
  ADD KEY `accounts_brand_id_entry_type_index` (`brand_id`,`entry_type`);

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_keys_user_id_is_active_index` (`user_id`,`is_active`),
  ADD KEY `api_keys_created_by_created_at_index` (`created_by`,`created_at`),
  ADD KEY `api_keys_sanctum_token_id_index` (`sanctum_token_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cartoons`
--
ALTER TABLE `cartoons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cartoons_rack_id_foreign` (`rack_id`),
  ADD KEY `cartoons_rack_row_id_foreign` (`rack_row_id`),
  ADD KEY `cartoons_warehouse_id_foreign` (`warehouse_id`),
  ADD KEY `cartoons_received_to_stock_by_foreign` (`received_to_stock_by`),
  ADD KEY `cartoons_received_to_stock_at_index` (`received_to_stock_at`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countries_name_unique` (`name`),
  ADD UNIQUE KEY `countries_code_unique` (`code`);

--
-- Indexes for table `fabrics`
--
ALTER TABLE `fabrics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fabrics_ref_number_unique` (`ref_number`),
  ADD KEY `fabrics_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_slug_unique` (`slug`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_role_permission_id_role_id_unique` (`permission_id`,`role_id`),
  ADD KEY `permission_role_role_id_foreign` (`role_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_style_id_foreign` (`style_id`);

--
-- Indexes for table `products_for`
--
ALTER TABLE `products_for`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_for_name_unique` (`name`);

--
-- Indexes for table `product_brand`
--
ALTER TABLE `product_brand`
  ADD UNIQUE KEY `product_brand_product_id_brand_id_unique` (`product_id`,`brand_id`),
  ADD KEY `product_brand_brand_id_foreign` (`brand_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchases_purchase_to_foreign` (`purchase_to`),
  ADD KEY `purchases_purchase_form_purchase_to_index` (`purchase_form`,`purchase_to`),
  ADD KEY `purchases_po_number_index` (`po_number`),
  ADD KEY `purchases_brand_id_foreign` (`brand_id`);

--
-- Indexes for table `quickbooks__tokens`
--
ALTER TABLE `quickbooks__tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quickbooks__tokens_realm_id_unique` (`realm_id`);

--
-- Indexes for table `racks`
--
ALTER TABLE `racks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `racks_name_unique` (`name`),
  ADD KEY `racks_warehouse_id_foreign` (`warehouse_id`);

--
-- Indexes for table `rack_rows`
--
ALTER TABLE `rack_rows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rack_rows_rack_id_row_number_unique` (`rack_id`,`row_number`),
  ADD UNIQUE KEY `rack_rows_code_unique` (`code`);

--
-- Indexes for table `received_cartoon_issues`
--
ALTER TABLE `received_cartoon_issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `received_cartoon_issues_cartoon_id_foreign` (`cartoon_id`),
  ADD KEY `received_cartoon_issues_raised_by_foreign` (`raised_by`),
  ADD KEY `received_cartoon_issues_concern_warehouse_id_status_index` (`concern_warehouse_id`,`status`),
  ADD KEY `received_cartoon_issues_purchase_id_status_index` (`purchase_id`,`status`);

--
-- Indexes for table `recurring_payments`
--
ALTER TABLE `recurring_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recurring_payments_account_id_foreign` (`account_id`),
  ADD KEY `recurring_payments_purchase_id_status_index` (`purchase_id`,`status`),
  ADD KEY `recurring_payments_warehouse_id_status_index` (`warehouse_id`,`status`);

--
-- Indexes for table `remote_orders`
--
ALTER TABLE `remote_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `remote_orders_remote_id_unique` (`remote_id`);

--
-- Indexes for table `retail_sales`
--
ALTER TABLE `retail_sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `retail_sales_reference_number_unique` (`reference_number`),
  ADD KEY `retail_sales_reference_number_index` (`reference_number`),
  ADD KEY `retail_sales_warehouse_id_index` (`warehouse_id`),
  ADD KEY `retail_sales_sold_by_index` (`sold_by`),
  ADD KEY `retail_sales_brand_id_index` (`brand_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_slug_unique` (`slug`);

--
-- Indexes for table `role_user`
--
ALTER TABLE `role_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_user_role_id_user_id_unique` (`role_id`,`user_id`),
  ADD KEY `role_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `seasons`
--
ALTER TABLE `seasons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `seasons_name_unique` (`name`);

--
-- Indexes for table `sells`
--
ALTER TABLE `sells`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sells_purchase_id_product_id_unique` (`purchase_id`,`product_id`),
  ADD KEY `sells_sold_to_foreign` (`sold_to`),
  ADD KEY `sells_product_id_foreign` (`product_id`),
  ADD KEY `sells_selling_from_sold_to_index` (`selling_from`,`sold_to`),
  ADD KEY `sells_po_number_index` (`po_number`),
  ADD KEY `sells_brand_id_selling_from_index` (`brand_id`,`selling_from`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shiping_times`
--
ALTER TABLE `shiping_times`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stocks_product_id_foreign` (`product_id`),
  ADD KEY `stocks_warehouse_id_foreign` (`warehouse_id`),
  ADD KEY `stocks_cartoon_id_foreign` (`cartoon_id`),
  ADD KEY `stocks_brand_id_foreign` (`brand_id`);

--
-- Indexes for table `styles`
--
ALTER TABLE `styles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_phone_unique` (`phone`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warehouses_country_id_foreign` (`country_id`),
  ADD KEY `warehouses_state_id_foreign` (`state_id`);

--
-- Indexes for table `warehouse_brand`
--
ALTER TABLE `warehouse_brand`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `warehouse_brand_warehouse_id_brand_id_unique` (`warehouse_id`,`brand_id`),
  ADD KEY `warehouse_brand_brand_id_foreign` (`brand_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=659;

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cartoons`
--
ALTER TABLE `cartoons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `colors`
--
ALTER TABLE `colors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `fabrics`
--
ALTER TABLE `fabrics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `permission_role`
--
ALTER TABLE `permission_role`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `products_for`
--
ALTER TABLE `products_for`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `quickbooks__tokens`
--
ALTER TABLE `quickbooks__tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `racks`
--
ALTER TABLE `racks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rack_rows`
--
ALTER TABLE `rack_rows`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `received_cartoon_issues`
--
ALTER TABLE `received_cartoon_issues`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recurring_payments`
--
ALTER TABLE `recurring_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `remote_orders`
--
ALTER TABLE `remote_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `retail_sales`
--
ALTER TABLE `retail_sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `role_user`
--
ALTER TABLE `role_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `seasons`
--
ALTER TABLE `seasons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sells`
--
ALTER TABLE `sells`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `shiping_times`
--
ALTER TABLE `shiping_times`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `styles`
--
ALTER TABLE `styles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `warehouse_brand`
--
ALTER TABLE `warehouse_brand`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `accounts_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `api_keys_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `api_keys_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cartoons`
--
ALTER TABLE `cartoons`
  ADD CONSTRAINT `cartoons_rack_id_foreign` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cartoons_rack_row_id_foreign` FOREIGN KEY (`rack_row_id`) REFERENCES `rack_rows` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cartoons_received_to_stock_by_foreign` FOREIGN KEY (`received_to_stock_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cartoons_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `fabrics`
--
ALTER TABLE `fabrics`
  ADD CONSTRAINT `fabrics_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_style_id_foreign` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_brand`
--
ALTER TABLE `product_brand`
  ADD CONSTRAINT `product_brand_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_brand_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchases_purchase_form_foreign` FOREIGN KEY (`purchase_form`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_purchase_to_foreign` FOREIGN KEY (`purchase_to`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `racks`
--
ALTER TABLE `racks`
  ADD CONSTRAINT `racks_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rack_rows`
--
ALTER TABLE `rack_rows`
  ADD CONSTRAINT `rack_rows_rack_id_foreign` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `received_cartoon_issues`
--
ALTER TABLE `received_cartoon_issues`
  ADD CONSTRAINT `received_cartoon_issues_cartoon_id_foreign` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `received_cartoon_issues_concern_warehouse_id_foreign` FOREIGN KEY (`concern_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `received_cartoon_issues_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `received_cartoon_issues_raised_by_foreign` FOREIGN KEY (`raised_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recurring_payments`
--
ALTER TABLE `recurring_payments`
  ADD CONSTRAINT `recurring_payments_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `recurring_payments_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recurring_payments_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `retail_sales`
--
ALTER TABLE `retail_sales`
  ADD CONSTRAINT `retail_sales_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `retail_sales_sold_by_foreign` FOREIGN KEY (`sold_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `retail_sales_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `role_user`
--
ALTER TABLE `role_user`
  ADD CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sells`
--
ALTER TABLE `sells`
  ADD CONSTRAINT `sells_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stocks_cartoon_id_foreign` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `warehouse_brand`
--
ALTER TABLE `warehouse_brand`
  ADD CONSTRAINT `warehouse_brand_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouse_brand_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
