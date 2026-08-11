<?php

namespace Bdt\Analytic\SiteCategory;
use Bdt\Analytic\SiteCategory\CategorySettings;

class CategorySelector
{
    private CategorySettings $category_settings;

    public function __construct()
    {
        $this->category_settings = new CategorySettings();
        add_action('admin_menu', [$this->category_settings, 'add_plugin_menu']);
        add_action('admin_init', [$this->category_settings, 'register_settings']);
        add_action('init', [$this->category_settings, 'initialize_categories']);
    }
}