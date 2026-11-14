import { Link } from '@inertiajs/react';
import AuthLayout from '@/Components/AuthLayout';
import CodeVerificationForm from '@/Components/CodeVerificationForm';
import { ui } from '@/Components/authStyles';
import registerCatImage from '../imports/registerCat.png';

/** Registration step 2: enter the 6-digit code emailed to the new user. */
export default function VerifyCode({ maskedEmail, resendAvailableIn, codeLength = 6 }) {
    return (<AuthLayout title="Check your email" image={registerCatImage} imageAlt="Cat at a veterinary clinic" caption="One quick step and your account is ready." kicker="Almost there" heading="Check your email" subtitle={<>We sent a 6-digit verification code to <strong className={ui.codeEmail}>{maskedEmail}</strong>. It expires in 10 minutes.</>}>
      <CodeVerificationForm verifyUrl="/register/verify" resendUrl="/register/resend" resendAvailableIn={resendAvailableIn} codeLength={codeLength} backLink={<Link href="/register/cancel" method="post" as="button" className={ui.linkButtonMuted}>
            ← Back / use a different email
          </Link>}/>
    </AuthLayout>);
}
