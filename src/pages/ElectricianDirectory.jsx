import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User as UserIcon, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function ElectricianDirectory() {
  const [currentUser, setCurrentUser] = useState(null);
  const [electricians, setElectricians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
      
      const allUsers = await base44.entities.User.list("-created_date");
      const publicProfiles = allUsers.filter(u => u.is_public_profile === true);
      setElectricians(publicProfiles);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const filteredElectricians = electricians.filter(e => {
    const query = searchQuery.toLowerCase();
    return (
      e.full_name?.toLowerCase().includes(query) ||
      e.company_name?.toLowerCase().includes(query) ||
      e.bio?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query) ||
      e.specialties?.some(s => s.toLowerCase().includes(query))
    );
  });

  const handleContact = (electrician) => {
    if (electrician.email) {
      window.location.href = `mailto:${electrician.email}`;
    }
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Electrician & Contractor Directory
          </h1>
          <p className="text-slate-600 mt-2">Connect with electrical professionals in your area</p>
        </div>

        {!currentUser?.is_public_profile && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2">Join the Directory</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Make your profile public to connect with other electricians, contractors, and potential customers.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/ProfileSettings'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Enable Public Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <Input
              placeholder="Search by name, company, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        <div>
          <p className="text-sm text-slate-500 mb-4">
            {filteredElectricians.length} professional{filteredElectricians.length !== 1 ? 's' : ''} found
          </p>

          {filteredElectricians.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <UserIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {electricians.length === 0 ? "No public profiles yet" : "No profiles match your search"}
                </h3>
                <p className="text-slate-600">
                  {electricians.length === 0 
                    ? "Be the first to make your profile public and connect with others!" 
                    : "Try adjusting your search terms"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElectricians.map((electrician, index) => (
                <motion.div
                  key={electrician.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-slate-200">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center border-4 border-white shadow-lg flex-shrink-0">
                          {electrician.profile_picture_url ? (
                            <img
                              src={electrician.profile_picture_url}
                              alt={electrician.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-slate-900 truncate">
                            {electrician.full_name}
                          </CardTitle>
                          {electrician.company_name && (
                            <p className="text-sm text-slate-600 font-medium truncate flex items-center gap-1 mt-1">
                              <Briefcase className="w-3 h-3" />
                              {electrician.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {electrician.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{electrician.location}</span>
                        </div>
                      )}

                      {electrician.bio && (
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {electrician.bio}
                        </p>
                      )}

                      {electrician.specialties && electrician.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {electrician.specialties.slice(0, 3).map((specialty, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {electrician.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{electrician.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {electrician.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${electrician.phone}`} className="hover:text-blue-600">
                              {electrician.phone}
                            </a>
                          </div>
                        )}
                        {electrician.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${electrician.email}`} className="hover:text-blue-600 truncate">
                              {electrician.email}
                            </a>
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleContact(electrician)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!electrician.email}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}