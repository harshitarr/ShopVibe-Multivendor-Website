import { assets } from "@/assets/assets";
import Image from "next/image";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useState } from "react";

export default function EditProductModal({ product, open, onClose, onSave }) {
  // Guard: if not open or no product, render nothing
  if (!open || !product) return null;

  const categories = [
    'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games',
    'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others'
  ];

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    mrp: product?.mrp || 0,
    price: product?.price || 0,
    category: product?.category || "",
  });
  const [images, setImages] = useState(product.images || []);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(files);
    setImages(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (newImageFiles.length > 0) {
        // If new images are uploaded, use FormData
        const formData = new FormData();
        formData.append("productId", product._id);
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("mrp", form.mrp);
        formData.append("price", form.price);
        formData.append("category", form.category);
        newImageFiles.forEach(file => formData.append("images", file));
        const res = await axios.put(`/api/store/product`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        data = res.data;
      } else {
        // No new images, send JSON
        const res = await axios.put(`/api/store/product`, {
          productId: product._id,
          ...form,
        });
        data = res.data;
      }
      toast.success("Product updated!");
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex gap-3 items-center flex-1">
            {images && images.length > 0 ? (
              images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  width={60}
                  height={60}
                  className="rounded shadow"
                  alt={form.name}
                />
              ))
            ) : (
              <Image
                src={assets?.upload_area || "/placeholder.png"}
                width={60}
                height={60}
                className="rounded shadow"
                alt="No image"
              />
            )}
            <span className="text-slate-700 font-medium">{form.name}</span>
          </div>
          <div className="flex-shrink-0">
            <label className="inline-block">
              <span className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 transition text-sm">Upload Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <label className="block mb-2">
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded px-3 py-2 mt-1"
            required
          />
        </label>
        <label className="block mb-2">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded px-3 py-2 mt-1"
            rows={3}
            required
          />
        </label>
        <div className="flex flex-col gap-3 mb-2">
          <label className="block mb-2">
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded px-3 py-2 mt-1"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-3 flex-col sm:flex-row w-full md:w-auto">
            <label className="flex-1">
              MRP
              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 mt-1"
                required
              />
            </label>
            <label className="flex-1">
              Price
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2 mt-1"
                required
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-slate-200 text-slate-700"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
