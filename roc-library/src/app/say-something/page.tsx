import type { Metadata } from "next";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "บอกเรา",
  description: "ส่งความคิดเห็นหรือข้อเสนอแนะถึงผู้พัฒนา ROC Library",
};

export default function SaySomethingPage() {
  return <FeedbackForm />;
}
