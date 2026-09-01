import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import { useFaviconFromSettings } from "@/hooks/useSiteSettings";
import { usePageTracking } from "@/hooks/usePageTracking";

// Lazy-load all non-landing pages so the initial bundle stays small.
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminSetPassword = lazy(() => import("./pages/admin/AdminSetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminProjectForm = lazy(() => import("./pages/admin/AdminProjectForm"));
const AdminTags = lazy(() => import("./pages/admin/AdminTags"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminTeamForm = lazy(() => import("./pages/admin/AdminTeamForm"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminAbout = lazy(() => import("./pages/admin/AdminAbout"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminContact = lazy(() => import("./pages/admin/AdminContact"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogForm = lazy(() => import("./pages/admin/AdminBlogForm"));
const AdminBlogCategories = lazy(() => import("./pages/admin/AdminBlogCategories"));
const TeamMemberPreview = lazy(() => import("./pages/admin/TeamMemberPreview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
  </div>
);

/** Applies an uploaded favicon at runtime. Must sit inside the query provider. */
const FaviconSync = () => {
  useFaviconFromSettings();
  return null;
};

/** First-party pageview ping. Must sit inside the router. */
const AnalyticsTracker = () => {
  usePageTracking();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FaviconSync />
        <ScrollToTop />
        <AnalyticsTracker />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<Navigate to="/about" replace />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            {/* Legacy listing URLs collapse to the portfolio. */}
            <Route path="/developments" element={<Navigate to="/projects" replace />} />
            <Route path="/developments/*" element={<Navigate to="/projects" replace />} />
            <Route path="/gallery" element={<Navigate to="/projects" replace />} />
            <Route path="/testimonials" element={<Navigate to="/" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/set-password" element={<AdminSetPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/projects/new" element={<AdminProjectForm />} />
            <Route path="/admin/projects/:id/edit" element={<AdminProjectForm />} />
            <Route path="/admin/tags" element={<AdminTags />} />
            <Route path="/admin/team" element={<AdminTeam />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/team/new" element={<AdminTeamForm />} />
            <Route path="/admin/team/:id/edit" element={<AdminTeamForm />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/blog/categories" element={<AdminBlogCategories />} />
            <Route path="/admin/blog/new" element={<AdminBlogForm />} />
            <Route path="/admin/blog/:id/edit" element={<AdminBlogForm />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/about" element={<AdminAbout />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/contact" element={<AdminContact />} />
            {/* Former single "Homepage" screen. */}
            <Route path="/admin/homepage" element={<Navigate to="/admin/home" replace />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            {/* Preview routes render unsaved admin form state — no DB writes. */}
            <Route path="/admin/preview/project" element={<ProjectPage />} />
            <Route path="/admin/preview/blog" element={<BlogPostPage />} />
            <Route path="/admin/preview/team" element={<TeamMemberPreview />} />
            <Route path="/admin/preview/homepage" element={<Index />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
