
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "Up to 3 projects",
      "Basic product search",
      "Quote list creation",
      "Up to 20 items per quote",
      "Email support"
    ],
    limitations: [
      "No AI features",
      "No templates",
      "No supplier directory"
    ],
    color: "slate",
    icon: Zap
  },
  {
    name: "Pro",
    price: 49,
    description: "For professional contractors",
    features: [
      "Unlimited projects",
      "AI-Powered product search",
      "AI Estimator",
      "Unlimited quote items",
      "Templates & kits library",
      "Priority email support",
      "Advanced reporting"
    ],
    popular: true,
    color: "blue",
    icon: Sparkles
  },
  {
    name: "Enterprise",
    price: 149,
    description: "For teams and large operations",
    features: [
      "Everything in Pro",
      "Supplier directory & RFQ",
      "Team collaboration",
      "Custom integrations",
      "Dedicated account manager",
      "Phone support",
      "Custom training"
    ],
    color: "amber",
    icon: Crown
  }
];

const colorClasses = {
  slate: {
    card: "border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    button: "bg-slate-600 hover:bg-slate-700",
    gradient: "from-slate-500 to-slate-600"
  },
  blue: {
    card: "border-blue-300 shadow-xl ring-2 ring-blue-200",
    badge: "bg-blue-600 text-white",
    button: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg",
    gradient: "from-blue-500 to-blue-600"
  },
  amber: {
    card: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    button: "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800",
    gradient: "from-amber-500 to-amber-600"
  }
};

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleSelectPlan = (planName) => {
    alert(`To upgrade to ${planName}, please contact support@packoutai.com or call 1-800-PACKOUT. We'll help you get set up right away!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-blue-100 text-blue-700 text-sm px-4 py-1">
              Simple, Transparent Pricing
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Select the perfect plan for your electrical contracting business
          </motion.p>
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-slate-100 text-slate-700 text-base px-4 py-2">
                Current Plan: <span className="font-bold ml-1">{user.subscription_tier}</span>
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const colors = colorClasses[plan.color];
            const isCurrentPlan = user?.subscription_tier === plan.name;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plan.popular ? "md:scale-105" : ""}
              >
                <Card className={`h-full relative ${colors.card}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                          </div>
                          <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.name !== "Free" && ( // Only render button if not the "Free" plan
                      isCurrentPlan ? (
                        <Button disabled className="w-full bg-slate-200 text-slate-500 cursor-not-allowed">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSelectPlan(plan.name)}
                          className={`w-full ${colors.button}`}
                        >
                          {user?.subscription_tier === "Free" || !user ? "Get Started" : "Upgrade Now"}
                        </Button>
                      )
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans at any time?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We accept all major credit cards, ACH transfers, and can invoice for Enterprise plans. Contact us for custom payment arrangements.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  The Free plan is available indefinitely with no credit card required. Pro and Enterprise plans come with a 14-day money-back guarantee.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
