import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  memberships: any[];
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

const statsConfig = [
  {
    label: 'Todas',
    filter: 'all',
    icon: <Users className="w-4 h-4 sm:w-6 sm:h-6" />,
    bgColor: 'bg-gray-700/30',
    borderColor: 'border-gray-600',
  },
  {
    label: 'Pendientes',
    filter: 'pending',
    icon: <Clock className="w-4 h-4 sm:w-6 sm:h-6" />,
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-700',
  },
  {
    label: 'Aprobadas',
    filter: 'active',
    icon: <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />,
    bgColor: 'bg-emerald-900/30',
    borderColor: 'border-emerald-700',
  },
  {
    label: 'Rechazadas',
    filter: 'rejected',
    icon: <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />,
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-700',
  },
];

export default function MembershipStats({ memberships, statusFilter, setStatusFilter }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsConfig.map((stat) => {
        const value =
          stat.filter === 'all'
            ? memberships.length
            : memberships.filter((m) => m.status === stat.filter).length;
        return (
          <div
            key={stat.filter}
            className={`bg-dark rounded-xl p-4 sm:p-6 border cursor-pointer transition-all duration-200 hover:bg-gray-800 ${
              statusFilter === stat.filter ? `ring-2 ring-white/50 ${stat.bgColor}` : 'border-white/20'
            }`}
            onClick={() => setStatusFilter(stat.filter)}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-red-100 truncate">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
              </div>
              <div className="text-white/80 flex-shrink-0 ml-2">{stat.icon}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
