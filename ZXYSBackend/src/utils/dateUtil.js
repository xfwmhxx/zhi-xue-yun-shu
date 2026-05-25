// 获取中国时区当前时间
const getChinaDateTime = () => {
  const now = new Date();
  // 转换为中国时区时间（UTC+8）
  const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return chinaTime;
};

// 获取中国时区当前日期字符串 YYYY-MM-DD
const getChinaDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 将日期字符串转为中国时区Date对象
const parseChinaDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

module.exports = {
  getChinaDateTime,
  getChinaDate,
  parseChinaDate
};