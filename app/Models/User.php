<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name', 'email', 'phone', 'password', 'role', 'commercial_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // If user is a client, the commercial assigned to them
    public function commercial()
    {
        return $this->belongsTo(User::class, 'commercial_id');
    }

    // If user is a commercial, get all assigned clients
    public function clients(): HasMany
    {
        return $this->hasMany(User::class, 'commercial_id');
    }

    // Leads created by this commercial
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'created_by');
    }

    // Deals created by this commercial or admin
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class, 'created_by');
    }

    // Tasks assigned to this user
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // Targets created by this user (admin)
    public function targets(): HasMany
    {
        return $this->hasMany(Target::class, 'created_by');
    }
}
