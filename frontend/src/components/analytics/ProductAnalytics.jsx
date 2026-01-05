import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  AlertCircle,
  RefreshCw,
  Award,
  Percent
} from 'lucide-react';
import { getProductAnalytics } from '../../services/analyticsService';

export default function ProductAnalytics() {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductAnalytics();
      setProductData(data);
    } catch (err) {
      console.error('Failed to fetch product analytics:', err);
      setError('Failed to load product analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAnalytics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProductAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <ProductAnalyticsSkeleton />
      </div>
    );
  }

  if (error && !productData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview, products } = productData || {};

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Analytics</h1>
          <p className="text-gray-500">Track product performance and sales insights</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Total Products"
          value={overview?.totalProducts || 0}
          icon={<Package className="w-5 h-5" />}
          color="sky"
        />
        <OverviewCard
          title="Total Revenue"
          value={`$${(overview?.totalRevenue || 0).toLocaleString()}`}
          subtitle={`${overview?.totalDeals || 0} deals closed`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <OverviewCard
          title="Avg Revenue/Product"
          value={`$${(overview?.avgRevenuePerProduct || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <OverviewCard
          title="Top Product"
          value={overview?.topProduct || 'N/A'}
          subtitle={`$${(overview?.topProductRevenue || 0).toLocaleString()}`}
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Product Performance</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Detailed breakdown of all products</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total Deals
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Avg Deal Value
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Customers
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Revenue Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products && products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {product.totalDeals}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-emerald-600">
                        ${product.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      ${product.avgDealValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{product.uniqueCustomers}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-sky-500 h-2 rounded-full transition-all"
                            style={{ width: `${product.revenueShare}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {product.revenueShare}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No product data available</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Products will appear here once deals are closed with product names
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Insights */}
      {products && products.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Revenue Distribution</h2>
            </div>
            <div className="space-y-3">
              {products.slice(0, 5).map((product, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{product.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${product.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${product.revenueShare}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Value Range */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Deal Value Ranges</h2>
            </div>
            <div className="space-y-4">
              {products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.totalDeals} {product.totalDeals === 1 ? 'deal' : 'deals'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      ${product.minDealValue.toLocaleString()} - ${product.maxDealValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Avg: ${product.avgDealValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Overview Card Component
function OverviewCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    sky: "bg-sky-50 text-sky-600 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  const bgClasses = {
    sky: "bg-sky-100",
    emerald: "bg-emerald-100",
    purple: "bg-purple-100",
    amber: "bg-amber-100",
  };

  return (
    <div className={`p-5 rounded-xl border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${bgClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// Skeleton Loader
function ProductAnalyticsSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border-2 border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-lg" />
          ))}
        </div>
      </div>
    </>
  );
}
