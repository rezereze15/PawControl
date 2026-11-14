import { Link } from '@inertiajs/react';
import AuthLayout from '@/Components/AuthLayout';
import CodeVerificationForm from '@/Components/CodeVerificationForm';
import registerCatImage from '../imports/registerCat.png';
import '../../css/Register.css';

/** Registration step 2: enter the 6-digit code emailed to the new user. */
export default function VerifyCode({ maskedEmail, resendAvailableIn, codeLength = 6 }) {
    return (<AuthLayout title="Check your email" image={registerCatImage} imageAlt="Cat at a veterinary clinic" caption="One quick step and your account is ready." kicker="Almost there" heading="Check your email" subtitle={<>We sent a 6-digit verification code to <strong className="verify-email">{maskedEmail}</strong>. It expires in 10 minutes.</>}>
      <CodeVerificationForm verifyUrl="/register/verify" resendUrl="/register/resend" resendAvailableIn={resendAvailableIn} codeLength={codeLength} backLink={<Link href="/register/cancel" method="post" as="button" className="verify-link-btn verify-link-btn--muted">
            ← Back / use a different email
          </Link>}/>
    </AuthLayout>);
}
