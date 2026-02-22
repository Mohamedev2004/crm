<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    // Admin notifications (global)
    public function index(Request $request)
    {
        $perPage = in_array((int) $request->input('perPage'), [5, 10, 20, 30, 50], true)
            ? (int) $request->input('perPage')
            : 10;

        $search = $request->input('search');
        $types = $request->input('types', []);

        if (! is_array($types)) {
            $types = [$types];
        }

        $allowedTypes = ['success', 'alert', 'warning', 'info'];

        $types = array_values(array_intersect($types, $allowedTypes));

        $query = Notification::query()->latest();

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('message', 'like', '%' . $search . '%');
            });
        }

        if (! empty($types)) {
            $query->whereIn('type', $types);
        }

        $notifications = $query
            ->orderby('is_read', 'asc')
            ->paginate($perPage)
            ->appends($request->query())
            ->through(fn (Notification $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'is_read' => $n->is_read,
                'created_at' => optional($n->created_at)->toDateTimeString(),
            ]);

        return Inertia::render('user/notifications', [
            'notifications' => $notifications,
            'filters' => [
                'search' => $search,
                'types' => $types,
                'perPage' => $perPage,
            ],
        ]);
    }

    // Mark one as read
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    // Mark all as read
    public function markAllAsRead()
    {
        Notification::query()->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
