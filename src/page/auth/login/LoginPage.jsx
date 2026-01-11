
import LoginScene3D from "@/components/HomeComp/login-scene-3D";
import LoginForm from "@/components/HomeComp/LoginForm";

function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-900">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-10 lg:py-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      <div className="hidden lg:flex relative w-1/2 bg-linear-to-br from-indigo-500/10 via-slate-900 to-purple-500/10 items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-6xl mx-auto p-4 lg:p-8 xl:p-12">
          <LoginScene3D variant="login" />
        </div>
      </div>
    </main>
  );
}

export default LoginPage;