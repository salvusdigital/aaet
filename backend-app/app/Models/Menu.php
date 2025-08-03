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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
