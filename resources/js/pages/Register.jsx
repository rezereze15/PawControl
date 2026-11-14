import AuthLayout from '@/Components/AuthLayout';
import RegisterForm from '@/Components/RegisterForm';
import registerCatImage from '../imports/registerCat.png';
export default function Register() {
    return (<AuthLayout wide title="Create account" image={registerCatImage} imageAlt="Cat at a veterinary clinic" caption="Book visits and track your pet's health with ease." kicker="Join Big Paws" heading="Create your account" subtitle="Set up your account to book visits and keep your pet's health records in one place.">
      <RegisterForm />
    </AuthLayout>);
}
