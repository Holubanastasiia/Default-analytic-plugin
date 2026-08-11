<?php
/*
Plugin Name: Facebook Analytic
Description: A fb-analytic code with preloader and choosing main manager with r2 (comics) + redirect.Fixed jquery. Dynamic Source for casual. with one click templates through filters. Fix error section.
Version: 12.0.0
Author: Anastasia Holubnycha
*/

if (!defined('ABSPATH')) {
    exit;
}

define('FB_LANDING_ANALYTIC_PATH', plugin_dir_path(__FILE__));
define('FB_LANDING_ANALYTIC_URL', plugin_dir_url(__FILE__));

require __DIR__ . '/vendor/autoload.php';

use Bdt\Analytic\Core\Plugin;
use Bdt\Analytic\MainManager\ManagerCron;

$plugin = new Plugin();
$plugin->init();

register_deactivation_hook(__FILE__, [new ManagerCron(), 'remove_cron_job']);
