<?php
/*
Plugin Name: 3beats Publisher WP Plugin
Plugin URI: http://wordpress.org/extend/plugins/googleanalytics/
Description: Enables <a href="http://www.3beats.com/">threebeats-js</a> on all pages.
Version: 0.1.1
Author: Ryan Kern
Author URI: http://www.3beats.com/
*/

if (!defined('WP_PLUGIN_DIR'))
	define('WP_PLUGIN_DIR', WP_CONTENT_DIR.'/plugins');

add_action('admin_menu', 'threebeats_loadjs_add_page');
add_action('init', 'threebeats_load_api');

function threebeats_admin_menu() {
  add_options_page('3beats Options', '3beats Plugin Options', 8, 'threebeats-js', 'threebeats_options_page');
}

function threebeats_options_page() {
  include(WP_PLUGIN_DIR.'/threebeats-js/options.php');  
}

function threebeats_load_api() { 
	// Add the example.js
	$plugindir = get_settings('home').'/wp-content/plugins/'.dirname(plugin_basename(__FILE__));

	//wp_enqueue_style('threebeats-style', $plugindir . '/inject/threebeats_popup.css',false,'0.1','all');
	
	//wp_enqueue_script('jquery-latest.min', $plugindir . '/inject/jquery-latest.min.js', false, '1.4.3', false);
	//wp_enqueue_script('threebeats-jpop', $plugindir . '/inject/jpopup.js', array('jquery-latest.min'), '0.1', false);
	//wp_enqueue_script('threebeats-pop', $plugindir . '/inject/popup.js', array('jquery-latest.min'), '0.1', false);
	wp_enqueue_script('threebeats-js', $plugindir . '/3beats_engine.js', false, '0.1', false);
	// wp_enqueue_script('threebeats-js', '/wp-content/plugins/threebeats-js/3beats_engine.js');

	threebeats_injecthtml();
}

function threebeats_injecthtml() {
?>
<?php	
}

function threebeats_loadjs_add_page() {
	/** 
	 * Adds an options page
	 * not really needed at this moment
	 */
	// $mypage = add_options_page('Load JS Example', 'Load JS Example', 8, 'loadjsexample', 'threebeats_loadjs_options_page');

	// Does something else
	// add_action( "admin_print_scripts-$mypage", 'threebeats_loadjs_admin_head' );
}

if (is_admin()) {
  // add_action('admin_init', 'admin_init_googleanalytics');
  add_action('admin_menu', 'threebeats_admin_menu');
}



/*
function threebeats_loadjs_options_page() {
	echo "<div class='wrap'>
	<h2>Load JS Example Page</h2>
	Only on this page you'll see ugly CSS and annoying JS
	</div>
	";
}

function threebeats_loadjs_admin_head() {
	$plugindir = get_settings('home').'/wp-content/plugins/'.dirname(plugin_basename(__FILE__));
	wp_enqueue_script('loadjs', $plugindir . '/example.js');
	echo "<link rel='stylesheet' href='$plugindir/example.css' type='text/css' />\n";
}
*/

/** 
 * This was from the google analytics plugin from before
 */

/*
if (!defined('WP_CONTENT_URL'))
      define('WP_CONTENT_URL', get_option('siteurl').'/wp-content');
if (!defined('WP_CONTENT_DIR'))
      define('WP_CONTENT_DIR', ABSPATH.'wp-content');
if (!defined('WP_PLUGIN_URL'))
      define('WP_PLUGIN_URL', WP_CONTENT_URL.'/plugins');
if (!defined('WP_PLUGIN_DIR'))
      define('WP_PLUGIN_DIR', WP_CONTENT_DIR.'/plugins');

function activate_googleanalytics() {
  add_option('web_property_id', 'UA-0000000-0');
  add_option('asynchronous_tracking', 'no');
}

function deactive_googleanalytics() {
  delete_option('web_property_id');
  delete_option('asynchronous_tracking');
}

function admin_init_googleanalytics() {
  register_setting('googleanalytics', 'web_property_id');
  register_setting('googleanalytics', 'asynchronous_tracking');
}

function admin_menu_googleanalytics() {
  add_options_page('Google Analytics', 'Google Analytics', 8, 'googleanalytics', 'options_page_googleanalytics');
}

function options_page_googleanalytics() {
  include(WP_PLUGIN_DIR.'/googleanalytics/options.php');  
}

function asynchronous_googleanalytics($web_property_id) {
?>
<script type="text/javascript">
var _gaq = _gaq || [];
_gaq.push(['_setAccount', '<?php echo $web_property_id ?>']);
_gaq.push(['_trackPageview']);
(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
})();
</script>
<?php
}

function synchronous_googleanalytics($web_property_id) {
?>
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("<?php echo $web_property_id ?>");
pageTracker._trackPageview();
} catch(err) {}</script>
<?php
}

function googleanalytics() { 
  
  $web_property_id = get_option('web_property_id');
  $asynchronous_tracking = (get_option('asynchronous_tracking') == 'yes');
  
  switch($asynchronous_tracking) {
    case true:
      asynchronous_googleanalytics($web_property_id);
      break;
    case false:
      synchronous_googleanalytics($web_property_id);
      break;
  }

}

register_activation_hook(__FILE__, 'activate_googleanalytics');
register_deactivation_hook(__FILE__, 'deactive_googleanalytics');

if (is_admin()) {
  add_action('admin_init', 'admin_init_googleanalytics');
  add_action('admin_menu', 'admin_menu_googleanalytics');
}

if (!is_admin()) {
	add_action('wp_footer', 'googleanalytics');
}
*/
?>