<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Task;
use Illuminate\Console\Command;

class UpdateOverdueTasks extends Command
{
    protected $signature = 'tasks:update-overdue';

    protected $description = 'Met à jour les tâches dont la date d\'échéance est dépassée et crée une notification.';

    public function handle()
    {
        $counter = 0;

        $tasks = Task::where('due_date', '<=', now())
            ->whereNotIn('status', ['done', 'overdue'])
            ->get();

        foreach ($tasks as $task) {
            $task->update(['status' => 'overdue']);

            $this->info('Tâche "'.$task->title.'" marquée comme en retard.');
            $counter++;
        }

        if ($counter > 0) {
            Notification::create([
                'title' => 'Tâches en retard',
                'message' => "Il y a {$counter} tâche(s) qui sont maintenant en retard.",
                'type' => 'alert',
                'is_read' => false,
            ]);
        }

        $this->info('Terminé. '.$counter.' tâche(s) mises à jour comme en retard.');
    }
}
