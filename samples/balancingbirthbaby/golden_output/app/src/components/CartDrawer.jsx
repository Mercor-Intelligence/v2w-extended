import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import '../styles/cart.css';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, count, clear } = useCart();

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-label="Shopping cart">
        <div className="cart-head">
          <h3>Your Cart ({count})</h3>
          <button className="cart-close" onClick={() => setIsOpen(false)} aria-label="Close">×</button>
        </div>
        <div className="cart-body">
          {items.length === 0 ? (
            <p className="cart-empty">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} />
                <div className="cart-item-info">
                  <p className="cart-item-title">{item.title}</p>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-remove" onClick={() => removeItem(item.id)} aria-label="Remove">×</button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button className="btn" style={{ width: '100%' }}>Checkout</button>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={clear}>Clear cart</button>
          </div>
        )}
      </aside>
    </>
  );
}
