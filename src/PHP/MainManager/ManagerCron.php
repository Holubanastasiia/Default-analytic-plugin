<?php

namespace Bdt\Analytic\MainManager;

class ManagerCron
{
    private const HOOK = 'update_managers_list';
    private const RECURRENCE = 'weekly';

    public function register_manager_update_cron(): void
    {
        $timestamp = wp_next_scheduled(self::HOOK);

        if ($timestamp && wp_get_schedule(self::HOOK) !== self::RECURRENCE) {
            wp_unschedule_event($timestamp, self::HOOK);
            $timestamp = false;
        }

        if (!$timestamp) {
            wp_schedule_event(time(), self::RECURRENCE, self::HOOK);
        }
    }

    public function remove_cron_job(): void
    {
        $timestamp = wp_next_scheduled(self::HOOK);

        if ($timestamp) {
            wp_unschedule_event($timestamp, self::HOOK);
        }
    }
}
