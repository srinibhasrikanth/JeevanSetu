import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
    <p className="text-slate-500 font-medium">Loading...</p>
  </div>
);

export default PageLoader;
