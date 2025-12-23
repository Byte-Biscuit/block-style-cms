"use client";

interface WelcomeFormProps {
    onNext: () => void;
}

/**
 * Welcome Form Component
 * 欢迎页面组件
 *
 * Introduction to the installation process and requirements
 */
export default function WelcomeForm({ onNext }: WelcomeFormProps) {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Block Style CMS! 🎉
            </h1>
            <p className="mt-4 text-lg text-gray-600">
                Let us get your content management system up and running in just
                a few steps.
            </p>
            <div className="mt-8 space-y-4 text-left">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900">
                        Installation Steps:
                    </h3>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-700">
                        <li>Environment check - Verify system requirements</li>
                        <li>Create admin account - Set up your first user</li>
                        <li>Configure authentication - Choose login methods</li>
                        <li>
                            Set up services (optional) - Connect external tools
                        </li>
                        <li>Complete installation - Start using your CMS</li>
                    </ol>
                </div>
            </div>
            <button
                onClick={onNext}
                className="mt-8 rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-600"
            >
                Get Started →
            </button>
        </div>
    );
}
