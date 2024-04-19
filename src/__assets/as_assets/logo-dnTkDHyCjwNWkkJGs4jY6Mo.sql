-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : lun. 08 avr. 2024 à 08:14
-- Version du serveur : 8.0.30
-- Version de PHP : 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `__app_ecom_kgreen`
--

-- --------------------------------------------------------

--
-- Structure de la table `__tbl_ecom_categories`
--

CREATE TABLE `__tbl_ecom_categories` (
  `id` int NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `__tbl_ecom_categories`
--

INSERT INTO `__tbl_ecom_categories` (`id`, `category`, `description`) VALUES
(1, 'Céréales et Grains', NULL),
(2, 'Légumes', NULL),
(3, 'Fruits', NULL),
(4, 'Produits Horticoles', NULL),
(5, 'Produits Laitiers', NULL),
(6, 'Viandes et Produits Carnés', NULL),
(7, 'Produits Avicoles', NULL),
(8, 'Produits de la Pêche', NULL),
(9, 'Produits Apicoles', NULL),
(10, 'Produits Oléagineux', NULL),
(11, 'Produits Sucrés', NULL),
(12, 'Produits de la Forêt', NULL),
(13, 'Produits Spéciaux', NULL),
(14, 'Produits Biologiques', NULL),
(15, 'Produits Transformés', NULL),
(16, 'Produits Pharmacetiques', NULL),
(17, 'Nouvelle category', 'Bon ceci est une nouvelle description');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `__tbl_ecom_categories`
--
ALTER TABLE `__tbl_ecom_categories`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `__tbl_ecom_categories`
--
ALTER TABLE `__tbl_ecom_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
