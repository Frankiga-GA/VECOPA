import { Armchair, CheckCircle2, Clock, PlusCircle, XCircle } from 'lucide-react';
import { PageHeader } from '../../shared/components/PageHeader';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import type { TableStatus } from '../../shared/types';

const statusStyles: Record<TableStatus, string> = {
  libre: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ocupada: 'border-rose-200 bg-rose-50 text-rose-700',
  reservada: 'border-amber-200 bg-amber-50 text-amber-700',
};

const statusIcon = {
  libre: CheckCircle2,
  ocupada: XCircle,
  reservada: Clock,
};

export function TablesPage() {
  const { tables, orders, openTable, closeTable, setTableStatus } = useVecopaStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion de mesas" eyebrow="Salon" />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => {
          const Icon = statusIcon[table.status];
          const order = orders.find((item) => item.tableId === table.id && item.status === 'abierto');
          return (
            <article key={table.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-ink">{table.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-stone-500"><Armchair size={16} /> {table.capacity} personas</p>
                </div>
                <span className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold capitalize ${statusStyles[table.status]}`}>
                  <Icon size={15} /> {table.status}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="primary-button" type="button" onClick={() => openTable(table.id)}>
                  <PlusCircle size={18} />
                  Abrir
                </button>
                <button className="secondary-button" type="button" onClick={() => closeTable(table.id)}>
                  Cerrar
                </button>
              </div>
              <select className="field mt-3" value={table.status} onChange={(event) => setTableStatus(table.id, event.target.value as TableStatus)}>
                <option value="libre">Libre</option>
                <option value="ocupada">Ocupada</option>
                <option value="reservada">Reservada</option>
              </select>
              {order ? <p className="mt-3 text-sm font-semibold text-stone-600">Pedido activo: {order.items.length} items</p> : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

