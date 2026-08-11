<?php

namespace Bdt\Analytic\DynamicSource;

class DynamicSource
{
    public static function bdt_get_dynamic_source_data(): array
    {
        $enabled = get_field('make_dynamic_source') ?: false;
        $addPrefix = get_field('add_prefix_to_utmsource') ?: false;

        return [
            'enabled' => $enabled,
            'add_prefix' => $addPrefix,
            'ios' => self::extract_sources('ios'),
            'android' => self::extract_sources('android'),
        ];
    }

    private static function extract_sources(string $platform): array
    {
        $group = get_field($platform);

        if (!is_array($group) || empty($group['sources'])) {
            return [];
        }

        $result = [];

        foreach ($group['sources'] as $row) {
            $result[] = [
                'source_we_have' => $row['source_we_have'] ?? '',
                'source_we_pass_on' => $row['source_we_pass_on'] ?? '',
            ];
        }

        return $result;
    }
}