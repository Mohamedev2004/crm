<?php

use App\Console\Commands\UpdateOverdueTasks;
use App\Console\Commands\WarnUpcomingTasks;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(UpdateOverdueTasks::class)->daily();
Schedule::command(WarnUpcomingTasks::class)->everyMinute();
