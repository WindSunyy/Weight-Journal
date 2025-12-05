import request from "../utils/request";

// 新增或更新体重记录
export function saveWeight({
  weight,
  date,
  unit = "kg",
}: {
  weight: number;
  date: string;
  unit?: string;
}) {
  return request.post("/api/weight", { weight, date, unit });
}

// 查询体重记录（可查某天或全部）
export function getWeightList({ date }: { date?: string } = {}) {
  return request.get("/api/weight", { params: { date } });
}
