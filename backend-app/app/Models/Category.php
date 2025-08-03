<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'group',
        'sort_order',
    ];

    protected $casts = [
        'group' => 'string',
        'sort_order' => 'integer',
    ];

    public function scopeSortedByGroupAndSortOrder($query)
    {
        return $query->orderBy('group')->orderBy('sort_order');
    }

    public static function getMenuStructure()
    {
        return static::sortedByGroupAndSortOrder()
            ->get()
            ->groupBy('group')
            ->map(function ($categories) {
                return $categories->sortBy('sort_order')->pluck('name')->toArray();
            });
    }
}
