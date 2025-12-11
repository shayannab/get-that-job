import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1
              className="text-2xl font-bold text-textPrimary cursor-pointer"
              onClick={() => navigate('/')}
            >
              Get That Job
            </h1>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-textPrimary mb-2">
            Dashboard
          </h2>
          <p className="text-textSecondary mb-8">
            Start building your ATS-optimized resume
          </p>

          {/* Placeholder Card */}
          <div className="card">
            <h3 className="text-xl font-semibold text-textPrimary mb-4">
              Welcome to Dashboard
            </h3>
            <p className="text-textSecondary mb-6">
              This is a placeholder. We'll build the job analysis, question form, and resume generator here.
            </p>
            <div className="flex gap-4">
              <button className="btn-cta">
                Start Building Resume
              </button>
              <button className="btn-primary">
                View Examples
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

