<?php

namespace Bdt\Analytic\MainManager;

class ManagerSettings
{

    public function add_plugin_menu(): void
    {
        add_options_page(
            'Manager Settings',
            'Manager Settings',
            'manage_options',
            'manager-selector',
            [ $this, 'settings_page' ]
        );
    }

    public function settings_page(): void
    {
        $updated = isset($_GET['managers_updated']) && $_GET['managers_updated'] === '1';
        $failed = isset($_GET['managers_updated']) && $_GET['managers_updated'] === '0';
        ?>
        <div class="wrap">
            <h1>Manager Settings</h1>
            <?php if ($updated) : ?>
                <div class="notice notice-success is-dismissible">
                    <p><?php esc_html_e('Manager list updated successfully.', 'bdt-analytic'); ?></p>
                </div>
            <?php elseif ($failed) : ?>
                <div class="notice notice-error is-dismissible">
                    <p><?php esc_html_e('Manager list update failed. Please try again later.', 'bdt-analytic'); ?></p>
                </div>
            <?php endif; ?>
            <form method="post" action="options.php">
                <?php
                settings_fields( 'manager_selector_options_group' );
                do_settings_sections( 'manager-selector' );

                $managers = $this->get_managers_from_option();

                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Select Manager</th>
                        <td>
                            <select name="selected_manager">
                                <?php
                                foreach ( $managers as $manager ) {
                                    printf(
                                        '<option value="%s" %s>%s</option>',
                                        esc_attr($manager['hash'] ?? ''),
                                        selected(get_option('selected_manager'), $manager['hash'] ?? '', false),
                                        esc_html($manager['name'] ?? ''),
                                    );
                                }
                                ?>
                            </select>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <?php wp_nonce_field('bdt_update_managers_list'); ?>
                <input type="hidden" name="action" value="bdt_update_managers_list">
                <?php submit_button('Update Manager List', 'secondary'); ?>
            </form>
        </div>
        <?php
    }
    public function register_settings(): void
    {
        register_setting(
            'manager_selector_options_group',
            'selected_manager',
            [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '',
            ]
        );
    }

    public function get_managers_from_option() {
        return get_option('managers_list', []);
    }

}
