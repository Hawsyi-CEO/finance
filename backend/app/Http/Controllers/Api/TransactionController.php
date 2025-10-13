<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Transaction::with(['user', 'createdBy', 'transactionGroup', 'employeePayment.employee']);
        
        // If user role is 'user', only show their own transactions
        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }
        
        // Filter by transaction group if specified
        if ($request->has('group_id')) {
            $query->where('transaction_group_id', $request->group_id);
        }
        
        // Filter by type if specified
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        $limit = $request->get('limit');
        if ($limit) {
            $transactions = $query->orderBy('created_at', 'desc')->limit($limit)->get();
        } else {
            $transactions = $query->orderBy('created_at', 'desc')->paginate(15);
        }
        
        return response()->json([
            'data' => $transactions->items ?? $transactions,
            'meta' => $transactions instanceof \Illuminate\Pagination\LengthAwarePaginator ? [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ] : null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category' => 'nullable|string|max:100',
            'expense_category' => 'nullable|in:asset,operational',
            'expense_subcategory' => 'nullable|string|max:100',
            'transaction_group_id' => 'nullable|exists:transaction_groups,id',
            'employee_payment_id' => 'nullable|exists:employee_payments,id',
            'user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        
        // Only admin and finance can create transactions
        if (!in_array($user->role, ['admin', 'finance'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = Transaction::create([
            'description' => $request->description,
            'type' => $request->type,
            'amount' => $request->amount,
            'date' => $request->date,
            'category' => $request->category,
            'expense_category' => $request->expense_category,
            'expense_subcategory' => $request->expense_subcategory,
            'transaction_group_id' => $request->transaction_group_id,
            'employee_payment_id' => $request->employee_payment_id,
            'user_id' => $request->user_id ?? $user->id,
            'created_by' => $user->id,
            'notes' => $request->notes,
        ]);

        $transaction->load(['user', 'createdBy', 'transactionGroup', 'employeePayment']);

        return response()->json($transaction, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        
        // Users can only see their own transactions
        if ($user->role === 'user' && $transaction->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->load(['user', 'createdBy']);
        return response()->json($transaction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        $request->validate([
            'description' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category' => 'nullable|string|max:100',
            'user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        
        // Only admin and finance can update transactions
        if (!in_array($user->role, ['admin', 'finance'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->update([
            'description' => $request->description,
            'type' => $request->type,
            'amount' => $request->amount,
            'date' => $request->date,
            'category' => $request->category,
            'user_id' => $request->user_id ?? $transaction->user_id,
            'notes' => $request->notes,
        ]);

        $transaction->load(['user', 'createdBy']);
        return response()->json($transaction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        
        // Only admin and finance can delete transactions
        if (!in_array($user->role, ['admin', 'finance'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}
