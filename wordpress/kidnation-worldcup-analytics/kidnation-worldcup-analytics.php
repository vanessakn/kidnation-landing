<?php
/**
 * Plugin Name: KidNation World Cup Analytics Bridge
 * Description: Sends privacy-conscious World Cup landing-page and embedded-game events to the existing GTM dataLayer.
 * Version: 1.0.0
 * Author: KidNation
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

/**
 * Load the bridge only on the World Cup landing page.
 *
 * The bridge does not send network requests itself. It validates iframe messages
 * and pushes approved events into the site's existing GTM dataLayer.
 */
function kidnation_worldcup_enqueue_analytics_bridge() {
    if ( ! is_page( 'worldcup' ) ) {
        return;
    }

    $handle = 'kidnation-worldcup-analytics';
    $version = '1.0.0';

    wp_enqueue_script(
        $handle,
        plugin_dir_url( __FILE__ ) . 'assets/worldcup-analytics.js',
        array(),
        $version,
        false
    );

    $config = array(
        'pagePath'       => '/worldcup/',
        'gameOrigin'     => 'https://miasstack.github.io',
        'gamePathPrefix' => '/knsoccer',
        'iframeSelector' => 'iframe[src*="miasstack.github.io/knsoccer"]',
        'ctaLabels'      => array( 'play now', 'kick off', 'start the match' ),
        'dataLayerName'  => 'dataLayer',
    );

    wp_add_inline_script(
        $handle,
        'window.KidNationWorldCupAnalyticsConfig = ' . wp_json_encode( $config ) . ';',
        'before'
    );
}
add_action( 'wp_enqueue_scripts', 'kidnation_worldcup_enqueue_analytics_bridge', 20 );
