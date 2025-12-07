import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Supplier } from "@/entities/Supplier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Mail, Phone, Globe, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import UpgradePrompt from "../components/shared/UpgradePrompt";

export default function SupplierDirectory() {
  const [user, setUser] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await User.me();
    setUser(userData);
    
    const suppliersData = await Supplier.list("-rating");
    setSuppliers(suppliersData);
  };

  const hasAccess = user?.subscription_tier === "Enterprise";

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Supplier Directory
            </h1>
            <p className="text-slate-600 mt-2">Connect with verified electrical suppliers</p>
          </div>

          <UpgradePrompt
            feature="Supplier Directory"
            requiredTier="Enterprise"
            message="Upgrade to Enterprise to access our network of verified suppliers with RFQ capabilities"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Supplier Directory
          </h1>
          <p className="text-slate-600 mt-2">Connect with verified electrical suppliers</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Input
              placeholder="Search suppliers by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                        {supplier.name}
                      </CardTitle>
                      {supplier.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-900">{supplier.rating}</span>
                          <span className="text-sm text-slate-500">/5</span>
                        </div>
                      )}
                    </div>
                    <Building2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {supplier.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{supplier.description}</p>
                  )}
                  
                  {supplier.specialties && supplier.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {supplier.specialties.slice(0, 3).map((spec, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{supplier.location}</span>
                      </div>
                    )}
                    {supplier.website && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Globe className="w-4 h-4" />
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                    Send RFQ
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredSuppliers.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No suppliers found</h3>
                <p className="text-slate-600">Try adjusting your search</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}