<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class KanbanController extends Controller
{
    protected array $statuses = ['pending', 'in_progress', 'done', 'overdue'];
    protected int $perPage = 10;
    protected int $cacheMinutes = 10;

    /**
     * Display Kanban board.
     */
    public function index(Request $request)
    {
        // Infinite scroll request for a specific column
        if ($request->has('status') && in_array($request->status, $this->statuses)) {
            $status = $request->status;
            $page = $request->input('page', 1);

            $tasks = Cache::tags(['kanban', "status:{$status}"])
                ->remember("kanban:{$status}:page:{$page}", now()->addMinutes($this->cacheMinutes), function () use ($status, $page) {
                    return $this->fetchTasks($status, $page);
                });

            return response()->json([
                'status' => $status,
                'tasks' => $tasks,
            ]);
        }

        // Initial load: fetch first page for all columns
        $initialTasks = [];
        foreach ($this->statuses as $status) {
            $initialTasks[$status] = Cache::tags(['kanban', "status:{$status}"])
                ->remember("kanban:{$status}:page:1", now()->addMinutes($this->cacheMinutes), function () use ($status) {
                    return $this->fetchTasks($status, 1);
                });
        }

        return Inertia::render('user/kanban', [
            'initialTasks' => $initialTasks,
            'patients' => Inertia::defer(fn () => Patient::select('id', 'first_name', 'last_name')
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => trim("{$p->first_name} {$p->last_name}"),
                ])),
        ]);
    }

    /**
     * Store a new task.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:' . implode(',', $this->statuses),
            'patient_id' => 'nullable|exists:patients,id',
        ]);

        $task = Task::create($validated);

        // Invalidate cache for this status
        Cache::tags(['kanban', "status:{$task->status}"])->flush();

        return back()->with('success', 'Tâche créée avec succès');
    }

    /**
     * Update the status of a task.
     */
    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', $this->statuses),
        ]);

        $newStatus = $validated['status'];

        if ($task->status === 'overdue') {
            return back()->with('error', 'Impossible de déplacer une tâche en retard.');
        }

        if ($newStatus === 'overdue') {
            return back()->with('error', 'Impossible de déplacer manuellement une tâche vers la colonne En retard.');
        }

        $oldStatus = $task->status;
        $task->update(['status' => $newStatus]);

        // Invalidate caches for old and new statuses
        Cache::tags(['kanban', "status:{$oldStatus}"])->flush();
        Cache::tags(['kanban', "status:{$newStatus}"])->flush();

        return back();
    }

    /**
     * Fetch tasks with patient info and map to API format.
     */
    protected function fetchTasks(string $status, int $page)
    {
        return Task::with('patient')
            ->where('status', $status)
            ->orderByDesc('due_date')
            ->paginate($this->perPage, ['*'], 'page', $page)
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
                    'name' => trim("{$task->patient->first_name} {$task->patient->last_name}"),
                ] : null,
            ]);
    }
}
