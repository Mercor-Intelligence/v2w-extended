import React, { useState, useMemo } from 'react';
import { products, productCategories } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';
import '../styles/pages.css';
import '../styles/shop.css';

function GiftCardSelector({ product, onAdd }) {
  const [amount, setAmount] = useState(product.options[1]);
  const [open, setOpen] = useState(false);
  return (
    <div className="gift-selector">
      <button className="btn btn-sm" onClick={() => setOpen((v) => !v)}>
        {open ? `$${amount}` : 'Select amount'}
      </button>
      {open && (
        <div className="gift-options">
          {product.options.map((v) => (
            <button
              key={v}
              className={`gift-opt ${amount === v ? 'sel' : ''}`}
              onClick={() => setAmount(v)}
            >
              ${v}
            </button>
          ))}
          <button
            className="btn btn-sm"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => { onAdd({ ...product, price: amount, title: `${product.title} ($${amount})`, id: `${product.id}-${amount}` }); setOpen(false); }}
          >
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'All') list = list.filter((p) => p.category === category);
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [category, search, sort]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Shop</p>
          <h1>Products & Gifts</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">Thoughtfully curated products, rentals and digital guides for new and growing families.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="shop-toolbar">
            <div className="cat-pills">
              {productCategories.map((c) => (
                <button
                  key={c}
                  className={category === c ? 'active' : ''}
                  onClick={() => setCategory(c)}
                >{c}</button>
              ))}
            </div>
            <div className="shop-search">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-asc">Price: low → high</option>
                <option value="price-desc">Price: high → low</option>
                <option value="name">Name A → Z</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center" style={{ color: 'var(--color-muted)' }}>No products match your search.</p>
          ) : (
            <div className="grid grid-4">
              {filtered.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-img">
                    <img src={p.image} alt={p.title} />
                    <span className="product-tag">{p.category}</span>
                  </div>
                  <div className="product-body">
                    <h4>{p.title}</h4>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-foot">
                      <strong className="product-price">
                        {p.type === 'gift' ? `from $${p.options[0]}` : `$${p.price.toFixed(2)}`}
                      </strong>
                      {p.type === 'gift' ? (
                        <GiftCardSelector product={p} onAdd={(it) => addItem(it)} />
                      ) : (
                        <button className="btn btn-sm" onClick={() => addItem(p)}>Add to cart</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
