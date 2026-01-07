import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Bell,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
} from "lucide-react";

export default function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    targetRevenue: 0,
    employees: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month"); // month, quarter, year

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = {
      totalRevenue: 485000,
      targetRevenue: 500000,
      previousRevenue: 420000,
      employees: [
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah.j@company.com",
          revenue: 125000,
          target: 100000,
          deals: 8,
          growth: 15.5,
          status: "exceeding"
        },
        {
          id: 2,
          name: "Michael Chen",
          email: "michael.c@company.com",
          revenue: 98000,
          target: 100000,
          deals: 6,
          growth: -5.2,
          status: "approaching"
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          email: "emily.r@company.com",
          revenue: 142000,
          target: 120000,
          deals: 11,
          growth: 22.8,
          status: "exceeding"
        },
        {
          id: 4,
          name: "David Park",
          email: "david.p@company.com",
          revenue: 67000,
          target: 100000,
          deals: 4,
          growth: -12.3,
          status: "behind"
        },
        {
          id: 5,
          name: "Jessica Taylor",
          email: "jessica.t@company.com",
          revenue: 53000,
          target: 80000,
          deals: 3,
          growth: 8.7,
          status: "approaching"
        },
      ]
    };

    setTimeout(() => {
      setRevenueData(mockData);
      setLoading(false);
    }, 500);
  }, [selectedPeriod]);

  const handleNotifyEmployee = (employee) => {
    // Show notification - replace with actual notification API
    alert(`Notification sent to ${employee.name} about revenue target`);
  };

  const revenuePercentage = ((revenueData.totalRevenue / revenueData.targetRevenue) * 100).toFixed(1);
  const revenueGap = revenueData.targetRevenue - revenueData.totalRevenue;
  const growthRate = revenueData.previousRevenue 
    ? (((revenueData.totalRevenue - revenueData.previousRevenue) / revenueData.previousRevenue) * 100).toFixed(1)
    : 0;

  const isTargetMet = revenueData.totalRevenue >= revenueData.targetRevenue;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {["month", "quarter", "year"].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? "bg-sky-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Total Revenue
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                ${(revenueData.totalRevenue / 1000).toFixed(0)}K
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(growthRate) >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      +{growthRate}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      {growthRate}%
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-500 ml-1">vs last {selectedPeriod}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Target Revenue */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Target Revenue
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                ${(revenueData.targetRevenue / 1000).toFixed(0)}K
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isTargetMet
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : revenuePercentage >= 80
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-sky-400 to-blue-500"
                    }`}
                    style={{ width: `${Math.min(revenuePercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {revenuePercentage}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Revenue Gap */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                {isTargetMet ? "Target Exceeded" : "Gap to Target"}
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {isTargetMet ? "+" : ""}${Math.abs(revenueGap / 1000).toFixed(0)}K
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {isTargetMet ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      Target Achieved!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600">
                      Needs attention
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isTargetMet
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : "bg-gradient-to-br from-amber-400 to-orange-500"
            }`}>
              {isTargetMet ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <Activity className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Employee Performance</h3>
              <p className="text-sm text-gray-500 mt-1">
                Track individual revenue targets and notify employees
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{revenueData.employees?.length || 0} employees</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deals
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenueData.employees?.map((employee) => {
                const progress = ((employee.revenue / employee.target) * 100).toFixed(0);
                const isOnTrack = employee.revenue >= employee.target;

                return (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        ${(employee.revenue / 1000).toFixed(0)}K
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-600">
                        ${(employee.target / 1000).toFixed(0)}K
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px] overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isOnTrack
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : progress >= 80
                                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                : "bg-gradient-to-r from-red-400 to-rose-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[45px]">
                          {progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Zap className="w-4 h-4 text-sky-500" />
                        <span className="font-medium">{employee.deals}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {employee.growth >= 0 ? (
                          <>
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-600">
                              +{employee.growth}%
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-600">
                              {employee.growth}%
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.status === "exceeding"
                            ? "bg-green-100 text-green-700"
                            : employee.status === "approaching"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {employee.status === "exceeding"
                          ? "Exceeding"
                          : employee.status === "approaching"
                          ? "On Track"
                          : "Behind"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleNotifyEmployee(employee)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          employee.status === "behind"
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            : employee.status === "approaching"
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                            : "bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200"
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-green-700 uppercase">Exceeding Target</p>
              <p className="text-2xl font-bold text-green-900">
                {revenueData.employees?.filter((e) => e.status === "exceeding").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase">On Track</p>
              <p className="text-2xl font-bold text-amber-900">
                {revenueData.employees?.filter((e) => e.status === "approaching").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-red-700 uppercase">Behind Target</p>
              <p className="text-2xl font-bold text-red-900">
                {revenueData.employees?.filter((e) => e.status === "behind").length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-sky-700 uppercase">Avg per Employee</p>
              <p className="text-2xl font-bold text-sky-900">
                ${((revenueData.totalRevenue / revenueData.employees.length) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
