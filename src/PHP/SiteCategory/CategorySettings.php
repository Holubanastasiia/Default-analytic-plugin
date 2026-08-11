<?php
namespace Bdt\Analytic\SiteCategory;

class CategorySettings
{
    public const OPTION_SELECTED_CATEGORY = 'selected_category';
    public const CATEGORY_CASUAL = 'CASUAL';
    private string $option_name = 'site_categories';
    private string $selected_option_name = self::OPTION_SELECTED_CATEGORY;
    private array $categories = ['MOB', self::CATEGORY_CASUAL, 'COMICS', 'iGAMING'];

    public function add_plugin_menu(): void
    {
        add_options_page(
            'Site Category Settings',
            'Site Category Settings',
            'manage_options',
            'category-selector',
            [ $this, 'settings_page' ]
        );
    }

    public function register_settings(): void
    {
        register_setting(
            'category_selector_options_group',
            $this->selected_option_name,
            [
                'type' => 'string',
                'sanitize_callback' => [$this, 'sanitize_selected_category'],
                'default' => $this->categories[0],
            ]
        );
    }

    public function sanitize_selected_category($category): string
    {
        $category = sanitize_text_field((string) $category);

        return in_array($category, $this->categories, true) ? $category : $this->categories[0];
    }

    public function initialize_categories(): void
    {
        $stored = get_option($this->option_name);
        if (!is_array($stored) || $stored !== $this->categories) {
            update_option($this->option_name, $this->categories);
        }
        $selected = get_option($this->selected_option_name);

        if (!$selected || !in_array($selected, $this->categories, true)) {
            update_option($this->selected_option_name, $this->categories[0]);
        }
    }

    private function get_categories(): array
    {
        return get_option($this->option_name, $this->categories);
    }

    public function settings_page(): void
    {
        ?>
        <div class="wrap">
            <h1>Site Category Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('category_selector_options_group');
                do_settings_sections('category-selector');

                $categories = $this->get_categories();
                $selected_category = get_option($this->selected_option_name, 'MOB');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Select Category</th>
                        <td>
                            <select name="<?php echo esc_attr($this->selected_option_name); ?>">
                                <?php
                                foreach ($categories as $category) {
                                    $selected = ($selected_category === $category) ? 'selected' : '';
                                    echo "<option value='" . esc_attr($category) . "' {$selected}>" . esc_html($category) . "</option>";
                                }
                                ?>
                            </select>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
