<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $menus = Menu::all();

            if ($menus->isEmpty()) {
                return response()->json([
                    'message' => 'No menu found',
                    'error' => 'No menu found'
                ], 404);
            }

            // $menus->load('category');
            return $menus;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve menu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    /**
     * Display the specified resource.
     */
    public function showByCategory(Request $request, $id)
    {
        try {
            $menu = Menu::where('category_id', $id)->get();

            if ($menu === null) {
                return response()->json([
                    'message' => 'Cannot show menu',
                    'error' => 'Menu not found'
                ], 404);
            }

            return $menu;
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve menu',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        try {
            $menu = Menu::find($id);
            
            if ($menu === null) {
                return response()->json([
                    'message' => 'Cannot show menu',
                    'error' => 'Menu not found'
                ], 404);
            }

            return $menu;
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve menu',
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
                'description' => 'nullable|string',
                'category_id' => 'required|exists:categories,id',
                'price_room' => 'required|numeric',
                'price_restaurant' => 'required|numeric',
                'available' => 'nullable|boolean',
                'image_url' => 'nullable|string',
                'tags' => 'nullable|array',
                'tags.*' => 'nullable|string',
            ]);

            $menu = Menu::create($validatedData);
            if (!$menu) {
                throw new \Exception('Failed to create menu');
            }

            return response()->json([
                'message' => 'Menu created successfully',
                'data' => $menu
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create menu',
                'message' => $e->getMessage()
            ], 500);
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
                'description' => 'nullable|string',
                'category_id' => 'required|exists:categories,id',
                'price_room' => 'required|numeric',
                'price_restaurant' => 'required|numeric',
                'available' => 'nullable|boolean',
                'image_url' => 'nullable|string',
                'tags' => 'nullable|array',
                'tags.*' => 'nullable|string',
            ]);

            $menu = Menu::find($id);

            if ($menu === null) {
                return response()->json([
                    'message' => 'Cannot update menu',
                    'error' => 'Menu not found'
                ], 404);
            }

            $menu->update($validatedData);
            if (!$menu) {
                throw new \Exception('Failed to update menu');
            }

            return response()->json([
                'message' => 'Menu updated successfully',
                'data' => $menu
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update menu',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $menu = Menu::find($id);

            if ($menu === null) {
                return response()->json([
                    'message' => 'Cannot delete menu',  
                    'error' => 'Menu not found' 
                ], 404);
            }

            $menu->delete();
            if (!$menu) {
                throw new \Exception('Failed to delete menu');
            }

            return response()->json([
                'message' => 'Menu deleted successfully',
                'data' => $menu
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete menu',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
