export default async (router) => {
  router.get("/sabha", (req, res) => {
    res.render("pages/sabha", {
      options: {
        title: `المسبحة الإلكترونية كي لا تنس ذكر الله أبدا`,
        keywords: ["سبحة إلكترونية", "تسبيح ذكي", "سبحة ذكية", "تقنية التسبيح", "سبحة رقمية", "تسبيح إلكتروني", "سبحة", "تسبيح", "سبحة تقنية", "تسبيح آلي", "تسبيح تقني", "سبحة تكنولوجية", "تسبيح إلكتروني ذكي", "تسبيح رقمي", "سبحة إلكترونية", "سبحة ذكر آلي", "سبحة تقنية", "تسبيح ذكر رقمي", "سبحة تقنية ذكية", "تسبيح رقمي ذكي"],
        description: "صفحة السبحة الإلكترونية تهدف إلى تسهيل عملية التسبيح والذكر اليومي عبر الإنترنت.",
      },
    });
  });
};