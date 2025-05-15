const cron = require("node-cron");
const Promotion = require("../models/Promotion");

cron.schedule('0 * * * *', async () => {
  const now = new Date();
  await Promotion.updateMany(
    { endDate: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
  console.log('Đã cập nhật trạng thái khuyến mãi hết hạn lúc', now);
});