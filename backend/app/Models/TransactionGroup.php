<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionGroup extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'category',
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];

    /**
     * Relasi ke user yang memiliki grup
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke transaksi dalam grup ini
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope untuk filter berdasarkan tipe transaksi
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope untuk grup yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk grup income
     */
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    /**
     * Scope untuk grup expense
     */
    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    /**
     * Hitung total transaksi dalam grup
     */
    public function getTotalAmount()
    {
        return $this->transactions()->sum('amount');
    }

    /**
     * Hitung jumlah transaksi dalam grup
     */
    public function getTransactionCount()
    {
        return $this->transactions()->count();
    }

    /**
     * Get summary statistik grup
     */
    public function getSummary()
    {
        return [
            'total_amount' => $this->getTotalAmount(),
            'transaction_count' => $this->getTransactionCount(),
            'last_transaction' => $this->transactions()->latest()->first()?->created_at,
        ];
    }
}
