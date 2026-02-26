<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory, softDeletes;

    protected $guarded = [];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
