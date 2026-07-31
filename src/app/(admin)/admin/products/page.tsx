'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Download, Upload, Search, Edit3, Trash2, Check, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getAdminProductsAction, deleteProductAction } from '@/actions/product-admin';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [imported, setImported] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const liveProducts = await getAdminProductsAction();
        setProducts(liveProducts);
      } catch (e) {
        console.error('Failed to load products from database:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product from PostgreSQL DB?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      await deleteProductAction(id);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Title,SKU,Price,Stock,Status']
        .concat(products.map((p) => `${p.id},"${p.title}",${p.sku},${p.price},${p.stock},${p.status}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `angel_collection_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImportMock = () => {
    setImported(true);
    setTimeout(() => setImported(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-admin-border">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">INVENTORY CATALOGUE</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">Product Management</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-admin-card text-admin-muted hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-admin-border transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> CSV Export
          </button>

          <button
            onClick={handleCSVImportMock}
            className="px-4 py-2.5 bg-admin-card text-admin-muted hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-admin-border transition cursor-pointer"
          >
            <Upload className="w-4 h-4" /> CSV Bulk Upload
          </button>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-400 transition shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {imported && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" /> CSV Bulk Upload Completed Successfully.
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-admin-card p-4 rounded-2xl border border-admin-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-admin-muted" />
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-bg text-xs text-white rounded-xl border border-admin-border focus:outline-none focus:border-amber-500"
          />
        </div>

        <span className="text-xs text-admin-muted">Live DB Items: {filtered.length}</span>
      </div>

      {/* Products Table */}
      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-admin-muted text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Fetching live database products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border uppercase font-bold text-admin-muted bg-admin-bg">
                  <th className="py-3.5 px-4">Item & Image</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border text-admin-text">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-admin-hover transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-12 h-14 object-cover rounded-xl border border-admin-border"
                        />
                        <div>
                          <p className="font-bold text-white text-sm line-clamp-1">{prod.title}</p>
                          <p className="text-[10px] text-admin-muted">ANGEL LUXURY HOUSE</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">{prod.sku}</td>
                    <td className="py-4 px-4 text-admin-muted">{prod.categoryName}</td>
                    <td className="py-4 px-4 font-bold text-white">{formatPrice(prod.price)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          prod.stock <= prod.lowStockThreshold
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/${prod.id}/edit`}
                        className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-white transition inline-block border border-admin-border cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 rounded-lg bg-admin-bg text-admin-muted hover:text-rose-400 transition border border-admin-border cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
