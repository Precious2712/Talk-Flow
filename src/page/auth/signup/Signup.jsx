import Scene3D from "@/components/HomeComp/scene-3d";
import SignupForm from "@/components/HomeComp/SignupForm";


function SignupPage() {
    return (
        <main className="flex min-h-screen bg-slate-900">
            
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-12">
                <div className="w-full max-w-md">
                    <SignupForm />
                </div>
            </div>

            
            <div className="hidden lg:flex w-1/2 bg-linear-to-br from-indigo-500/20 via-slate-900 to-purple-500/20 items-center justify-center overflow-hidden relative">
                
                <div className="absolute inset-0">
                    <Scene3D variant="signup" />
                </div>
            </div>
        </main>
    );
}

export default SignupPage;
