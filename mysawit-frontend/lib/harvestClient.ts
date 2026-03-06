import axios, { AxiosInstance } from "axios";

export interface HarvestCreateRequest {
  plantationId: string;
  buruhId: string;
  weightKg: number;
  description: string;
}

export interface HarvestResponse {
  id: string;
  plantationId: string;
  buruhId: string;
  weightKg: number;
  description: string;
  status: string;
  createdAt: string;
  photoUrls?: string[];
}

class HarvestClient {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async submitHarvest(
    request: HarvestCreateRequest,
    photos?: File[]
  ): Promise<HarvestResponse> {
    try {
      const formData = new FormData();

      // Add request data as JSON blob
      const dataBlob = new Blob([JSON.stringify(request)], {
        type: "application/json",
      });
      formData.append("data", dataBlob);

      // Add photos if provided
      if (photos && photos.length > 0) {
        photos.forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      const response = await this.api.post<HarvestResponse>(
        "/harvests",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error(
            `Connection timeout. Make sure Harvest Service is running at ${this.baseUrl}`
          );
        }
        if (error.code === "ECONNREFUSED") {
          throw new Error(
            `Cannot connect to Harvest Service at ${this.baseUrl}. Make sure it's running.`
          );
        }
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to submit harvest"
        );
      }
      throw error;
    }
  }
}

export const harvestClient = new HarvestClient();
