<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Permission extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'category',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role');
    }

    /**
     * Get permissions grouped by category
     */
    public static function groupedByCategory()
    {
        return self::all()->groupBy('category');
    }

    /**
     * Get all unique categories
     */
    public static function categories()
    {
        return self::distinct('category')->pluck('category')->sort();
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('permission')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





