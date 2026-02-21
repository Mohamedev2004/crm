<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    // Admin notifications (global)
    public function index()
    {
        $notifications = Notification::latest()
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'is_read' => $n->is_read,
                'created_at' => $n->created_at->toDateTimeString(),
            ]);

        return Inertia::render('user/notifications', [
            'notifications' => $notifications,
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