<?php

namespace Bdt\Analytic\Loader;

class LoaderTemplate
{
    public function render(): void
    {
        if (!is_singular('bdt-quiz')) {
            include FB_LANDING_ANALYTIC_PATH . 'templates/loader.html';
        }
    }
}
