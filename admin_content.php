<?php
header('Content-Type: text/html; charset=utf-8');
date_default_timezone_set('Europe/Berlin');
// Load config (for db)
include('api1/config.php');
// Connect to PgSQL database
$pg = pg_connect($pgr_connectstr) or die("Datenbankverbindung (PostgreSQL) nicht möglich. ".pg_last_error());
// Start session
session_start();

// Process input
if(isset($_GET["content_get"])) {
	if($_GET["content_get"] == "login") {
		$out = json_encode(array("content" => '
		<h3>Bitte zuerst Anmelden:</h3>
		<form id="login_form" onsubmit="loginUser()">
			<label for="user_user">Admin-Benutzername:</label>
			<br />
			<input type="text" value="" id="login_user">
			<br />
			<label for="user_pw">Passwort</label>
			<br />
			<input type="password" value="" id="login_pw">
			<br />
			<input type="submit" value="Anmelden">
			<br />
		</form>
		<br />'));
	} else if($_GET["content_get"] == "delete") {
		if(isset($_SESSION["auth_user"]) && $_SESSION["auth_user"]=="ok") {
			$query = "SELECT name, track_id, created, nodes FROM tracks ORDER BY created DESC;";
			$result = pg_query($pg, $query);
			$options = "";
			if($result && (pg_num_rows($result) >= 1)){
				$data = array();
				while($row = pg_fetch_assoc($result)){
					$options .= "\t\t\t\t\t\t<option value=\"" . $row["track_id"] . "\">" .
					$row["name"] . " (" . date("d.m. ~H", intval($row["created"])) . "h; " . $row["nodes"] ." Punkte)" 
					. "(" . $row["nodes"] . " Punkte)</option>\n";
				}
				pg_free_result($result);
			}
			$out = json_encode(array("content" => '
			<h1>iBis Tracks Löschen</h1>
			<form id="admin_delete_form" onsubmit="deleteTracks()">
				<label for="admin_delete_select">Track(s) löschen</label>
				<br />
				<select id="admin_delete_select" multiple="multiple" size="35" style="overflow: hidden; width: 100%;">
				'.$options.'
				</select>
				<br />
				<input type="submit" value="Tracks Löschen">
				<br />
			</form>
			<br />
			<br />
			<hr />
			<form id="logout_form" onsubmit="logoutUser()">
				<input type="submit" value="Abmelden">
			</form>
			<br />'));
		} else {
			$out = json_encode(array("error" => "User not authenticated"));
		}
	} else {
		$out = json_encode(array("error" => "Content unknown"));
	}
}

echo($out);

// Close PgSQL connection
pg_close($pg);
?>