<?php
header ( 'Content-Type: text/html; charset=utf-8' );
date_default_timezone_set ( 'Europe/Berlin' );
include ('config.php');
include ('functions.php');
$err_level = error_reporting ( 0 );
$my = new mysqli ( $my_host, $my_user, $my_pass );
error_reporting ( $err_level );
if ($my->connect_error)
	die ( "Datenbankverbindung nicht möglich." );
$my->set_charset ( 'utf8' );
$my->select_db ( $my_name );

$pg = pg_connect ( $pg_connectstr ) or die ( "Datenbankverbindung (PostgreSQL) nicht möglich." . pg_last_error () );

if (isset ( $_GET ["newtrack"] ) && $_GET ['newtrack'] == "newtrack" && isset ( $_GET ['user_token'] ) && isset ( $_GET ['length'] ) && isset ( $_GET ['duration'] ) && isset ( $_GET ['name'] ) && isset ( $_GET ['comment'] ) && isset ( $_GET ['data'] )) {
	// user_token passed by the app.
	$user_token = $my->real_escape_string ( $_GET ['user_token'] );
	if (verify_token ( $user_token, $my )) {
		// Create new unique track_id
		// uniqid() generates a 23-character unique string with the giver prefix (ibis_)
		$track_id = uniqid ( "tra_", true );
		
		// Created UNIX-timestamp
		$created = time ();
		
		// Länge (in Metern) des Tracks
		$length = $my->real_escape_string ( $_GET ['length'] );
		
		// Dauer (in Sekunden) des Tracks
		$duration = $my->real_escape_string ( $_GET ['duration'] );
		
		// Name (vom User festgelegt) des Tracks; max. 49 chars
		$name = substr ( $my->real_escape_string ( $_GET ['name'] ), 0, 48 );
		
		// Beschreibung (vom User festgelegt) des Tracks; max. 249 chars
		$comment = substr ( $my->real_escape_string ( $_GET ['comment'] ), 0, 248 );
		
		// data: json-encoded user track
		// array of (lat, lon, alt, time, speed, additional-info (not used so far))
		$data_raw = $_GET ['data'];
		$data = json_decode($data_raw, true, 3);
		var_dump($data); //debug
		foreach ($data as $element) {
			$lat = floatval($element["lat"]); 	// lat, lon und alt sind Gleitkommazahlen
			$lon = floatval($element["lon"]);
			$alt = floatval($element["alt"]);
			$time = intval($element["time"]); 	// UNIX timestamp ist ganzzahlig
			$result = pg_query ( "INSERT INTO `data1`.`rawdata_server-php` (`id`, `lat`, `lon`, `alt`, `time`, `track_id`)
			VALUES (NULL,  " . $lat . ",  " . $lon . ",  " . $alt . ", " . $time . ", '" . $track_id . "')" );
			pg_free_result ( $result );
		}
		
		$my->query ( "INSERT INTO `ibis_server-php`.`tracks` (`user_token`, `track_id`, `created`, `length`, `duration`, `name`, `comment`) 
		VALUES ('" . $user_token . "', '" . $track_id . "',  '" . $created . "',  '" . $length . "',  '" . $duration . "',  '" . $name . "', '" . $comment . "')" );
		// Hier wird user_token mit track_id verknüpft: DATENSCHUTZ/SPARSAMKEIT? (TODO)
		
		// Return/echo token with created and expiry timestamp as json
		$out = json_encode ( array (
				'track_id' => $track_id,
				'created' => $created 
		) );
	} else {
		$out = json_encode ( array (
				"error" => "Der Token kann nicht verifiziert werden." 
		) );
	}
} else {
	$out = json_encode ( array (
			"error" => "Keine oder falsche Eingabe." 
	) );
}
echo ($out);
pg_close ( $dbconn );
$my->close ();
?>
