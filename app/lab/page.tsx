≠rá^—f•ñÿ¶{^¨y 'v√Æ∂õ≠import { requireChatGPTUser } from "../chatgpt-auth";
import LabClient from "./LabClient";

export const dynamic = "force-dynamic";

export default async function LabPage() {
  const user = await requireChatGPTUser("/lab");
  return <LabClient operator={user.displayName} />;
}
