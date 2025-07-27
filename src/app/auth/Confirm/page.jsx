import { Suspense } from "react";
import ConfirmEmail from "./ConfirmEmail";

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Loading confirmation...</div>}>
      <ConfirmEmail />
    </Suspense>
  );
}