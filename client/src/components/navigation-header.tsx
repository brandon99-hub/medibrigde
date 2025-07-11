import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Stethoscope, UserRound, Shield, LogOut, Globe, User as UserIcon, Settings, AlertTriangle as AlertTriangleIcon, ChevronDown, UserCheck, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HospitalStaffProfileCompletion from "./hospital-staff-profile-completion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NavigationHeaderProps {
  currentHospital: "A" | "B";
  onHospitalSwitch: (hospital: "A" | "B") => void;
  user: User;
  showStaffProfileModal: boolean;
  setShowStaffProfileModal: (open: boolean) => void;
  setExistingStaff: (staff: any[]) => void;
  onOpenStaffProfileModal: () => void;
}

const dividerVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: '2px', opacity: 0.15, transition: { duration: 0.3 } },
  exit: { width: 0, opacity: 0, transition: { duration: 0.2 } },
};

export default function NavigationHeader({ currentHospital, onHospitalSwitch, user, showStaffProfileModal, setShowStaffProfileModal, setExistingStaff, onOpenStaffProfileModal }: NavigationHeaderProps) {
  const { logoutMutation } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch staff profile status for admin users
  const { data: staffProfileData, error: staffProfileError } = useQuery({
    queryKey: ['staffProfile', user.id],
    queryFn: async () => {
      if (!user.isAdmin || !user.id) return null;
      try {
        const response = await apiRequest("GET", `/api/hospital/staff-profile?hospitalId=${user.id}`);
        const data = await response.json();
        return data;
      } catch (error) {
        return { hasStaffProfile: false, staffCount: 0, staff: [] };
      }
    },
    enabled: user.isAdmin && !!user.id,
    retry: 1,
    retryDelay: 1000,
  });

  const isStaffProfileIncomplete = user.isAdmin && (staffProfileData === null || !staffProfileData?.hasStaffProfile || staffProfileData?.staffCount < 2);

  // Update existing staff when data is fetched
  useEffect(() => {
    if (staffProfileData?.staff) {
      setExistingStaff(staffProfileData.staff);
    }
  }, [staffProfileData, setExistingStaff]);

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo & Tagline */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Stethoscope className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight truncate">MediBridge</h1>
                <span className="text-xs text-slate-500 block hidden sm:block">Healthcare Record Interoperability</span>
              </div>
            </div>

            {/* Center: Hospital Toggle - Hidden on mobile, shown in mobile menu */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative flex bg-slate-100 rounded-full p-1 w-64 overflow-hidden">
                <motion.div
                  key={currentHospital}
                  layout
                  animate={{
                    x: currentHospital === "A" ? 0 : "100%",
                    background: currentHospital === "A" ? "#2563eb" : "#16a34a",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 h-8 w-[calc(50%-0.25rem)] rounded-full z-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHospitalSwitch("A")}
                  className={
                    "medibridge-tab relative z-10 w-1/2 transition-colors duration-300 " +
                    (currentHospital === "A"
                      ? "!text-white font-bold"
                      : "text-blue-700 font-medium")
                  }
                  style={{
                    transition: "color 0.3s, font-weight 0.3s",
                  }}
                >
                  <motion.span
                    animate={{
                      color: currentHospital === "A" ? "#fff" : "#1d4ed8",
                      opacity: currentHospital === "A" ? 1 : 0.85,
                      scale: currentHospital === "A" ? 1.08 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ display: "inline-block" }}
                  >
                    Hospital A
                  </motion.span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHospitalSwitch("B")}
                  className={
                    "medibridge-tab relative z-10 w-1/2 transition-colors duration-300 " +
                    (currentHospital === "B"
                      ? "!text-white font-bold"
                      : "text-green-700 font-medium")
                  }
                  style={{
                    transition: "color 0.3s, font-weight 0.3s",
                  }}
                >
                  <motion.span
                    animate={{
                      color: currentHospital === "B" ? "#fff" : "#16a34a",
                      opacity: currentHospital === "B" ? 1 : 0.85,
                      scale: currentHospital === "B" ? 1.08 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ display: "inline-block" }}
                  >
                    Hospital B
                  </motion.span>
                </Button>
              </div>
            </div>

            {/* Right: Emergency, Profile Dropdown, Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Emergency Access - Hidden on mobile, shown in mobile menu */}
              {user && (user.hospitalType === "B" || user.isAdmin) && (
                <Link href="/emergency-access" className="hidden md:block">
                  <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    <AlertTriangleIcon className="h-4 w-4 mr-2" />
                    Emergency
                  </Button>
                </Link>
              )}
              
              {/* Profile Dropdown - Desktop */}
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 px-2"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <UserRound className="h-5 w-5 text-slate-700" />
                  <span className="hidden sm:inline text-sm font-medium text-slate-900">{user.hospitalName || user.username}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
                </Button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user.hospitalName || user.username}</p>
                        <p className="text-xs text-slate-600">
                          Hospital {user.hospitalType} • {user.username}
                          {user.hospitalType && (
                            <span className="ml-2">
                              {user.hospitalType === "A" ? "Record Submitter" : "Record Accessor"}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="px-4 py-2 flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <Globe className="h-4 w-4 text-purple-600" />
                      </div>
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
                        }}
                        className="flex flex-col"
                      >
                        {user.isAdmin && (
                          <motion.div
                            variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                          >
                            <Link href="/admin">
                              <button className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center">
                                <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
                              </button>
                            </Link>
                          </motion.div>
                        )}
                        {user.isAdmin && (
                          <motion.div>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                              onClick={() => { 
                                onOpenStaffProfileModal(); 
                                setProfileOpen(false); 
                                setExistingStaff([]);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" /> 
                              {staffProfileData?.staff?.length > 0 ? "Edit Staff Profile" : "Complete Staff Profile"}
                            </button>
                          </motion.div>
                        )}
                        <motion.div
                          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                        >
                          <Link href="/patient-portal">
                            <button className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 flex items-center">
                              <UserIcon className="h-4 w-4 mr-2" /> Patient Portal
                            </button>
                          </Link>
                        </motion.div>
                        {/* ZK Proof Verifier Button */}
                        <motion.div
                          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                        >
                          <Link href="/verifier">
                            <button className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center">
                              <Shield className="h-4 w-4 mr-2" /> ZK Proof Verifier
                            </button>
                          </Link>
                        </motion.div>
                        <motion.div
                          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                        >
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                            onClick={() => logoutMutation.mutate()}
                          >
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                          </button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-700" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-slate-200 bg-white"
              >
                <div className="py-4 space-y-4">
                  {/* Hospital Toggle for Mobile */}
                  <div className="px-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Switch Hospital</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={currentHospital === "A" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          onHospitalSwitch("A");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        Hospital A
                      </Button>
                      <Button
                        variant={currentHospital === "B" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          onHospitalSwitch("B");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        Hospital B
                      </Button>
                    </div>
                  </div>

                  {/* Emergency Access for Mobile */}
                  {user && (user.hospitalType === "B" || user.isAdmin) && (
                    <div className="px-4">
                      <Link href="/emergency-access">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <AlertTriangleIcon className="h-4 w-4 mr-2" />
                          Emergency Access
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* User Info for Mobile */}
                  <div className="px-4 py-3 bg-slate-50 rounded-lg mx-4">
                    <p className="text-sm font-medium text-slate-900">{user.hospitalName || user.username}</p>
                    <p className="text-xs text-slate-600">
                      Hospital {user.hospitalType} • {user.username}
                    </p>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="px-4 space-y-1">
                    {user.isAdmin && (
                      <Link href="/admin">
                        <button 
                          className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded-md flex items-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" /> Admin Dashboard
                        </button>
                      </Link>
                    )}
                    {user.isAdmin && (
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md flex items-center"
                        onClick={() => { 
                          onOpenStaffProfileModal(); 
                          setMobileMenuOpen(false); 
                          setExistingStaff([]);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-3" /> 
                        {staffProfileData?.staff?.length > 0 ? "Edit Staff Profile" : "Complete Staff Profile"}
                      </button>
                    )}
                    <Link href="/patient-portal">
                      <button 
                        className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-md flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3" /> Patient Portal
                      </button>
                    </Link>
                    <Link href="/verifier">
                      <button 
                        className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-3" /> ZK Proof Verifier
                      </button>
                    </Link>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md flex items-center"
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-3" /> Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
