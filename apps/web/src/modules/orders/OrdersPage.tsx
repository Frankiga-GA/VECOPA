import { Minus, Plus, QrCode, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { money } from '../../shared/lib/format';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import type { PaymentMethod } from '../../shared/types';

export function OrdersPage() {
  const store = useVecopaStore();
  const activeOrders = store.orders.filter((order) => order.status === 'abierto');
  const [selectedOrderId, setSelectedOrderId] = useState(activeOrders[0]?.id ?? '');
  const [method, setMethod] = useState<PaymentMethod>('YAPE');
  const [reference, setReference] = useState('');
  const selectedOrder = activeOrders.find((order) => order.id === selectedOrderId) ?? activeOrders[0];
  const table = store.tables.find((item) => item.id === selectedOrder?.tableId);
  const categories = useMemo(() => store.categories, [store.categories]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const visibleProducts = store.products.filter((product) => product.active && (!categoryId || product.categoryId === categoryId));

  return (
    <div className="space-y-6">
      <PageHeader title="Sistema de pedidos" eyebrow="POS tactil" />
      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="panel p-4">
          <div className="touch-scroll flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                className={`min-h-11 shrink-0 rounded-lg px-4 text-sm font-bold ${categoryId === category.id ? 'bg-ink text-white' : 'bg-stone-100 text-stone-700'}`}
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                className="min-h-28 rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:border-brand-500 active:scale-[0.98]"
                type="button"
                onClick={() => selectedOrder && store.addOrderItem(selectedOrder.tableId, product.id)}
              >
                <span className="block text-sm font-bold text-ink">{product.name}</span>
                <span className="mt-3 block text-lg font-black text-brand-700">{money(product.price)}</span>
                <span className="mt-1 block text-xs text-stone-500">Stock {product.stock}</span>
              </button>
            ))}
          </div>
        </div>
        <aside className="panel p-4">
          <select className="field" value={selectedOrder?.id ?? ''} onChange={(event) => setSelectedOrderId(event.target.value)}>
            {activeOrders.map((order) => {
              const orderTable = store.tables.find((item) => item.id === order.tableId);
              return <option key={order.id} value={order.id}>{orderTable?.name} · {money(store.orderTotal(order))}</option>;
            })}
          </select>

          {selectedOrder ? (
            <>
              <h2 className="mt-4 text-xl font-black text-ink">{table?.name}</h2>
              <div className="mt-4 space-y-3">
                {selectedOrder.items.map((item) => {
                  const product = store.products.find((candidate) => candidate.id === item.productId);
                  return (
                    <div key={item.productId} className="rounded-lg border border-stone-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-ink">{product?.name}</p>
                          <p className="text-sm text-stone-500">{money(product?.price ?? 0)}</p>
                        </div>
                        <button className="icon-button" type="button" aria-label="Eliminar item" onClick={() => store.removeOrderItem(selectedOrder.id, item.productId)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button className="icon-button" type="button" aria-label="Restar" onClick={() => store.updateOrderItem(selectedOrder.id, item.productId, item.quantity - 1)}>
                            <Minus size={17} />
                          </button>
                          <span className="w-8 text-center font-black">{item.quantity}</span>
                          <button className="icon-button" type="button" aria-label="Sumar" onClick={() => store.updateOrderItem(selectedOrder.id, item.productId, item.quantity + 1)}>
                            <Plus size={17} />
                          </button>
                        </div>
                        <strong>{money((product?.price ?? 0) * item.quantity)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-lg bg-stone-50 p-4">
                <div className="flex items-center justify-between text-lg font-black">
                  <span>Total</span>
                  <span>{money(store.orderTotal(selectedOrder))}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(['YAPE', 'PLIN', 'EFECTIVO'] as PaymentMethod[]).map((candidate) => (
                    <button key={candidate} className={`min-h-11 rounded-lg text-sm font-black ${method === candidate ? 'bg-brand-600 text-white' : 'bg-white text-stone-700'}`} type="button" onClick={() => setMethod(candidate)}>
                      {candidate}
                    </button>
                  ))}
                </div>
                {method !== 'EFECTIVO' ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-[104px_1fr]">
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-white text-ink">
                      <QrCode size={74} />
                    </div>
                    <input className="field" placeholder="Referencia de operacion" value={reference} onChange={(event) => setReference(event.target.value)} />
                  </div>
                ) : null}
                <button className="primary-button mt-4 w-full" type="button" onClick={() => store.confirmPayment(selectedOrder.id, method, reference || undefined)}>
                  Confirmar pago
                </button>
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-lg bg-stone-50 p-4 text-sm text-stone-500">Abre una mesa para iniciar un pedido.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
