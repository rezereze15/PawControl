import { useForm } from '@inertiajs/react';
import AuthLayout from '@/Components/AuthLayout';
import LoginForm from '@/Components/LoginForm';
import dog_image from "../imports/logindog.png";
export default function Login() {
    const form = useForm({ username: '', password: '' });
    function handleSubmit(event) {
        event.preventDefault();
        form.post('/login', { onError: () => form.reset('password') });
    }
    return (<AuthLayout title="Log in" image={dog_image} imageAlt="Puppies at a veterinary clinic" caption="Every visit, every record, all in one place." kicker="Welcome back" heading="Log in to your account" subtitle="Manage appointments and keep your pet's records up to date.">
      <LoginForm username={form.data.username} password={form.data.password} error={form.errors.username ?? form.errors.password ?? ''} processing={form.processing} onUsernameChange={(username) => form.setData('username', username)} onPasswordChange={(password) => form.setData('password', password)} onClearError={() => form.clearErrors()} onSubmit={handleSubmit}/>
    </AuthLayout>);
}
