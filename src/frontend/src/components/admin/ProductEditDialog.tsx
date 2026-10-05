import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import type { Category, Product, ProductDetails } from "@/types/product";
import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (details: ProductDetails) => void;
  isSaving: boolean;
}

/**
 * Modal for editing a product's name, category, and short description.
 * The draft lives in local state and is only reset when the dialog opens for a
 * different product, so a background refetch never overwrites the owner's edits.
 */
export function ProductEditDialog({
  product,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: ProductEditDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("hairFlowers");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description);
      setError(null);
    }
  }, [open, product]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("A product name is required.");
      return;
    }
    setError(null);
    onSave({
      name: trimmedName,
      category,
      description: description.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="admin.edit_dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            Edit product
          </DialogTitle>
          <DialogDescription>
            Update the name, category, and short description shown in the shop.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-edit-name">Product name</Label>
            <Input
              id="admin-edit-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Marigold Gajra Hair Flower"
              aria-invalid={error != null}
              data-ocid="admin.edit_name_input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-edit-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as Category)}
            >
              <SelectTrigger
                id="admin-edit-category"
                data-ocid="admin.edit_category_select"
                className="w-full"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((meta) => (
                  <SelectItem key={meta.value} value={meta.value}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-edit-description">Short description</Label>
            <Textarea
              id="admin-edit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A line or two about the piece, its colours, and when to wear it."
              rows={3}
              data-ocid="admin.edit_description_input"
            />
          </div>

          {error ? (
            <p
              role="alert"
              data-ocid="admin.edit_error"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              data-ocid="admin.edit_cancel_button"
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              data-ocid="admin.edit_save_button"
              className="rounded-full"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
