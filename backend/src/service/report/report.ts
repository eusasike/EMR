// backend/src/service/report/report.ts
import { prisma } from "../../util/prisma";

export class ReportService {
  /**
   * Fetch daily report by delegating a single-day range to getReportByDateRange
   */
  public async getDailyReport(facilityId: string, dateStr: string) {
    return this.getReportByDateRange(facilityId, dateStr, dateStr);
  }

  /**
   * Fetch invoices, patient details, medical services, lab results, and dispensed items across a custom date range
   */
  public async getReportByDateRange(
    facilityId: string,
    startDateStr: string,
    endDateStr: string,
  ) {
    const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDate = new Date(`${endDateStr}T23:59:59.999Z`);

    const invoices = await prisma.invoice.findMany({
      where: {
        facilityId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payments: true,
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                mrn: true,
                firstName: true,
                lastName: true,
              },
            },
            services: {
              include: {
                service: true,
                labResult: true,
              },
            },
            labResults: {
              include: {
                providedService: {
                  include: {
                    service: true,
                  },
                },
              },
            },
            dispenseRecord: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invoices;
  }
}
