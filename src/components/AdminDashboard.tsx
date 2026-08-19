"use client";

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Boxes, FolderPlus, LayoutGrid, LogOut, PackagePlus, Pencil, Plus, ReceiptText, Search, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Category = { id: string; name: string; image: string; _count: { items: number } };
type Product = { id: string; name: string; description: string; price: string; image: string; categoryId: string; tags: string[]; specs: unknown };
type CategoryDraft = { id: string; name: string; image: string };
type ProductDraft = { id: string; name: string; description: string; price: string; image: string; categoryId: string; tags: string; gallery: string };
type Order = { id: string; orderNumber: string; customerEmail: string | null; customerPhone: string | null; status: string; paymentStatus?: string; orderType: string; paymentMethod: string; deliveryAddress: string | null; total: number; createdAt: string; items: Array<{ id: string; name: string; price: number; quantity: number }> };

const emptyCategory: CategoryDraft = { id: '', name: '', image: '' };
const emptyProduct: ProductDraft = { id: '', name: '', description: '', price: '', image: '', categoryId: '', tags: '', gallery: '' };

function galleryFromSpecs(specs: unknown) {
  if (!specs) return '';
  try {
    const parsed = typeof specs === 'string' ? JSON.parse(specs) : specs;
    if (parsed && typeof parsed === 'object' && 'gallery' in parsed && Array.isArray(parsed.gallery)) return parsed.gallery.join('\n');
  } catch { return ''; }
  return '';
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminDashboard({ initialCategories, initialProducts, initialOrders }: { initialCategories: Category[]; initialProducts: Product[]; initialOrders: Order[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'orders' | 'products' | 'collections'>('orders');
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState('');
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const visibleProducts = useMemo(() => products.filter((product) => `${product.name} ${product.description} ${product.categoryId} ${product.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const visibleCategories = useMemo(() => categories.filter((category) => `${category.name} ${category.id}`.toLowerCase().includes(query.toLowerCase())), [categories, query]);
  const visibleOrders = useMemo(() => orders.filter((order) => `${order.orderNumber} ${order.customerEmail || ''} ${order.customerPhone || ''} ${order.status}`.toLowerCase().includes(query.toLowerCase())), [orders, query]);

  useEffect(() => {
    if (tab !== 'orders') return;
    const refreshOrders = async () => {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (response.ok) setOrders(await response.json());
    };
    const timer = window.setInterval(refreshOrders, 15000);
    return () => window.clearInterval(timer);
  }, [tab]);

  const request = async (url: string, options: RequestInit) => {
    setSaving(true); setError(''); setMessage('');
    const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (response.status === 401) { router.replace('/admin/login'); throw new Error('Session expired.'); }
    if (!response.ok) { setError(data.error ?? 'Something went wrong.'); throw new Error(data.error); }
    return data;
  };

  const updateOrderStatus = async (order: Order, status: string) => {
    try {
      const updated = await request(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
      setMessage(`${order.orderNumber} updated.`);
    } catch { /* API message is shown */ }
  };

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault(); if (!categoryDraft) return;
    try {
      const editing = Boolean(editingId);
      const category = await request(editing ? `/api/admin/categories/${editingId}` : '/api/admin/categories', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(categoryDraft) });
      if (editing) setCategories((current) => current.map((item) => item.id === editingId ? { ...item, ...category } : item));
      else setCategories((current) => [...current, { ...category, _count: { items: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryDraft(null); setEditingId(null); setMessage(editing ? 'Collection updated.' : 'Collection created.');
    } catch { /* API message is shown */ }
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault(); if (!productDraft) return;
    const payload = { ...productDraft, tags: productDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean), gallery: productDraft.gallery.split('\n').map((image) => image.trim()).filter(Boolean) };
    try {
      const editing = Boolean(editingId);
      const previous = products.find((item) => item.id === editingId);
      const product = await request(editing ? `/api/admin/products/${editingId}` : '/api/admin/products', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      if (editing) setProducts((current) => current.map((item) => item.id === editingId ? product : item));
      else setProducts((current) => [...current, product].sort((a, b) => a.name.localeCompare(b.name)));
      setCategories((current) => current.map((category) => {
        let count = category._count.items;
        if (!editing && category.id === product.categoryId) count += 1;
        if (editing && previous?.categoryId !== product.categoryId) {
          if (category.id === previous?.categoryId) count -= 1;
          if (category.id === product.categoryId) count += 1;
        }
        return { ...category, _count: { items: count } };
      }));
      setProductDraft(null); setEditingId(null); setMessage(editing ? 'Product updated.' : 'Product created.');
    } catch { /* API message is shown */ }
  };

  const removeProduct = async (product: Product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    try {
      await request(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setCategories((current) => current.map((category) => category.id === product.categoryId ? { ...category, _count: { items: Math.max(0, category._count.items - 1) } } : category));
      setMessage('Product deleted.');
    } catch { /* API message is shown */ }
  };

  const removeCategory = async (category: Category) => {
    if (!window.confirm(`Delete the “${category.name}” collection?`)) return;
    try {
      await request(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
      setCategories((current) => current.filter((item) => item.id !== category.id)); setMessage('Collection deleted.');
    } catch { /* API message is shown */ }
  };

  const openProduct = (product?: Product) => {
    setEditingId(product?.id ?? null); setError('');
    setProductDraft(product ? { id: product.id, name: product.name, description: product.description, price: product.price, image: product.image, categoryId: product.categoryId, tags: product.tags.join(', '), gallery: galleryFromSpecs(product.specs) } : { ...emptyProduct, categoryId: categories[0]?.id ?? '' });
  };

  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.replace('/admin/login'); router.refresh(); };

  return (
    <main className="admin-shell">
      <header className="admin-header"><div><p className="admin-kicker">Azmar Mandi</p><h1>Restaurant dashboard</h1><p>Manage incoming orders, menu products and collections.</p></div><div className="admin-header-actions"><a href="/" target="_blank">View store</a><button onClick={logout}><LogOut size={16} /> Sign out</button></div></header>
      <section className="admin-stats"><article><span><ReceiptText /></span><div><strong>{orders.length}</strong><small>Orders</small></div></article><article><span><LayoutGrid /></span><div><strong>{categories.length}</strong><small>Collections</small></div></article><article><span><Boxes /></span><div><strong>{products.length}</strong><small>Products</small></div></article></section>
      <section className="admin-workspace">
        <div className="admin-toolbar"><div className="admin-tabs"><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button><button className={tab === 'collections' ? 'active' : ''} onClick={() => setTab('collections')}>Collections</button></div><label className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${tab}…`} /></label>{tab !== 'orders' && <button className="admin-primary" onClick={() => tab === 'products' ? openProduct() : (setEditingId(null), setCategoryDraft(emptyCategory))}><Plus size={17} /> Add {tab === 'products' ? 'product' : 'collection'}</button>}</div>
        {message && <p className="admin-success">{message}</p>}{error && <p className="admin-error">{error}</p>}
        {tab === 'orders' ? <div className="admin-order-list">{visibleOrders.map((order) => <article className="admin-order" key={order.id}><div className="admin-order-head"><div><span>{new Date(order.createdAt).toLocaleString()}</span><h2>{order.orderNumber} {order.paymentStatus && <small style={{ marginLeft: '8px', padding: '2px 7px', borderRadius: '4px', background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2', color: order.paymentStatus === 'PAID' ? '#15803d' : '#b91c1c', fontSize: '10px', fontWeight: 800 }}>{order.paymentStatus}</small>}</h2><p>{order.customerEmail || order.customerPhone || 'Customer'} · {order.orderType} · {order.paymentMethod}</p></div><strong>₹{order.total}</strong></div><div className="admin-order-items">{order.items.map((item) => <span key={item.id}>{item.quantity} × {item.name}</span>)}</div>{order.deliveryAddress && <p className="admin-order-address">{order.deliveryAddress}</p>}<div className="admin-order-actions">{order.customerPhone && <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, this is Azmar Mandi regarding order ${order.orderNumber}.`)}`} target="_blank" rel="noreferrer">Open WhatsApp</a>}<label className="admin-order-status">Status<select value={order.status} disabled={saving} onChange={(event) => updateOrderStatus(order, event.target.value)}><option value="PLACED">Placed</option><option value="CONFIRMED">Confirmed</option><option value="PREPARING">Preparing</option><option value="READY">Ready</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label></div></article>)}</div> : tab === 'products' ? <div className="admin-product-grid">{visibleProducts.map((product) => <article className="admin-product" key={product.id}><div className="admin-product-image"><Image src={product.image} alt="" fill sizes="180px" /></div><div className="admin-product-copy"><span>{categories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId}</span><h2>{product.name}</h2><p>{product.description}</p><strong>{product.price}</strong></div><div className="admin-card-actions"><button aria-label={`Edit ${product.name}`} onClick={() => openProduct(product)}><Pencil size={15} /></button><button className="danger" aria-label={`Delete ${product.name}`} onClick={() => removeProduct(product)}><Trash2 size={15} /></button></div></article>)}</div> : <div className="admin-collection-grid">{visibleCategories.map((category) => <article className="admin-collection" key={category.id}><div className="admin-collection-image"><Image src={category.image} alt="" fill sizes="120px" /></div><div><span>{category.id}</span><h2>{category.name}</h2><p>{category._count.items} products</p></div><div className="admin-card-actions"><button aria-label={`Edit ${category.name}`} onClick={() => { setEditingId(category.id); setCategoryDraft({ id: category.id, name: category.name, image: category.image }); }}><Pencil size={15} /></button><button className="danger" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category)}><Trash2 size={15} /></button></div></article>)}</div>}
        {(tab === 'orders' ? visibleOrders.length : tab === 'products' ? visibleProducts.length : visibleCategories.length) === 0 && <div className="admin-empty">No matching {tab} found.</div>}
      </section>

      {categoryDraft && <div className="admin-modal-backdrop" onMouseDown={() => { setCategoryDraft(null); setEditingId(null); }}><form className="admin-modal" onSubmit={saveCategory} onMouseDown={(event) => event.stopPropagation()}><div className="admin-modal-head"><span><FolderPlus size={20} /></span><div><h2>{editingId ? 'Edit collection' : 'New collection'}</h2><p>Collections organize products on the storefront.</p></div><button type="button" onClick={() => { setCategoryDraft(null); setEditingId(null); }}><X /></button></div><div className="admin-form"><label>Collection name<input required value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value, id: editingId ? categoryDraft.id : slugify(event.target.value) })} /></label><label>Collection ID<input required disabled={Boolean(editingId)} pattern="[a-z0-9-]+" value={categoryDraft.id} onChange={(event) => setCategoryDraft({ ...categoryDraft, id: slugify(event.target.value) })} /></label><label>Cover image path or URL<input required value={categoryDraft.image} onChange={(event) => setCategoryDraft({ ...categoryDraft, image: event.target.value })} placeholder="/product-images/example.jpg" /></label></div>{error && <p className="admin-error">{error}</p>}<div className="admin-modal-foot"><button type="button" onClick={() => { setCategoryDraft(null); setEditingId(null); }}>Cancel</button><button className="admin-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save collection'}</button></div></form></div>}

      {productDraft && <div className="admin-modal-backdrop" onMouseDown={() => { setProductDraft(null); setEditingId(null); }}><form className="admin-modal admin-modal-wide" onSubmit={saveProduct} onMouseDown={(event) => event.stopPropagation()}><div className="admin-modal-head"><span><PackagePlus size={20} /></span><div><h2>{editingId ? 'Edit product' : 'New product'}</h2><p>Update the product details shown to customers.</p></div><button type="button" onClick={() => { setProductDraft(null); setEditingId(null); }}><X /></button></div><div className="admin-form admin-form-grid"><label>Product name<input required value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value, id: editingId ? productDraft.id : slugify(event.target.value) })} /></label><label>Product ID<input required disabled={Boolean(editingId)} pattern="[a-z0-9-]+" value={productDraft.id} onChange={(event) => setProductDraft({ ...productDraft, id: slugify(event.target.value) })} /></label><label>Price<input required value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} placeholder="₹299" /></label><label>Collection<select required value={productDraft.categoryId} onChange={(event) => setProductDraft({ ...productDraft, categoryId: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="full">Description<textarea required rows={3} value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} /></label><label className="full">Main image path or URL<input required value={productDraft.image} onChange={(event) => setProductDraft({ ...productDraft, image: event.target.value })} placeholder="/product-images/example.jpg" /></label><label className="full">Tags <small>Comma separated</small><input value={productDraft.tags} onChange={(event) => setProductDraft({ ...productDraft, tags: event.target.value })} placeholder="Best Seller, Signature" /></label><label className="full">Gallery images <small>One path or URL per line</small><textarea rows={3} value={productDraft.gallery} onChange={(event) => setProductDraft({ ...productDraft, gallery: event.target.value })} /></label></div>{error && <p className="admin-error">{error}</p>}<div className="admin-modal-foot"><button type="button" onClick={() => { setProductDraft(null); setEditingId(null); }}>Cancel</button><button className="admin-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save product'}</button></div></form></div>}
    </main>
  );
}
