<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index()
    {
        // 1. Optimize Task query: Select only needed columns and limit per status
        $statuses = ['pending', 'in_progress', 'done', 'overdue'];
        $tasks = collect();

        foreach ($statuses as $status) {
            $tasks = $tasks->concat(
                Task::where('status', $status)
                    ->latest()
                    ->with(['patient'])
                    ->select(['id', 'title', 'description', 'priority', 'due_date', 'status', 'patient_id'])
                    ->take(10)
                    ->get()
            );
        }

        $tasks = $tasks->map(function ($task) {
            if ($task->patient) {
                $task->patient->name = trim($task->patient->first_name.' '.$task->patient->last_name);
            }

            return $task;
        });

        // 2. Use Defer for patients: Loaded only when needed (e.g. for the creation modal)
        return Inertia::render('user/kanban', [
            'tasks' => $tasks,
            'patients' => Inertia::defer(fn () => Patient::select('id', 'first_name', 'last_name')->get()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->first_name.' '.$p->last_name,
            ])),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,done,overdue',
            'patient_id' => 'nullable|exists:patients,id',
        ]);

        Task::create($validated);

        return back()->with('success', 'Tâche créée avec succès');
    }

    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,done,overdue',
        ]);

        if ($task->status === 'overdue') {
            return back()->with('error', 'Impossible de déplacer une tâche en retard.');
        }

        if ($validated['status'] === 'overdue') {
            return back()->with('error', 'Impossible de déplacer manuellement une tâche vers la colonne En retard.');
        }

        $task->update([
            'status' => $validated['status'],
        ]);

        return back();
    }
}
