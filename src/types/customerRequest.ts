export type CustomerServiceReqListItem = {
  customer_service_request_id: string;
  request_no: string;
  room_no: string | null;
  customer_name: string | null;
  message: string;
  assigned_department: string | null;
  status: string;
  priority_level: string;
  created_at: string;
};

export type CustomerServiceReqDetail = CustomerServiceReqListItem & {
  customer_vip_account_id: string;
  customer_id: string;
  login_account: string;
  booking_stay_id: string | null;
  room_id: number | null;
  language: string | null;
  remark: string | null;
  assigned_at: string | null;
  completed_at: string | null;
};