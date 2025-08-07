<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
        {
        try {
            $categories = Category::orderBy('sort_order', 'asc')->get();
            if ($categories->isEmpty()) {
                return response()->json([
                    'message' => 'No categories found',
                    'error' => 'No categories found'
                ], 404);
            }

            return response()->json($categories, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve categories',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'group' => 'required|string|in:FOOD,DRINKS', // Ensure group is one of these values
                'sort_order' => 'nullable|integer', // Make sort_order optional
                'image_url' => 'nullable|string',
                'group' => 'required|string|in:FOOD,DRINKS',
            ]);

            // If sort_order is not provided, calculate it (get max + 1 for the group)
            if (!isset($validatedData['sort_order'])) {
                $maxOrder = Category::where('group', $validatedData['group'])->max('sort_order');
                $validatedData['sort_order'] = $maxOrder ? $maxOrder + 1 : 1;
            }

            $category = Category::create($validatedData);
            if (!$category) {
                throw new \Exception('Failed to create category');
            }
            return response()->json([
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $category = Category::find($id);
            if (!$category) {
                throw new \Exception('Category not found');
            }
            return response()->json([
                'message' => 'Category retrieved successfully',
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'group' => 'required|string|in:FOOD,DRINKS', // Ensure group is one of these values
                'sort_order' => 'nullable|integer', // Make sort_order optional
                'image_url' => 'nullable|string',
                'group' => 'required|string|in:FOOD,DRINKS',
            ]);

            $category = Category::find($id);
            if (!$category) {
                throw new \Exception('Category not found');
            }
            
            $updated = $category->update([
                'name' => $validatedData['name'],
                'sort_order' => $validatedData['sort_order'],
                'group' => $validatedData['group'],
                'image_url' => $validatedData['image_url'],
            ]);
            if (!$updated) {
                throw new \Exception('Failed to update category');
            }
            return response()->json([
                'message' => 'Category updated successfully',
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                throw new \Exception('Category not found. Could not delete.');
            }

            $deleted = $category->delete();
            if (!$deleted) {
                throw new \Exception('Failed to delete category');
            }
            return response()->json([
                'message' => 'Category deleted successfully',
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage()
            ], 400);
        }
    }
}
