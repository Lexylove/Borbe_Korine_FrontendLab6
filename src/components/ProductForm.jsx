import { useState } from "react";

export default function ProductForm({ product, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState({
    product_name: product?.product_name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    quantity: product?.quantity ?? "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      product_name: form.product_name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
    });
  };

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <form className="card modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{product ? "Edit Product" : "Add Product"}</h2>
        {error && <div className="alert">{error}</div>}

        <label>
          Product name
          <input value={form.product_name} onChange={set("product_name")} maxLength={100} required autoFocus />
        </label>
        <label>
          Description
          <textarea rows={3} value={form.description} onChange={set("description")} />
        </label>
        <div className="row">
          <label>
            Price
            <input type="number" step="0.01" min="0" value={form.price} onChange={set("price")} required />
          </label>
          <label>
            Quantity
            <input type="number" step="1" min="0" value={form.quantity} onChange={set("quantity")} required />
          </label>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={saving}>{saving ? "Saving…" : product ? "Update" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}
