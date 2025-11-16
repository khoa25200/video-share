/**
 * Ad Monitoring Utility
 * Theo dõi và phân tích hiệu quả của các ad zones
 */

export interface AdMetrics {
  zoneId: string;
  impressions: number;
  revenue: number;
  cpm: number;
  viewability: number; // % thời gian ad visible
  viewTime: number; // Tổng thời gian visible (ms)
  clicks?: number;
  clickThroughRate?: number;
}

export class AdMonitor {
  private static metrics: Map<string, AdMetrics> = new Map();
  private static viewabilityTrackers: Map<string, IntersectionObserver> = new Map();

  /**
   * Track viewability cho một ad zone
   */
  static trackViewability(zoneId: string, element: HTMLElement): void {
    if (this.viewabilityTrackers.has(zoneId)) {
      return; // Đã track rồi
    }

    let totalViewTime = 0;
    let isVisible = false;
    let startTime = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Ad visible ít nhất 50%
            if (!isVisible) {
              isVisible = true;
              startTime = Date.now();
            }
          } else {
            // Ad không visible
            if (isVisible) {
              isVisible = false;
              totalViewTime += Date.now() - startTime;
            }
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    observer.observe(element);
    this.viewabilityTrackers.set(zoneId, observer);

    // Lưu metrics khi component unmount
    window.addEventListener("beforeunload", () => {
      if (isVisible) {
        totalViewTime += Date.now() - startTime;
      }
      this.updateMetrics(zoneId, {
        viewTime: totalViewTime,
        viewability: totalViewTime > 0 ? 100 : 0, // Simplified
      });
    });
  }

  /**
   * Update metrics cho một zone
   */
  static updateMetrics(zoneId: string, updates: Partial<AdMetrics>): void {
    const current = this.metrics.get(zoneId) || {
      zoneId,
      impressions: 0,
      revenue: 0,
      cpm: 0,
      viewability: 0,
      viewTime: 0,
    };

    this.metrics.set(zoneId, { ...current, ...updates });
  }

  /**
   * Get metrics cho một zone
   */
  static getMetrics(zoneId: string): AdMetrics | undefined {
    return this.metrics.get(zoneId);
  }

  /**
   * Get tất cả metrics
   */
  static getAllMetrics(): AdMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Phân tích và đề xuất zones nên tắt
   */
  static analyzeLowPerformanceZones(thresholdCPM: number = 0.1): string[] {
    const lowPerformanceZones: string[] = [];

    this.metrics.forEach((metrics, zoneId) => {
      if (metrics.impressions > 100 && metrics.cpm < thresholdCPM) {
        lowPerformanceZones.push(zoneId);
      }
    });

    return lowPerformanceZones;
  }

  /**
   * Export metrics để phân tích
   */
  static exportMetrics(): string {
    return JSON.stringify(Array.from(this.metrics.values()), null, 2);
  }
}

