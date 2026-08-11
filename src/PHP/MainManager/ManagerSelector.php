<?php

namespace Bdt\Analytic\MainManager;

class ManagerSelector
{
    private ManagerAPI $manager_api;
    private ManagerCron $manager_cron;
    private ManagerSettings $manager_settings;

    public function __construct()
    {
        $this->manager_api = new ManagerAPI();
        $this->manager_cron = new ManagerCron();
        $this->manager_settings = new ManagerSettings();

        add_action('admin_menu', [$this->manager_settings, 'add_plugin_menu']);
        add_action('admin_init', [$this->manager_settings, 'register_settings']);
        add_action('admin_post_bdt_update_managers_list', [$this->manager_api, 'handle_manual_update']);
        add_action('admin_notices', [$this->manager_api, 'missing_token_notice']);
        add_action('update_managers_list', [$this->manager_api, 'update_manager_list']);
        add_action( 'wp', [ $this->manager_cron, 'register_manager_update_cron' ] );
    }
}
