import { useCallback, useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, errorMessage } from "../api";
import ProductForm from "./ProductForm.jsx";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export default function Products({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | product
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts(q);
      setItems(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  const save = async (data) => {
    setSaving(true);
    setFormError("");
    try {
      if (editing === "new") {
        await createProduct(data);
        flash("Product added.");
      } else {
        await updateProduct(editing.id, data);
        flash("Product updated.");
      }
      setEditing(null);
      load(search);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(toDelete.id);
      flash("Product deleted.");
      setToDelete(null);
      load(search);
    } catch (err) {
      setError(errorMessage(err));
      setToDelete(null);
    }
  };

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <h1>Product Management</h1>
          <span className="muted">Signed in as {user?.username} ({user?.role})</span>
        </div>
        <button className="btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="card">
        <div className="toolbar">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(search);
            }}
          >
            <input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <button className="btn primary" onClick={() => { setFormError(""); setEditing("new"); }}>
            + Add Product
          </button>
        </div>

        {notice && <div className="alert ok">{notice}</div>}
        {error && <div className="alert">{error}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Description</th>
                <th className="num">Price</th>
                <th className="num">Qty</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="empty">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="7" className="empty">No products yet. Click “Add Product”.</td></tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><strong>{p.product_name}</strong></td>
                    <td className="desc">{p.description}</td>
                    <td className="num">{peso.format(p.price)}</td>
                    <td className="num">{p.quantity}</td>
                    <td>{p.created_at}</td>
                    <td className="row-actions">
                      <button className="btn sm" onClick={() => { setFormError(""); setEditing(p); }}>Edit</button>
                      <button className="btn sm danger" onClick={() => setToDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
          saving={saving}
          error={formError}
        />
      )}

      {toDelete && (
        <div className="overlay" onMouseDown={() => setToDelete(null)}>
          <div className="card modal small" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Delete product?</h2>
            <p>
              Are you sure you want to delete <strong>{toDelete.product_name}</strong>? This cannot be undone.
            </p>
            <div className="actions">
              <button className="btn" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="btn danger solid" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
