<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name', 'email', 'phone', 'service', 'source', 'status', 'client_id', 'created_by'
    ];

    // The client related to this lead
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // The commercial or admin who created the lead
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Deals linked to this lead
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }
}
