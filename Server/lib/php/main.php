<?php
require 'firebaseInterface.php';
require 'firebaseLib.php';
require 'firebaseStub.php';
require 'AllPayAIO.php';

$firebase = new \Firebase\FirebaseLib($_GET['FBURL'], $_GET['FIREBASE_SECRETE']);
require 'orderHandler.php';

?>