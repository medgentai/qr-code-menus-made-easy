/**
 * Performance monitoring hook to track and optimize app performance
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  cacheHitRate: number;
  apiCallCount: number;
  errorCount: number;
}

interface ComponentPerformanceData {
  componentName: string;
  renderTimes: number[];
  propsChanges: number;
  lastUpdate: number;
}

// Global performance tracking
const performanceData = new Map<string, ComponentPerformanceData>();
let globalApiCallCount = 0;
let globalErrorCount = 0;

export const usePerformanceMonitor = (componentName: string) => {
  const queryClient = useQueryClient();
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastPropsRef = useRef<any>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    cacheHitRate: 0,
    apiCallCount: 0,
    errorCount: 0,
  });

  // Track render performance
  useEffect(() => {
    const startTime = performance.now();
    renderCountRef.current += 1;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderTimesRef.current.push(renderTime);

      // Keep only last 10 render times for average calculation
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current.shift();
      }

      // Update component performance data
      const componentData: ComponentPerformanceData = {
        componentName,
        renderTimes: [...renderTimesRef.current],
        propsChanges: renderCountRef.current,
        lastUpdate: Date.now(),
      };
      performanceData.set(componentName, componentData);

      // Update metrics
      const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
      
      setMetrics(prev => ({
        ...prev,
        renderCount: renderCountRef.current,
        lastRenderTime: renderTime,
        averageRenderTime,
        apiCallCount: globalApiCallCount,
        errorCount: globalErrorCount,
      }));
    };
  });

  // Calculate cache hit rate
  useEffect(() => {
    const calculateCacheHitRate = () => {
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      let hits = 0;
      let total = 0;
      
      queries.forEach(query => {
        total++;
        if (query.state.dataUpdatedAt > 0 && query.state.isFetching === false) {
          hits++;
        }
      });
      
      const hitRate = total > 0 ? (hits / total) * 100 : 0;
      
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: hitRate,
      }));
    };

    const interval = setInterval(calculateCacheHitRate, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [queryClient]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = () => {
    const suggestions: string[] = [];
    
    if (metrics.renderCount > 10) {
      suggestions.push(`${componentName} is re-rendering frequently (${metrics.renderCount} times)`);
    }
    
    if (metrics.averageRenderTime > 16) {
      suggestions.push(`${componentName} render time is slow (${metrics.averageRenderTime.toFixed(2)}ms)`);
    }
    
    if (metrics.cacheHitRate < 70) {
      suggestions.push(`Low cache hit rate (${metrics.cacheHitRate.toFixed(1)}%) - consider optimizing queries`);
    }
    
    return suggestions;
  };

  // Log performance data in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logPerformance = () => {
        console.group(`🔍 Performance Monitor - ${componentName}`);
        console.log('Metrics:', metrics);
        console.log('Suggestions:', getOptimizationSuggestions());
        console.groupEnd();
      };

      // Log every 30 seconds in development
      const interval = setInterval(logPerformance, 30000);
      return () => clearInterval(interval);
    }
  }, [componentName, metrics]);

  return {
    metrics,
    suggestions: getOptimizationSuggestions(),
    componentData: performanceData.get(componentName),
    getAllComponentsData: () => Array.from(performanceData.values()),
  };
};

// Hook to track API call performance
export const useApiPerformanceTracker = () => {
  const [apiMetrics, setApiMetrics] = useState({
    totalCalls: 0,
    averageResponseTime: 0,
    errorRate: 0,
    slowQueries: [] as string[],
  });

  useEffect(() => {
    // Track API calls by intercepting fetch
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      globalApiCallCount++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Track slow queries (>1 second)
        if (responseTime > 1000) {
          const url = typeof args[0] === 'string' ? args[0] : args[0].url;
          setApiMetrics(prev => ({
            ...prev,
            slowQueries: [...prev.slowQueries.slice(-9), url], // Keep last 10
          }));
        }
        
        setApiMetrics(prev => ({
          ...prev,
          totalCalls: globalApiCallCount,
          averageResponseTime: (prev.averageResponseTime + responseTime) / 2,
        }));
        
        return response;
      } catch (error) {
        globalErrorCount++;
        setApiMetrics(prev => ({
          ...prev,
          totalCalls: globalApiCallCount,
          errorRate: (globalErrorCount / globalApiCallCount) * 100,
        }));
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return apiMetrics;
};

// Hook to monitor memory usage
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Development-only performance dashboard
export const usePerformanceDashboard = () => {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl + Shift + P to toggle performance dashboard
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setIsVisible(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  const getDashboardData = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.isFetching).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.error).length,
      cacheSize: queries.reduce((size, query) => {
        return size + JSON.stringify(query.state.data || {}).length;
      }, 0),
      components: Array.from(performanceData.values()),
    };
  };

  return {
    isVisible,
    setIsVisible,
    dashboardData: getDashboardData(),
  };
};
