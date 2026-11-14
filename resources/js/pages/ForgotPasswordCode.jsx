import { Link } from '@inertiajs/react';
import AuthLayout from '@/Components/AuthLayout';
import CodeVerificationForm from '@/Components/CodeVerificationForm';
import { ui } from '@/Components/authStyles';
import dogImage from '../imports/logindog.png';

/** Forgot password step 2: enter the emailed code. Wording never confirms the account exists. */
export default function ForgotPasswordCode({ maskedEmail, resendAvailableIn, codeLength = 6 }) {
    return (<AuthLayout title="Check your email" image={dogImage} imageAlt="Puppies at a veterinary clinic" caption="Locked out? We'll get you back in a minute." kicker="Forgot password" heading="Check your email" subtitle={<>If an account exists, we sent a code to <strong className={ui.codeEmail}>{maskedEmail}</strong>. It expires in 10 minutes.</>}>
      <CodeVerificationForm verifyUrl="/forgot-password/verify" resendUrl="/forgot-password/resend" resendAvailableIn={resendAvailableIn} codeLength={codeLength} backLink={<Link href="/login" className={ui.linkButtonMuted}>← Back to login</Link>}/>
    </AuthLayout>);
}
