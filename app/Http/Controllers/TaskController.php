<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['id', 'title', 'due_date', 'status', 'priority', 'patient_id', 'created_at'];

        $status = $request->input('status');
        $priority = $request->input('priority');

        $status = $status === 'all' ? null : $status;
        $priority = $priority === 'all' ? null : $priority;

        $sortBy = in_array($request->input('sortBy'), $sortable) ? $request->input('sortBy') : 'created_at';
        $sortDir = $request->input('sortDir') === 'asc' ? 'asc' : 'desc';
        $perPage = in_array((int) $request->input('perPage'), [5, 10, 20, 30, 40, 50, 60])
            ? (int) $request->input('perPage')
            : 10;

        $query = Task::query()->with('patient');

        if ($status) {
            $query->where('status', $status);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        $tasks = $query
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->appends($request->query());

        $patients = Patient::select('id', 'first_name', 'last_name')->get();

        return Inertia::render('user/tasks', [
            'tasks' => $tasks,
            'patients' => $patients,
            'filters' => [
                'status' => $request->input('status') ?? 'all',
                'priority' => $request->input('priority') ?? 'all',
                'sortBy' => $sortBy,
                'sortDir' => $sortDir,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'patient_id' => 'nullable|exists:patients,id',
        ]);

        Task::create([
            ...$validated,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Tâche créée avec succès');
    }

    public function update(Request $request, Task $task)
    {
        if ($task->status === 'done') {
            return back()->with('error', 'Impossible de modifier une tâche terminée !');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,done,overdue',
            'patient_id' => 'nullable|exists:patients,id',
        ]);

        $task->update($validated);

        return back()->with('success', 'Tâche mise à jour avec succès !');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return back()->with('success', 'Tâche supprimée avec succès');
    }

    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,done,overdue',
        ]);

        $task->update(['status' => $validated['status']]);

        return back()->with('success', 'Statut mis à jour');
    }

    // Bulk updates
    public function setSelectedPending(Request $request)
    {
        return $this->setSelectedStatus($request, 'pending');
    }

    public function setSelectedInProgress(Request $request)
    {
        return $this->setSelectedStatus($request, 'in_progress');
    }

    public function setSelectedDone(Request $request)
    {
        return $this->setSelectedStatus($request, 'done');
    }

    private function setSelectedStatus(Request $request, $status)
    {
        $request->validate([
            'task_ids' => 'required|array',
            'task_ids.*' => 'exists:tasks,id',
        ]);

        Task::whereIn('id', $request->task_ids)
            ->where('status', '!=', 'done')
            ->update(['status' => $status]);

        return back()->with('success', 'Tâches sélectionnées mises à jour !');
    }
}