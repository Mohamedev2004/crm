<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentFactory> */
    use HasFactory;

    protected $fillable = [
        'appointment_name',
        'appointment_email',
        'appointment_phone',
        'appointment_date',
        'appointment_message',
        'status',
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
    ];
}
