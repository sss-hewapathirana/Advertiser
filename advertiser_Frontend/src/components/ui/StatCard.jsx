import { cn } from '../../utils/cn'

export default function StatCard({ label, value, icon, color = 'indigo', className }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  }

  return (
    <div className={cn(
      'glass rounded-2xl p-6 border border-white/[0.06]',
      'hover:border-indigo-500/30 transition-all duration-300 group',
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className="text-4xl font-bold text-white mt-2 group-hover:text-indigo-400 transition-colors">
            {value ?? '—'}
          </p>
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl', colorMap[color] || colorMap.indigo)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
