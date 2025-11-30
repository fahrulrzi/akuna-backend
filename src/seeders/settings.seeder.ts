import { Setting } from "../models/Setting.js";

export const settingsSeeder = async () => {
  const defaultSettings = [
    { key: "affiliate_commission_rate", value: "10" },
    { key: "max_affiliate_payout", value: "500000" },
    { key: "min_withdrawal", value: "50000" },
    { key: "postal_code", value: "55281" },
  ];

  for (const settings of defaultSettings) {
    const exist = await Setting.findOne({ where: { key: settings.key } });
    if (!exist) {
      await Setting.create(settings);
      console.log(`Setting ${settings.key} created.`);
    } else {
      console.log(`Setting ${settings.key} already exists.`);
    }
  }
};
