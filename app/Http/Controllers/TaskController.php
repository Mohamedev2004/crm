<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::where('user_id', Auth::id())->orderBy('created_at')->get();
        return Inertia::render('admin/tasks', [
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Default due_date = start_date if not provided
        $validated['due_date'] = $validated['due_date'] ?? $validated['start_date'];

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'status' => 'pending',
            'user_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Task created successfully');
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:pending,in_progress,done,cancelled',
        ]);

        $validated['due_date'] = $validated['due_date'] ?? $validated['start_date'];

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully');
    }

    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,done,cancelled',
        ]);

        $task->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Status updated');
    }
}
