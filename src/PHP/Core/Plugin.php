<?php

namespace Bdt\Analytic\Core;

use Bdt\Analytic\DynamicSource\DynamicSourceFieldFilter;
use Bdt\Analytic\Loader\LoaderTemplate;
use Bdt\Analytic\MainManager\ManagerSelector;
use Bdt\Analytic\SiteCategory\CategorySelector;

class Plugin
{
    public function init(): void
    {
        $this->init_acf_json_paths();
        $this->register_hooks();
        $this->init_modules();
    }

    private function register_hooks(): void
    {
        add_filter('body_class', [$this, 'add_custom_body_class']);
        add_filter('bdt_custom_templates_skip_one_click_fallback', [$this, 'skip_one_click_fallback'], 10, 3);
        add_action('wp_enqueue_scripts', [new Enqueue(), 'register_assets']);
        add_action('wp_body_open', [new LoaderTemplate(), 'render']);
    }

    private function init_acf_json_paths(): void
    {
        $json_path = FB_LANDING_ANALYTIC_PATH . 'acf-json';

        add_filter('acf/settings/load_json', function ($paths) use ($json_path) {
            $paths[] = $json_path;
            return $paths;
        });

        add_filter('acf/settings/save_json', function () use ($json_path) {
            return $json_path;
        });
    }

    private function init_modules(): void
    {
        new ManagerSelector();
        new CategorySelector();
        new DynamicSourceFieldFilter();
    }

    public function add_custom_body_class($classes): array
    {
        $classes[] = 'loading';
        return $classes;
    }

    public function skip_one_click_fallback($skip_fallback, $post_id, $template): bool
    {
        if (is_singular('bdt-quiz')) {
            return (bool) $skip_fallback;
        }

        return true;
    }
}
