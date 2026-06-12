import { useEffect, useState } from "react";
import {
    Button,
    Card,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Space,
    message,
    Row,
    Col,
    Typography,
    Modal
} from "antd";
import { QRCodeSVG } from "qrcode.react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
    createCheckIn,
    getRoomTypes,
    getRooms, 
    generateRecommendation
} from "../services/checkinApi";
import type { Room, RoomType } from "../services/checkinApi";

type VipInfo = {
    vip_login_account: string;
    vip_initial_password: string;
    vip_login_url: string;
};

function CheckInPage() {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [, setGenerating] = useState(false);

    const [vipInfo, setVipInfo] = useState<VipInfo | null>(null);
    const [vipModalOpen, setVipModalOpen] = useState(false);

    useEffect(() => {
        loadRoomTypes();
    }, []);

    const loadRoomTypes = async () => {
        const result = await getRoomTypes();
        setRoomTypes(result);
    };

    const handleRoomTypeChange = async (roomTypeId: number) => {
        form.setFieldValue("room_id", undefined);

        const result = await getRooms(roomTypeId);
        setRooms(result);
    };

    const getCheckInData = (result: any) => {
        return result?.data ?? result;
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            const values = await form.validateFields();

            const checkInResult = await createCheckIn({
                ...values,
                birth_date: values.birth_date
                    ? dayjs(values.birth_date).format("YYYY-MM-DD")
                    : null,
                check_in_date: dayjs(values.check_in_date).format("YYYY-MM-DD"),
                check_out_date: dayjs(values.check_out_date).format("YYYY-MM-DD"),
                notes: values.notes ?? [],
            });

            // console.log("checkInResult =", checkInResult);

            const checkInData = getCheckInData(checkInResult);

            // console.log("checkInData =", checkInData);

            messageApi.success("入住資料新增成功");

            if (
                checkInData?.vip_login_account &&
                checkInData?.vip_initial_password &&
                checkInData?.vip_login_url
            ) {
                setVipInfo({
                    vip_login_account: checkInData.vip_login_account,
                    vip_initial_password: checkInData.vip_initial_password,
                    vip_login_url: checkInData.vip_login_url,
                });
                setVipModalOpen(true);
            }

            form.resetFields();
            setRooms([]);

            const customerId =
                checkInData?.customer_id ??
                values.customer_id;

            if (!customerId) {
                messageApi.warning("入住成功，但找不到 customer_id，無法產生 AI 推薦");
                return;
            }

            setGenerating(true);

            messageApi.loading({
                content: "AI 行程產生中，請稍候...",
                key: "generateRecommendation",
                duration: 0,
            });

            generateRecommendation(customerId)
                .then(() => {
                    messageApi.success({
                        content: "AI 行程推薦產生成功",
                        key: "generateRecommendation",
                    });
                })
                .catch((error: any) => {
                    console.error(error);

                    messageApi.warning({
                        content: "AI 行程可能仍在背景產生中，請稍後查看推薦結果",
                        key: "generateRecommendation",
                        duration: 5,
                    });
                })
                .finally(() => {
                    setGenerating(false);
                });
        } catch (error: any) {
            messageApi.error(error.response?.data?.detail || "入住資料新增失敗");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}

            <Card title="新增入住資料" className="checkin-card">
                <h3>基本資料</h3>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        gender_id: 1,
                        country_code: "TW",
                        adult_count: 1,
                        child_count: 0,
                        has_parking: false,
                        notes: [],
                    }}
                >
                    <Space size="large" wrap>
                        <Form.Item
                            label="代表客姓名"
                            name="full_name"
                            rules={[{ required: true, message: "請輸入代表客姓名" }]}
                        >
                            <Input placeholder="例如：陳大文" style={{ width: 280 }} />
                        </Form.Item>

                        <Form.Item
                            label="性別"
                            name="gender_id"
                            rules={[{ required: true }]}
                        >
                            <Select style={{ width: 280 }}>
                                <Select.Option value={1}>男</Select.Option>
                                <Select.Option value={2}>女</Select.Option>
                                <Select.Option value={3}>其他</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="年齡/生日" name="birth_date">
                            <DatePicker style={{ width: 280 }} />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ type: "email", message: "Email 格式不正確" }]}
                        >
                            <Input placeholder="guest@example.com" style={{ width: 280 }} />
                        </Form.Item>

                        <Form.Item
                            label="國籍"
                            name="country_code"
                            rules={[{ required: true }]}
                        >
                            <Select style={{ width: 280 }}>
                                <Select.Option value="TW">台灣</Select.Option>
                                <Select.Option value="JP">日本</Select.Option>
                                <Select.Option value="US">美國</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="聯絡電話" name="mobile_phone">
                            <Input placeholder="09XX-XXX-XXX" style={{ width: 280 }} />
                        </Form.Item>
                    </Space>

                    <Divider />

                    <h3>住宿資訊</h3>

                    <Space size="large" wrap>
                        <Form.Item
                            label="房型"
                            name="room_type_id"
                            rules={[{ required: true, message: "請選擇房型" }]}
                        >
                            <Select
                                placeholder="請選擇房型"
                                style={{ width: 280 }}
                                onChange={handleRoomTypeChange}
                            >
                                {roomTypes.map((item) => (
                                    <Select.Option
                                        key={item.room_type_id}
                                        value={item.room_type_id}
                                    >
                                        {item.room_type_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="房號"
                            name="room_id"
                            rules={[{ required: true, message: "請選擇房號" }]}
                        >
                            <Select placeholder="請先選擇房型" style={{ width: 280 }}>
                                {rooms.map((item) => (
                                    <Select.Option key={item.room_id} value={item.room_id}>
                                        {item.room_no}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="入住日期"
                            name="check_in_date"
                            rules={[{ required: true, message: "請選擇入住日期" }]}
                        >
                            <DatePicker style={{ width: 280 }} />
                        </Form.Item>

                        <Form.Item
                            label="退房日期"
                            name="check_out_date"
                            rules={[{ required: true, message: "請選擇退房日期" }]}
                        >
                            <DatePicker style={{ width: 280 }} />
                        </Form.Item>

                        <Form.Item
                            label="大人人數"
                            name="adult_count"
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={1} style={{ width: 280 }} />
                        </Form.Item>

                        <Form.Item
                            label="小孩人數"
                            name="child_count"
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={0} style={{ width: 280 }} />
                        </Form.Item>
                    </Space>

                    <Divider />

                    <h3>其他需求</h3>

                    <Row gutter={[24, 16]}>
                        <Col span={8}>
                            <Form.Item label="是否停車" name="has_parking">
                                <Radio.Group>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="車牌號碼" name="license_plate_no">
                                <Input placeholder="例如：ABC-1234" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.List name="notes">
                        {(fields, { add, remove }) => (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 16,
                                    }}
                                >
                                    <h4 style={{ margin: 0 }}>特殊備註</h4>

                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => add()}
                                    >
                                        新增備註
                                    </Button>
                                </div>

                                {fields.map((field) => (
                                    <Row gutter={[16, 16]} key={field.key}>
                                        <Col span={8}>
                                            <Form.Item
                                                label="備註類型"
                                                name={[field.name, "note_type"]}
                                            >
                                                <Input placeholder="過敏 / 紀念日" />
                                            </Form.Item>
                                        </Col>

                                        <Col span={14}>
                                            <Form.Item
                                                label="備註內容"
                                                name={[field.name, "note_content"]}
                                                rules={[{ required: true, message: "請輸入備註內容" }]}
                                            >
                                                <Input placeholder="例如：週年紀念日，需佈置" />
                                            </Form.Item>
                                        </Col>

                                        <Col span={2}>
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(field.name)}
                                                style={{ marginTop: 30 }}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                            </>
                        )}
                    </Form.List>

                    <Divider />

                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        {submitting ? "送出中..." : "送出入住資料"}
                    </Button>
                </Form>
            </Card>

            <Modal
                title="VIP 帳號建立成功"
                open={vipModalOpen}
                onOk={() => setVipModalOpen(false)}
                onCancel={() => setVipModalOpen(false)}
                okText="完成"
                cancelButtonProps={{ style: { display: "none" } }}
            >
                {vipInfo && (
                    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                        <Typography.Text>
                            帳號：<Typography.Text strong>{vipInfo.vip_login_account}</Typography.Text>
                        </Typography.Text>

                        <Typography.Text>
                            初始密碼：<Typography.Text strong>{vipInfo.vip_initial_password}</Typography.Text>
                        </Typography.Text>

                        <Typography.Text>
                            前台登入網址：{" "}
                            <Typography.Text copyable>{vipInfo.vip_login_url}</Typography.Text>
                        </Typography.Text>

                        <div
                            style={{
                                background: "#fff",
                                padding: 16,
                                display: "inline-block",
                                borderRadius: 8,
                            }}
                        >
                            <QRCodeSVG
                                value={JSON.stringify({
                                    login_url: vipInfo.vip_login_url,
                                    account: vipInfo.vip_login_account,
                                    password: vipInfo.vip_initial_password,
                                })}
                                size={180}
                            />
                        </div>

                        <Typography.Text type="secondary">
                            請旅客掃描 QRCode，前往 VIP 前台登入。
                        </Typography.Text>
                    </Space>
                )}
            </Modal>
        </>
    );
}

export default CheckInPage;