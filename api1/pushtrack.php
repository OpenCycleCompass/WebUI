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

$pgr = pg_connect ( $pgr_connectstr );
if(!$pgr)
	die ( "Datenbankverbindung (PostgreSQL) nicht möglich." . pg_last_error () );

if( isset($_GET["newtrack"])
		&& ($_GET['newtrack'] == "newtrack")
		&& isset($_GET['user_token'])
		&& isset($_GET['length'])
		&& isset($_GET['duration'])
		&& isset($_GET['name'])
		&& isset($_GET['comment'])
		&& (isset($_GET['data']) || isset($_POST['data'])) ) {
	
	// user_token passed by the app.
	$user_token = $my->real_escape_string ( $_GET ['user_token'] );
	if (verify_token ( $user_token, $my )) {
		// Create new unique track_id
		// uniqid() generates a 23-character unique string with the giver prefix (ibis_)
		$track_id = uniqid ( "tra_", true );
		
		// Created UNIX-timestamp
		$created = time ();
		
		// Länge (in Metern) des Tracks
		$length = intval($my->real_escape_string ( $_GET ['length'] ));
		
		// Dauer (in Sekunden) des Tracks
		$duration = intval($my->real_escape_string ( $_GET ['duration'] ));
		
		// Name (vom User festgelegt) des Tracks; max. 49 chars
		$name = substr ( $my->real_escape_string ( $_GET ['name'] ), 0, 48 );
		
		// Beschreibung (vom User festgelegt) des Tracks; max. 249 chars
		$comment = substr ( $my->real_escape_string ( $_GET ['comment'] ), 0, 248 );
		
		// Public: Track is public availible (anonymous)
		if(isset($_GET ['public']))
			if($_GET ['public'] == "true")
				$public = 1;
			else
				$public = 0;
		else
			$public = 1;
		
		$track_string = "";
		
		// data: json-encoded user track
		// array of (lat, lon, alt, time, speed, additional-info (not used so far))
		$nodes = 0;
		if(isset($_POST['data'])) {
			$data_raw = $_POST['data'];
		} else {
			$data_raw = $_GET['data'];
		}
		$data = json_decode($data_raw, true, 3);
		if(count($data)>=1){
			foreach ($data as $element) {
				if(isset($element["lat"]) && isset($element["lon"]) && isset($element["tst"])){
					$time = intval($element["tst"]); 	// UNIX timestamp ist ganzzahlig
					$lat = floatval($element["lat"]); 	// lat, lon und alt sind Gleitkommazahlen
					$lon = floatval($element["lon"]);
					if(isset($element["alt"])) {
						$alt = floatval($element["alt"]);
					} else {
						$alt = "NULL";
					}
					if(isset($element["spe"])) {
						$spe = floatval($element["spe"]);
					} else {
						$spe = "NULL";
					}
					// Länge (in Metern) des Tracks
					if($element["acc"]) {
						$acc = floatval($element["acc"]);
					} else {
						$acc = 0;
					}
					$query = "INSERT INTO rawdata_server_php (lat, lon, alt, time, speed, track_id, the_geom)
					VALUES (" . $lat . ",  " . $lon . ",  " . $alt . ", " . $time . ", " . $spe . ", '" . $track_id . "', ST_SetSRID(ST_MakePoint(".$lon.",".$lat."),4326))";
					$result = pg_query ( $query );
					if ( $result ) {
						pg_free_result ( $result );
						$nodes++;
						$track_string .= $time.$lat.$lon;
					}
					// Effizenz? Evtl alle Querys sammeln und gemeinsam ausführen?
				}
			}
			
			// Generate hash of track: $track_string
			
			$hash = sha1($track_string);
			
			$my->query ( "INSERT INTO `ibis_server-php`.`tracks` (`user_token`, `track_id`, `created`, `length`, `duration`, `nodes`, `name`, `comment`, `public`, `hash`, `data_raw`, `acc`)
			VALUES ('" . $user_token . "', '" . $track_id . "',  '" . $created . "',  '" . $length . "',  '" . $duration . "',    '" . $nodes . "',  '" . $name . "', '" . $comment . "', '" . $public . "', '" . $hash . "', '" . $my->real_escape_string($data_raw) . "', '".$acc."')" );
			// Hier wird user_token mit track_id verknüpft: DATENSCHUTZ/SPARSAMKEIT? (TODO)
			
			// Return/echo token with created and expiry timestamp as json
			$out = json_encode ( array (
					'track_id' => $track_id,
					'created' => $created,
					'nodes' => $nodes 
			) );

		} else {
			$out = json_encode ( array (
					"error" => "Keine Track-Daten enthalten." 
			) );
		}
	} else {
		$out = json_encode ( array (
				"error" => "Der Token kann nicht verifiziert werden." 
		) );
	}
} else {
	if(!isset($_POST["data"])) {
		$out = json_encode(array("error" => "Keine oder falsche Eingabe. \"data\" fehlt"));
	} else {
		$out = json_encode(array("error" => "Keine oder falsche Eingabe."));
	}
}
echo ($out);
pg_close ( $pgr );
$my->close ();
?>
