<?php

namespace Bdt\Analytic\MainManager;

class ManagerAPI
{
    private const ANALYTICS_API_URL = 'https://api.myflow-analytics.com/v1/public/users';
    private const TOKEN_CONSTANT = 'BDT_ANALYTIC_MANAGER_API_TOKEN';

    public function get_managers_from_analytics()
    {
        $bearer_token = $this->get_bearer_token();

        if ($bearer_token === '') {
            return ['error' => 'missing manager api token', 'http_code' => 0];
        }

        $response = wp_remote_get(self::ANALYTICS_API_URL, [
            'headers' => [
                'Authorization' => 'Bearer ' . $bearer_token,
                'Content-Type' => 'application/json',
            ],
        ]);

        if (is_wp_error($response)) {
            return ['error' => 'can\'t get managers', 'http_code' => $response->get_error_code()];
        }

        $body = wp_remote_retrieve_body($response);

        return json_decode($body, true);
    }

    public function has_bearer_token(): bool
    {
        return $this->get_bearer_token() !== '';
    }

    private function get_bearer_token(): string
    {
        if (!defined(self::TOKEN_CONSTANT)) {
            return '';
        }

        $token = constant(self::TOKEN_CONSTANT);

        return is_string($token) ? trim($token) : '';
    }


    public function update_manager_list(): void
    {
        $managers = $this->get_managers_from_analytics();
        $managers = $this->sanitize_managers($managers);

        if (!empty($managers)) {
            update_option('managers_list', $managers);
        }
    }

    private function sanitize_managers($managers): array
    {
        if (!is_array($managers) || !empty($managers['error'])) {
            return [];
        }

        $clean_managers = [];

        foreach ($managers as $manager) {
            if (!is_array($manager)) {
                continue;
            }

            $hash = isset($manager['hash']) ? sanitize_text_field((string) $manager['hash']) : '';
            $name = isset($manager['name']) ? sanitize_text_field((string) $manager['name']) : '';

            if ($hash === '' || $name === '') {
                continue;
            }

            $clean_managers[] = [
                'hash' => $hash,
                'name' => $name,
            ];
        }

        return $clean_managers;
    }

    public function handle_manual_update(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to update managers.', 'bdt-analytic'));
        }

        check_admin_referer('bdt_update_managers_list');

        $managers = $this->get_managers_from_analytics();
        $managers = $this->sanitize_managers($managers);
        $updated = !empty($managers);

        if ($updated) {
            update_option('managers_list', $managers);
        }

        wp_safe_redirect(add_query_arg(
            'managers_updated',
            $updated ? '1' : '0',
            admin_url('options-general.php?page=manager-selector')
        ));
        exit;
    }

    public function missing_token_notice(): void
    {
        if ($this->has_bearer_token() || !current_user_can('manage_options')) {
            return;
        }

        printf(
            '<div class="notice notice-warning"><p>%s</p></div>',
            esc_html(sprintf(
                'Facebook Analytic: define %s in wp-config.php to update the manager list.',
                self::TOKEN_CONSTANT
            ))
        );
    }

}
