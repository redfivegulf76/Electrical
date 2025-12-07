import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function PlanCard({ plan, onSelectPlan, isPopular }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
        >
            <Card className={`h-full flex flex-col relative ${isPopular ? 'border-2 border-blue-500 shadow-xl' : 'border border-gray-200'}`}>
                {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                )}
                
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                    
                    <div className="mt-6">
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                            <span className="text-gray-500">/{plan.billing_period === 'yearly' ? 'year' : 'month'}</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-grow">
                    <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="pt-4">
                    <Button 
                        onClick={() => onSelectPlan(plan)}
                        className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                        size="lg"
                    >
                        Get Started
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}