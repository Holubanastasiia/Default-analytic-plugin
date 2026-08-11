<?php

namespace Bdt\Analytic\DynamicSource;

class DynamicSourceFieldFilter
{
    private array $groupsToShowOnlyForCasual = [
        'group_684ee71b1c2be',
        'group_687e3ffd28446',
    ];

    private const OPTION_NAME = 'selected_category';
    private const OPTION_ALLOWED_VALUE = 'CASUAL';

    public function __construct()
    {
        add_action('acf/input/admin_footer', [$this, 'printAdminScript']);
    }

    public function printAdminScript(): void
    {
        $category = get_option(self::OPTION_NAME);

        if ($category === self::OPTION_ALLOWED_VALUE) {
            return;
        }

        ?>
        <script>
            jQuery(function($) {
                const groupKeysToHide = <?php echo json_encode($this->groupsToShowOnlyForCasual); ?>;

                function hideGroups(context) {
                    context = context || document;
                    $('div.acf-postbox', context).each(function() {
                        const key = $(this).attr('id');
                        if (!key) return;
                        for (let i = 0; i < groupKeysToHide.length; i++) {
                            if (key.includes(groupKeysToHide[i])) {
                                $(this).hide();
                                break;
                            }
                        }
                    });
                }

                hideGroups();

                if (typeof acf !== 'undefined') {
                    acf.addAction('append_field_groups', hideGroups);
                    acf.addAction('refresh_field_groups', hideGroups);
                }
            });
        </script>
        <?php
    }
}
