import apiClient from "./apiClient";

export interface ItineraryRecommendation {
  customer_id: string;
  full_name: string;
  recommendation_id: string;
  summary: string | null;
}

export interface ItinerarySchedule {
  schedule_id: string;
  recommendation_id: string;
  schedule_date: string;
  schedule_time: string;
  title: string;
  content: string | null;
  preference: number | null;
}

export const getItineraryRecommendations = async (): Promise<
  ItineraryRecommendation[]
> => {
  const response = await apiClient.get<ItineraryRecommendation[]>(
    "/api/recommends/itinerary"
  );

  return response.data;
};

export const getItinerarySchedules = async (
  customerId: string,
  recommendationId: string
) => {
  const response = await apiClient.get<ItinerarySchedule[]>(
    `/api/recommends/itinerary/${customerId}/${recommendationId}/schedules`
  );

  return response.data;
};