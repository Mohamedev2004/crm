<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'priority', 'start_date','due_date', 'status', 'user_id'
    ];

    // User (commercial/admin) assigned to this task
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
