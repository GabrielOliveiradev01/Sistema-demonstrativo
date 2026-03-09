"use client";

interface CalendarioMesProps {
  date: Date;
  onDateChange: (d: Date) => void;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarioMes({ date, onDateChange }: CalendarioMesProps) {
  const base = startOfMonth(date);
  const firstDow = base.getDay(); // 0 (dom) - 6 (sáb)
  const offset = (firstDow + 6) % 7; // alinhar em segunda-feira
  const gridStart = new Date(base);
  gridStart.setDate(base.getDate() - offset);

  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(gridStart);
      cell.setDate(gridStart.getDate() + w * 7 + d);
      row.push(cell);
    }
    weeks.push(row);
  }

  const hoje = new Date();
  const nomesDias = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-medium text-slate-700">
        {date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr>
            {nomesDias.map((n) => (
              <th
                key={n}
                className="pb-1 text-center font-semibold uppercase tracking-wide text-slate-400"
              >
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d) => {
                const isMesAtual = d.getMonth() === date.getMonth();
                const isSelecionado = sameDay(d, date);
                const isHoje = sameDay(d, hoje);
                const baseClasses =
                  "h-16 w-full rounded-lg border border-transparent px-1 py-1 align-top text-left";
                let bg = "";
                if (isSelecionado) bg = " bg-primary text-white border-primary";
                else if (isHoje)
                  bg = " bg-primary/5 text-primary border-primary/40";
                else if (!isMesAtual) bg = " bg-slate-50 text-slate-300";
                else bg = " bg-white text-slate-700 hover:bg-slate-50";
                return (
                  <td key={d.toISOString()} className="p-1 align-top">
                    <button
                      type="button"
                      onClick={() => onDateChange(d)}
                      className={baseClasses + bg}
                    >
                      <div className="text-xs font-semibold">
                        {String(d.getDate()).padStart(2, "0")}
                        {isHoje && !isSelecionado && (
                          <span className="ml-1 rounded-full bg-primary/10 px-1 text-[10px] font-medium text-primary">
                            hoje
                          </span>
                        )}
                      </div>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-slate-500">
        Clique em um dia para ver e editar a agenda desse dia.
      </p>
    </div>
  );
}

