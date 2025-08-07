<?php

namespace App\Models;

use App\Models\Category;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category_id',
        'price_room',
        'price_restaurant',
        'available',
        'image_url',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array',
        'available' => 'boolean',
        'price_room' => 'decimal:2',
        'price_restaurant' => 'decimal:2'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
