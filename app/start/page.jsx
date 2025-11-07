"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Eye,
  Target,
  Clock,
  Users,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  User,
  Bell,
  X,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function StartPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [sitesDiscovered, setSitesDiscovered] = useState(0);
  const [activeSection, setActiveSection] = useState("briefing");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedNotificationIds, setViewedNotificationIds] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [progressData, setProgressData] = useState(null);

  // Function to fetch progress data
  const fetchProgressData = async () => {
    try {
      const participantType = localStorage.getItem("participantType");
      const teamId = localStorage.getItem("teamId");
      const participantId = localStorage.getItem("participantId");
      
      const participantIdValue = participantId || teamId
      const response = await fetch(
        `/api/progress/fetch?participantId=${participantIdValue}&participantType=${participantType}`
      )
      if (response.ok) {
        const data = await response.json()
        setProgressData(data)
        console.log('[Start] Progress data refreshed:', data)
      }
    } catch (err) {
      console.error('[Start] Error fetching progress:', err)
    }
  }

  useEffect(() => {
    const loadParticipantData = async () => {
      const participantType = localStorage.getItem("participantType");
      const participantName = localStorage.getItem("participantName");
      const teamName = localStorage.getItem("teamName");
      const teamId = localStorage.getItem("teamId");
      const participantId = localStorage.getItem("participantId");

      if (!participantType) {
        router.push("/register");
        return;

      }

      setParticipant({
        type: participantType,
        name: participantType === "team" ? teamName : participantName,
        teamId: teamId,
      });

      try {
        const table = participantType === "team" ? "teams" : "participants";
        const id = participantType === "team" ? teamId : participantId;

        const { data, error } = await supabase
          .from(table)
          .select(
            `
            id,
            site_discoveries (
              id
            )
          `
          )
          .eq("id", id)
          .single();

        if (error || !data) {
          router.push("/register");
          return;
        }

        // Don't set sitesDiscovered here - we'll use progressData instead
      } catch (err) {
        console.error("Error fetching sites discovered:", err);
        router.push("/register");
        return;
      }

      if (participantType === "team" && teamId) {
        try {
          const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("team_id", teamId)
            .order("created_at", { ascending: true });

          if (error) throw error;

          setTeamMembers(data || []);
        } catch (err) {
          console.error("Error fetching team members:", err);
        }
      }

      // Fetch progress data
      try {
        const participantIdValue = participantId || teamId
        const response = await fetch(
          `/api/progress/fetch?participantId=${participantIdValue}&participantType=${participantType}`
        )
        if (response.ok) {
          const data = await response.json()
          setProgressData(data)
          setSitesDiscovered(data.pagesCompleted || 0)
          console.log('[Start] Progress data:', data)
        }
      } catch (err) {
        console.error('[Start] Error fetching progress:', err)
      }

      setLoading(false);
    };

    loadParticipantData();
  }, [router]);

  // Refresh progress data when window regains focus
  useEffect(() => {
    window.addEventListener('focus', fetchProgressData)
    return () => window.removeEventListener('focus', fetchProgressData)
  }, [])

  // Request notification permission on mount and load viewed notification IDs
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // Load viewed notification IDs from localStorage
    const savedViewedIds = localStorage.getItem("viewedNotificationIds");
    if (savedViewedIds) {
      try {
        setViewedNotificationIds(JSON.parse(savedViewedIds));
      } catch (err) {
        console.error("Error loading viewed notification IDs:", err);
      }
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Notifications Enabled!", {
          body: "You will now receive browser notifications from admins",
          icon: "/api/protected?file=cia.png",
        });
      }
    }
  };

  // Swipe gesture handlers for notification dropdown
  const handleSwipeStart = (e) => {
    if (e.touches && e.touches[0]) {
      setSwipeStartY(e.touches[0].clientY);
      setSwipeStartX(e.touches[0].clientX);
    }
  };

  const handleSwipeEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;

    const swipeEndY = e.changedTouches[0].clientY;
    const swipeEndX = e.changedTouches[0].clientX;

    // Calculate vertical distance (positive = swipe down, negative = swipe up)
    const verticalDistance = swipeEndY - swipeStartY;
    const horizontalDistance = swipeEndX - swipeStartX;

    // Swipe up more than 50px to close
    if (verticalDistance < -50) {
      setShowNotifications(false);
    }

    // Swipe left or right more than 50px to close
    if (Math.abs(horizontalDistance) > 50) {
      setShowNotifications(false);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);

    // Mark as viewed and persist to localStorage
    if (!viewedNotificationIds.includes(notification.id)) {
      const updatedIds = [...viewedNotificationIds, notification.id];
      setViewedNotificationIds(updatedIds);
      localStorage.setItem("viewedNotificationIds", JSON.stringify(updatedIds));
    }
  };

  // Update unread count when viewed IDs or notifications change
  useEffect(() => {
    const unreadNotifications = notifications.filter(
      (n) => !viewedNotificationIds.includes(n.id)
    );
    setUnreadCount(unreadNotifications.length);
  }, [notifications, viewedNotificationIds]);

  const formatNotificationDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      // Ensure the dateString has a Z suffix for proper UTC parsing
      let normalizedDateString = dateString
      if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        normalizedDateString = dateString + 'Z'
      }
      
      const date = new Date(normalizedDateString);
      const now = new Date();

      // Ensure valid date
      if (isNaN(date.getTime())) {
        return "Recently";
      }

      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error('[Notification Date Error]', err)
      return "Recently";
    }
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationError("");
        const response = await fetch("/api/admin/notifications");

        if (!response.ok) {
          if (response.status === 500) {
            console.warn("Notifications table not yet created");
            setNotifications([]);
          } else {
            throw new Error(`Failed to fetch notifications: ${response.status}`);
          }
          return;
        }

        const result = await response.json();
        const notificationsData = result.notifications || [];

        setNotifications(notificationsData);

        // Calculate unread count (notifications not yet viewed)
        const unreadNotifications = notificationsData.filter(
          (notif) => !viewedNotificationIds.includes(notif.id)
        );
        setUnreadCount(unreadNotifications.length);

        // Show browser notification for new notifications
        // Get previously seen notification IDs from sessionStorage to avoid duplicates
        const previousIds = JSON.parse(
          sessionStorage.getItem("seenNotifications") || "[]"
        );
        const newNotifications = notificationsData.filter(
          (notif) => !previousIds.includes(notif.id)
        );

        // Save all current notification IDs to sessionStorage
        const allIds = notificationsData.map((n) => n.id);
        sessionStorage.setItem("seenNotifications", JSON.stringify(allIds));

        // Show browser notifications for new ones
        newNotifications.forEach((notif) => {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("THE DYATLOV CHRONICLES", {
              body: `${notif.title}: ${notif.message}`,
              icon: "/api/protected?file=cia.png",
              tag: `notif-${notif.id}`,
              requireInteraction: false,
            });
          }
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
        // Don't show error if it's just the table not existing
        if (err.message.includes("500")) {
          setNotifications([]);
        } else {
          setNotificationError("Failed to load notifications.");
        }
      }
    };

    fetchNotifications();
    // Poll for new notifications every 10 seconds for better UX
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading investigation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* CIA Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1b]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/api/protected?file=cia.png"
                width={62}
                height={62}
                alt="CIA LOGO"
                className=" invert"
              />
              <div>
                <div className="text-[50px] text-neutral-500 uppercase tracking-widest font-mono">
                  CIA
                </div>
                
              </div>
            </div>

            {/* Notifications & Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-neutral-400 hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </button>

                {/* Desktop Dropdown */}
                {showNotifications && !showNotificationModal && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="hidden sm:fixed inset-0 z-40"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="hidden sm:block absolute right-0 top-full mt-2 w-96 bg-[#1a1a1b] border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50"
                    >
                      <div className="sticky top-0 bg-[#1a1a1b] p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-semibold text-white">
                          Notifications
                        </h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-neutral-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-neutral-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {notifications.map((notif, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                handleViewNotification(notif);
                                setShowNotifications(false);
                              }}
                              className="w-full text-left p-4 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white text-sm mb-1 truncate">
                                    {notif.title}
                                  </h4>
                                  <p className="text-sm text-neutral-400 mb-2 line-clamp-2">
                                    {notif.message}
                                  </p>
                                </div>
                                {!viewedNotificationIds.includes(notif.id) && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-neutral-500">
                                {formatNotificationDate(notif.created_at)}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}

                {/* Mobile Full Screen Notifications List */}
                {showNotifications && !showNotificationModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-[#0a0a0a] z-500 sm:hidden flex flex-col h-screen"
                  >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#1a1a1b] border-b border-white/10 p-4 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">
                        Notifications
                      </h2>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto h-screen">
                      {notificationError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 text-red-300 text-sm bg-red-500/10 border-b border-red-500/20 flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {notificationError}
                        </motion.div>
                      )}

                      {typeof window !== "undefined" &&
                        "Notification" in window &&
                        Notification.permission !== "granted" && (
                          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
                            <p className="text-sm text-blue-300 mb-3">
                              Enable browser notifications to get alerts when
                              admins send important messages
                            </p>
                            <button
                              onClick={handleRequestNotificationPermission}
                              className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded text-sm font-medium text-blue-300 transition-colors"
                            >
                              Enable Notifications
                            </button>
                          </div>
                        )}

                      {notifications.length === 0 && (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p className="text-neutral-400">
                            No notifications yet
                          </p>
                        </div>
                      )}

                      {notifications.length > 0 && (
                        <div className="divide-y divide-white/5">
                          {notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleViewNotification(notif)}
                              className={`w-full text-left p-4 transition-colors ${
                                viewedNotificationIds.includes(notif.id)
                                  ? "hover:bg-white/5"
                                  : "bg-blue-500/5 hover:bg-blue-500/10"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {!viewedNotificationIds.includes(notif.id) && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0 mt-2" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white text-base mb-1 line-clamp-2">
                                    {notif.title}
                                  </h3>
                                  <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {formatNotificationDate(notif.created_at)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs text-neutral-500">
                  {participant.type === "team" ? "Team ID" : "Investigator ID"}
                </div>
                <div className="text-sm font-mono font-bold">
                  {participant.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Detail Modal - Desktop Only */}
      {showNotificationModal && selectedNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="hidden sm:flex fixed inset-0 z-60 items-center justify-center p-4 overflow-hidden"
          onClick={() => setShowNotificationModal(false)}
        >
          {/* Blurred background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md max-h-[90vh] bg-[#1a1a1b] border border-white/10 rounded-lg p-6 sm:p-8 backdrop-blur-md shadow-2xl overflow-y-auto"
          >
            <button
              onClick={() => setShowNotificationModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-3 pr-6 wrap-break-word">
              {selectedNotification.title}
            </h2>

            <p className="text-neutral-300 mb-4 leading-relaxed wrap-break-word whitespace-pre-wrap">
              {selectedNotification.message}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <p className="text-sm text-neutral-500">
                {formatNotificationDate(selectedNotification.created_at)}
              </p>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded text-sm font-medium text-blue-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Notification Detail View - Mobile Full Screen */}
      {showNotificationModal && selectedNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="sm:hidden fixed inset-0 z-60 bg-[#0a0a0a] flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1a1a1b] border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex-1">
              Notification
            </h2>
            <button
              onClick={() => {
                setShowNotificationModal(false);
                setShowNotifications(true);
              }}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white wrap-break-word">
                  {selectedNotification.title}
                </h1>
                <p className="text-xs text-neutral-500 mt-2">
                  {formatNotificationDate(selectedNotification.created_at)}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-neutral-300 leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Button */}
          <div className="sticky bottom-0 bg-[#1a1a1b] border-t border-white/10 p-4">
            <button
              onClick={() => {
                setShowNotificationModal(false);
                setShowNotifications(true);
              }}
              className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded text-sm font-medium text-blue-300 transition-colors"
            >
              Back to List
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Classification Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-950/30 border-l-4 border-red-500 rounded-r-lg"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Classification: Top Secret // Eyes Only
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Case #195902-DPI • Declassified: January 2025 • Dyatlov Pass
                Incident
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1b] border border-white/10 rounded-lg p-4 sticky top-20 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
                  Mission Sections
                </h3>

                <nav className="space-y-2">
                  {[
                    {
                      id: "briefing",
                      label: "Mission Briefing",
                      icon: FileText,
                    },
                    { id: "objectives", label: "Objectives", icon: Target },
                    { id: "rules", label: "Rules of Engagement", icon: Shield },
                    { id: "evidence", label: "Initial Evidence", icon: Eye },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        activeSection === section.id
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  ))}
                </nav>

                {/* Utility Links */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  {/* Only show discovered pages */}
                  {progressData?.visitedPages.includes('newspaper-1959') && (
                    <button
                      onClick={() => router.push("/newspaper-1959")}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Newspapers
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                        Declassified
                      </span>
                    </button>
                  )}
                  {progressData?.visitedPages.includes('voices-1959') && (
                    <button
                      onClick={() => router.push("/voices-1959")}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Diaries
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                        Declassified
                      </span>
                    </button>
                  )}
                  {progressData?.visitedPages.includes('soviet-archive') && (
                    <button
                      onClick={() => router.push("/soviet-archive")}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Archives
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                        Declassified
                      </span>
                    </button>
                  )}
                
                  <button
                    onClick={() => router.push("/support")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Support Tickets
                  </button>
                  <button
                    onClick={() => router.push("/leaderboard")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent transition-all"
                  >
                    <Target className="w-4 h-4" />
                    Leaderboard
                  </button>
                </div>
              </div>

              {/* Investigation Status */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Investigation Status
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Status:</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Type:</span>
                    <span className="text-white capitalize">
                      {participant.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Sites Discovered:</span>
                    <span className="text-white">{sitesDiscovered}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              {progressData && (
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Evidence Explored
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-400">Sites Discovered:</span>
                      <span className="text-sm font-bold text-blue-400">
                        {progressData.pagesCompleted}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-linear-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(progressData.pagesCompleted / progressData.totalProgressPages) * 100}%`,
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members Section */}
              {participant.type === "team" && teamMembers.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Team Members
                  </h3>
                  <div className="space-y-2">
                    {teamMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                      >
                        <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">
                            {member.member_name}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            Class {member.class} - {member.section}
                          </div>
                        </div>
                        {index === 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded uppercase font-bold">
                            Leader
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-neutral-500 text-center">
                    {teamMembers.length}{" "}
                    {teamMembers.length === 1 ? "member" : "members"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mission Briefing */}
            {activeSection === "briefing" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 bg-linear-to-r from-blue-950/20 to-transparent">
                  <h2 className="text-xl font-bold mb-2">Mission Briefing</h2>
                  <p className="text-sm text-neutral-400">Case #195902-DPI</p>
                </div>

                <div className="p-6 space-y-4 text-sm text-neutral-300 leading-relaxed">
                  <p>
                    <strong className="text-white">
                      {participant.type === "team"
                        ? "Investigators,"
                        : "Investigator,"}
                    </strong>
                  </p>

                  <p>
                    On <strong className="text-white">February 2, 1959</strong>,
                    nine experienced hikers died under mysterious circumstances
                    in Russia's Ural Mountains.
                  </p>

                  <div className="p-4 bg-red-950/20 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-xs text-red-300 mb-2 font-bold uppercase tracking-wide">
                      Scene Description
                    </p>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      <li>• Tent ripped open from the inside</li>
                      <li>• Hikers fled barefoot into -30°C weather</li>
                      <li>
                        • Fractured skulls, broken ribs, massive internal trauma
                      </li>
                      <li>• Missing eyes and tongues</li>
                      <li>• No external wounds or signs of struggle</li>
                      <li>• Trace radiation on select clothing</li>
                    </ul>
                  </div>

                  <p>
                    The Soviet investigation lasted three months. The official
                    conclusion was vague and unsettling:
                  </p>

                  <div className="p-3 bg-white/5 border border-white/10 rounded text-center italic">
                    <span className="text-neutral-400">
                      "Death caused by an{" "}
                    </span>
                    <span className="text-red-300 font-semibold">
                      unknown compelling force
                    </span>
                    <span className="text-neutral-400">."</span>
                  </div>

                  <p>
                    The case was closed. Files were sealed. No further
                    investigation was permitted.
                  </p>

                  <p>
                    For 66 years, the incident remained one of history's most
                    disturbing unsolved mysteries.
                  </p>

                  <p className="text-white font-semibold">
                    Your mission: Uncover what really happened that night.
                  </p>

                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-yellow-300">
                      <strong>Note:</strong> Evidence is scattered across
                      multiple archived sites. Follow the clues. Cross-reference
                      everything. The truth reveals itself only through
                      investigation.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Objectives */}
            {activeSection === "objectives" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 bg-linear-to-r from-blue-950/20 to-transparent">
                  <h2 className="text-xl font-bold mb-2">Mission Objectives</h2>
                  <p className="text-sm text-neutral-400">
                    How to approach this investigation
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {[
                    {
                      title: "Discover Hidden Sites",
                      description:
                        "Navigate through archived websites containing case files, witness accounts, and forensic evidence.",
                      icon: Eye,
                    },
                    {
                      title: "Decode Hidden Clues",
                      description:
                        "Extract information from file metadata, image analysis, source code, and encrypted messages.",
                      icon: Target,
                    },
                    {
                      title: "Cross-Reference Evidence",
                      description:
                        "Connect dates, names, locations, and contradictions across multiple sources to build a timeline.",
                      icon: FileText,
                    },
                    {
                      title: "Reconstruct Events",
                      description:
                        "Determine what happened on February 2, 1959, and why the official story doesn't add up.",
                      icon: Clock,
                    },
                    {
                      title: "Submit Your Findings",
                      description:
                        "Present a complete explanation with supporting evidence from your investigation.",
                      icon: CheckCircle2,
                    },
                  ].map((objective, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/30 transition-all"
                    >
                      <div className="shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <objective.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">
                          {objective.title}
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {objective.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rules */}
            {activeSection === "rules" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 bg-linear-to-r from-blue-950/20 to-transparent">
                  <h2 className="text-xl font-bold mb-2">
                    Rules of Engagement
                  </h2>
                  <p className="text-sm text-neutral-400">
                    How the investigation works
                  </p>
                </div>

                <div className="p-6 space-y-4 text-sm text-neutral-300">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">
                          Work Solo or in Teams:
                        </strong>{" "}
                        Individual investigators and teams compete on the same
                        leaderboard.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">No Time Limit:</strong>{" "}
                        The investigation is self-paced. Most participants
                        complete it in 5-8 days.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">
                          Document Everything:
                        </strong>{" "}
                        Keep detailed notes. You'll need evidence from multiple
                        sites to submit a complete solution.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">
                          Follow the Clues:
                        </strong>{" "}
                        Each site contains hidden links to the next location.
                        URLs, metadata, and images hold secrets.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">No Brute Force:</strong>{" "}
                        All URLs follow logical patterns. Guessing won't
                        work—solve the puzzles.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-white">
                          Collaboration Allowed:
                        </strong>{" "}
                        Team members can share discoveries internally, but public
                        spoilers are discouraged.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-6">
                    <p className="text-xs text-yellow-300">
                      ⚠️ <strong>Important:</strong> This is a{" "}
                      <em>mystery-solving game</em>, not a hacking challenge.
                      All evidence is accessible through legitimate
                      investigation methods. Do not attempt to bypass security
                      or access unauthorized areas.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "evidence" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1a1a1b] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 bg-linear-to-r from-blue-950/20 to-transparent">
                  <h2 className="text-xl font-bold mb-2">Initial Evidence</h2>
                  <p className="text-sm text-neutral-400">
                    Your investigation begins here
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm text-neutral-300">
                    Two months ago, a deleted Reddit user posted this message to{" "}
                    <strong className="text-white">r/UnsolvedMysteries</strong>.
                    The account was deleted within hours. The post was archived
                    before removal.
                  </p>

                  <p className="text-sm text-neutral-300">
                    This is your{" "}
                    <strong className="text-white">starting point</strong>.
                    Examine every detail.
                  </p>

                  {/* Reddit Post Image */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 rounded-lg" />

                    <img
                      src="/api/protected?file=soviet-archive_isapage.png"
                      alt="Reddit Post - Dyatlov Pass Evidence"
                      className="w-full rounded-lg border border-white/20 shadow-2xl"
                    />

                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="flex items-center gap-2 text-xs text-white bg-black/80 backdrop-blur-sm px-3 py-2 rounded">
                        <ImageIcon className="w-4 h-4" />
                        <span>
                          Examine this image carefully. Hidden clues exist in
                          text, patterns, and context.
                        </span>
                      </div>
                    </div>
                  </div>

                 

                  {/* Download Options */}
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        const response = await fetch('/api/protected?file=soviet-archive_isapage.png');
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'soviet-archive_isapage.png';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Download Image
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}