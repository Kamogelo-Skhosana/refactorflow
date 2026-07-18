import Link from "next/link";
import AuthForm from "../auth-form";

export const metadata = { title: "Sign in | RefactorFlow" };
export default function SigninPage() { return <main className="auth-page"><nav className="nav shell"><Link className="brand" href="/">Refactor<span>Flow</span></Link><Link className="text-link" href="/signup">Create account</Link></nav><section className="auth-card"><p className="kicker">Welcome back</p><h1>Return to your rhythm.</h1><p className="auth-intro">Sign in to continue your private reflection practice.</p><AuthForm mode="signin" /><p className="auth-switch">New to RefactorFlow? <Link href="/signup">Create an account</Link></p></section></main>; }

