import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Radio, Select, Space, Table, message } from "antd";
import {
    getItineraryRecommendations,
    getItinerarySchedules,
    type ItineraryRecommendation,
    type ItinerarySchedule,
} from "../services/recommendApi";
import "../App.css";

function ItineraryRecommendationPage() {
    const [recommendations, setRecommendations] = useState<
        ItineraryRecommendation[]
    >([]);

    const [schedules, setSchedules] = useState<ItinerarySchedule[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<ItineraryRecommendation | null>(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            const result = await getItineraryRecommendations();
            setRecommendations(Array.isArray(result) ? result : []);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail || "推薦行程資料載入失敗";

            messageApi.error(errorMessage);
        }
    };

    const handleOpenDetail = async (record: ItineraryRecommendation) => {
        try {
            setSelected(record);
            setIsModalOpen(true);
            setSchedules([]);
            setSelectedDate("");
            setScheduleLoading(true);
            setViewMode("table");

            const result = await getItinerarySchedules(
                record.customer_id,
                record.recommendation_id
            );

            setSchedules(Array.isArray(result) ? result : []);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail || "推薦行程明細載入失敗";

            messageApi.error(errorMessage);
        } finally {
            setScheduleLoading(false);
        }
    };

    const dateOptions = useMemo(() => {
        const dates = Array.from(
            new Set(schedules.map((item) => item.schedule_date))
        );

        const options = dates.map((date) => ({
            label: date,
            value: date,
        }));

        if (viewMode === "timeline") {
            return options;
        }

        return [
            {
                label: "全部",
                value: "",
            },
            ...options,
        ];
    }, [schedules, viewMode]);

    const handleViewModeChange = (mode: "table" | "timeline") => {
        setViewMode(mode);

        if (mode === "timeline") {
            const firstDate = schedules[0]?.schedule_date ?? "";
            setSelectedDate(firstDate);
            return;
        }

        setSelectedDate("");
    };

    const filteredSchedules = useMemo(() => {
        if (!selectedDate) {
            return schedules;
        }

        return schedules.filter((item) => item.schedule_date === selectedDate);
    }, [schedules, selectedDate]);

    const columns = [
        {
            title: "操作",
            render: (_: any, record: ItineraryRecommendation) => (
                <Button
                    type="primary"
                    onClick={() => handleOpenDetail(record)}
                >
                    開啟
                </Button>
            ),
            width: 100,
        },
        {
            title: "姓名",
            dataIndex: "full_name",
            width: 120,
            ellipsis: true,
        },
        {
            title: "Summary",
            dataIndex: "summary",
        },
    ];

    const scheduleColumns = [
        {
            title: "日期",
            dataIndex: "schedule_date",
            width: 120,
        },
        {
            title: "時間",
            dataIndex: "schedule_time",
            width: 100,
        },
        {
            title: "標題",
            dataIndex: "title",
            width: 180,
        },
        {
            title: "內容",
            dataIndex: "content",
        },
        {
            title: "偏好",
            dataIndex: "preference",
            width: 90,
        },
    ];

    return (
        <>
            {contextHolder}

            <h2>推薦行程</h2>

            <Space className="toolbar">
                <Button onClick={loadRecommendations}>重新整理</Button>
            </Space>

            <Table
                rowKey="recommendation_id"
                columns={columns}
                dataSource={recommendations}
            />

            <Modal
                title="推薦行程內容"
                open={isModalOpen}
                onCancel={() => {
                    setSelected(null);
                    setSchedules([]);
                    setSelectedDate("");
                    setIsModalOpen(false);
                    setViewMode("table");
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setSelected(null);
                            setSchedules([]);
                            setSelectedDate("");
                            setIsModalOpen(false);
                        }}
                    >
                        關閉
                    </Button>,
                ]}
                width={1200}
            >
                <p>
                    <strong>姓名：</strong>
                    {selected?.full_name}
                </p>

                <p>
                    <strong>Summary：</strong>
                </p>

                <div style={{ whiteSpace: "pre-wrap", marginBottom: 16 }}>
                    {selected?.summary}
                </div>

                <Space style={{ marginBottom: 16 }}>
                    <span>日期：</span>

                    <Select
                        placeholder="請選擇日期"
                        style={{ width: 180 }}
                        value={selectedDate}
                        options={dateOptions}
                        onChange={(value) => setSelectedDate(value)}
                    />

                    <Radio.Group
                        value={viewMode}
                        onChange={(e) => handleViewModeChange(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="table">表格模式</Radio.Button>
                        <Radio.Button value="timeline">前台模式</Radio.Button>
                    </Radio.Group>
                </Space>

                {viewMode === "table" && (
                    <Table
                        rowKey="schedule_id"
                        columns={scheduleColumns}
                        dataSource={filteredSchedules}
                        loading={scheduleLoading}
                        pagination={false}
                        scroll={{ x: 1000 }}
                    />
                )}

                {viewMode === "timeline" && (
                    <div className="itinerary-timeline">
                        {filteredSchedules.map((item) => (
                            <div className="timeline-item" key={item.schedule_id}>
                                <div className="timeline-dot" />

                                <div className="timeline-card">
                                    <div className="timeline-time">
                                        {item.schedule_time}
                                    </div>

                                    <div className="timeline-title">
                                        {item.title}
                                    </div>

                                    <div className="timeline-content">
                                        {item.content}
                                    </div>

                                    {item.preference && (
                                        <div className="timeline-preference">
                                            偏好：{item.preference}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </>
    );
}

export default ItineraryRecommendationPage;