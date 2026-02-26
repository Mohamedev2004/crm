<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Notification;

class WarnUpcomingTasks extends Command
{
    protected $signature = 'tasks:warn-upcoming';
    protected $description = 'Crée une notification 1 heure avant la date d\'échéance d\'une tâche.';

    public function handle()
    {
        $counter = 0;

        $reminderHours = 1;

        $startWindow = now()->addHours($reminderHours);
        $endWindow   = now()->addHours($reminderHours)->addMinute();

        $tasks = Task::whereBetween('due_date', [$startWindow, $endWindow])
            ->where('reminder_sent', false)
            ->whereNotIn('status', ['done', 'overdue'])
            ->get();

        foreach ($tasks as $task) {

            Notification::create([
                'title'   => 'Rappel de tâche',
                'message' => "La tâche \"{$task->title}\" arrive à échéance à {$task->due_date}.",
                'type'    => 'warning',
                'is_read' => false,
            ]);

            $task->update(['reminder_sent' => true]);

            $this->info("Notification créée pour : {$task->title}");
            $counter++;
        }

        $this->info("Terminé. {$counter} notification(s) créée(s).");
    }
}