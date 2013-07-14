-- phpMyAdmin SQL Dump
-- version 3.5.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jul 14, 2013 at 02:26 PM
-- Server version: 5.1.68-cll
-- PHP Version: 5.2.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Table structure for table `encryption_keys`
--

CREATE TABLE IF NOT EXISTS `encryption_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id_1` varchar(32) NOT NULL DEFAULT '',
  `user_id_2` varchar(32) NOT NULL DEFAULT '',
  `key_timestamp` int(11) NOT NULL DEFAULT '0',
  `encryption_key` char(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_unique` (`user_id_1`,`user_id_2`,`key_timestamp`,`encryption_key`),
  KEY `index_timestamp` (`key_timestamp`),
  KEY `index_user_1` (`user_id_1`),
  KEY `index_user_2` (`user_id_2`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ;

-- --------------------------------------------------------

--
-- Table structure for table `statistics`
--

CREATE TABLE IF NOT EXISTS `statistics` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `session` varchar(32) NOT NULL DEFAULT '',
  `last_page` varchar(255) NOT NULL DEFAULT '',
  `ip` varchar(16) NOT NULL DEFAULT '',
  `last_active` datetime NOT NULL,
  `referer` varchar(255) NOT NULL DEFAULT '',
  `user_id` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `index_ip` (`ip`),
  KEY `index_last_active` (`last_active`),
  KEY `index_user` (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(32) NOT NULL,
  `password` varchar(128) NOT NULL DEFAULT '',
  `email` varchar(64) NOT NULL,
  `validation` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_email` (`email`),
  KEY `index_password` (`password`),
  KEY `validation` (`validation`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
