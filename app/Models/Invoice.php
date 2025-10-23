<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'amount', 'tax', 'discount', 'status',
        'due_date', 'currency', 'client_name', 'client_email', 'user_id',
        'invoice_number', 'total', 'file_path',
    ];

    protected $casts = [
        'amount' => 'float',
        'tax' => 'float',
        'discount' => 'float',
        'total' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

