import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type ProductInput,
  type VariantInput,
  useAddVariant,
  useAdminProduct,
  useCreateProduct,
  useDeleteVariant,
  useUpdateProduct,
  useUpdateVariant,
} from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useProducts";
import { apiError } from "@/lib/api";

const EMPTY_VARIANT: VariantInput = { size: "", color: "", sku: "", stock: 0 };

type VariantRow = VariantInput & { id?: number };

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : undefined;
  const isEdit = Boolean(productId);
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: existing } = useAdminProduct(productId);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const addVariant = useAddVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [form, setForm] = useState<ProductInput>({
    name: "",
    description: "",
    base_price: "0",
    compare_at_price: null,
    category_id: 0,
    images: [],
    is_active: true,
  });
  const [imageInput, setImageInput] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>([{ ...EMPTY_VARIANT }]);

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      description: existing.description ?? "",
      base_price: String(existing.base_price),
      compare_at_price: existing.compare_at_price ? String(existing.compare_at_price) : null,
      category_id: existing.category.id,
      images: existing.images ?? [],
      is_active: existing.is_active,
    });
    setVariants(
      existing.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
        price_override: v.price_override,
      })),
    );
  }, [existing]);

  useEffect(() => {
    if (!isEdit && categories?.length && form.category_id === 0) {
      setForm((f) => ({ ...f, category_id: categories[0].id }));
    }
  }, [categories, isEdit, form.category_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category_id) {
      toast.error("Pick a category");
      return;
    }
    try {
      if (isEdit && productId) {
        await update.mutateAsync({ id: productId, data: form });
        toast.success("Product updated");
      } else {
        const cleanVariants = variants.filter((v) => v.size && v.color && v.sku);
        if (cleanVariants.length === 0) {
          toast.error("Add at least one variant");
          return;
        }
        const created = await create.mutateAsync({ ...form, variants: cleanVariants });
        toast.success("Product created");
        navigate(`/admin/products/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function handleAddVariantRow() {
    if (!isEdit || !productId) {
      setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
      return;
    }
    const draft = variants.find((v) => !v.id && v.size && v.color && v.sku);
    if (!draft) {
      setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
      return;
    }
    try {
      const created = await addVariant.mutateAsync({ product_id: productId, data: draft });
      setVariants((v) => v.map((row) => (row === draft ? { ...created } : row)));
      toast.success("Variant added");
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function saveVariant(idx: number) {
    if (!isEdit || !productId) return;
    const v = variants[idx];
    if (!v.id) return;
    try {
      await updateVariant.mutateAsync({
        product_id: productId,
        variant_id: v.id,
        data: { size: v.size, color: v.color, sku: v.sku, stock: v.stock, price_override: v.price_override },
      });
      toast.success("Variant saved");
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function removeVariant(idx: number) {
    const v = variants[idx];
    if (isEdit && productId && v.id) {
      try {
        await deleteVariant.mutateAsync({ product_id: productId, variant_id: v.id });
      } catch (err) {
        toast.error(apiError(err));
        return;
      }
    }
    setVariants((rows) => rows.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin/products">
          <ChevronLeft className="mr-1 h-4 w-4" /> Products
        </Link>
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit product" : "New product"}</h1>

      <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base price</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Compare at (optional)</Label>
                  <Input
                    id="compare_at_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compare_at_price ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, compare_at_price: e.target.value ? e.target.value : null })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category_id ? String(form.category_id) : ""}
                  onValueChange={(v) => setForm({ ...form, category_id: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={v.id ?? `new-${idx}`}
                  className="grid gap-2 rounded-md border p-3 md:grid-cols-[80px_120px_1fr_80px_100px_auto]"
                >
                  <Input
                    placeholder="Size"
                    value={v.size}
                    onChange={(e) =>
                      setVariants((rows) => rows.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r)))
                    }
                  />
                  <Input
                    placeholder="Color"
                    value={v.color}
                    onChange={(e) =>
                      setVariants((rows) => rows.map((r, i) => (i === idx ? { ...r, color: e.target.value } : r)))
                    }
                  />
                  <Input
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) =>
                      setVariants((rows) => rows.map((r, i) => (i === idx ? { ...r, sku: e.target.value } : r)))
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) =>
                      setVariants((rows) =>
                        rows.map((r, i) => (i === idx ? { ...r, stock: Number(e.target.value) } : r)),
                      )
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Override $"
                    value={v.price_override ?? ""}
                    onChange={(e) =>
                      setVariants((rows) =>
                        rows.map((r, i) =>
                          i === idx ? { ...r, price_override: e.target.value ? e.target.value : null } : r,
                        ),
                      )
                    }
                  />
                  <div className="flex gap-1">
                    {isEdit && v.id && (
                      <Button type="button" size="sm" variant="outline" onClick={() => saveVariant(idx)}>
                        Save
                      </Button>
                    )}
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeVariant(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddVariantRow}>
                <Plus className="mr-1 h-4 w-4" /> Add variant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active (visible in store)
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <img src={img} alt="" className="h-10 w-10 rounded object-cover" />
                  <p className="line-clamp-1 flex-1 text-xs text-muted-foreground">{img}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Image URL" value={imageInput} onChange={(e) => setImageInput(e.target.value)} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (imageInput.trim()) {
                      setForm({ ...form, images: [...form.images, imageInput.trim()] });
                      setImageInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={create.isPending || update.isPending}>
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
