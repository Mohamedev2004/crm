<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Revenue extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'deal_id', 'amount', 'payment_date'
    ];

    // Deal that generated this revenue
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }
}
