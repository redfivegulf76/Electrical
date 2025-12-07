import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PlanCard from "../components/payment/PlanCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";

export default function PaymentPortal() {
    const [billingPeriod, setBillingPeriod] = useState("monthly");
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: () => base44.entities.Plan.list('order', 100),
    });

    const filteredPlans = plans.filter(plan => plan.billing_period === billingPeriod);

    const handleSelectPlan = async (plan) => {
        setSelectedPlan(plan);
        
        // TODO: Once backend functions are enabled, this will trigger payment processing
        // For now, we'll just show an alert
        alert(`You selected the ${plan.name} plan. Payment integration will be added once backend functions are enabled.`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Pricing Plans
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Choose Your Perfect Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the plan that fits your needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                {/* Billing Period Toggle */}
                <div className="flex justify-center mb-12">
                    <Tabs value={billingPeriod} onValueChange={setBillingPeriod} className="w-auto">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">
                                Yearly
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Save 20%
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Plans Grid */}
                {filteredPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {filteredPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onSelectPlan={handleSelectPlan}
                                isPopular={plan.is_popular}
                            />
                        ))}
                    </div>
                ) : (
                    <Alert className="max-w-2xl mx-auto">
                        <AlertDescription>
                            No plans available for {billingPeriod} billing. Please check back later.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Trust Indicators */}
                <div className="mt-16 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">99.9%</div>
                            <div className="text-sm text-gray-600 mt-1">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">24/7</div>
                            <div className="text-sm text-gray-600 mt-1">Support</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">10k+</div>
                            <div className="text-sm text-gray-600 mt-1">Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">SSL</div>
                            <div className="text-sm text-gray-600 mt-1">Secure</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}