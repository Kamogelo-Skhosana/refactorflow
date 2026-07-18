import Link from "next/link";
import AuthForm from "../auth-form";

export const metadata = { title: "Create an account | RefactorFlow" };
export default function SignupPage() { return <main className="auth-page"><nav className="nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><Link className="text-link" href="/signin">Sign in</Link></nav><section className="auth-card"><p className="kicker">Start your practice</p><h1>Create your workspace.</h1><p className="auth-intro">Build a clearer coding rhythm with a private RefactorFlow account.</p><AuthForm mode="signup" /><p className="auth-switch">Already have an account? <Link href="/signin">Sign in</Link></p></section></main>; }

