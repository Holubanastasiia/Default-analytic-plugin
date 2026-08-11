<?php

namespace Bdt\Analytic\Core;

use Bdt\Analytic\DynamicSource\DynamicSource;

class Enqueue
{
    public function register_assets(): void
    {
        if (is_singular('bdt-quiz')) {
            return;
        }

        $post_id = get_the_ID();
        $redirect_url = apply_filters('bdt_analytic_redirect_url', null, $post_id);
        $loader_delay = apply_filters('bdt_analytic_loader_delay', null, $post_id);
        $add_button_after_loader = (bool) apply_filters('bdt_analytic_add_button_after_loader', false, $post_id);

        $asset_file = FB_LANDING_ANALYTIC_PATH . 'build/index.asset.php';
        if (file_exists($asset_file)) {
            $asset = include $asset_file;
        } else {
            $asset = [
                'dependencies' => ['jquery'],
                'version' => '1.0.0',
            ];
        }

        wp_enqueue_script(
            'analytic-redirect-script',
            FB_LANDING_ANALYTIC_URL . 'build/index.js',
            $asset['dependencies'],
            $asset['version'],
            false
        );

        $data = [
            'selectedManager' => get_option('selected_manager', ''),
            'category' => get_option('selected_category', ''),
            'dynamic_source' => DynamicSource::bdt_get_dynamic_source_data(),
        ];

        if (!empty($redirect_url) && is_string($redirect_url)) {
            $data['redirect_url'] = esc_url_raw($redirect_url);
        }

        if ($loader_delay !== null && $loader_delay !== '') {
            $data['loader_delay'] = (int) $loader_delay;
        }

        if ($add_button_after_loader) {
            $data['add_button_after_loader'] = true;
        }

        wp_localize_script('analytic-redirect-script', 'wpData', $data);

        wp_enqueue_style(
            'analytic-style',
            FB_LANDING_ANALYTIC_URL . 'css/style.css'
        );
    }
}
