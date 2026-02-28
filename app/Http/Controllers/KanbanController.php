<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index(Request $request)
    {
        $statuses = ['pending', 'in_progress', 'done', 'overdue'];

        // If it's an Inertia partial request for a specific column (infinite scroll)
        if ($request->has('status') && in_array($request->status, $statuses)) {
            $status = $request->status;
            $perPage = 10;
            $page = $request->input('page', 1);

            $tasks = Task::with('patient')
                ->where('status', $status)
                ->orderByDesc('due_date')
                ->paginate($perPage, ['*'], 'page', $page)
                ->through(fn ($task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date?->toIso8601String(),
                    'status' => $task->status,
                    'patient_id' => $task->patient_id,
                    'patient' => $task->patient ? [
                        'id' => $task->patient->id,
                        'name' => trim($task->patient->first_name.' '.$task->patient->last_name),
                    ] : null,
                ]);

            return response()->json([
                'status' => $status,
                'tasks' => $tasks,
            ]);
        }

        // Initial load: fetch first page for all columns
        $initialTasks = [];
        foreach ($statuses as $status) {
            $initialTasks[$status] = Task::with('patient')
                ->where('status', $status)
                ->orderByDesc('due_date')
                ->paginate(10, ['*'], 'page', 1)
                ->through(fn ($task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date?->toIso8601String(),
                    'status' => $task->status,
                    'patient_id' => $task->patient_id,
                    'patient' => $task->patient ? [
                        'id' => $task->patient->id,
                        'name' => trim($task->patient->first_name.' '.$task->patient->last_name),
                    ] : null,
                ]);
        }

        return Inertia::render('user/kanban', [
            'initialTasks' => $initialTasks,
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
