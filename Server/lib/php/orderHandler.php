<?php
require 'firebaseInterface.php';
require 'firebaseLib.php';
require 'firebaseStub.php';
require 'AllPayAIO.php';

$firebase = new \Firebase\FirebaseLib($_GET['FBURL'], $_GET['FIREBASE_SECRETE']);


// --- reading the stored string ---
$remotedata = $firebase->get($_GET['ORDER_PATH']);
$obj = json_decode($remotedata);
echo "AllPay: <ID>";
echo $obj->{'id'};
