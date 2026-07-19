import { prisma } from "./prisma.ts";

export class SearchJobService {
  /**
   * Creates a new long-running search job record.
   */
  public static async createJob(query: string, location?: string, metadata?: any): Promise<any> {
    return prisma.searchJob.create({
      data: {
        query,
        location: location || null,
        status: "Queued",
        currentPage: 1,
        totalPages: 5, // Simulated pagination
        totalResults: 0,
        retryCount: 0,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  /**
   * Retrieves an active job.
   */
  public static async getJob(jobId: string): Promise<any> {
    return prisma.searchJob.findUnique({
      where: { id: jobId },
    });
  }

  /**
   * Triggers the job background execution sequence with automated retry logic and pagination updates.
   * Runs asynchronously in the background.
   */
  public static async executeJob(jobId: string): Promise<void> {
    let job = await prisma.searchJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    // Transition status to Processing
    await prisma.searchJob.update({
      where: { id: jobId },
      data: { status: "Processing", updatedAt: new Date() },
    });

    const maxRetries = 3;
    const mockPagesCount = 5;

    // Run pagination crawl simulation
    for (let page = 1; page <= mockPagesCount; page++) {
      let success = false;
      let attempt = 0;

      while (!success && attempt < maxRetries) {
        try {
          attempt++;
          // Simulate calling external Geolocation API or Map Crawler
          // Throw random network/timeout error for retry simulation in 10% of cases
          if (Math.random() < 0.15) {
            throw new Error("HTTP 503 Service Unavailable: Remote API cluster is overloaded.");
          }

          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock pagination and results addition
          const pageResults = 8 + Math.floor(Math.random() * 5); // 8-12 leads per page
          success = true;

          // Progress pagination details in DB
          await prisma.searchJob.update({
            where: { id: jobId },
            data: {
              currentPage: page,
              totalPages: mockPagesCount,
              totalResults: { increment: pageResults },
              updatedAt: new Date(),
            },
          });
        } catch (error: any) {
          console.warn(`[SearchJobService] Attempt ${attempt} failed for job ${jobId}, page ${page}:`, error.message);
          
          await prisma.searchJob.update({
            where: { id: jobId },
            data: {
              retryCount: { increment: 1 },
              errorMessage: `Page ${page} failed on attempt ${attempt}: ${error.message}`,
              updatedAt: new Date(),
            },
          });

          // Wait before retrying (exponential backoff representation)
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        }
      }

      // If page completely failed after all retries, set job to Failed
      if (!success) {
        await prisma.searchJob.update({
          where: { id: jobId },
          data: {
            status: "Failed",
            errorMessage: `Crawl aborted at page ${page} after ${maxRetries} failed request retries.`,
            updatedAt: new Date(),
          },
        });
        return;
      }
    }

    // Complete Job successfully
    await prisma.searchJob.update({
      where: { id: jobId },
      data: {
        status: "Completed",
        errorMessage: null,
        updatedAt: new Date(),
      },
    });
  }
}
