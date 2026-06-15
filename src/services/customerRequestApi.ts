import apiClient from "./apiClient";

import type {
  CustomerServiceReqDetail,
  CustomerServiceReqListItem,
} from "../types/customerRequest";

export const getCustomerServiceReqList = async (): Promise<
  CustomerServiceReqListItem[]
> => {
  const response = await apiClient.get<CustomerServiceReqListItem[]>(
    "/api/customer-service-requests/customer-service-req-list"
  );

  return response.data;
};

export const getCustomerServiceReqDetail = async (
  customerServiceRequestId: string
): Promise<CustomerServiceReqDetail> => {
  const response = await apiClient.get<CustomerServiceReqDetail>(
    `/api/customer-service-requests/customer-service-req-detail/${customerServiceRequestId}`
  );

  return response.data;
};