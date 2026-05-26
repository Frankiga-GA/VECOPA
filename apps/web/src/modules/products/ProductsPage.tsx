import { PackagePlus, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { money } from '../../shared/lib/format';
import { useVecopaStore } from '../../shared/store/useVecopaStore';

export function ProductsPage() {
  const { products, categories, addProduct, updateProductStock } = useVecopaStore();
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');

  const filtered = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !price || !stock) return;
    addProduct({ name: name.trim(), price: Number(price), stock: Number(stock), categoryId });
    setName('');
    setPrice('');
    setStock('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Productos y categorias" eyebrow="Catalogo" />
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form className="panel p-4" onSubmit={submit}>
          <h2 className="text-lg font-bold text-ink">Nuevo producto</h2>
          <div className="mt-4 space-y-3">
            <input className="field" placeholder="Nombre" value={name} onChange={(event) => setName(event.target.value)} />
            <select className="field" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input className="field" placeholder="Precio" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} />
            <input className="field" placeholder="Stock" inputMode="numeric" value={stock} onChange={(event) => setStock(event.target.value)} />
            <button className="primary-button w-full" type="submit"><PackagePlus size={18} /> Guardar</button>
          </div>
        </form>
        <div className="panel p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input className="field pl-10" placeholder="Buscar producto" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
            <div className="hidden grid-cols-[1.3fr_0.8fr_0.7fr_0.8fr] bg-stone-50 p-3 text-xs font-bold uppercase text-stone-500 md:grid">
              <span>Producto</span><span>Categoria</span><span>Precio</span><span>Stock</span>
            </div>
            {filtered.map((product) => {
              const category = categories.find((item) => item.id === product.categoryId);
              return (
                <div key={product.id} className="grid gap-3 border-t border-stone-200 p-3 md:grid-cols-[1.3fr_0.8fr_0.7fr_0.8fr] md:items-center">
                  <div>
                    <p className="font-bold text-ink">{product.name}</p>
                    <p className="text-sm text-stone-500 md:hidden">{category?.name} · {money(product.price)}</p>
                  </div>
                  <span className="hidden text-sm text-stone-600 md:block">{category?.name}</span>
                  <span className="hidden font-bold text-ink md:block">{money(product.price)}</span>
                  <input className="field max-w-32" value={product.stock} inputMode="numeric" onChange={(event) => updateProductStock(product.id, Number(event.target.value))} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

