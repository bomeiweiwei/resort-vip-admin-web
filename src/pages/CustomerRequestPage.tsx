import { useEffect, useState } from "react";
import {
  Coffee,
  MapPin,
  Search,
  Send,
  Sparkles,
  Wrench,
} from "lucide-react";

import {
  getCustomerServiceReqDetail,
  getCustomerServiceReqList,
} from "../services/customerRequestApi";

import type {
  CustomerServiceReqDetail,
  CustomerServiceReqListItem,
} from "../types/customerRequest";

const departments = [
  { name: "房務部", icon: MapPin },
  { name: "餐飲部", icon: Coffee },
  { name: "休閒SPA部", icon: Sparkles },
  { name: "工務部", icon: Wrench },
  { name: "禮賓部", icon: Send },
];

function formatTime(dateText: string) {
  return new Date(dateText).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusText(status: string) {
  if (status === "Pending") return "待處理";
  if (status === "Assigned") return "已派發";
  if (status === "Completed") return "已完成";
  return status;
}

function CustomerRequestPage() {
  const [requests, setRequests] = useState<CustomerServiceReqListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<CustomerServiceReqDetail | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  useEffect(() => {
    const loadList = async () => {
      const data = await getCustomerServiceReqList();
      setRequests(data);

      if (data.length > 0) {
        setSelectedId(data[0].customer_service_request_id);
      }
    };

    loadList();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const loadDetail = async () => {
      const data = await getCustomerServiceReqDetail(selectedId);
      setDetail(data);
      setSelectedDepartment("");
    };

    loadDetail();
  }, [selectedId]);

  const filteredRequests = requests.filter((item) => {
    const roomNo = item.room_no ?? "";
    return roomNo.includes(keyword);
  });

  return (
    <div style={styles.page}>
      <section style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>進件列表</h2>

          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              style={styles.searchInput}
              placeholder="搜尋房號..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div>
          {filteredRequests.map((item) => {
            const active = item.customer_service_request_id === selectedId;

            return (
              <button
                key={item.customer_service_request_id}
                type="button"
                onClick={() => setSelectedId(item.customer_service_request_id)}
                style={{
                  ...styles.listItem,
                  ...(active ? styles.listItemActive : {}),
                }}
              >
                <div style={styles.listTop}>
                  <div>
                    <span style={styles.roomNo}>{item.room_no ?? "-"}</span>
                    <span style={styles.customerName}>
                      {item.customer_name ?? ""}
                    </span>
                  </div>

                  <span style={styles.time}>{formatTime(item.created_at)}</span>
                </div>

                <div style={styles.message}>{item.message}</div>

                <span
                  style={{
                    ...styles.badge,
                    ...(item.status === "Pending"
                      ? styles.pendingBadge
                      : styles.assignedBadge),
                  }}
                >
                  {item.assigned_department
                    ? `已派發: ${item.assigned_department}`
                    : getStatusText(item.status)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={styles.detailPanel}>
        {detail ? (
          <>
            <div style={styles.detailHeader}>
              <div style={styles.titleRow}>
                <h1 style={styles.detailTitle}>房號 {detail.room_no}</h1>
                <span style={styles.customerPill}>{detail.customer_name}</span>
                <span style={{ ...styles.badge, ...styles.pendingBadge }}>
                  {getStatusText(detail.status)}
                </span>
              </div>

              <div style={styles.meta}>
                需求編號: {detail.request_no}・建立時間:{" "}
                {formatTime(detail.created_at)}
              </div>
            </div>

            <div style={styles.content}>
              <textarea
                style={styles.messageTextarea}
                value={detail.message}
                readOnly
              />

              <div style={styles.assignCard}>
                <h3 style={styles.cardTitle}>指派處理部門</h3>

                <div style={styles.departmentGrid}>
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    const active = selectedDepartment === dept.name;

                    return (
                      <button
                        key={dept.name}
                        type="button"
                        onClick={() => setSelectedDepartment(dept.name)}
                        style={{
                          ...styles.departmentButton,
                          ...(active ? styles.departmentButtonActive : {}),
                        }}
                      >
                        <Icon size={22} />
                        <span>{dept.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button type="button" style={styles.confirmButton}>
                  確認派發
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.empty}>尚無客服需求資料</div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "24px",
    padding: "24px",
    minHeight: "calc(100vh - 48px)",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  sidebar: {
    backgroundColor: "#fff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "190px",
    padding: "8px 12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 0,
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  listItem: {
    width: "100%",
    textAlign: "left",
    padding: "20px",
    backgroundColor: "#fff",
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: "1px",
    borderLeftWidth: 0,
    borderStyle: "solid",
    borderBottomColor: "#f1f5f9",
    cursor: "pointer",
  },
  listItemActive: {
    backgroundColor: "#f1f7ff",
    borderLeftWidth: "4px",
    borderLeftStyle: "solid",
    borderLeftColor: "#3b82f6",
  },
  listTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  roomNo: {
    fontSize: "20px",
    fontWeight: 700,
    marginRight: "10px",
    color: "#0f172a",
  },
  customerName: {
    color: "#64748b",
  },
  time: {
    color: "#94a3b8",
  },
  message: {
    color: "#475569",
    marginBottom: "10px",
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
  },
  pendingBadge: {
    color: "#e11d48",
    backgroundColor: "#ffe4e6",
  },
  assignedBadge: {
    color: "#b45309",
    backgroundColor: "#ffedd5",
  },
  detailPanel: {
    backgroundColor: "#fff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
  },
  detailHeader: {
    padding: "28px",
    backgroundColor: "#f8fafc",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#e2e8f0",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  detailTitle: {
    margin: 0,
    fontSize: "30px",
    color: "#0f172a",
  },
  customerPill: {
    padding: "6px 14px",
    borderRadius: "999px",
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    fontWeight: 700,
  },
  meta: {
    marginTop: "10px",
    color: "#64748b",
  },
  content: {
    padding: "28px",
  },
  messageTextarea: {
    width: "100%",
    minHeight: "90px",
    resize: "vertical",
    boxSizing: "border-box",
    padding: "18px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#dbeafe",
    color: "#1e40af",
    fontSize: "20px",
    lineHeight: 1.6,
    outline: "none",
    marginBottom: "28px",
    fontFamily: "inherit",
  },
  assignCard: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "20px",
    textAlign: "center",
    color: "#0f172a",
  },
  departmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },
  departmentButton: {
    height: "86px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#fff",
    color: "#475569",
    fontSize: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
  },
  departmentButtonActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.12)",
  },
  confirmButton: {
    display: "block",
    marginLeft: "auto",
    marginTop: "28px",
    padding: "14px 34px",
    borderWidth: 0,
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
  },
  empty: {
    padding: "40px",
    color: "#64748b",
  },
};

export default CustomerRequestPage;