import { useForm, usePage } from '@inertiajs/react';
import LoginForm from '@/Components/LoginForm';

/**
 * Login form state + submit, moved unchanged from the old pages/Login.jsx so the
 * login card can be shown in the landing page modal.
 */
export default function LoginPanel({ onSwitchToRegister, onForgotPassword, showFlash = true }) {
    const { flash } = usePage().props;
    const form = useForm({ username: '', password: '' });
    function handleSubmit(event) {
        event.preventDefault();
        form.post('/login', { onError: () => form.reset('password') });
    }
    return (<LoginForm username={form.data.username} password={form.data.password} error={form.errors.username ?? form.errors.password ?? ''} success={showFlash ? flash?.success ?? '' : ''} processing={form.processing} onUsernameChange={(username) => form.setData('username', username)} onPasswordChange={(password) => form.setData('password', password)} onClearError={() => form.clearErrors()} onSubmit={handleSubmit} onSwitchToRegister={onSwitchToRegister} onForgotPassword={onForgotPassword}/>);
}
